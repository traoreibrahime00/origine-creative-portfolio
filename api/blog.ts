import fs from 'fs';
import path from 'path';

// Vercel Serverless Function for Blog Articles
export default async function handler(req: any, res: any) {
    const filePath = path.resolve(process.cwd(), './src/data/blog.json');

    if (req.method === 'GET') {
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).end(data);
            }
            return res.status(200).json([]);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        try {
            const body = JSON.stringify(req.body);
            fs.writeFileSync(filePath, body);
            return res.status(200).json({ success: true });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
