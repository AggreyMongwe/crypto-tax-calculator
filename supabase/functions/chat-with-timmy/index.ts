import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log("Timmy received a message:", message);

    // CALL GROQ INSTEAD OF OPENAI
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Using Llama-3.3-70b-versatile (very smart and completely free)
        model: "llama-3.3-70b-versatile",
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
    console.log("Groq Response Status:", response.status);

    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I’m experiencing a small glitch in my tax-brain. Try again?";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});