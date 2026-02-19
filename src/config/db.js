import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables");
}
const supabase = createClient(supabaseUrl, supabaseKey);
export const connectDB = async () => {
    try {
        // Quick connectivity test – fetch from a known table
        const { error } = await supabase.from("profiles").select("id").limit(1);
        if (error && error.code !== "PGRST116") {
            // PGRST116 = "table not found" which is ok at boot before migration
            console.warn(`⚠️  Supabase warning: ${error.message}`);
        }
        else {
            console.log("✅ Supabase connected successfully");
        }
    }
    catch (err) {
        console.error(`❌ Supabase connection error: ${err.message}`);
        process.exit(1);
    }
};
export default supabase;
//# sourceMappingURL=db.js.map