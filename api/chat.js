
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

    // Switch to Qwen 2.5 7B Instruct (Free, Fast, Smart)
    const model = userModel || 'Qwen/Qwen2.5-7B-Instruct';

    try {
        // --- Strategy 1: Try Chat Completion Endpoint (Preferred for Qwen) ---
        const chatUrl = `https://router.huggingface.co/models/${model}/v1/chat/completions`;
        console.log(`Trying Chat API: ${chatUrl}`);

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

        if (chatResponse.ok) {
            const data = await chatResponse.json();
            return res.status(200).json(data);
        }

        console.warn(`Chat API failed (${chatResponse.status}), falling back to Standard API...`);

        // --- Strategy 2: Fallback to Standard Inference API ---
        const standardUrl = `https://router.huggingface.co/models/${model}`;

        // Qwen uses ChatML-like formatting, but for standard inference, 
        // passing the raw prompt is often needed.
        // Let's try a generic format: "System: ... User: ... Assistant:"
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
            return res.status(standardResponse.status).json({
                error: `HF API Error (Both endpoints failed). Last error: ${text}`,
                model: model
            });
        }

        const data = await standardResponse.json();

        // Normalize response
        if (Array.isArray(data) && data[0]?.generated_text) {
            return res.status(200).json({
                choices: [{ message: { content: data[0].generated_text } }]
            });
        } else {
            return res.status(200).json(data);
        }

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
}
