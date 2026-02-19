import express, {} from 'express';
import { findProfileById, updateProfileById, getAllProfiles } from '../models/Profile.js';
const router = express.Router();
// Get all profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await getAllProfiles();
        res.json(profiles);
    }
    catch (error) {
        console.error('Profiles Fetch All Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get Profile by ID (UUID)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: 'Missing ID' });
        const profile = await findProfileById(id);
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    }
    catch (error) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update Profile
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: 'Missing ID' });
        const profile = await updateProfileById(id, req.body);
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
export default router;
//# sourceMappingURL=profileRoutes.js.map