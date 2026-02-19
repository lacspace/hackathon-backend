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
import type { IProfile, IGeneResult } from '../types/index.js';
import crypto from 'crypto';

export interface IProfileRow {
    id: string;
    name: string;
    genes: IGeneResult[];
    file_path?: string;
    file_name?: string;
    uploaded_at?: string;
    created_at: string;
    updated_at: string;
}

/** Map raw DB row → IProfile shape (adds riskLevel heuristic) */
function applyRiskLevel(genes: IGeneResult[]): IGeneResult[] {
    return genes.map(gene => {
        const p = gene.phenotype.toLowerCase();
        let riskLevel: IGeneResult['riskLevel'];
        if (p.includes('poor') || p.includes('slow') || p.includes('rapid') || p.includes('positive')) {
            riskLevel = 'Toxic';
        } else if (p.includes('intermediate') || p.includes('decreased')) {
            riskLevel = 'Adjust Dose';
        } else {
            riskLevel = 'Safe';
        }
        return { ...gene, riskLevel };
    });
}

/** Create a new profile row and return the created record */
export async function createProfile(data: {
    name: string;
    genes: IGeneResult[];
    filePath?: string;
    fileName?: string;
}): Promise<IProfileRow> {
    // Attempt to insert with all columns
    const payload: any = {
        name: data.name,
        genes: applyRiskLevel(data.genes),
    };

    // Only add these if they are likely to exist based on common failures
    if (data.filePath) payload.file_path = data.filePath;
    if (data.fileName) payload.file_name = data.fileName;

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
        } as IProfileRow;
    }
    return row as IProfileRow;
}

/** Fetch a single profile by UUID */
export async function findProfileById(id: string): Promise<IProfileRow | null> {
    const { data: row, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // not found
        throw new Error(`Supabase fetch error: ${error.message}`);
    }
    return row as IProfileRow;
}

/** Update profile fields by UUID and return updated row */
export async function updateProfileById(
    id: string,
    updates: Partial<{ name: string; genes: IGeneResult[]; filePath: string; fileName: string }>
): Promise<IProfileRow | null> {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.genes !== undefined) payload.genes = applyRiskLevel(updates.genes);
    if (updates.filePath !== undefined) payload.file_path = updates.filePath;
    if (updates.fileName !== undefined) payload.file_name = updates.fileName;
    payload.updated_at = new Date().toISOString();

    const { data: row, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Supabase update error: ${error.message}`);
    }
    return row as IProfileRow;
}

/** Fetch all profiles, sorted by most recent first */
export async function getAllProfiles(): Promise<IProfileRow[]> {
    const { data: rows, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Supabase fetch all error: ${error.message}`);
    }
    return rows as IProfileRow[];
}
