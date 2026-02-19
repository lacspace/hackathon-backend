/**
 * Supabase Connection & CRUD Test
 * Run with: npx tsx test-supabase.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    console.log('\n🔍 PharmaGuard – Supabase Connection Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 URL : ${SUPABASE_URL}`);
    console.log(`🔑 Key : ${SUPABASE_ANON_KEY.slice(0, 30)}...`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ── 1. INSERT ──────────────────────────────────────────────────────────────
    console.log('1️⃣  INSERT – Creating test profile...');
    const testProfile = {
        name: '__test_profile__',
        genes: [
            {
                gene: 'CYP2D6',
                rsID: 'rs3892097',
                genotype: '*1/*4',
                phenotype: 'Poor Metabolizer',
                rawGT: '0/1',
                riskLevel: 'Toxic',
            },
        ],
        file_path: null,
        file_name: 'test.vcf',
        uploaded_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()
        .single();

    if (insertErr) {
        console.error('   ❌ INSERT failed:', insertErr.message);
        console.error('      Hint: Make sure you ran supabase_migration.sql in your Supabase SQL Editor');
        process.exit(1);
    }
    console.log(`   ✅ Inserted – id: ${inserted.id}`);

    // ── 2. SELECT ──────────────────────────────────────────────────────────────
    console.log('\n2️⃣  SELECT – Fetching profile by id...');
    const { data: fetched, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', inserted.id)
        .single();

    if (fetchErr) {
        console.error('   ❌ SELECT failed:', fetchErr.message);
        process.exit(1);
    }
    console.log(`   ✅ Fetched – name: "${fetched.name}", genes: ${fetched.genes.length} entry`);

    // ── 3. UPDATE ──────────────────────────────────────────────────────────────
    console.log('\n3️⃣  UPDATE – Renaming profile...');
    const { data: updated, error: updateErr } = await supabase
        .from('profiles')
        .update({ name: '__test_profile_updated__', updated_at: new Date().toISOString() })
        .eq('id', inserted.id)
        .select()
        .single();

    if (updateErr) {
        console.error('   ❌ UPDATE failed:', updateErr.message);
        process.exit(1);
    }
    console.log(`   ✅ Updated – new name: "${updated.name}"`);

    // ── 4. DELETE ──────────────────────────────────────────────────────────────
    console.log('\n4️⃣  DELETE – Cleaning up test record...');
    const { error: deleteErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', inserted.id);

    if (deleteErr) {
        console.error('   ❌ DELETE failed:', deleteErr.message);
        process.exit(1);
    }
    console.log('   ✅ Deleted – test record cleaned up');

    // ── DONE ───────────────────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All Supabase tests passed! Backend is properly connected.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

run().catch((err) => {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
});
