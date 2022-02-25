import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
if (supabaseUrl === undefined || supabaseUrl === '') {
  throw Error('Environment variable REACT_APP_SUPABASE_URL is not defined')
}

const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
if (supabaseAnonKey === undefined || supabaseAnonKey === '') {
  throw Error('Environment variable REACT_APP_SUPABASE_ANON_KEY is not defined')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
