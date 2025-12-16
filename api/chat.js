
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

    // Default to Phi-3
    const model = userModel || 'microsoft/Phi-3-mini-4k-instruct';

    // Helper to try a URL
    const tryFetch = async (url, body) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            return response;
        } catch (e) {
            return { ok: false, status: 500, statusText: e.message, text: () => Promise.resolve(e.message) };
        }
    };

    try {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n') + "\nassistant:";
        const body = {
            inputs: prompt,
            parameters: { max_new_tokens: 500, return_full_text: false }
        };

        // URL Candidates
        const urls = [
            `https://router.huggingface.co/models/${model}`,
            `https://router.huggingface.co/hf-inference/models/${model}`
        ];

        let lastError = "";

        for (const url of urls) {
            console.log(`Trying URL: ${url}`);
            const response = await tryFetch(url, body);

            if (response.ok) {
                const data = await response.json();
                return res.status(200).json(data);
            }

            const text = await response.text();
            lastError = `URL: ${url} | Status: ${response.status} | Error: ${text.substring(0, 100)}`;
            console.error(`Failed: ${lastError}`);

            // If 401 (Unauthorized), stop trying (token is bad)
            if (response.status === 401) {
                return res.status(401).json({ error: "Invalid Hugging Face Token (401)" });
            }
        }

        // If all failed
        return res.status(500).json({
            error: `All connection attempts failed. Last error: ${lastError}`
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
}
