/**
 * PharmaGuard – Supabase Database Setup + Connection Test
 *
 * This script:
 *   1. Creates the `profiles` table (if missing) via Supabase Management API
 *   2. Runs full INSERT → SELECT → UPDATE → DELETE smoke test
 *
 * Run:
 *   npx tsx setup-db.ts <SUPABASE_ACCESS_TOKEN>
 *
 * Get your access token at: https://supabase.com/dashboard/account/tokens
 * (it's different from your project anon key — it's your personal account token)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const SUPABASE_URL   = process.env.SUPABASE_URL!;
const SUPABASE_KEY   = process.env.SUPABASE_ANON_KEY!;
const PROJECT_REF    = SUPABASE_URL.replace('https://', '').split('.')[0]; // e.g. ljxmnggveddtfahmsyyd
const ACCESS_TOKEN   = process.argv[2]; // optional – only needed for CREATE TABLE

// ─── Helper: run SQL via Supabase Management API ──────────────────────────────
function runSQL(sql: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query: sql });
        const opts = {
            hostname: 'api.supabase.com',
            path: `/v1/projects/${PROJECT_REF}/database/query`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };
        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

const MIGRATION_SQL = `
-- Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    genes       JSONB NOT NULL DEFAULT '[]'::jsonb,
    file_path   TEXT,
    file_name   TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read"   ON profiles;
DROP POLICY IF EXISTS "Allow public insert" ON profiles;
DROP POLICY IF EXISTS "Allow public update" ON profiles;
DROP POLICY IF EXISTS "Allow public delete" ON profiles;

CREATE POLICY "Allow public read"   ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert" ON profiles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update" ON profiles FOR UPDATE USING (TRUE);
CREATE POLICY "Allow public delete" ON profiles FOR DELETE USING (TRUE);
`;

async function main() {
    console.log('\n🔧 PharmaGuard – Supabase Setup + Test');
    console.log('════════════════════════════════════════');
    console.log(`📡 Project : ${PROJECT_REF}`);
    console.log(`📡 URL     : ${SUPABASE_URL}`);
    console.log(`🔑 Anon Key: ${SUPABASE_KEY.slice(0, 25)}...`);
    console.log('════════════════════════════════════════\n');

    // ── STEP 1: Create table if access token provided ──────────────────────────
    if (ACCESS_TOKEN) {
        console.log('🏗️  STEP 1 – Running SQL migration via Management API...');
        const result = await runSQL(MIGRATION_SQL, ACCESS_TOKEN);
        if (result.status === 200 || result.status === 201) {
            console.log('   ✅ Migration successful – profiles table created/verified\n');
        } else {
            console.error(`   ❌ Migration failed (HTTP ${result.status}):`, JSON.stringify(result.body, null, 2));
            console.log('\n   ⚠️  Continuing with CRUD test anyway...\n');
        }
    } else {
        console.log('ℹ️  STEP 1 – Skipped (no access token). Table must already exist.');
        console.log('   To create table, run:');
        console.log('   npx tsx setup-db.ts <YOUR_SUPABASE_ACCESS_TOKEN>\n');
    }

    // ── STEP 2: Full CRUD smoke test ──────────────────────────────────────────
    console.log('🧪 STEP 2 – Running CRUD smoke test\n');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // INSERT
    console.log('   1️⃣  INSERT...');
    const { data: row, error: e1 } = await supabase
        .from('profiles')
        .insert({
            name: '__smoke_test__',
            genes: [{ gene: 'CYP2D6', rsID: 'rs3892097', genotype: '*1/*4', phenotype: 'Poor Metabolizer', rawGT: '0/1', riskLevel: 'Toxic' }],
            file_name: 'smoke.vcf',
            uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (e1) { console.error('   ❌ INSERT failed:', e1.message); process.exit(1); }
    console.log(`   ✅ Inserted row – id: ${row.id}`);

    // SELECT
    console.log('   2️⃣  SELECT...');
    const { data: fetchedRow, error: e2 } = await supabase
        .from('profiles').select('*').eq('id', row.id).single();
    if (e2) { console.error('   ❌ SELECT failed:', e2.message); process.exit(1); }
    console.log(`   ✅ Fetched  – name: "${fetchedRow.name}", genes: ${fetchedRow.genes.length}`);

    // UPDATE
    console.log('   3️⃣  UPDATE...');
    const { data: updatedRow, error: e3 } = await supabase
        .from('profiles').update({ name: '__smoke_test_updated__', updated_at: new Date().toISOString() })
        .eq('id', row.id).select().single();
    if (e3) { console.error('   ❌ UPDATE failed:', e3.message); process.exit(1); }
    console.log(`   ✅ Updated  – new name: "${updatedRow.name}"`);

    // DELETE
    console.log('   4️⃣  DELETE...');
    const { error: e4 } = await supabase.from('profiles').delete().eq('id', row.id);
    if (e4) { console.error('   ❌ DELETE failed:', e4.message); process.exit(1); }
    console.log('   ✅ Deleted  – test record cleaned up');

    console.log('\n════════════════════════════════════════');
    console.log('🎉 All checks passed! Supabase is fully connected & working.');
    console.log('════════════════════════════════════════\n');
}

main().catch(err => { console.error('\n❌ Fatal:', err.message); process.exit(1); });
