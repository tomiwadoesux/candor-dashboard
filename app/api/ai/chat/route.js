import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTalentDossier } from "@/lib/ai/context";
import { hfChat } from "@/lib/ai/hf";

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

  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!talent) {
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

  // Ground the model in this talent's full account dossier — a markdown
  // document regenerated from the live database on every question. RLS scopes
  // every query inside it to the signed-in talent's own rows, so the dossier
  // can never contain another talent's data.
  const dossier = await buildTalentDossier(supabase, talent);

  // Conversation history (single rolling conversation per talent).
  const { data: convo } = await supabase
    .from("ai_conversations")
    .select("id, messages")
    .eq("talent_id", talent.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const history = Array.isArray(convo?.messages)
    ? convo.messages.slice(-MAX_TURNS)
    : [];

  const messages = [
    {
      role: "system",
      content: `You are Ask Candor, the private assistant inside ${talent.first_name}'s Candor Management Agency talent dashboard (Lagos · London · USA). You are speaking ONLY to ${talent.first_name} ${talent.last_name}, and the dossier below contains ONLY their account. Answer strictly from the dossier — never invent bookings, fees, dates, or brand names, and never speculate about any other talent's information. Casting brand names are confidential until selection. Be warm, brief, and concrete; quote exact figures and dates from the dossier. If the dossier doesn't contain the answer, say so and point them to their booker at contact@candor-management.com.\n\n${dossier}`,
    },
    ...history,
    { role: "user", content: message },
  ];

  const result = await hfChat(messages);
  if (result.error) {
    return NextResponse.json({
      reply:
        result.error === "not_configured"
          ? "The assistant isn't configured yet — the team needs to add an HF_TOKEN."
          : "I couldn't reach the assistant just now — try again in a minute. If this keeps happening, tell your booker.",
    });
  }
  const reply = result.reply;

  const now = new Date().toISOString();
  const newMessages = [
    ...history,
    { role: "user", content: message, timestamp: now },
    { role: "assistant", content: reply, timestamp: now },
  ].slice(-MAX_TURNS);

  if (convo?.id) {
    await supabase
      .from("ai_conversations")
      .update({ messages: newMessages })
      .eq("id", convo.id);
  } else {
    await supabase
      .from("ai_conversations")
      .insert({ talent_id: talent.id, messages: newMessages });
  }

  return NextResponse.json({ reply });
}
