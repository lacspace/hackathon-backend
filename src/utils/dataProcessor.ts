import fs from 'fs';
import path from 'path';

/**
 * Advanced Data Processor to ingest PharmGKB/ClinPGx datasets
 * Pure Node.js implementation to bypass permission issues with npm
 */
export async function processGenomicData(basePath: string) {
  const results: any = {};
  const drugToGenes: Record<string, Set<string>> = {};
  const drugToVariants: Record<string, any[]> = {};
  const drugToLabels: Record<string, any[]> = {};
  const drugToGuidelines: Record<string, any> = {};

  console.log('🧬 Starting Genomic Knowledge Ingestion...');

  // Helper to parse TSV lines
  const parseTSV = (filePath: string, callback: (data: any) => void) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Missing file: ${filePath}`);
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0]?.split('\t').map(h => h.trim()) || [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      const values = line.split('\t');
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx]?.trim() || '';
      });
      callback(obj);
    }
  };

  // 1. Process Relationships (Gene-Drug mappings)
  console.log(' - Processing Relationships...');
  parseTSV(path.join(basePath, 'relationships/relationships.tsv'), (data) => {
    if (data.Entity1_type === 'Gene' && data.Entity2_type === 'Chemical') {
      const drug = data.Entity1_name.toLowerCase(); // Wait, usually e2 is drug in this dataset? 
      // Let's check headers again. e1_name, e1_type, e2_name, e2_type
      const chemical = data.Entity2_name.toLowerCase();
      if (!drugToGenes[chemical]) drugToGenes[chemical] = new Set();
      drugToGenes[chemical].add(data.Entity1_name);
    }
  });

  // 2. Process Clinical Variants (Evidence & Phenotypes)
  console.log(' - Processing Clinical Variants...');
  parseTSV(path.join(basePath, 'clinicalVariants/clinicalVariants.tsv'), (data) => {
    const drugs = data.chemicals?.toLowerCase().split(',').map((s: string) => s.trim()) || [];
    drugs.forEach((drug: string) => {
      if (!drugToVariants[drug]) drugToVariants[drug] = [];
      drugToVariants[drug].push({
        variant: data.variant,
        gene: data.gene,
        level: data['level of evidence'],
        phenotypes: data.phenotypes
      });
    });
  });

  // 3. Process Drug Labels (FDA/EMA Citations)
  console.log(' - Processing Drug Labels...');
  parseTSV(path.join(basePath, 'drugLabels/drugLabels.tsv'), (data) => {
    const drugs = data.Chemicals?.toLowerCase().split(';').map((s: string) => s.trim()) || [];
    drugs.forEach((drug: string) => {
      if (!drugToLabels[drug]) drugToLabels[drug] = [];
      drugToLabels[drug].push({
        source: data.Source,
        level: data['Testing Level'],
        name: data.Name
      });
    });
  });

  // 4. Process Guidelines
  console.log(' - Processing Clinical Guidelines...');
  const guidelinePath = path.join(basePath, 'guidelineAnnotations');
  if (fs.existsSync(guidelinePath)) {
    const files = fs.readdirSync(guidelinePath).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(guidelinePath, file), 'utf8'));
        const g = content.guideline;
        if (g && g.relatedChemicals) {
          const summary = g.summaryMarkdown?.html?.replace(/<[^>]*>?/gm, '') || '';
          g.relatedChemicals.forEach((c: any) => {
            const drug = c.name.toLowerCase();
            drugToGuidelines[drug] = {
              advice: summary,
              source: g.source || 'CPIC'
            };
          });
        }
      } catch (e) {}
    });
  }

  // 5. Merge into Unified Knowledge Base
  console.log(' - Finalizing Database...');
  const allDrugs = new Set([
    ...Object.keys(drugToGenes),
    ...Object.keys(drugToVariants),
    ...Object.keys(drugToLabels),
    ...Object.keys(drugToGuidelines)
  ]);

  allDrugs.forEach(drug => {
    results[drug] = {
      genes: Array.from(drugToGenes[drug] || []),
      clinicalVariants: drugToVariants[drug] || [],
      fdaLabels: drugToLabels[drug] || [],
      guidelines: drugToGuidelines[drug] || { advice: 'Follow standard protocol.', source: 'General' }
    };
  });

  console.log(`✅ Ingestion Complete. Processed ${allDrugs.size} entities.`);
  return results;
}
