# AI Layer Implementation Guide

## Architecture Recap

This is NOT RAG. The AI assistant uses **structured data injection** — the backend pulls the talent's data from the database and injects it directly into the prompt before every conversation. The talent's full data set (profile, bookings, payments, portfolio status, contract) is small enough to fit within any model's context window.

---

## Core Files

### `src/lib/ai.ts` — Provider Abstraction

This file handles the actual API call to whichever AI model is configured. Swapping providers only requires changing this file and the env vars.

```typescript
interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AiResponse {
  content: string;
  error?: string;
}

export async function callAiModel(messages: AiMessage[]): Promise<AiResponse> {
  const provider = process.env.AI_PROVIDER || 'huggingface';

  switch (provider) {
    case 'huggingface':
      return callHuggingFace(messages);
    case 'anthropic':
      return callAnthropic(messages);
    case 'openai':
      return callOpenAI(messages);
    default:
      return { content: '', error: `Unknown AI provider: ${provider}` };
  }
}

// --- Hugging Face (free tier) ---
async function callHuggingFace(messages: AiMessage[]): Promise<AiResponse> {
  const model = process.env.AI_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
  const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
  const apiKey = process.env.HF_API_KEY; // empty string = free tier (rate limited)

  // Hugging Face Inference API expects a specific format for chat models
  // Convert messages to the model's expected prompt format
  const prompt = formatMessagesForHF(messages);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,       // Low temperature for factual responses
          top_p: 0.9,
          do_sample: true,
          return_full_text: false, // Only return the generated response
        },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      // Handle model loading (free tier can be slow)
      if (res.status === 503) {
        return { content: "I'm warming up — please try again in a moment.", error: 'Model loading' };
      }
      return { content: '', error: `HF API error: ${res.status} ${error}` };
    }

    const data = await res.json();
    const generated = Array.isArray(data)
      ? data[0]?.generated_text || ''
      : data.generated_text || '';

    return { content: generated.trim() };
  } catch (err) {
    return { content: '', error: `HF API call failed: ${err}` };
  }
}

// Format messages into Mistral instruction format
function formatMessagesForHF(messages: AiMessage[]): string {
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `<s>[INST] ${msg.content}\n`;
    } else if (msg.role === 'user') {
      prompt += `${msg.content} [/INST]`;
    } else if (msg.role === 'assistant') {
      prompt += `${msg.content}</s>\n[INST] `;
    }
  }
  return prompt;
}

// --- Anthropic (future upgrade) ---
async function callAnthropic(messages: AiMessage[]): Promise<AiResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { content: '', error: 'Anthropic API key not configured' };

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const chatMessages = messages.filter(m => m.role !== 'system');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemMessage,
      messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  const data = await res.json();
  const text = data.content?.map((c: any) => c.text).join('') || '';
  return { content: text };
}

// --- OpenAI (future upgrade) ---
async function callOpenAI(messages: AiMessage[]): Promise<AiResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { content: '', error: 'OpenAI API key not configured' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  const data = await res.json();
  return { content: data.choices?.[0]?.message?.content || '' };
}
```

### `src/lib/ai-prompt.ts` — Prompt Builder

This file queries the database for the talent's data and constructs the system prompt.

```typescript
import { prisma } from './prisma';
import { format } from 'date-fns';

export async function buildTalentContext(talentId: string): Promise<string> {
  // Fetch all relevant data in parallel
  const [profile, measurements, portfolioStatus, upcomingBookings, recentBookings, payments, pendingPayments] = await Promise.all([
    prisma.talentProfile.findUnique({
      where: { id: talentId },
    }),
    prisma.talentMeasurements.findUnique({
      where: { talentId },
    }),
    prisma.talentPortfolioStatus.findUnique({
      where: { talentId },
    }),
    prisma.booking.findMany({
      where: { talentId, bookingDate: { gte: new Date() }, status: { not: 'cancelled' } },
      include: { client: { select: { companyName: true } } },
      orderBy: { bookingDate: 'asc' },
      take: 10,
    }),
    prisma.booking.findMany({
      where: { talentId, status: 'completed' },
      include: { client: { select: { companyName: true } } },
      orderBy: { bookingDate: 'desc' },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { talentId },
      include: { booking: { select: { projectTitle: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.payment.aggregate({
      where: { talentId, status: { not: 'talent_paid' } },
      _sum: { netTalentPayment: true },
    }),
  ]);

  if (!profile) return 'Error: Talent profile not found.';

  const currencySymbol: Record<string, string> = { NGN: '₦', GBP: '£', USD: '$' };

  // Calculate YTD totals
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const ytdPayments = payments.filter(p => p.createdAt >= yearStart);
  const totalGrossYTD = ytdPayments.reduce((sum, p) => sum + Number(p.grossFee), 0);
  const totalNetPaidYTD = ytdPayments
    .filter(p => p.status === 'talent_paid')
    .reduce((sum, p) => sum + Number(p.netTalentPayment), 0);
  const totalAwaiting = Number(pendingPayments._sum.netTalentPayment || 0);

  // Build the context string
  let context = `You are Candor AI, the booking assistant for Candor Management Agency's talent portal.

