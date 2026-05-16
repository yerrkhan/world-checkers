<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameBoard    from '../components/GameBoard.vue'
import GameBoard10  from '../components/GameBoard10.vue'

const route  = useRoute()
const router = useRouter()

const mode    = computed(() => route.query.mode    || 'local')
const tcType  = computed(() => route.query.tc      || 'rapid')
const variant = computed(() => route.query.variant || 'international')  // default 10x10

const isInternational = computed(() => variant.value === 'international')

const timeControlMap = {
  bullet: { type:'bullet', seconds:60  },
  blitz:  { type:'blitz',  seconds:180 },
  rapid:  { type:'rapid',  seconds:600 },
  none:   { type:'none',   seconds:0   },
}
const timeControl = computed(() => timeControlMap[tcType.value] || timeControlMap.rapid)

const boardTheme   = ref(localStorage.getItem('boardTheme') || 'classic')
const showSettings = ref(false)
const gameDone     = ref(false)
const boardRef     = ref(null)

const boardThemes = [
  { id:'classic',  label:'Classic',  light:'#f0d9b5', dark:'#b58863' },
  { id:'green',    label:'Green',    light:'#eeeed2', dark:'#769656' },
  { id:'midnight', label:'Midnight', light:'#6e85b5', dark:'#3d4b6e' },
]

const modeLabel = computed(() => {
  return { local:'Pass & Play', vsBot:'vs Bot', online:'Online', friend:'vs Friend' }[mode.value] || 'Local'
})
const tcLabel = computed(() => {
  return { bullet:'⚡ Bullet 1+0', blitz:'🔥 Blitz 3+0', rapid:'⏱ Rapid 10+0', none:'♾ No timer' }[tcType.value] || '⏱ Rapid'
})
const variantLabel = computed(() => isInternational.value ? '♟ International 10×10' : '♞ Russian 8×8')

const onGameOver = ({ winner }) => { gameDone.value = true }
const setBoardTheme = (id) => { boardTheme.value = id; localStorage.setItem('boardTheme', id) }
</script>

<template>
<div class="game-page">

  <!-- Game area -->
  <div class="game-area">
    <!-- Info bar -->
    <div class="info-bar">
      <span class="info-chip">{{ modeLabel }}</span>
      <span class="info-chip">{{ tcLabel }}</span>
      <span class="info-chip variant-chip">{{ variantLabel }}</span>
      <button @click="showSettings=!showSettings" class="settings-btn">⚙</button>
    </div>

    <!-- Board settings -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-label">BOARD THEME</div>
      <div class="theme-row">
        <button v-for="t in boardThemes" :key="t.id"
          @click="setBoardTheme(t.id)"
          class="theme-btn"
          :class="{ active: boardTheme===t.id }">
          <span :style="{ width:'14px', height:'14px', borderRadius:'3px', background:t.dark, display:'inline-block' }"/>
          <span :style="{ width:'14px', height:'14px', borderRadius:'3px', background:t.light, display:'inline-block' }"/>
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- INTERNATIONAL 10×10 -->
    <GameBoard10
      v-if="isInternational"
      ref="boardRef"
      :boardTheme="boardTheme"
      :gameMode="mode"
      :timeControl="timeControl"
      @gameOver="onGameOver"
    />

    <!-- RUSSIAN 8×8 -->
    <GameBoard
      v-else
      ref="boardRef"
      :boardTheme="boardTheme"
      :gameMode="mode"
      :timeControl="timeControl"
      @gameOver="onGameOver"
    />
  </div>

  <!-- Sidebar -->
  <aside class="game-sidebar">
    <div class="side-card">
      <div class="side-label">GAME</div>
      <RouterLink to="/play" class="side-btn side-btn-outline">← New Game</RouterLink>
      <button @click="boardRef?.resetGame()" class="side-btn side-btn-outline">↺ Restart</button>
    </div>

    <div class="side-card">
      <div class="side-label">VARIANT</div>
      <div style="font-size:.82rem; color:#ddd; font-weight:700; margin-bottom:4px;">{{ variantLabel }}</div>
      <div style="font-size:.75rem; color:#555; line-height:1.5;">
        <template v-if="isInternational">
          10×10 board · FMJD rules<br>Flying kings · Max capture<br>Backward captures allowed
        </template>
        <template v-else>
          8×8 board · Russian rules<br>Flying kings · Multi-jump
        </template>
      </div>
    </div>

    <div class="side-card">
      <div class="side-label">RULES</div>
      <ul class="rules-list">
        <li>Captures are mandatory</li>
        <li v-if="isInternational">Choose the maximum capture sequence</li>
        <li>Kings move any distance diagonally</li>
        <li>Win by capturing all pieces</li>
        <li>Or block all opponent moves</li>
      </ul>
    </div>

    <div class="side-card">
      <div class="side-label">SWITCH VARIANT</div>
      <RouterLink
        :to="`/game?mode=${mode}&tc=${tcType}&variant=${isInternational ? 'russian' : 'international'}`"
        class="side-btn side-btn-gold">
        {{ isInternational ? '♞ Play 8×8 Russian' : '♟ Play 10×10 International' }}
      </RouterLink>
    </div>
  </aside>
