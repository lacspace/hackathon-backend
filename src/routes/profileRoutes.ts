import express, { type Request, type Response } from 'express';
import { findProfileById, updateProfileById, getAllProfiles } from '../models/Profile.js';

const router = express.Router();

// Get all profiles
router.get('/', async (req: Request, res: Response) => {
    try {
        const profiles = await getAllProfiles();
        res.json(profiles);
    } catch (error: any) {
        console.error('Profiles Fetch All Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Profile by ID (UUID)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Missing ID' });
        const profile = await findProfileById(id as string);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (error: any) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Missing ID' });
        const profile = await updateProfileById(id as string, req.body);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