You are speaking with ${profile.firstName}, a ${profile.category.replace('_', ' ')} represented by Candor based in ${profile.primaryLocation}.

Your role is to answer questions about their bookings, payments, schedule, portfolio, contract terms, and commission. ONLY answer based on the data below. If you don't have the information, say so and suggest they contact their Candor booker at contact@candor-management.com or through the Communications section.

Be concise, friendly, and professional. Use their first name. Format financial figures with the correct currency symbol.

--- TALENT DATA ---

Profile:
- Name: ${profile.firstName} ${profile.lastName}
- Category: ${profile.category.replace('_', ' ')}
- Primary location: ${profile.primaryLocation}
- Contract: ${profile.contractType.replace('_', ' ')}, ${profile.exclusivity.replace('_', '-')}, expires ${format(profile.contractEndDate, 'MMMM d, yyyy')}
- Commission rate: ${profile.commissionRate}%

`;

  // Upcoming bookings
  if (upcomingBookings.length > 0) {
    context += `Upcoming Bookings:\n`;
    for (const b of upcomingBookings) {
      const sym = currencySymbol[b.feeCurrency] || b.feeCurrency;
      context += `- ${b.projectTitle} | Status: ${b.status} | Date: ${format(b.bookingDate, 'MMMM d, yyyy')} | Location: ${b.locationCity} | Service: ${b.serviceType} | Fee: ${sym}${Number(b.talentFee).toLocaleString()} | Media: ${b.mediaUsage || 'TBC'} | Territory: ${b.territory || 'TBC'} | Usage term: ${b.usageTerm || 'TBC'} | Call time: ${b.callTime || 'TBC'}\n`;
    }
    context += `\n`;
  } else {
    context += `Upcoming Bookings: None currently scheduled.\n\n`;
  }

  // Recent completed bookings
  if (recentBookings.length > 0) {
    context += `Recent Completed Bookings:\n`;
    for (const b of recentBookings) {
      const sym = currencySymbol[b.feeCurrency] || b.feeCurrency;
      context += `- ${b.projectTitle} | ${format(b.bookingDate, 'MMMM d, yyyy')} | ${b.locationCity} | ${sym}${Number(b.talentFee).toLocaleString()}\n`;
    }
    context += `\n`;
  }

  // Payment summary
  const primaryCurrency = upcomingBookings[0]?.feeCurrency || payments[0]?.currency || 'NGN';
  const sym = currencySymbol[primaryCurrency] || primaryCurrency;
  context += `Payment Summary:
- Total earned (YTD): ${sym}${totalGrossYTD.toLocaleString()}
- Net received (YTD): ${sym}${totalNetPaidYTD.toLocaleString()}
- Awaiting payment: ${sym}${totalAwaiting.toLocaleString()}

`;

  // Individual payment records
  if (payments.length > 0) {
    context += `Payment Records:\n`;
    for (const p of payments) {
      const ps = currencySymbol[p.currency] || p.currency;
      context += `- ${p.booking.projectTitle} | Gross: ${ps}${Number(p.grossFee).toLocaleString()} | Commission (${p.commissionRate}%): ${ps}${Number(p.commissionAmount).toLocaleString()} | Net: ${ps}${Number(p.netTalentPayment).toLocaleString()} | Status: ${p.status.replace(/_/g, ' ')}\n`;
    }
    context += `\n`;
  }

  // Booked dates
  const bookedDates = upcomingBookings.map(b => format(b.bookingDate, 'MMMM d')).join(', ');
  context += `Booked Dates: ${bookedDates || 'None'}\n\n`;

  // Portfolio status
  if (portfolioStatus) {
    context += `Portfolio Status:
- Comp card: ${portfolioStatus.compCardStatus.replace('_', ' ')}
- Digitals: ${portfolioStatus.digitalsStatus.replace('_', ' ')}
- Portfolio images: ${portfolioStatus.portfolioImageCount}
- Last test shoot: ${portfolioStatus.lastTestShoot ? format(portfolioStatus.lastTestShoot, 'MMMM d, yyyy') : 'None recorded'}
- Next scheduled shoot: ${portfolioStatus.nextScheduledShoot ? format(portfolioStatus.nextScheduledShoot, 'MMMM d, yyyy') : 'None scheduled'}

`;
  }

  // Contract terms
  context += `Contract Terms:
