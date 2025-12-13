export const config = {
  runtime: 'edge', // Macht es schneller (optional)
};

const API_KEY = process.env.HUGGINGFACE_API_KEY; 
const API_URL = "https://router.huggingface.co/v1/chat/completions";

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Server Config Error: API Key fehlt.' }), { 
          status: 500, headers: { 'Content-Type': 'application/json' } 
      });
  }

  try {
    const { messages, max_tokens, temperature, model } = await req.json();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: model, // Modell kommt vom Frontend
        messages: messages,
        max_tokens: max_tokens || 1024,
        temperature: temperature || 0.7
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
}
