'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Helper for JWT error retries
const withAuthRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error && 
        (error.message.includes('JWT') || error.message.includes('token')) && 
        retries < maxRetries - 1
      ) {
        console.log(`Auth token error, retry ${retries + 1} of ${maxRetries}...`);
        const supabase = await createSupabaseClient();
        await supabase.auth.signOut(); // Force fresh token
        retries++;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached for authentication');
};

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();

    // Check permissions first (backend check)
    const canCreate = await newCompanionPermissions();
    if (!canCreate) {
        throw new Error("You have reached your companion limit. Please upgrade your plan.");
    }

    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const supabase = await createSupabaseClient();

    let query = supabase.from('companions').select();

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if(error) throw new Error(error.message);

    return companions;
}

export const getCompanion = async (id: string) => {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10) => {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = await createSupabaseClient();

    let limit = 0;

    if(has({ plan: 'pro' })) {
        return true;
    } else if(has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if(has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit) {
        return false
    } else {
        return true;
    }
}

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  return withAuthRetry(async () => {
    const supabase = await createSupabaseClient();
    
    // First, get all bookmarks for the user
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('companion_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (bookmarksError) {
      throw new Error(`Bookmarks fetch error: ${bookmarksError.message}`);
    }

    if (!bookmarks?.length) {
      return [];
    }

    // Get unique companion IDs while preserving order
    const uniqueCompanionIds = [...new Set(bookmarks.map(b => b.companion_id))];
    
    // Then, get all companions that are bookmarked
    const { data: companions, error: companionsError } = await supabase
      .from('companions')
      .select('*')
      .in('id', uniqueCompanionIds);

    if (companionsError) {
      throw new Error(`Companions fetch error: ${companionsError.message}`);
    }

    // Sort companions to match the bookmark order
    const companionsMap = new Map(companions?.map(c => [c.id, c]) || []);
    const orderedCompanions = uniqueCompanionIds
      .map(id => companionsMap.get(id))
      .filter(Boolean); // Remove any undefined entries

    return orderedCompanions;
  });
};