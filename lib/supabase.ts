import { createClient } from '@supabase/supabase-js'
import { Database } from '../database-types'

// Create a lazy-initialized Supabase client
let supabaseClient: any = null

const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set')
    return null
  }

  try {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    return supabaseClient
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Export the client getter
export const supabase = getSupabaseClient()

// Auth helper functions
export const getCurrentUser = async () => {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase client not initialized')
  const { data: { user }, error } = await client.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase client not initialized')
  const { data: { session }, error } = await client.auth.getSession()
  if (error) throw error
  return session
}

export const signOut = async () => {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase client not initialized')
  const { error } = await client.auth.signOut()
  if (error) throw error
} 