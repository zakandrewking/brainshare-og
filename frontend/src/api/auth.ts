import supabase from './supabaseClient'

// TODO generic function to handle errors
export async function logIn (email: string): Promise<string | null> {
  try {
    const { error } = await supabase.auth.signIn({ email })
    if (error) console.warn(error)
    return error ? error.message : null
  } catch (error) {
    console.warn(error)
    return String(error)
  }
}

export async function logOut (): Promise<string | null> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) console.warn(error)
    return error ? error.message : null
  } catch (error) {
    console.warn(error)
    return String(error)
  }
}
