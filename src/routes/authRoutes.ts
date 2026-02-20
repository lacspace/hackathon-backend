import express, { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_super_secret_clinical_key_2026';

// VERIFY endpoint - Check if token is still valid
router.get('/verify', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        res.json({ success: true, user });
    });
});

router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Authorized Clinical Personnel
    const MOCK_USERS = [
        {
            email: 'admin@lacspace.com',
            password: 'Abcd@123.45',
            data: { id: 'admin_root_001', name: 'Admin Bro', email: 'admin@lacspace.com', role: 'admin', accessLevel: 'Master Control' }
        },
        {
            email: 'deep@pharmaguard.com',
            password: 'Abcd@123.45',
            data: { id: 'pg_deep_002', name: 'Deep', email: 'deep@pharmaguard.com', role: 'clinician', accessLevel: 'Clinical Lead' }
        },
        {
            email: 'zeeshan@pharmaguard.com',
            password: 'Abcd@123.45',
            data: { id: 'pg_zeeshan_003', name: 'Zeeshan', email: 'zeeshan@pharmaguard.com', role: 'clinician', accessLevel: 'Senior Researcher' }
        },
        {
            email: 'abhishek@pharmaguard.com',
            password: 'Abcd@123.45',
            data: { id: 'pg_abhishek_004', name: 'Abhishek', email: 'abhishek@pharmaguard.com', role: 'clinician', accessLevel: 'Lab Specialist' }
        },
        {
            email: 'adarsh@pharmaguard.com',
            password: 'Abcd@123.45',
            data: { id: 'pg_adarsh_005', name: 'Adarsh', email: 'adarsh@pharmaguard.com', role: 'clinician', accessLevel: 'Data Analyst' }
        }
    ];

    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);

    if (foundUser) {
        const user = foundUser.data;
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });

        console.log(`🔐 Clinical Access Granted: ${email}`);

        return res.json({
            success: true,
            user,
            token
        });
    }

    console.warn(`🚨 Unauthorized Access Attempt: ${email}`);
    return res.status(401).json({ error: 'Forbidden: Invalid Clinical Credentials' });
});

export default router;
