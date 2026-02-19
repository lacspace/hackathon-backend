import express, { type Request, type Response } from 'express';
import supabase from '../config/db.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
            return res.status(500).json({ status: 'offline', error: error.message });
        }
        res.json({ status: 'live' });
    } catch (e: any) {
        res.status(500).json({ status: 'offline', error: e.message });
    }
});

export default router;
