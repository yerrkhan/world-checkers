<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameBoard    from '../components/GameBoard.vue'
import GameBoard10  from '../components/GameBoard10.vue'
import { useI18n } from '../i18n.js'

const route  = useRoute()
const router = useRouter()
const { t } = useI18n()

const mode       = computed(() => route.query.mode       || 'local')
const tcType     = computed(() => route.query.tc         || 'rapid')
const variant    = computed(() => route.query.variant    || 'international')  // default 10x10
const difficulty = computed(() => route.query.difficulty || 'medium')
const playerSide = computed(() => route.query.side       || 'white')
const roomId     = computed(() => route.query.room       || null)   // for friend mode

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

const boardThemes = computed(() => [
  { id:'classic',   label: t.value.game.themeClassic,  light:'#f0d9b5', dark:'#b58863' },
  { id:'green',     label: t.value.game.themeGreen,    light:'#eeeed2', dark:'#769656' },
  { id:'midnight',  label: t.value.game.themeMidnight, light:'#6e85b5', dark:'#3d4b6e' },
])

const modeLabel = computed(() => {
  return {
    local:  t.value.game.modeLocal,
    vsBot:  t.value.game.modeBot,
    online: t.value.game.modeOnline,
    friend: t.value.game.modeFriend,
  }[mode.value] || t.value.game.modeDefault
})
const tcLabel = computed(() => {
  return {
    bullet: t.value.game.tcBullet,
    blitz:  t.value.game.tcBlitz,
    rapid:  t.value.game.tcRapid,
    none:   t.value.game.tcNone,
  }[tcType.value] || t.value.game.tcRapid
})
const variantLabel = computed(() => isInternational.value ? t.value.game.variantIntl : t.value.game.variantRu)

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
      <div class="settings-label">{{ t.game.boardTheme }}</div>
      <div class="theme-row">
        <button v-for="theme in boardThemes" :key="theme.id"
          @click="setBoardTheme(theme.id)"
          class="theme-btn"
          :class="{ active: boardTheme===theme.id }">
          <span :style="{ width:'14px', height:'14px', borderRadius:'3px', background:theme.dark, display:'inline-block' }"/>
          <span :style="{ width:'14px', height:'14px', borderRadius:'3px', background:theme.light, display:'inline-block' }"/>
          {{ theme.label }}
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
      :botDifficulty="difficulty"
      :playerSide="playerSide"
      :roomId="roomId"
      @gameOver="onGameOver"
    />

    <!-- RUSSIAN 8×8 -->
    <GameBoard
      v-else
      ref="boardRef"
      :boardTheme="boardTheme"
      :gameMode="mode"
      :timeControl="timeControl"
      :botDifficulty="difficulty"
      :playerSide="playerSide"
      :roomId="roomId"
      @gameOver="onGameOver"
    />
  </div>

  <!-- Sidebar -->
  <aside class="game-sidebar">
    <div class="side-card">
      <div class="side-label">{{ t.game.sideGame }}</div>
      <RouterLink to="/play" class="side-btn side-btn-outline">{{ t.game.newGame }}</RouterLink>
      <button @click="boardRef?.resetGame()" class="side-btn side-btn-outline">{{ t.game.restart }}</button>
      <button v-if="mode==='friend'" @click="boardRef?.offerDraw()" class="side-btn side-btn-outline">{{ t.game.offerDraw }}</button>
    </div>

    <div class="side-card">
      <div class="side-label">{{ t.game.sideVariant }}</div>
      <div style="font-size:.82rem; color:var(--text0); font-weight:700; margin-bottom:4px;">{{ variantLabel }}</div>
      <div style="font-size:.75rem; color:var(--text2); line-height:1.5;">
        <template v-if="isInternational">
          {{ t.game.intlDesc }}<br>{{ t.game.intlDesc2 }}<br>{{ t.game.intlDesc3 }}
        </template>
        <template v-else>
          {{ t.game.ruDesc }}<br>{{ t.game.ruDesc2 }}
        </template>
      </div>
    </div>

    <div class="side-card">
      <div class="side-label">{{ t.game.sideRules }}</div>
      <ul class="rules-list">
        <li>{{ t.game.rule1 }}</li>
        <li v-if="isInternational">{{ t.game.rule2 }}</li>
        <li>{{ t.game.rule3 }}</li>
        <li>{{ t.game.rule4 }}</li>
        <li>{{ t.game.rule5 }}</li>
      </ul>
    </div>

    <div class="side-card">
      <div class="side-label">{{ t.game.sideSwitchVariant }}</div>
      <RouterLink
        :to="`/game?mode=${mode}&tc=${tcType}&variant=${isInternational ? 'russian' : 'international'}`"
        class="side-btn side-btn-gold">
        {{ isInternational ? t.game.playRussian : t.game.playIntl }}
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
  background: var(--ink2); border: 1px solid var(--border);
  border-radius: 7px;
}
.info-chip {
  font-size: .78rem; color: var(--text2); font-weight: 500;
  background: var(--ink3); padding: 3px 8px;
  border-radius: 4px; white-space: nowrap;
}
.variant-chip { color: var(--amber); border: 1px solid rgba(196,148,48,.25); }
.settings-btn {
  background: transparent; border: none; color: var(--text3);
  cursor: pointer; margin-left: auto; font-size: 1rem;
  padding: 2px 4px; transition: color .15s;
}
.settings-btn:hover { color: var(--text0); }

.settings-panel {
  width: min(580px, 95vw);
  background: var(--ink2); border: 1px solid var(--border);
  border-radius: 7px; padding: 14px;
}
.settings-label { font-size: .72rem; font-weight: 700; color: var(--text3); letter-spacing: 1px; margin-bottom: 10px; }
.theme-row { display: flex; gap: 8px; flex-wrap: wrap; }
.theme-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 6px;
  border: 1.5px solid var(--border); background: var(--ink3);
  cursor: pointer; font-size: .78rem; color: var(--text2);
  transition: all .15s; font-family: inherit;
}
.theme-btn:hover { border-color: var(--border2); color: var(--text0); }
.theme-btn.active { border-color: var(--amber); color: var(--amber); }

/* Sidebar */
.game-sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }

.side-card {
  background: var(--ink2); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.side-label {
  font-size: .68rem; font-weight: 700; color: var(--text3);
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
  background: transparent; border: 1px solid var(--border2); color: var(--text2);
}
.side-btn-outline:hover { border-color: var(--border2); color: var(--text0); }
.side-btn-gold {
  background: rgba(196,148,48,.1); border: 1px solid rgba(196,148,48,.3); color: var(--amber);
}
.side-btn-gold:hover { background: rgba(196,148,48,.18); color: var(--amber-l); }

.rules-list {
  font-size: .75rem; color: var(--text2); line-height: 1.8;
  padding-left: 14px; margin: 0;
}
</style>
