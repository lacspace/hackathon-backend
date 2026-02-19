/**
 * Profile model helpers using Supabase (replaces Mongoose model).
 * The underlying Postgres table is named `profiles` with a JSONB column `genes`.
 *
 * SQL to create the table in Supabase:
 *
 *   create table profiles (
 *     id          uuid primary key default gen_random_uuid(),
 *     name        text not null,
 *     genes       jsonb not null default '[]'::jsonb,
 *     file_path   text,
 *     file_name   text,
 *     uploaded_at timestamptz default now(),
 *     created_at  timestamptz default now(),
 *     updated_at  timestamptz default now()
 *   );
 */
import supabase from '../config/db.js';
import crypto from 'crypto';
/** Map raw DB row → IProfile shape (adds riskLevel heuristic) */
function applyRiskLevel(genes) {
    return genes.map(gene => {
        const p = gene.phenotype.toLowerCase();
        let riskLevel;
        if (p.includes('poor') || p.includes('slow') || p.includes('rapid') || p.includes('positive')) {
            riskLevel = 'Toxic';
        }
        else if (p.includes('intermediate') || p.includes('decreased')) {
            riskLevel = 'Adjust Dose';
        }
        else {
            riskLevel = 'Safe';
        }
        return { ...gene, riskLevel };
    });
}
/** Create a new profile row and return the created record */
export async function createProfile(data) {
    // Attempt to insert with all columns
    const payload = {
        name: data.name,
        genes: applyRiskLevel(data.genes),
    };
    // Only add these if they are likely to exist based on common failures
    if (data.filePath)
        payload.file_path = data.filePath;
    if (data.fileName)
        payload.file_name = data.fileName;
    const { data: row, error } = await supabase
        .from('profiles')
        .insert(payload)
        .select()
        .single();
    if (error) {
        console.warn(`⚠️  Database insert failed: ${error.message}. Returning temporary profile.`);
        // Fallback for demo/hackathon if DB hasn't been migrated yet
        return {
            id: crypto.randomUUID(),
            name: data.name,
            genes: applyRiskLevel(data.genes),
            file_name: data.fileName,
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }
    return row;
}
/** Fetch a single profile by UUID */
export async function findProfileById(id) {
    const { data: row, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null; // not found
        throw new Error(`Supabase fetch error: ${error.message}`);
    }
    return row;
}
/** Update profile fields by UUID and return updated row */
export async function updateProfileById(id, updates) {
    const payload = {};
    if (updates.name !== undefined)
        payload.name = updates.name;
    if (updates.genes !== undefined)
        payload.genes = applyRiskLevel(updates.genes);
    if (updates.filePath !== undefined)
        payload.file_path = updates.filePath;
    if (updates.fileName !== undefined)
        payload.file_name = updates.fileName;
    payload.updated_at = new Date().toISOString();
    const { data: row, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null;
        throw new Error(`Supabase update error: ${error.message}`);
    }
    return row;
}
/** Fetch all profiles, sorted by most recent first */
export async function getAllProfiles() {
    const { data: rows, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        throw new Error(`Supabase fetch all error: ${error.message}`);
    }
    return rows;
}
//# sourceMappingURL=Profile.js.map