- Type: ${profile.contractType.replace('_', ' ')}
- Exclusivity: ${profile.exclusivity.replace('_', '-')}
- Start: ${format(profile.contractStartDate, 'MMMM d, yyyy')}
- End: ${format(profile.contractEndDate, 'MMMM d, yyyy')}
- Commission: ${profile.commissionRate}% of gross fees
- Termination: Either party with 30 days written notice
- Cure period: 14 days for material breach
- Client-paid expenses (travel, accommodation) are not commissionable
--- END TALENT DATA ---`;

  return context;
}
```

### `src/app/api/ai/chat/route.ts` — API Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getTalentId } from '@/lib/middleware';
import { buildTalentContext } from '@/lib/ai-prompt';
import { callAiModel } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  return withAuth(req, ['talent'], async (req, user) => {
    const talentId = await getTalentId(user.userId);
    if (!talentId) {
      return NextResponse.json({ error: 'Talent profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { message, conversation_id } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Rate limit: 50 queries per day per talent
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const queryCount = await prisma.aiConversation.count({
      where: {
        talentId,
        createdAt: { gte: today },
      },
    });

    if (queryCount >= 50) {
      return NextResponse.json({
        response: "You've reached the daily limit for Ask Candor. Your booker is available at contact@candor-management.com.",
        conversation_id: conversation_id || null,
      });
    }

    // Build system prompt with talent data
    const systemPrompt = await buildTalentContext(talentId);

    // Load or create conversation
    let conversation;
    let previousMessages: { role: string; content: string }[] = [];

    if (conversation_id) {
      conversation = await prisma.aiConversation.findUnique({
        where: { id: conversation_id },
      });
      if (conversation && conversation.talentId === talentId) {
        previousMessages = conversation.messages as any[];
      }
    }

    // Check conversation length (max 20 messages = 10 turns)
    if (previousMessages.length >= 20) {
      return NextResponse.json({
        response: "This conversation has reached its limit. Please start a new one for the freshest data.",
        conversation_id,
      });
    }

    // Build message array for AI
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...previousMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call AI model
    const aiResponse = await callAiModel(aiMessages);

    if (aiResponse.error && !aiResponse.content) {
      return NextResponse.json({
        response: "I'm having trouble right now. Please try again in a moment, or contact your booker at contact@candor-management.com.",
        conversation_id: conversation_id || null,
      });
    }

    // Save conversation
    const updatedMessages = [
      ...previousMessages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse.content, timestamp: new Date().toISOString() },
    ];

    if (conversation) {
      await prisma.aiConversation.update({
        where: { id: conversation.id },
        data: { messages: updatedMessages as any },
      });
    } else {
      conversation = await prisma.aiConversation.create({
        data: {
          talentId,
          messages: updatedMessages as any,
        },
      });
    }

    return NextResponse.json({
      response: aiResponse.content,
      conversation_id: conversation.id,
    });
  });
}
```

---

## Frontend Chat Component

### `src/hooks/useAiChat.ts`

```typescript
import { useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMsg: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversation_id: conversationId,
        }),
      });

      const data = await res.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Something went wrong. Please try again or contact your booker.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return { messages, isLoading, sendMessage, resetChat };
}
```

---

## Suggested Question Chips Logic

Generate chips dynamically based on the talent's current data:

```typescript
import { prisma } from './prisma';
import { addDays } from 'date-fns';

export async function getSuggestedQuestions(talentId: string): Promise<string[]> {
  const suggestions: string[] = [];

  // Always include these
  suggestions.push('When is my next booking?');
  suggestions.push('How much am I owed?');

  // Check for booking within 7 days
  const soonBooking = await prisma.booking.findFirst({
    where: {
      talentId,
      bookingDate: { gte: new Date(), lte: addDays(new Date(), 7) },
      status: { in: ['confirmed', 'pending'] },
    },
    orderBy: { bookingDate: 'asc' },
  });

  if (soonBooking) {
    suggestions.push(`What's the call time for ${soonBooking.projectTitle}?`);
  }

  // Check for pending payments
  const pendingPayment = await prisma.payment.findFirst({
    where: { talentId, status: { not: 'talent_paid' } },
    include: { booking: { select: { projectTitle: true } } },
  });

  if (pendingPayment) {
    suggestions.push(`Payment status for ${pendingPayment.booking.projectTitle}?`);
  }

  // Check portfolio needs update
  const portfolio = await prisma.talentPortfolioStatus.findUnique({
    where: { talentId },
  });

  if (portfolio?.compCardStatus === 'needs_update') {
    suggestions.push("What's my portfolio status?");
  }

  // Cap at 4 suggestions
  return suggestions.slice(0, 4);
}
```

---

## Model Swap Checklist

To switch from Hugging Face free tier to a paid model:

1. Update `.env.local`:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-xxx
   ```
   OR
   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-xxx
   ```

2. No code changes needed — `src/lib/ai.ts` handles routing by provider.

3. Test with a few queries to verify response quality.

4. Adjust `temperature` and `max_tokens` in the provider function if needed.

The system prompt in `ai-prompt.ts` works identically across all providers — it's plain text injected into the messages array.
