import { createClient } from "@supabase/supabase-js";

export type Aufgabe = {
  id: number;
  text: string;
  typ: string;
};

export type IchHabNochNie = {
  id: number;
  text: string;
  schon_getan_count: number;
  noch_nie_count: number;
};

export type Room = {
  id: string;
  created_at: string;
  current_card_id: number | null;
  current_card_text: string | null;
  host_id: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
