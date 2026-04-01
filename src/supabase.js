import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase Error: URL ou Clé manquante dans l'environnement Vite.");
} else {
  console.log("Supabase: Configuration détectée pour l'URL", supabaseUrl.substring(0, 15) + "...");
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (() => {
      return null;
    })();
