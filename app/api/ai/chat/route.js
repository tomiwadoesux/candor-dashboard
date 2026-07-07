import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = process.env.HF_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct";
const MAX_TURNS = 20;

// Ask Candor — talent-only assistant grounded in the caller's own data.
// RLS means every query below can only ever return the signed-in talent's rows.
export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "talent") {
    return NextResponse.json(
      { error: "Ask Candor is available to talent accounts" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const message = body?.message?.toString().trim();
  if (!message) {
    return NextResponse.json({ error: "Say something first" }, { status: 400 });
  }

  if (!process.env.HF_TOKEN) {
    return NextResponse.json({
      reply:
        "The assistant isn't configured yet — the team needs to add an HF_TOKEN. In the meantime, your bookings, payments and documents pages have everything up to date.",
    });
  }

  // Ground the model in this talent's actual data.
  const [bookings, payments, castings] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "project_name, status, start_date, end_date, fee_gross, currency, clients(company_name)"
      )
      .order("start_date", { ascending: false })
      .limit(12),
    supabase
      .from("payments")
      .select("amount_gross, amount_net, currency, status, invoice_number, paid_date")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("open_castings_public")
      .select("title, category, location, deadline")
      .limit(8),
  ]);

  const context = {
    talent_name: profile.full_name,
    today: new Date().toISOString().slice(0, 10),
    bookings: bookings.data ?? [],
    payments: payments.data ?? [],
    open_castings: castings.data ?? [],
    commission_note: "Candor's commission is 20% of gross fees.",
  };

  // Conversation history (single rolling conversation per talent).
  const { data: convo } = await supabase
    .from("ai_conversations")
    .select("id, messages")
    .eq("talent_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const history = Array.isArray(convo?.messages)
    ? convo.messages.slice(-MAX_TURNS)
    : [];

  const messages = [
    {
      role: "system",
      content: `You are Ask Candor, the assistant inside Candor Management Agency's talent dashboard (models, photographers, creative directors — Lagos, London, USA). Answer only from the JSON context below. Be warm, brief, and concrete. If the data doesn't contain the answer, say so and point the talent to their booker at contact@candor-management.com. Never invent bookings, fees, or dates.\n\nCONTEXT:\n${JSON.stringify(context)}`,
    },
    ...history,
    { role: "user", content: message },
  ];

  let reply;
  try {
    const res = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 400,
        temperature: 0.4,
      }),
    });
    if (!res.ok) throw new Error(`HF ${res.status}`);
    const json = await res.json();
    reply = json.choices?.[0]?.message?.content?.trim();
  } catch {
    return NextResponse.json({
      reply:
        "I couldn't reach the assistant just now — free-tier limits, most likely. Try again in a minute.",
    });
  }

  if (!reply) {
    return NextResponse.json({
      reply: "I came back empty-handed — try rephrasing that?",
    });
  }

  const newMessages = [
    ...history,
    { role: "user", content: message },
    { role: "assistant", content: reply },
  ].slice(-MAX_TURNS);

  if (convo?.id) {
    await supabase
      .from("ai_conversations")
      .update({ messages: newMessages })
      .eq("id", convo.id);
  } else {
    await supabase
      .from("ai_conversations")
      .insert({ talent_user_id: user.id, messages: newMessages });
  }

  return NextResponse.json({ reply });
}
