import express, {} from 'express';
import https from 'https';
const router = express.Router();
router.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question)
            return res.status(400).json({ error: 'Question is required' });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
        const prompt = `
            You are PharmaGuard AI, an expert clinical pharmacogenomics assistant.
            You help users and clinicians understand precision medicine, genetic drug testing, and pharmacogenomics.
            Answer the following question clearly and concisely in 2-3 short paragraphs, representing the PharmaGuard platform AI.
            
            Question: ${question}
        `;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });
        const reqApi = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10000
        }, (resApi) => {
            let data = '';
            resApi.on('data', chunk => data += chunk);
            resApi.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) {
                        console.error('Gemini API Error:', json.error);
                        return res.json({ answer: `AI Error: ${json.error.message}` });
                    }
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
                    res.json({ answer: text });
                }
                catch (e) {
                    res.status(500).json({ error: 'Failed to parse AI response' });
                }
            });
        });
        reqApi.on('error', (err) => res.status(500).json({ error: err.message }));
        reqApi.on('timeout', () => { reqApi.destroy(); res.status(504).json({ error: 'Timeout' }); });
        reqApi.write(payload);
        reqApi.end();
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=aiRoutes.js.map