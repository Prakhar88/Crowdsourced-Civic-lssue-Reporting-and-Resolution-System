import { supabase } from "../services/supabaseConfig";

export async function uploadImage(file, folder = "reports") {
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("civic-reports")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from("civic-reports")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
