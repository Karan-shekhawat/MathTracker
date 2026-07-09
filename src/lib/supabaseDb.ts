import { supabase } from '../supabase';
import { AppState } from '../types';

// ============================================================================
// Supabase Database Helper Functions
// ============================================================================
// Data is stored in a `user_data` table with columns:
//   - user_id (UUID, PK, references auth.users)
//   - data (JSONB — the entire app state)
//   - updated_at (timestamptz)
//
// This keeps things simple: one row per user, one JSONB blob of all their data.
// ============================================================================

/**
 * Save the entire app state to Supabase.
 */
export async function saveFullState(userId: string, state: AppState): Promise<void> {
  const { error } = await supabase
    .from('user_data')
    .upsert(
      {
        user_id: userId,
        data: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
}

/**
 * Load the entire app state from Supabase.
 * Returns null if the user has no data yet.
 */
export async function loadFullState(userId: string): Promise<AppState | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows found, which is expected for new users
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Supabase load error:', error);
    throw error;
  }

  if (!data?.data) {
    return null;
  }

  const d = data.data as any;
  return {
    topics: d.topics || [],
    questions: d.questions || [],
    practiceSessions: d.practiceSessions || [],
    mockTests: d.mockTests || [],
    errorBook: d.errorBook || [],
    pastImports: d.pastImports || [],
    theme: d.theme || 'dark',
  };
}

/**
 * Delete all user data from Supabase.
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_data')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
}
