const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const prompt = "What does CYP2C19 do?";
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 10000
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("RESPONSE:", data);
    });
});

req.on('error', (err) => console.error(err));
req.write(payload);
req.end();
