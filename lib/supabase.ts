import {createClient} from "@supabase/supabase-js";
import {auth} from "@clerk/nextjs/server";

export const createSupabaseClient = async () => {
    const session = await auth();
    if (!session || !session.userId) {
        throw new Error("User must be authenticated to access this resource.");
    }

    // Get token for Supabase
    const token = await session.getToken({
        template: "supabase"
    });

    if (!token) {
        throw new Error("Failed to get Supabase token. Please try signing in again.");
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
}