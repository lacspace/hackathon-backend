import express, { type Request, type Response } from 'express';
import supabase from '../config/db.js';
import crypto from 'crypto';

const router = express.Router();

let memoryNotifications: any[] = [];

// GET notifications
router.get('/', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn(`Supabase notifications fetch failed: ${error.message}. Returning memory fallback.`);
            return res.json(memoryNotifications);
        }

        return res.json(data);
    } catch (e: any) {
        return res.json(memoryNotifications);
    }
});

export const addNotification = async (title: string, message: string, type: string = 'info') => {
    try {
        const payload = {
            id: crypto.randomUUID(),
            title,
            message,
            type,
            read: false,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('notifications')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.warn(`Supabase insert failed: ${error.message}. Using memory fallback.`);
            memoryNotifications.unshift(payload);
            return payload;
        }

        return data;
    } catch (e: any) {
        console.error('Add notification error:', e.message);
        return null;
    }
};

// POST notification (auto-created when processing completes)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, message, type = 'info' } = req.body;
        const result = await addNotification(title, message, type);
        return res.status(201).json(result);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

// Mark as read
router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            const idx = memoryNotifications.findIndex(n => n.id === id);
            if (idx > -1) memoryNotifications[idx].read = true;
            return res.json({ success: true });
        }

        return res.json(data);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

export default router;
