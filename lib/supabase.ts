import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
export const createSupabaseServerClient = async () => {
  const session = await auth();
  if (!session || !session.userId) {
    throw new Error("User must be authenticated to access this resource.");
  }
  const token = await session.getToken({ template: "supabase" });
  console.log("Supabase JWT token:", token); // Debug log
  if (!token) throw new Error("No Supabase JWT found for the current user.");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Never expose on client!
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};