const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const HuggingFace_API_Key = "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"; 

app.post('/api/embeddings', async (req, res) => {
    try {
        const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/BAAI/bge-m3', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HuggingFace_API_Key}`
            },
            body: JSON.stringify({ inputs: req.body.inputs })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF Embedding Error: ${errText}`);
        }

        const data = await response.json();

        res.json({ embedding: data }); 
    } catch (error) {
        console.error("Embedding API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HuggingFace_API_Key}`
            },
            body: JSON.stringify({
                model: 'Qwen/Qwen2.5-7B-Instruct',
                messages: req.body.messages,
                max_tokens: 500,
                temperature: req.body.temperature || 0.6
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF Chat Error: ${errText}`);
        }
        
        const data = await response.json();
        // ส่งข้อความที่ AI ตอบกลับไปให้หน้าบ้าน
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error("Chat API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Chatbot Backend Proxy กำลังรันอยู่ที่พอร์ต ${PORT}`);
});