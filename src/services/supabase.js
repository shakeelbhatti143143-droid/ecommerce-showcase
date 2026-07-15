import { supabase } from "../assets/subabaseclient";

// Read data
export async function safeFetch(table) {
  const { data, error } = await supabase
    .from(table)
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

// Insert data
export async function safeInsert(table, record) {
  const { data, error } = await supabase
    .from(table)
    .insert([record]);

  return { data, error };
}

// Update data
export async function safeUpdate(table, id, updates) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id);

  return { data, error };
}

// Delete data
export async function safeDelete(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  return !error;
}