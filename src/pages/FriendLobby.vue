<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase, createRoom, joinRoom, subscribeRoom } from '../supabase.js'
import { useI18n } from '../i18n.js'

const router = useRouter()
const route  = useRoute()
const { t, lang } = useI18n()

const status   = ref('loading')   // loading | waiting | joining | ready | error
const errorMsg = ref('')
const copied   = ref(false)
const roomId   = ref(route.query.room || null)
const roomData = ref(null)
const isHost   = ref(!route.query.room)

let channel = null

const inviteLink = computed(() =>
  `${window.location.origin}/friend?room=${roomId.value}`)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea')
    el.value = inviteLink.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

const goToGame = (side) => {
  const room = roomData.value
  router.push(`/game?mode=friend&room=${room.id}&side=${side}&variant=${room.variant}&tc=${room.time_control}`)
}

// Side assignment by variant:
// - International (10×10): dark moves first → host='black', guest='white'
// - Russian (8×8): white moves first → host='white', guest='black'
const hostSide  = computed(() => roomData.value?.variant === 'russian' ? 'white' : 'black')
const guestSide = computed(() => roomData.value?.variant === 'russian' ? 'black' : 'white')
const hostSideLabel = computed(() =>
  roomData.value?.variant === 'russian' ? '⬜ You are White' : '⚫ You are Black'
)

