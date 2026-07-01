import { createClient } from "@/lib/supabase/server";
import InstructorasClient from "./InstructorasClient";

export default async function InstructorasPage() {
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id").limit(1).single();

  const { data: instructors } = business
    ? await supabase
        .from("instructors")
        .select("id, bio, specialties, photo_url, video_urls, instagram_handle, tagline, is_active, profiles(id, first_name, last_name, phone)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  return <InstructorasClient instructors={instructors || []} />;
}
