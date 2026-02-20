import express, { type Request, type Response } from 'express';
import https from 'https';

const router = express.Router();

router.post('/ask', async (req: Request, res: Response) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'Question is required' });
        
        const apiKeys = [
            process.env.GEMINI_API_KEY, 
            ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [])
        ].filter(Boolean).map(k => (k as string).trim()) as string[];

        const prompt = `
            You are PharmaGuard AI, an expert clinical pharmacogenomics assistant.
            You help users and clinicians understand precision medicine, genetic drug testing, and pharmacogenomics.
            Answer the following question clearly and concisely in 2-3 short paragraphs, representing the PharmaGuard platform AI.
            
            Question: ${question}
        `;

        let finalAnswer = "I'm sorry, I couldn't process that query right now. Please refer to the CPIC guidelines in the dashboard for confirmed clinical actions.";

        for (const key of apiKeys) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
                const payload = JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                });

                const apiRes = await new Promise<string>((resolve, reject) => {
                    const reqApi = https.request(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(payload)
                        },
                        timeout: 10000
                    }, (resStream) => {
                        let data = '';
                        resStream.on('data', chunk => data += chunk);
                        resStream.on('end', () => {
                            if (resStream.statusCode && resStream.statusCode >= 400) {
                                return reject(new Error(`API Error ${resStream.statusCode}`));
                            }
                            try {
                                const json = JSON.parse(data);
                                resolve(json.candidates?.[0]?.content?.parts?.[0]?.text || '');
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });

                    reqApi.on('error', reject);
                    reqApi.on('timeout', () => { reqApi.destroy(); reject(new Error('Timeout')); });
                    reqApi.write(payload);
                    reqApi.end();
                });

                if (apiRes) {
                    finalAnswer = apiRes;
                    process.stdout.write(`✨ Chat AI Success [${key.substring(0, 4)}]\n`);
                    break;
                }
            } catch (err) {
                continue; // Try next key
            }
        }

        res.json({ answer: finalAnswer });

    } catch (e: any) {
        res.json({ answer: "PharmaGuard AI Console is temporarily optimizing. Please check evidence markers below." });
    }
});

export default router;
