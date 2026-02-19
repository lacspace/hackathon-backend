import express, {} from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { createProfile } from '../models/Profile.js';
import { parseVCFContent } from '../utils/vcfParser.js';
import { generatePatientReport } from '../utils/aiModule.js';
import { addNotification } from './notificationRoutes.js';
const router = express.Router();
// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(vcf|txt)$/)) {
            return cb(new Error('Please upload a VCF or TXT file'));
        }
        cb(null, true);
    }
});
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a VCF file for genomic analysis
 *     tags: [Upload]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vcf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File processed successfully
 *       400:
 *         description: Bad Request
 */
router.post('/', upload.single('vcf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(`📂 Processing VCF: ${req.file.originalname}`);
        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // Parse VCF
        const geneticData = parseVCFContent(fileContent);
        // Persist to Supabase
        const newProfile = await createProfile({
            name: `Patient ${new Date().toLocaleDateString()}`,
            genes: geneticData,
            filePath: req.file.path,
            fileName: req.file.originalname,
        });
        // Generate the required structured report as per Hackathon Case Study
        const report = await generatePatientReport(newProfile.id, newProfile.genes);
        // Auto-create notification
        await addNotification("Genome Analysis Complete", `Report generated for ${req.file.originalname} predicting risks with Level 1A CPIC evidence.`, "success");
        res.status(201).json({
            ...report
        });
    }
    catch (error) {
        console.error('❌ Upload Error:', error.message);
        res.status(500).json({ error: 'Server error processing file' });
    }
});
export default router;
//# sourceMappingURL=uploadRoutes.js.map