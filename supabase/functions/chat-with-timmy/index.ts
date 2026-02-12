
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/// <reference lib="Deno.ns" />
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text:
                  "You are Timmy AI, a professional South African crypto tax assistant for TaxTim. " +
                  "You specialize in SARS FIFO rules. Be helpful, concise, and professional. " +
                  "Remind users you provide information, not official financial advice."
              }
            ]
          },
          {
            role: "user",
            content: [{ type: "text", text: message }]
          }
        ]
      }),
    });

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text ??
      "Sorry, I couldn’t process that request.";

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
