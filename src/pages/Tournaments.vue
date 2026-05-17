<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n.js'

const router = useRouter()
const { t } = useI18n()

/* ── Current time ─────────────────────────────── */
const now = ref(new Date())
let clockId = null
onMounted(() => { clockId = setInterval(() => { now.value = new Date() }, 10000) })
onUnmounted(() => clearInterval(clockId))

/* ── Filters ──────────────────────────────────── */
const filterType    = ref('All types')
const filterRegion  = ref('Worldwide')
const filterControl = ref('All controls')

/* ── Tournament data ──────────────────────────── */
// start/end are hours as decimal (18.5 = 18:30), duration in minutes
const allT = [
  // Row 0
  { id:1,  name:'Daily Bullet Swiss',            type:'Bullet',  control:'Swiss',  players:28,  max:500,  start:18,    dur:45,  row:0, variant:'International 10x10' },
  { id:2,  name:'Daily Rapid Swiss',             type:'Rapid',   control:'Swiss',  players:91,  max:500,  start:20,    dur:60,  row:0, variant:'International 10x10' },
  { id:3,  name:'Daily Bullet Swiss',            type:'Blitz',   control:'Swiss',  players:4,   max:200,  start:22,    dur:45,  row:0, variant:'International 10x10' },
  // Row 1
  { id:4,  name:'Swiss Chess Tournament (13)',   type:'Blitz',   control:'Swiss',  players:67,  max:500,  start:18,    dur:90,  row:1, variant:'International 10x10' },
  { id:5,  name:'Daily Battleground',            type:'Blitz',   control:'Arena',  players:101, max:500,  start:20,    dur:75,  row:1, variant:'International 10x10' },
  { id:6,  name:'Bullet 2.0 T3',                type:'Bullet',  control:'Arena',  players:22,  max:500,  start:21.5,  dur:120, row:1, variant:'International 10x10' },
  { id:7,  name:'Daily Blitz Swiss',             type:'Blitz',   control:'Swiss',  players:0,   max:200,  start:22.5,  dur:60,  row:1, variant:'International 10x10' },
  // Row 2
  { id:8,  name:'Blitz Happy Hour',              type:'Blitz',   control:'Arena',  players:54,  max:200,  start:18,    dur:60,  row:2, variant:'International 10x10' },
  { id:9,  name:'Elo Elevate Superexpress',      type:'Bullet',  control:'Arena',  players:58,  max:500,  start:19.5,  dur:60,  row:2, variant:'International 10x10' },
  { id:10, name:'Daily Battleground Blitz',      type:'Blitz',   control:'Arena',  players:57,  max:500,  start:21,    dur:60,  row:2, variant:'International 10x10' },
  { id:11, name:'Blitz Practice Tournament',     type:'Blitz',   control:'Arena',  players:1,   max:500,  start:22.5,  dur:60,  row:2, variant:'International 10x10' },
  // Row 3
  { id:12, name:'Elo Elevate Superexpress',      type:'Bullet',  control:'Arena',  players:10,  max:500,  start:19.75, dur:45,  row:3, variant:'International 10x10' },
  { id:13, name:'Blitz Happy Hour',              type:'Blitz',   control:'Arena',  players:21,  max:200,  start:21,    dur:60,  row:3, variant:'International 10x10' },
  { id:14, name:'Road to 2000 Challenge - Blitz',type:'Blitz',   control:'Arena',  players:0,   max:550,  start:22.5,  dur:90,  row:3, variant:'International 10x10' },
  // Row 4
  { id:15, name:'Elo Elevate Express',           type:'Blitz',   control:'Arena',  players:44,  max:200,  start:20,    dur:60,  row:4, variant:'International 10x10' },
  { id:16, name:'Elo Elevate Express',           type:'Bullet',  control:'Arena',  players:0,   max:200,  start:22.5,  dur:60,  row:4, variant:'International 10x10' },
  // Row 5
  { id:17, name:'1500 – 2000 Rated Arena',       type:'Blitz',   control:'Arena',  players:26,  max:500,  start:19.5,  dur:105, row:5, variant:'International 10x10', rated:'1500-2000' },
  { id:18, name:'Saturday\'s Biggest Tournament', type:'Bullet', control:'Arena',  players:6,   max:550,  start:22,    dur:90,  row:5, variant:'International 10x10' },
  // Row 6
  { id:19, name:'The Elo Race Rapid',            type:'Rapid',   control:'Arena',  players:17,  max:200,  start:22,    dur:75,  row:6, variant:'International 10x10' },
  // Row 7
  { id:20, name:'The Title Race Blitz',          type:'Blitz',   control:'Arena',  players:4,   max:200,  start:22,    dur:60,  row:7, variant:'International 10x10' },
  // Row 8
  { id:21, name:'Blitz Practice Tournament',     type:'Blitz',   control:'Arena',  players:27,  max:500,  start:20.5,  dur:120, row:8, variant:'International 10x10' },
  // Row 9
  { id:22, name:'Premier Draughts Academy',      type:'Rapid',   control:'Swiss',  players:1,   max:100,  start:23,    dur:90,  row:9, variant:'International 10x10' },
]

