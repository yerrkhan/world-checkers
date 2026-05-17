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

// ── Friend Game Room Functions ──────────────────────────────────────────────
// Requires a 'game_rooms' table in Supabase. Run this SQL in Supabase SQL Editor:
//
// CREATE TABLE IF NOT EXISTS game_rooms (
//   id TEXT PRIMARY KEY,
//   host_id TEXT,
//   guest_id TEXT,
//   variant TEXT DEFAULT 'international',
//   time_control TEXT DEFAULT 'rapid',
//   status TEXT DEFAULT 'waiting',
//   moves JSONB DEFAULT '[]',
//   winner TEXT,
//   created_at BIGINT,
//   last_move_at BIGINT
// );
// ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow all" ON game_rooms FOR ALL USING (true) WITH CHECK (true);
// -- Then enable Realtime for game_rooms in Supabase Dashboard → Database → Replication

export const createRoom = async ({ userId, variant, timeControl }) => {
  const id = Math.random().toString(36).substr(2, 8).toUpperCase()
  const { data, error } = await supabase
    .from('game_rooms')
    .insert([{
      id,
      host_id: userId || 'anon',
      variant: variant || 'international',
      time_control: timeControl || 'rapid',
      status: 'waiting',
      moves: [],
      created_at: Date.now(),
      last_move_at: Date.now(),
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export const joinRoom = async (roomId, userId) => {
  const { data, error } = await supabase
    .from('game_rooms')
    .update({ guest_id: userId || 'anon', status: 'playing', last_move_at: Date.now() })
    .eq('id', roomId)
    .eq('status', 'waiting')
    .select()
    .single()
  if (error) throw error
  return data
}

export const getRoom = async (roomId) => {
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', roomId)
    .single()
  if (error) throw error
  return data
}

export const pushMove = async (roomId, move) => {
  const room = await getRoom(roomId)
  // Support regular moves {from,path} and signals {type,...} (draw offer/accept/decline)
  const entry = move.type
    ? { ...move, ts: Date.now() }
    : { from: move.from, path: move.path, ts: Date.now() }
  const moves = [...(room.moves || []), entry]
  const { error } = await supabase
    .from('game_rooms')
    .update({ moves, last_move_at: Date.now() })
    .eq('id', roomId)
  if (error) throw error
}

export const subscribeRoom = (roomId, callback) => {
  return supabase
    .channel(`room_${roomId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_rooms',
      filter: `id=eq.${roomId}`,
    }, (payload) => callback(payload.new))
    .subscribe()
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
