import fs from 'fs';
import path from 'path';
import { processGenomicData } from '../utils/dataProcessor.js';
const DATA_PATH = '/Users/apple/Downloads/hackathon/Rift_hackathon_project_using_healthcare/data';
const BACKEND_OUTPUT = '/Users/apple/Downloads/hackathon/Rift_hackathon_project_using_healthcare/backend/src/data/advanced_drug_db.json';
const FRONTEND_OUTPUT = '/Users/apple/Downloads/hackathon/Rift_hackathon_project_using_healthcare/src/data/drug_db.json';
async function main() {
    try {
        const knowledgeBase = await processGenomicData(DATA_PATH);
        // Ensure output directories exist
        os_mkdir_p(path.dirname(BACKEND_OUTPUT));
        os_mkdir_p(path.dirname(FRONTEND_OUTPUT));
        // Save to backend
        fs.writeFileSync(BACKEND_OUTPUT, JSON.stringify(knowledgeBase, null, 2));
        console.log(`✅ Saved advanced KB to ${BACKEND_OUTPUT}`);
        // Map to the simple format the current engine expects for backward compatibility
        const simpleDb = {};
        Object.keys(knowledgeBase).forEach(drug => {
            const kb = knowledgeBase[drug];
            simpleDb[drug] = {
                gene: kb.genes.length > 0 ? kb.genes.join(', ') : 'See CPIC',
                advice: kb.guidelines.advice || 'Standard clinical dosing.',
                source: kb.guidelines.source || 'PharmGKB'
            };
        });
        // Save to frontend
        fs.writeFileSync(FRONTEND_OUTPUT, JSON.stringify(simpleDb, null, 2));
        console.log(`✅ Updated frontend drug_db.json at ${FRONTEND_OUTPUT}`);
    }
    catch (error) {
        console.error('❌ Update failed:', error);
    }
}
function os_mkdir_p(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
main();
//# sourceMappingURL=updateKnowledgeBase.js.map