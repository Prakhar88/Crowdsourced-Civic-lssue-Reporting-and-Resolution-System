import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ktynjgnxxkvgwxiucbwa.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0eW5qZ254eGt2Z3d4aXVjYndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDczNDEsImV4cCI6MjA4ODYyMzM0MX0.WHXOPQS3NgKO3Fmm6QK-h4m3_FN_gkrzLgkD74hUB3Q";

export const supabase = createClient(supabaseUrl, supabaseKey);