/* ── Layout constants ─────────────────────────── */
const PX_PER_HOUR   = 220   // pixels per hour on the timeline
const TIMELINE_START = 17.5  // 17:30
const TIMELINE_END   = 24    // 00:00

const timeToX = (h) => (h - TIMELINE_START) * PX_PER_HOUR
const totalW  = computed(() => (TIMELINE_END - TIMELINE_START) * PX_PER_HOUR + 120)

// Time axis labels (every 30 min)
const timeLabels = computed(() => {
  const labels = []
  for (let h = TIMELINE_START; h <= TIMELINE_END; h += 0.5) {
    const hour = Math.floor(h)
    const min  = h % 1 === 0.5 ? '30' : '00'
    labels.push({ h, label: `${hour}:${min}`, x: timeToX(h) })
  }
  return labels
})

// Current time marker
const nowX = computed(() => {
  const h = now.value.getHours() + now.value.getMinutes() / 60
  return timeToX(h)
})
const nowLabel = computed(() => {
  const h = now.value.getHours()
  const m = now.value.getMinutes().toString().padStart(2,'0')
  return `${h}:${m}`
})

// Filtered tournaments
const displayed = computed(() => {
  return allT.filter(t => {
    if (filterType.value !== 'All types' && t.type !== filterType.value) return false
    if (filterControl.value !== 'All controls' && t.control !== filterControl.value) return false
    return true
  })
})

// Group by row
const rows = computed(() => {
  const rowMap = {}
  displayed.value.forEach(t => {
    if (!rowMap[t.row]) rowMap[t.row] = []
    rowMap[t.row].push(t)
  })
  return Object.values(rowMap)
})

// Total players
const totalPlaying = computed(() => allT.reduce((a,b) => a + b.players, 0))

/* ── Tournament status ─────────────────────────── */
const getTStatus = (t) => {
  const h = now.value.getHours() + now.value.getMinutes() / 60
  const end = t.start + t.dur / 60
  if (h >= t.start && h < end) return 'live'
  if (h < t.start) return 'upcoming'
  return 'done'
}

/* ── Colors ───────────────────────────────────── */
const typeColor = { Bullet:'#e85d04', Blitz:'#f5b623', Rapid:'#4cc9f0' }
const getBg = (t) => {
  const c = typeColor[t.type] || '#888'
  return `linear-gradient(135deg, ${c}22, ${c}11)`
}
const getBorder = (t) => typeColor[t.type] || '#444'

/* ── Tooltip ──────────────────────────────────── */
const tooltip = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })

const showTooltip = (t, e) => {
  tooltip.value = t
  const rect = e.currentTarget.getBoundingClientRect()
  tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.top - 8 }
}
const hideTooltip = () => { tooltip.value = null }

/* ── Helpers ──────────────────────────────────── */
const fmtTime = (h) => {
  const hh = Math.floor(h)
  const mm = h % 1 === 0.5 ? '30' : '00'
  return `${hh}:${mm}`
}
const today = computed(() => {
  return now.value.toLocaleDateString('en', { month:'long', day:'numeric', year:'numeric' })
})
</script>

