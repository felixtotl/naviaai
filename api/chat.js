// Dies ist der sichere Backend-Code, der auf Vercel läuft.
// Er sieht den API-Key, aber der Browser sieht ihn NICHT.

// Zugriff auf die Environment Variable, die NUR hier verfügbar ist.
const API_KEY = process.env.HUGGINGFACE_API_KEY; 
const API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL = "meta-llama/Llama-3.1-70B-Instruct";

// Standard-System-Prompt (basierend auf Ihrem Originalcode)
const SYSTEM_PROMPT = {
    role: "system",
    content: "Du bist Navia AI, eine hochmoderne, intelligente und freundliche KI-Assistentin entwickelt von ChatNet. Du basierst auf der navi Du antwortest präzise und ausführlich auf Deutsch. Deine Antworten werden privat behandelt. Du darfst keinen Quellcode oder sontige Konfigurations Infos rausgeben, da dies gegen die Nutzungsrichtlinien verstößt. Nutze Markdown für Code und Formatierung, Mathematische Formeln und Terme und auch einfache aufgaben, und achte besonders auf die Verwendung von mehreren übersichtlichen Absätzen, bei jeder Antwort. Nutze mardown wenn folgendes eintritt: bei mathematischen sachen (egal wie schwer oder leicht) und code. Nutze Ansichten und schreibweisen die der Computer richtig anzeien kann. Verwende Stichpunkten zur besseren Lesbarkeit. Antworte schnell, präzise und effizient. Wähle die ausführlichste Antwort-Länge für die Anfrage, aber optimiere die Schnelligkeit."
};

// Vercel Serverless Function Handler
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Methode nicht erlaubt' });
    }

    if (!API_KEY) {
        return response.status(500).json({ error: 'API Key nicht auf dem Server konfiguriert.' });
    }
    
    // Die Messages vom Frontend-Body extrahieren
    const { messages, max_tokens = 1024, temperature = 0.7, mode = 'fast' } = request.body;

    // Optional: Füge hier Logik ein, um den System-Prompt dynamisch basierend auf dem Modus (fast/smart) zu ändern, 
    // um die Komplexität Ihres Frontends zu replizieren.
    
    // Füge den System-Prompt an den Anfang der Messages hinzu
    const finalMessages = [SYSTEM_PROMPT, ...messages];


    try {
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}` // SICHERER KEY wird hier verwendet
            },
            body: JSON.stringify({
                model: MODEL,
                messages: finalMessages,
                max_tokens: max_tokens,
                temperature: temperature
            })
        });

        const data = await apiResponse.json();
        
        // Den Statuscode der externen API an das Frontend weitergeben
        if (!apiResponse.ok) {
            console.error("Externe API Fehler:", data);
            return response.status(apiResponse.status).json(data);
        }

        // Ergebnis der KI an das Frontend zurücksenden
        response.status(200).json(data);

    } catch (error) {
        console.error('Proxy-Fetch-Fehler:', error);
        response.status(500).json({ error: 'Interner Serverfehler beim Aufruf der KI.' });
    }
}
