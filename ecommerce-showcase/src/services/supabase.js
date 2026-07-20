import { supabase } from "../assets/subabaseclient";

// ===============================
// FETCH
// ===============================
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

// ===============================
// INSERT
// ===============================
export async function safeInsert(table, record) {
  const { data, error } = await supabase
    .from(table)
    .insert([record])
    .select();

  return { data, error };
}

// ===============================
// UPDATE
// ===============================
export async function safeUpdate(table, id, updates) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select();

  return { data, error };
}

// ===============================
// DELETE
// ===============================
export async function safeDelete(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  return !error;
}