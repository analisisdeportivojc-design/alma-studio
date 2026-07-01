import { createAdminClient } from "@/lib/supabase/admin";
import InstructorasClient from "./InstructorasClient";

export default async function InstructorasPage() {
  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("id").limit(1).single();

  const { data: instructors } = business
    ? await admin
        .from("instructors")
        .select("id, bio, specialties, photo_url, video_urls, instagram_handle, tagline, is_active, profiles(id, first_name, last_name, phone)")
        .eq("business_id", business.id)
        .order("id", { ascending: true })
    : { data: [] };

  return <InstructorasClient instructors={instructors || []} />;
}