onMounted(async () => {
  const savedUser = JSON.parse(localStorage.getItem('wc_user') || 'null')
  const userId = savedUser?.id || ('anon_' + Math.random().toString(36).substr(2, 6))

  try {
    if (isHost.value) {
      // ── HOST: create a new room ──────────────────────────────
      const variant = route.query.variant || 'international'
      const tc      = route.query.tc      || 'rapid'
      const room    = await createRoom({ userId, variant, timeControl: tc })
      roomId.value  = room.id
      roomData.value = room
      status.value  = 'waiting'

      // Subscribe to room changes — detect when guest joins
      channel = subscribeRoom(room.id, (newRoom) => {
        roomData.value = newRoom
        if (newRoom.status === 'playing') {
          // Host side depends on variant: international→black(dark,first), russian→white(first)
          goToGame(newRoom.variant === 'russian' ? 'white' : 'black')
        }
      })
    } else {
      // ── GUEST: join existing room ────────────────────────────
      status.value = 'joining'
      const room = await joinRoom(roomId.value, userId)
      roomData.value = room
      status.value   = 'ready'
      // Guest side is the opposite of host
      goToGame(room.variant === 'russian' ? 'black' : 'white')
    }
  } catch (err) {
    status.value  = 'error'
    errorMsg.value = err.message || 'Failed to connect. Make sure the game_rooms table exists in Supabase.'
  }
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

// Friendly label for time control
const tcLabel = computed(() => {
  const map = { bullet: '⚡ Bullet 1+0', blitz: '🔥 Blitz 3+0', rapid: '⏱ Rapid 10+0', none: '♾ No timer' }
  return map[roomData.value?.time_control] || ''
})
</script>

<template>
<div class="lobby-page">
  <div class="lobby-box">

    <!-- Logo -->
    <RouterLink to="/" class="lobby-logo">
      <span class="lobby-icon">♟</span>
      <span class="lobby-brand">WORLD CHECKERS</span>
    </RouterLink>

    <!-- LOADING -->
    <div v-if="status === 'loading' || status === 'joining'" class="state-center">
      <div class="spinner"/>
      <p class="state-txt">{{ status === 'joining' ? 'Joining game…' : 'Setting up room…' }}</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="status === 'error'" class="state-center">
      <div class="err-icon">⚠️</div>
      <p class="err-msg">{{ errorMsg }}</p>
      <div class="err-hint">
        <strong>Quick fix:</strong> Go to your Supabase Dashboard → SQL Editor and run the SQL from
        <code>src/supabase.js</code> (the comment at the top of the room functions section).
      </div>
      <RouterLink to="/play" class="btn-back">← Back to Lobby</RouterLink>
    </div>

    <!-- WAITING (host) -->
    <div v-else-if="status === 'waiting'" class="waiting-content">
      <h1 class="lobby-title">👥 Game vs Friend</h1>
      <p class="lobby-sub">Send this link to your friend. The game starts as soon as they open it.</p>

      <!-- Invite link box -->
      <div class="link-row">
        <input class="link-input" :value="inviteLink" readonly @click="$event.target.select()" />
        <button class="btn-copy" :class="{ copied }" @click="copyLink">
          <span v-if="copied">✓ Copied!</span>
          <span v-else>📋 Copy</span>
        </button>
      </div>

      <!-- Room info chips -->
      <div class="chips-row">
        <span class="chip">Room {{ roomId }}</span>
        <span class="chip">{{ roomData?.variant === 'russian' ? '♞ 8×8 Russian' : '♟ 10×10 International' }}</span>
        <span class="chip">{{ tcLabel }}</span>
        <span class="chip chip-you">{{ hostSideLabel }}</span>
      </div>

      <!-- Waiting animation -->
      <div class="waiting-row">
        <div class="wait-dot"/>
        <span>Waiting for opponent to join…</span>
      </div>

      <RouterLink to="/play" class="btn-back">← Cancel</RouterLink>
    </div>

  </div>
</div>
</template>

<style scoped>
.lobby-page {
  min-height: 100vh;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lobby-box {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Logo */
.lobby-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  text-decoration: none;
  margin-bottom: 4px;
}
.lobby-icon  { font-size: 26px; color: var(--amber); }
.lobby-brand { font-weight: 900; font-size: 0.9rem; color: var(--text0); letter-spacing: 1.5px; }

/* Spinner */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--ink3);
  border-top-color: var(--amber);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-txt { color: var(--text2); font-size: 0.92rem; }

/* Error */
.err-icon { font-size: 2.5rem; }
.err-msg {
  color: var(--red);
  font-size: 0.88rem;
  text-align: center;
  line-height: 1.5;
}
.err-hint {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.82rem;
  color: var(--text2);
  line-height: 1.6;
}
.err-hint code {
  background: var(--ink3);
  padding: 1px 5px;
  border-radius: 3px;
  color: var(--amber);
  font-size: 0.8rem;
}

/* Waiting state */
.waiting-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lobby-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text0);
  text-align: center;
}
.lobby-sub {
  font-size: 0.88rem;
  color: var(--text2);
  text-align: center;
  line-height: 1.6;
}

/* Link box */
.link-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.link-input {
  flex: 1;
  background: var(--ink2);
  border: 1px solid var(--border2);
  color: var(--text0);
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 0.82rem;
  font-family: 'Courier New', monospace;
  cursor: pointer;
}
.link-input:focus { outline: none; border-color: var(--amber); }

.btn-copy {
  background: var(--amber);
  color: var(--btn-ink);
  border: none;
  border-radius: 7px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-copy:hover { background: var(--amber-l); }
.btn-copy.copied { background: var(--green); color: var(--paper); }

/* Chips */
.chips-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  background: var(--ink2);
  border: 1px solid var(--border);
  color: var(--text2);
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 0.76rem;
  font-weight: 600;
}
.chip-you {
  background: rgba(196,148,48,0.08);
  border-color: rgba(196,148,48,0.3);
  color: var(--amber);
}

/* Waiting animation */
.waiting-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.86rem;
  color: var(--text2);
}
.wait-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--amber);
  animation: pulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.8)} }

/* Buttons */
.btn-back {
  text-align: center;
  padding: 10px;
  color: var(--text3);
  font-size: 0.84rem;
  text-decoration: none;
  transition: color 0.15s;
  display: block;
}
.btn-back:hover { color: var(--text1); }
</style>
