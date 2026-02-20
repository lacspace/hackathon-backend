import express, { type Application, type Request, type Response, type NextFunction } from 'express';
setInterval(() => {}, 1000); // Keep-alive
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Import Routes
import uploadRoutes from './routes/uploadRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Load Env
dotenv.config();

// Connect to Supabase (fire-and-forget connectivity check)
connectDB().catch(console.error);

const app: Application = express();

// Hardcore CORS fix
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('X-CORS-Debug', 'activated');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// Other Middleware
app.use(express.json());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

// Swagger Config
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PharmaGuard API',
            version: '1.0.0',
            description: 'API Documentation for PharmaGuard Genomic Analysis Platform',
            contact: {
                name: 'PharmaGuard Support',
                email: 'support@pharmaguard.med'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Local Development Server'
            }
        ]
    },
    apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
import healthRoutes from './routes/healthRoutes.js';
app.use('/api/health', healthRoutes);
import aiRoutes from './routes/aiRoutes.js';
app.use('/api/ai', aiRoutes);
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);
import notificationRoutes from './routes/notificationRoutes.js';
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'PharmaGuard API is Online 🧬',
        docs: `http://localhost:${process.env.PORT || 5000}/api-docs`
    });
});

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`❌ Server Error: ${err.message}`);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs\n`);
    });
}

export default app;