</div>
</template>

<style scoped>
.game-page {
  max-width: 1100px; margin: 0 auto;
  padding: 24px 20px;
  display: flex; gap: 24px;
  align-items: flex-start; flex-wrap: wrap;
}

.game-area {
  flex: 1; min-width: 300px;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}

.info-bar {
  width: min(580px, 95vw);
  display: flex; align-items: center;
  gap: 8px; flex-wrap: wrap;
  padding: 8px 12px;
  background: #111; border: 1px solid #1e1e1e;
  border-radius: 7px;
}
.info-chip {
  font-size: .78rem; color: #888; font-weight: 500;
  background: #1a1a1a; padding: 3px 8px;
  border-radius: 4px; white-space: nowrap;
}
.variant-chip { color: #f5b623; border: 1px solid rgba(245,182,35,.25); }
.settings-btn {
  background: transparent; border: none; color: #555;
  cursor: pointer; margin-left: auto; font-size: 1rem;
  padding: 2px 4px; transition: color .15s;
}
.settings-btn:hover { color: #fff; }

.settings-panel {
  width: min(580px, 95vw);
  background: #111; border: 1px solid #1e1e1e;
  border-radius: 7px; padding: 14px;
}
.settings-label { font-size: .72rem; font-weight: 700; color: #555; letter-spacing: 1px; margin-bottom: 10px; }
.theme-row { display: flex; gap: 8px; flex-wrap: wrap; }
.theme-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 6px;
  border: 1.5px solid #1e1e1e; background: #1a1a1a;
  cursor: pointer; font-size: .78rem; color: #aaa;
  transition: all .15s; font-family: inherit;
}
.theme-btn:hover { border-color: #333; color: #ddd; }
.theme-btn.active { border-color: #f5b623; color: #f5b623; }

/* Sidebar */
.game-sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }

.side-card {
  background: #111; border: 1px solid #1e1e1e;
  border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.side-label {
  font-size: .68rem; font-weight: 700; color: #444;
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 2px;
}
.side-btn {
  display: block; text-align: center;
  padding: 8px 12px; border-radius: 6px;
  font-size: .78rem; font-weight: 700;
  cursor: pointer; transition: all .15s;
  text-decoration: none; font-family: inherit;
}
.side-btn-outline {
  background: transparent; border: 1px solid #252525; color: #888;
}
.side-btn-outline:hover { border-color: #444; color: #ddd; }
.side-btn-gold {
  background: rgba(245,182,35,.1); border: 1px solid rgba(245,182,35,.3); color: #f5b623;
}
.side-btn-gold:hover { background: rgba(245,182,35,.18); color: #ffd740; }

.rules-list {
  font-size: .75rem; color: #666; line-height: 1.8;
  padding-left: 14px; margin: 0;
}
</style>
