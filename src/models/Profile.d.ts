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
import type { IGeneResult } from '../types/index.js';
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
/** Create a new profile row and return the created record */
export declare function createProfile(data: {
    name: string;
    genes: IGeneResult[];
    filePath?: string;
    fileName?: string;
}): Promise<IProfileRow>;
/** Fetch a single profile by UUID */
export declare function findProfileById(id: string): Promise<IProfileRow | null>;
/** Update profile fields by UUID and return updated row */
export declare function updateProfileById(id: string, updates: Partial<{
    name: string;
    genes: IGeneResult[];
    filePath: string;
    fileName: string;
}>): Promise<IProfileRow | null>;
/** Fetch all profiles, sorted by most recent first */
export declare function getAllProfiles(): Promise<IProfileRow[]>;
//# sourceMappingURL=Profile.d.ts.map