import { createClient } from '@supabase/supabase-js'
import { Database } from '../database-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Auth helper functions
export const getCurrentUser = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const signOut = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
} 