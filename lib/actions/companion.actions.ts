'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Helper for JWT error retries
const withAuthRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && error.message.includes('JWT')) {
      console.log('Auth token expired, retrying...');
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut(); // Force fresh token
      return await fn();
    }
    throw error;
  }
};

// CREATE
export const createCompanion = async (formData: CreateCompanion) => {
  return withAuthRetry(async () => {
    const { userId: author } = await auth();
    if (!author) throw new Error("Unauthorized");

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('companions')
      .insert({ ...formData, author })
      .select()
      .single();

    if (error) throw new Error(`DB Error: ${error.message}`);
    return data;
  });
};

// READ (with optimized queries)
export const getAllCompanions = async ({ 
  limit = 10, 
  page = 1, 
  subject, 
  topic 
}: GetAllCompanions) => {
  return withAuthRetry(async () => {
    const supabase = await createSupabaseServerClient();
    
    let query = supabase
      .from('companions')
      .select('*', { count: 'exact' });

    if (subject && topic) {
      query = query
        .ilike('subject', `%${subject}%`)
        .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if (subject) {
      query = query.ilike('subject', `%${subject}%`);
    } else if (topic) {
      query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(`Query failed: ${error.message}`);
    return { data, count };
  });
};

// SINGLE GET
export const getCompanion = async (id: string) => {
  return withAuthRetry(async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('companions')
      .select()
      .eq('id', id)
      .single();

    if (error) console.error('Companion fetch error:', error);
    return data || null;
  });
};

// SESSION HISTORY
export const addToSessionHistory = async (companionId: string) => {
  return withAuthRetry(async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('session_history')
      .insert({ companion_id: companionId, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(`Session error: ${error.message}`);
    return data;
  });
};

// BOOKMARKS
export const addBookmark = async (companionId: string, path: string) => {
  return withAuthRetry(async () => {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ companion_id: companionId, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(`Bookmark error: ${error.message}`);
    revalidatePath(path);
    return data;
  });
};