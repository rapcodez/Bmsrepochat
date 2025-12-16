
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

    // Force Mistral v0.2 as it is the most reliable on free tier
    const model = 'mistralai/Mistral-7B-Instruct-v0.2';

    try {
        // TARGET: Standard Inference Endpoint (Raw Text Generation)
        // This is safer than Chat API which returns 404 for many models on free tier.
        const url = `https://router.huggingface.co/models/${model}`;

        console.log(`Connecting to HF Router (Standard): ${url}`);

        // Manual Prompt Formatting for Mistral
        // Combine System + User into one [INST] block
        const systemMsg = messages.find(m => m.role === 'system')?.content || "";
        const userMsg = messages.find(m => m.role === 'user')?.content || "";
        const fullPrompt = `<s>[INST] ${systemMsg}\n\n${userMsg} [/INST]`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 800,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`HF Router Error (${response.status}): ${text}`);
            return res.status(response.status).json({
                error: `HF API Error (${response.status}): ${text}`,
                url: url
            });
        }

        const data = await response.json();

        // Standard API returns array: [{ generated_text: "..." }]
        if (Array.isArray(data) && data[0]?.generated_text) {
            return res.status(200).json({
                choices: [{ message: { content: data[0].generated_text } }]
            });
        } else {
            return res.status(200).json(data); // Pass through if format differs
        }

    } catch (error) {
        console.error("Proxy Server Error:", error);
        res.status(500).json({ error: error.message });
    }
}