<template>
<div class="tourn-page">

  <!-- ── Header ── -->
  <div class="t-header">
    <h1 class="t-heading">
      <span class="t-trophy">🏆</span>
      {{ allT.length }} {{ t.tournaments.heading }}
    </h1>
    <p class="t-sub">{{ totalPlaying.toLocaleString() }} {{ t.tournaments.players }} · {{ today }}</p>
  </div>

  <!-- ── Filters ── -->
  <div class="filters">
    <select v-model="filterType" class="f-select">
      <option value="All types">{{ t.tournaments.allTypes }}</option>
      <option value="Bullet">{{ t.leaderboard.bullet }}</option>
      <option value="Blitz">{{ t.leaderboard.blitz }}</option>
      <option value="Rapid">{{ t.leaderboard.rapid }}</option>
    </select>
    <select v-model="filterRegion" class="f-select">
      <option value="Worldwide">{{ t.tournaments.worldwide }}</option>
      <option value="Kazakhstan">{{ t.tournaments.kazakhstan }}</option>
      <option value="Russia">{{ t.tournaments.russia }}</option>
      <option value="Europe">{{ t.tournaments.europe }}</option>
    </select>
    <select v-model="filterControl" class="f-select">
      <option value="All controls">{{ t.tournaments.allControls }}</option>
      <option value="Swiss">{{ t.tournaments.swiss }}</option>
      <option value="Arena">{{ t.tournaments.arena }}</option>
    </select>
    <div class="f-date">
      📅 {{ now.toLocaleDateString('en',{ month:'2-digit', day:'2-digit', year:'numeric' }) }}
    </div>
  </div>

  <!-- ── Timeline ── -->
  <div class="tl-outer">
    <div class="tl-inner" :style="{ width: totalW + 'px' }">

      <!-- Time axis -->
      <div class="tl-axis">
        <div v-for="lbl in timeLabels" :key="lbl.h"
          class="tl-tick"
          :style="{ left: lbl.x + 'px' }">
          {{ lbl.label }}
        </div>
      </div>

      <!-- Axis line -->
      <div class="tl-line"/>

      <!-- Current time marker (arrow + vertical line) -->
      <div class="tl-now" :style="{ left: nowX + 'px' }">
        <div class="tl-now-label">{{ nowLabel }}</div>
        <div class="tl-now-arrow"/>
        <div class="tl-now-line"/>
      </div>

      <!-- Tournament rows -->
      <div class="tl-rows">
        <div v-for="(row, ri) in rows" :key="ri" class="tl-row">
          <div
            v-for="t in row"
            :key="t.id"
            class="tl-bar"
            :class="['status-'+getTStatus(t)]"
            :style="{
              left:  timeToX(t.start) + 'px',
              width: (t.dur / 60 * PX_PER_HOUR) + 'px',
              borderColor: getBorder(t),
              background: getBg(t),
            }"
            @mouseenter="showTooltip(t, $event)"
            @mouseleave="hideTooltip"
          >
            <div class="bar-head">
              <span class="bar-type-icon">{{ t.type==='Bullet' ? '🔴' : t.type==='Blitz' ? '🔥' : '⏱' }}</span>
              <span class="bar-type" :style="{ color: getBorder(t) }">{{ t.type.toUpperCase() }}</span>
              <span v-if="getTStatus(t)==='live'" class="bar-live-dot"/>
            </div>
            <div class="bar-name">{{ t.name }}</div>
            <div class="bar-meta">
              <span>{{ t.players }}/{{ t.max }}</span>
              <span>🌐</span>
              <span>{{ t.control }}</span>
            </div>
            <!-- Rounded right end -->
            <div class="bar-cap"/>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ── Tooltip ── -->
  <Teleport to="body">
    <div v-if="tooltip" class="tt"
      :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
      <div class="tt-name">{{ tooltip.name }}</div>
      <div class="tt-row"><span class="tt-label">{{ t.tournaments.ttType }}</span><span :style="{ color: typeColor[tooltip.type] }">{{ tooltip.type }}</span></div>
      <div class="tt-row"><span class="tt-label">{{ t.tournaments.ttFormat }}</span>{{ tooltip.control }}</div>
      <div class="tt-row"><span class="tt-label">{{ t.tournaments.ttTime }}</span>{{ fmtTime(tooltip.start) }} – {{ fmtTime(tooltip.start + tooltip.dur/60) }}</div>
      <div class="tt-row"><span class="tt-label">{{ t.tournaments.ttPlayers }}</span>{{ tooltip.players }} / {{ tooltip.max }}</div>
      <div class="tt-row"><span class="tt-label">{{ t.tournaments.ttVariant }}</span>{{ tooltip.variant }}</div>
      <button class="tt-join">{{ t.tournaments.joinTournament }}</button>
    </div>
  </Teleport>

</div>
</template>

<style scoped>
.tourn-page { background: var(--ink); min-height:100vh; padding:44px 0 80px; color: var(--text0); }

.t-header { padding:0 40px; margin-bottom:20px; }
.t-heading { font-size:1.6rem; font-weight:800; display:flex; align-items:center; gap:10px; margin-bottom:6px; letter-spacing:-0.3px; }
.t-trophy  { font-size:1.2rem; }
.t-sub     { color: var(--text2); font-size:.88rem; }

