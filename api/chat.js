
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

    // Default to Phi-3 (Microsoft's reliable free model)
    const model = userModel || 'microsoft/Phi-3-mini-4k-instruct';

    try {
        // TARGET: The OpenAI-compatible Chat Completion Endpoint on the new Router
        // This is the standard way to do chat now.
        const url = `https://router.huggingface.co/models/${model}/v1/chat/completions`;

        console.log(`Connecting to HF Router: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                stream: false
            })
        });

        // Handle Errors Explicitly
        if (!response.ok) {
            const text = await response.text();
            console.error(`HF Router Error (${response.status}): ${text}`);

            // If 404, it means this specific model doesn't support the Chat API on the free tier.
            // We could fallback to 'inputs', but let's see the error first.
            return res.status(response.status).json({
                error: `HF API Error (${response.status}): ${text}`,
                details: "The model might not support the Chat API or is unavailable."
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Proxy Server Error:", error);
        res.status(500).json({ error: error.message });
    }
}
