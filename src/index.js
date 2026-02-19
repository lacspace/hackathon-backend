import express, {} from 'express';
setInterval(() => { }, 1000); // Keep-alive
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
const app = express();
// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
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
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'PharmaGuard API is Online 🧬',
        docs: `http://localhost:${process.env.PORT || 5000}/api-docs`
    });
});
// Error Handling Middleware
app.use((err, req, res, next) => {
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
//# sourceMappingURL=index.js.map