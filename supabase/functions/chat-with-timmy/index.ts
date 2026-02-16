import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    // FIX 1: Use the correct Chat Completions endpoint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // FIX 2: Use a valid model name (e.g., "gpt-4o-mini" or "gpt-4")
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Timmy AI, a professional South African crypto tax assistant for TaxTim. You specialize in SARS FIFO rules. Be helpful, concise, and professional. Remind users you provide information, not official financial advice."
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    const data = await response.json();

    // FIX 3: Correctly parse the standard OpenAI response
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn’t process that request.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});