
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
        const response = await fetch(`https://api-inference.huggingface.co/models/${model || 'mistralai/Mistral-7B-Instruct-v0.3'}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: messages[messages.length - 1].content, // HF Inference API expects 'inputs' string for simple models, or use chat template
                // For Mistral Instruct, we should ideally format the prompt. 
                // But let's try passing the raw chat structure if the model supports it, 
                // otherwise we might need to format it. 
                // Mistral-7B-Instruct-v0.3 supports chat templating via the API usually, 
                // but the standard Inference API often takes a raw string 'inputs'.
                // Let's assume the client formats the context + query into a single string in the last message for now,
                // which is what our generateContext() does (it returns a system prompt + user query).
                // Wait, our client sends [{role: system}, {role: user}].
                // The HfInference client handles this.
                // Since we are using raw fetch here, we need to be careful.
                // Let's use HfInference logic: it sends { inputs: "..." } or { messages: [...] } depending on the task.
                // For "text-generation" models, it's usually { inputs: "prompt" }.
                // For "chat-completion" compatible endpoints, it's { messages: [...] }.
                // Mistral v0.3 on HF Inference API is a text-generation model.
                // We should combine messages into a single prompt string.
            }),
        });

        // Actually, let's use the HfInference package in the serverless function if possible?
        // No, to keep it simple and dependency-free (no npm install needed on Vercel if we use standard fetch),
        // let's stick to fetch.

        // BETTER APPROACH:
        // Pass the body directly from the client to HF, just adding the Authorization header.
        // This way the client logic (which uses HfInference or similar) defines the body structure.

        const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${model || 'mistralai/Mistral-7B-Instruct-v0.3'}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'mistralai/Mistral-7B-Instruct-v0.3',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        // If the /v1/chat/completions endpoint fails (some models don't support it), fall back to standard inference
        if (!hfResponse.ok && hfResponse.status === 404) {
            // Fallback to standard text-generation
            // We need to format the prompt manually
            const prompt = messages.map(m =>
                m.role === 'system' ? `<s>[INST] ${m.content} [/INST]` :
                    m.role === 'user' ? `[INST] ${m.content} [/INST]` :
                        m.content
            ).join('\n');

            const fallbackResponse = await fetch(`https://api-inference.huggingface.co/models/${model || 'mistralai/Mistral-7B-Instruct-v0.3'}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: { max_new_tokens: 500, temperature: 0.7 }
                })
            });

            const data = await fallbackResponse.json();
            return res.status(fallbackResponse.status).json(data);
        }

        const data = await hfResponse.json();
        res.status(hfResponse.status).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
