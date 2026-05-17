export async function handler() {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ok: true,
      service: "cleitin-cobrancas-netlify-api",
      groqConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "SUA_API_KEY"),
    }),
  };
}
