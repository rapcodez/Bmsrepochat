
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, model: userModel, token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Missing Hugging Face Token' });
    }

    // Default to Phi-3 if not specified, as it's reliable on free tier
    const model = userModel || 'microsoft/Phi-3-mini-4k-instruct';

    try {
        // --- Strategy 1: Try OpenAI-Compatible Chat Endpoint ---
        // This is preferred as it handles prompt formatting automatically
        const chatUrl = `https://router.huggingface.co/models/${model}/v1/chat/completions`;

        const chatResponse = await fetch(chatUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        // If successful, return immediately
        if (chatResponse.ok) {
            const data = await chatResponse.json();
            return res.status(200).json(data);
        }

        // If error is NOT 404/405, it's a real error (e.g. 401, 429, 500). Return it.
        // 404/405 means the endpoint doesn't exist for this model, so we try fallback.
        if (chatResponse.status !== 404 && chatResponse.status !== 405) {
            const text = await chatResponse.text();
            return res.status(chatResponse.status).json({ error: `HF Chat API Error: ${text}` });
        }

        console.log(`Chat API not supported for ${model} (${chatResponse.status}), falling back to standard inference...`);

        // --- Strategy 2: Fallback to Standard Inference API ---
        const standardUrl = `https://router.huggingface.co/models/${model}`;

        // Simple prompt formatting for fallback
        // We just join the messages. Most instruction models handle this reasonably well even without perfect tags.
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n') + "\nassistant:";

        const standardResponse = await fetch(standardUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    return_full_text: false
                }
            })
        });

        if (!standardResponse.ok) {
            const text = await standardResponse.text();
            return res.status(standardResponse.status).json({ error: `HF Standard API Error: ${text}` });
        }

        const data = await standardResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
}