/* Filters */
.filters { padding:0 40px; display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
.f-select {
  background: var(--ink2); border:1px solid var(--border2); color: var(--text1);
  padding:7px 12px; border-radius:5px; font-size:.82rem;
  cursor:pointer; outline:none; transition:border-color .15s;
  font-family:inherit;
}
.f-select:hover { border-color: var(--amber); }
.f-select:focus { border-color: var(--amber); }
.f-date {
  background: var(--ink2); border:1px solid var(--border); color: var(--text2);
  padding:7px 12px; border-radius:5px; font-size:.82rem;
}

/* Timeline container */
.tl-outer {
  overflow-x: auto;
  padding: 0 40px;
  scrollbar-width: thin;
  scrollbar-color: var(--ink4) transparent;
}
.tl-outer::-webkit-scrollbar { height: 4px; }
.tl-outer::-webkit-scrollbar-track { background: transparent; }
.tl-outer::-webkit-scrollbar-thumb { background: var(--ink4); border-radius: 2px; }

.tl-inner { position: relative; min-height: 400px; }

/* Time axis */
.tl-axis { position: relative; height: 32px; margin-bottom: 4px; }
.tl-tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: .7rem;
  color: var(--text3);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
}

/* Axis horizontal line */
.tl-line {
  height: 1px;
  background: var(--border);
  margin-bottom: 12px;
}

/* Current time marker */
.tl-now {
  position: absolute;
  top: 0;
  z-index: 20;
  pointer-events: none;
}
.tl-now-label {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--red);
  color: var(--paper);
  font-size: .68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
}
.tl-now-arrow {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--red);
}
.tl-now-line {
  position: absolute;
  top: 20px;
  left: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--red) 0%, rgba(178,48,48,.2) 100%);
  height: 2000px;
  margin-left: -1px;
}

/* Rows */
.tl-rows { position: relative; padding-top: 4px; }
.tl-row  { position: relative; height: 74px; margin-bottom: 6px; }

/* Tournament bars */
.tl-bar {
  position: absolute;
  top: 4px;
  height: 64px;
  min-width: 80px;
  border: 1px solid var(--border2);
  border-left-width: 1px;
  border-radius: 0 10px 10px 0;
  padding: 6px 10px;
  cursor: pointer;
  transition: filter .15s, transform .15s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-sizing: border-box;
}
.tl-bar:hover {
  filter: brightness(1.3);
  transform: translateY(-1px);
  z-index: 10;
}
.status-done { opacity: .4; }
.status-live  { filter: brightness(1.1); }

.bar-head { display: flex; align-items: center; gap: 4px; }
.bar-type-icon { font-size: .7rem; line-height: 1; }
.bar-type { font-size: .6rem; font-weight: 800; letter-spacing: .5px; }
.bar-live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); animation: blink 1s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

.bar-name {
  font-size: .75rem;
  font-weight: 700;
  color: var(--text0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-meta {
  display: flex;
  gap: 6px;
  font-size: .65rem;
  color: var(--text3);
  align-items: center;
}

/* Right rounded cap (makes bars look like Lichess pills) */
.bar-cap {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 44px;
  border-radius: 50%;
  background: inherit;
  border: 1px solid inherit;
}

/* Tooltip */
.tt {
  position: fixed;
  transform: translateX(-50%) translateY(-100%);
  background: var(--ink2);
  border: 1px solid var(--border2);
  border-radius: 9px;
  padding: 12px 14px;
  z-index: 9999;
  pointer-events: none;
  min-width: 200px;
  box-shadow: 0 12px 40px rgba(0,0,0,.7);
}
.tt-name { font-size: .88rem; font-weight: 700; color: var(--text0); margin-bottom: 8px; }
.tt-row  { display: flex; gap: 8px; font-size: .78rem; color: var(--text1); margin-bottom: 3px; }
.tt-label { color: var(--text3); min-width: 56px; }
.tt-join {
  margin-top: 10px;
  width: 100%;
  background: var(--amber);
  color: var(--btn-ink);
  border: none;
  padding: 7px;
  border-radius: 5px;
  font-weight: 700;
  font-size: .78rem;
  cursor: pointer;
  pointer-events: auto;
  font-family: inherit;
  transition: background .15s;
}
.tt-join:hover { background: var(--amber-l); }
</style>
