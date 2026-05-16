<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selectedVariant = ref('international')  // default: 10x10 International
const selectedMode    = ref(null)
const selectedTC      = ref('rapid')

const variants = [
  {
    id: 'international',
    icon: '♟',
    title: 'International Draughts',
    sub: '10×10 board · FMJD rules',
    desc: 'The official world standard. 20 pieces per side, flying kings, mandatory maximum captures.',
    badge: 'DEFAULT',
  },
  {
    id: 'russian',
    icon: '♞',
    title: 'Russian Checkers',
    sub: '8×8 board · Russian rules',
    desc: 'Classic 8×8 checkers with flying kings and backward captures.',
    badge: null,
  },
]

const modes = [
  { id:'local',  icon:'🤝', title:'Pass & Play',   desc:'Two players on one device' },
  { id:'vsBot',  icon:'🤖', title:'Play vs Bot',    desc:'Challenge the AI engine' },
  { id:'online', icon:'🌍', title:'Play Online',    desc:'Matchmaking worldwide' },
  { id:'friend', icon:'👥', title:'Play a Friend',  desc:'Invite with a game link' },
]

const timeControls = [
  { id:'bullet', label:'⚡ Bullet',    sub:'1 min'  },
  { id:'blitz',  label:'🔥 Blitz',     sub:'3 min'  },
  { id:'rapid',  label:'⏱ Rapid',     sub:'10 min' },
  { id:'none',   label:'♾ Unlimited', sub:'No timer' },
]

const startGame = () => {
  if (!selectedMode.value) return
  router.push(`/game?mode=${selectedMode.value}&tc=${selectedTC.value}&variant=${selectedVariant.value}`)
}
</script>

<template>
<div class="play-page">
  <h1 class="play-title">Play Checkers</h1>
  <p class="play-sub">Choose your variant, game mode, and time control.</p>

  <!-- ── Variant selection ── -->
  <div class="section-label">GAME VARIANT</div>
  <div class="variant-grid">
    <div v-for="v in variants" :key="v.id"
      class="variant-card"
      :class="{ selected: selectedVariant === v.id }"
      @click="selectedVariant = v.id">
      <div class="vc-top">
        <span class="vc-icon">{{ v.icon }}</span>
        <div class="vc-texts">
          <div class="vc-title">{{ v.title }}</div>
          <div class="vc-sub">{{ v.sub }}</div>
        </div>
        <span v-if="v.badge" class="vc-badge">{{ v.badge }}</span>
      </div>
      <p class="vc-desc">{{ v.desc }}</p>
    </div>
  </div>

  <!-- ── Game mode ── -->
  <div class="section-label">GAME MODE</div>
  <div class="mode-grid">
    <div v-for="mode in modes" :key="mode.id"
      class="mode-card"
      :class="{ selected: selectedMode === mode.id }"
      @click="selectedMode = mode.id">
      <div class="mc-icon">{{ mode.icon }}</div>
      <div class="mc-title">{{ mode.title }}</div>
      <div class="mc-desc">{{ mode.desc }}</div>
    </div>
  </div>

  <!-- ── Time control ── -->
  <div class="section-label">TIME CONTROL</div>
  <div class="tc-row">
    <button v-for="tc in timeControls" :key="tc.id"
      class="tc-btn"
      :class="{ selected: selectedTC === tc.id }"
      @click="selectedTC = tc.id">
      {{ tc.label }} <span class="tc-sub">{{ tc.sub }}</span>
    </button>
  </div>

  <!-- ── Start ── -->
  <button class="start-btn" :class="{ disabled: !selectedMode }" @click="startGame">
    {{ selectedMode ? '▶ Start Game' : 'Select a mode to continue' }}
  </button>

  <div v-if="selectedMode==='online' || selectedMode==='friend'" class="online-note">
    <strong>Note:</strong> Online multiplayer requires an account.
    <RouterLink to="/register">Sign up free →</RouterLink>
  </div>
</div>
</template>

<style scoped>
.play-page { max-width: 820px; margin: 0 auto; padding: 40px 24px 60px; }
.play-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; color: #fff; }
.play-sub   { color: #666; font-size: .88rem; margin-bottom: 32px; }
.section-label {
  font-size: .72rem; font-weight: 700; color: #555;
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 12px; margin-top: 28px;
}

/* Variants */
.variant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .variant-grid { grid-template-columns: 1fr; } }

.variant-card {
  background: #111; border: 2px solid #1e1e1e;
  border-radius: 10px; padding: 16px;
  cursor: pointer; transition: all .15s;
}
.variant-card:hover { border-color: #333; background: #141414; }
.variant-card.selected { border-color: #f5b623; background: rgba(245,182,35,.05); }

.vc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.vc-icon { font-size: 1.6rem; flex-shrink: 0; }
.vc-texts { flex: 1; }
.vc-title { font-size: .92rem; font-weight: 700; color: #ddd; }
.vc-sub   { font-size: .75rem; color: #555; }
.vc-badge {
  background: rgba(245,182,35,.15); border: 1px solid rgba(245,182,35,.3);
  color: #f5b623; font-size: .65rem; font-weight: 800;
  padding: 2px 8px; border-radius: 10px; white-space: nowrap;
}
.vc-desc { font-size: .78rem; color: #666; line-height: 1.4; }

/* Modes */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}
.mode-card {
  background: #111; border: 2px solid #1e1e1e;
  border-radius: 9px; padding: 16px;
  cursor: pointer; transition: all .15s;
}
.mode-card:hover { border-color: #333; background: #141414; }
.mode-card.selected { border-color: #f5b623; background: rgba(245,182,35,.05); }
.mc-icon  { font-size: 1.5rem; margin-bottom: 8px; }
.mc-title { font-size: .88rem; font-weight: 700; color: #ddd; margin-bottom: 4px; }
.mc-desc  { font-size: .75rem; color: #666; line-height: 1.4; }

/* Time control */
.tc-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tc-btn {
  background: #111; border: 2px solid #1e1e1e; color: #aaa;
  padding: 9px 18px; border-radius: 7px;
  cursor: pointer; font-size: .85rem; font-weight: 600;
  transition: all .15s; font-family: inherit;
}
.tc-btn:hover { border-color: #333; color: #ddd; }
.tc-btn.selected { border-color: #f5b623; color: #f5b623; background: rgba(245,182,35,.06); }
.tc-sub { font-size: .72rem; opacity: .75; }

/* Start */
.start-btn {
  margin-top: 28px;
  width: 100%; max-width: 300px;
  background: #f5b623; color: #000; border: none;
  padding: 14px; border-radius: 7px;
  font-weight: 800; font-size: .95rem; cursor: pointer;
  transition: background .15s; display: block;
}
.start-btn:hover { background: #ffd740; }
.start-btn.disabled { background: #222; color: #555; cursor: not-allowed; }

.online-note {
  margin-top: 14px; padding: 12px 14px;
  background: #111; border: 1px solid #1e1e1e;
  border-radius: 7px; font-size: .82rem; color: #666;
}
.online-note a { color: #f5b623; font-weight: 700; margin-left: 4px; }
</style>
