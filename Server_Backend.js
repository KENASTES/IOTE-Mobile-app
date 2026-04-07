const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

const HuggingFace_API_Key = "";


app.use(cors());

app.use(express.json());

const uploadDir = './News_Image_Storage';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

app.use('/News_Image_Storage', express.static(path.join(__dirname, 'News_Image_Storage')));

app.get('/api/Course', async (req, res) => {
    try {
        const Courses = await prisma.course.findMany();
        res.json({ success: true, data: Courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/Course', async (req, res) => {
    try {
        const { code, title } = req.body;
        const New_Courses = await prisma.course.create({
            data: { code, title }
        });
        res.json({ success: true, data: New_Courses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/News', async (req, res) => {
    try {
        const allNews = await prisma.News.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: allNews });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/News', upload.single('image'), async (req, res) => {
    try {
        const { title, description, refUrl } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `http://localhost:${PORT}/News_Image_Storage/${req.file.filename}`;
        }
        const newNews = await prisma.News.create({
            data: { title, description, imageUrl, refUrl }
        });
        res.status(201).json({ success: true, data: newNews });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/Camp_And_Workshop', async (req, res) => {
    try {
        const camps = await prisma.Camp_And_Workshop.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: camps });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/Camp_And_Workshop', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `http://localhost:${PORT}/News_Image_Storage/${req.file.filename}`;
        }
        const newCamp = await prisma.Camp_And_Workshop.create({
            data: { title, description, imageUrl }
        });
        res.status(201).json({ success: true, data: newCamp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/embeddings', async (req, res) => {
    try {
        const response = await fetch('https://router.huggingface.co/hf-inference/models/BAAI/bge-m3/pipeline/feature-extraction', {
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
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
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
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error("Chat API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server (Database + Chatbot) is running on http://localhost:${PORT}`);
});
