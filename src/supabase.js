import { createClient } from '@supabase/supabase-js'

// ⚠️ IMPORTANT: Replace these with YOUR credentials from Supabase Settings → API
const SUPABASE_URL = 'https://kksfgpjnrppifciagrfd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_BARjYNF0iw1lEJZ1SXra7A_4QH4sChZ'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch user profile from database
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export const signUp = async (email, password, username) => {
  // 1. Create auth account
  const { data: authData, error: authError } =
    await supabase.auth.signUp({ email, password })

  if (authError) throw authError

  // 2. Create user profile in database
  const { error: dbError } = await supabase
    .from('users')
    .insert([{
      id: authData.user.id,
      email: email,
      username: username,
      elo: 1000,
      games_won: 0,
      games_lost: 0,
      country: 'KZ',
      is_premium: false
    }])

  if (dbError) {
    console.error('Profile insert error:', dbError)
    throw new Error('Failed to create profile: ' + dbError.message)
  }

  return authData.user
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const saveGame = async (whitePlayerId, blackPlayerId, winnerId, moves, timeControl) => {
  const { error } = await supabase
    .from('games')
    .insert([{
      white_player_id: whitePlayerId,
      black_player_id: blackPlayerId,
      winner_id: winnerId,
      moves: moves,
      time_control: timeControl,
      result: winnerId === whitePlayerId ? 'white_wins' : 'black_wins'
    }])

  if (error) throw error
}
