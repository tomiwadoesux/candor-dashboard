# AI Assistant — "Ask Candor"

## Overview

A chat interface in the talent dashboard where talent can ask natural language questions about their bookings, payments, schedule, portfolio, contract, and commission. The AI reads structured data from the database — this is NOT a RAG system. It uses simple context injection.

---

## Architecture

### How It Works

```
Talent asks a question
        ↓
Backend fetches talent's data from database:
  - Profile (name, category, location, contract dates, commission rate)
  - Active bookings (upcoming + recent)
  - Payment records (recent + pending)
  - Calendar (booked dates)
  - Portfolio status
  - Recent communications
        ↓
Backend constructs a prompt:
  - System message: "You are Candor's AI assistant for [talent name]..."
  - Context block: all the talent's data as structured text
  - User message: the talent's question
        ↓
Prompt sent to AI model (Hugging Face Inference API)
        ↓
AI response streamed back to talent's chat interface
```

### Key Principle: Context Injection, Not RAG

Each talent's data set is small — typically 5-20 bookings, 10-30 payment records, a few documents, one profile. This fits easily within an AI model's context window (even small models handle 4K-8K tokens).

Before each conversation, the backend pulls all relevant data and injects it as a structured context block in the system prompt. The AI doesn't search anything — it reads from the pre-loaded data and answers questions.

### Model-Agnostic Design

The system is built so the AI provider can be swapped without changing the frontend or database:

```
AI_PROVIDER=huggingface  # or 'anthropic' or 'openai' or 'local'
AI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
AI_API_URL=https://api-inference.huggingface.co/models/...
AI_API_KEY=hf_xxx  # or empty for free tier
```

For MVP, use Hugging Face free Inference API with Mistral or Phi. Upgrade later if response quality needs improvement.

---

## System Prompt Template

```
You are Candor AI, the AI assistant for Candor Management Agency's talent portal.

You are speaking with {talent_name}, a {category} represented by Candor based in {location}.

Your role is to answer questions about their bookings, payments, schedule, portfolio, contract terms, and commission. You can ONLY answer based on the data provided below. If you don't have the information, say so and suggest they contact their Candor booker.

Be concise, friendly, and professional. Use the talent's first name. Format financial figures with the correct currency symbol. When listing bookings, include date, client, location, and fee.

TALENT DATA:
---
Profile:
- Name: {first_name} {last_name}
- Category: {category}
- Location: {primary_location}
- Contract: {contract_type}, {exclusivity}, expires {contract_end_date}
- Commission rate: {commission_rate}%

Upcoming Bookings:
{for each booking with future date, status != cancelled}
- {project_title} | {status} | {booking_date} | {location_city} | {service_type} | Fee: {fee_currency} {talent_fee} | Media: {media_usage} | Territory: {territory} | Usage term: {usage_term} | Call time: {call_time}
{end for}

Recent Completed Bookings:
{for each booking with past date, status = completed, limit 5}
- {project_title} | {booking_date} | {location_city} | Fee: {fee_currency} {talent_fee}
{end for}

Payment Summary:
- Total earned (YTD): {currency} {sum of gross_fee this year}
- Net received (YTD): {currency} {sum of net_talent_payment where talent_paid this year}
- Awaiting payment: {currency} {sum of net amounts where status != talent_paid}

Payment Records:
{for each payment, limit 10, ordered by date DESC}
- {booking.project_title} | Gross: {currency} {gross_fee} | Commission: {currency} {commission_amount} | Net: {currency} {net_talent_payment} | Status: {status}
{end for}

Booked Dates:
{comma-separated list of all future booking dates}

Portfolio Status:
- Comp card: {comp_card_status}
- Digitals: {digitals_status}
- Portfolio images: {count}
- Last test shoot: {date}
- Next scheduled shoot: {date or "None scheduled"}

Contract Terms:
- Type: {contract_type}
- Exclusivity: {exclusivity}
- Start: {contract_start_date}
- End: {contract_end_date}
- Commission: {commission_rate}% of gross fees
- Termination: Either party with 30 days written notice
- Cure period: 14 days for material breach
---
```

---

## Chat Interface

### Design
- Chat panel accessible from sidebar: "Ask Candor" with AI badge
- Top bar: Candor AI icon (C in brand colour circle) + "Ask Candor" + subtitle "Your AI booking assistant"
- Chat area: scrollable message history
- Input area: text field + "Send" button (brand colour)

### Message Bubbles
- **AI messages:** Left-aligned, grey background, Candor avatar (C in brand colour circle)
- **Talent messages:** Right-aligned, brand colour background, white text

### Suggested Questions (Chips)
On first load or when chat is empty, show clickable suggestion chips below the AI's welcome message. Chips are dynamically generated based on the talent's current data:

**Always shown:**
- "When is my next booking?"
- "How much am I owed?"

**Conditional:**
- If talent has a booking within 7 days: "What's the call time for [project title]?"
- If talent has pending payments: "What's the status of my payment for [project title]?"
- If portfolio needs update: "What's my portfolio status?"
- If talent has a booking in a different city than their primary location: "Where is my [project title] shoot?"

### Conversation Management
- Conversations are per-session — stored in `ai_conversations` table
- Start a new conversation each time the talent opens Ask Candor (don't carry over from days ago — data may have changed)
- Store conversation history in JSONB for potential future analysis
- Maximum conversation length: 20 messages (10 turns). After that, show "Start a new conversation" button

### What the AI Should NOT Do
- Never reveal other talent's information
- Never make up bookings, payments, or dates that aren't in the data
- Never give legal advice about contracts (say "for legal questions, please speak with your Candor booker")
- Never discuss Candor's internal operations, client relationships, or business strategy
- Never process bookings, payments, or make changes — it's read-only
- If asked something outside its data scope, respond: "I don't have that information right now. You can reach your Candor booker at contact@candor-management.com or through the Communications section."

---

## API Endpoint

### `POST /api/ai/chat`

**Auth:** Talent only (JWT required)

**Request:**
```json
{
  "message": "When is my next booking?",
  "conversation_id": "uuid-or-null"
}
```

**Backend logic:**
1. Authenticate user, get `talent_id`
2. If `conversation_id` is null, create new `ai_conversations` row
3. Fetch talent's data from database (profile, bookings, payments, etc.)
4. Construct system prompt with data injected
5. Append conversation history from `ai_conversations.messages`
6. Append new user message
7. Send to AI model API
8. Stream response back to frontend
9. Save updated conversation to `ai_conversations.messages`

**Response:** Streamed text or:
```json
{
  "conversation_id": "uuid",
  "response": "Your next booking is with Zenith Bank on April 2..."
}
```

---

## Rate Limiting

- Maximum 50 AI queries per talent per day (prevents abuse of free API tier)
- If limit reached: "You've reached the daily limit for Ask Candor. Your booker is available at contact@candor-management.com."

---

## Future Enhancements

- Voice input (speech-to-text for mobile)
- Proactive suggestions: AI notices patterns and suggests actions ("You haven't updated your availability for next month — would you like to flag any unavailable dates?")
- Multilingual support: respond in the language the talent asks in (relevant for Nigerian talent who may prefer Pidgin or Yoruba)
- Upgrade to a more capable model (Claude or GPT) if response quality from free tier is insufficient
