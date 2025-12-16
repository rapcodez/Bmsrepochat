
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

    const { messages, model, token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Missing Hugging Face Token' });
    }

    try {
        // Use the new router URL
        const apiUrl = `https://router.huggingface.co/models/${model || 'mistralai/Mistral-7B-Instruct-v0.2'}/v1/chat/completions`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'mistralai/Mistral-7B-Instruct-v0.2',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        // Handle non-JSON responses (like 404 Not Found text)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("HF API Non-JSON Response:", text);
            return res.status(response.status).json({
                error: `HF API Error (${response.status}): ${text.substring(0, 200)}`
            });
        }

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || JSON.stringify(data) });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
}
