<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Draughts10 } from '../game/draughts10.js'
import { useI18n } from '../i18n.js'

const { t } = useI18n()

const router    = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('wc_user'))

/* ── Supabase Storage — photos stored online, work on any hosting ── */
const AVATAR_BASE = 'https://kksfgpjnrppifciagrfd.supabase.co/storage/v1/object/public/avatars'

/* ── Animated counters ── */
const tournamentsToday = ref(0)
const playersOnline    = ref(0)
const gamesPlayed      = ref(0)
const intervals        = []

const animateCount = (target, setter, ms = 1600) => {
  const t0 = Date.now()
  const id = setInterval(() => {
    const p = Math.min((Date.now() - t0) / ms, 1)
    setter(Math.round((1 - Math.pow(1 - p, 3)) * target))
    if (p >= 1) clearInterval(id)
  }, 16)
  intervals.push(id)
}

/* ── Tournament data ── */
const typeColor = { bullet:'#b23030', blitz:'#c49430', rapid:'#3a6caa' }
const typeLabel = computed(() => ({
  bullet: t.value.home.bullet,
  blitz:  t.value.home.blitz,
  rapid:  t.value.home.rapid,
}))

const tournaments = [
  { id:1,  name:'Bullet Blitz 1+0',   time:'18:00', players:340, type:'bullet' },
  { id:2,  name:'Daily Blitz Swiss',  time:'18:30', players:125, type:'blitz'  },
  { id:3,  name:'Swiss Championship', time:'19:00', players: 89, type:'blitz'  },
  { id:4,  name:'Blitz Happy Hour',   time:'19:15', players:214, type:'blitz'  },
  { id:5,  name:'Daily Rapid Swiss',  time:'20:00', players:156, type:'rapid'  },
  { id:6,  name:'Elo Elevate Open',   time:'20:30', players: 76, type:'bullet' },
  { id:7,  name:'Daily Battleground', time:'21:00', players:203, type:'blitz'  },
  { id:8,  name:'Bullet Masters T3',  time:'21:30', players: 67, type:'bullet' },
  { id:9,  name:'Daily Bullet Swiss', time:'22:00', players:298, type:'bullet' },
  { id:10, name:'Night Blitz Arena',  time:'22:30', players:142, type:'blitz'  },
]

/* ── Live games ── */
const liveGames = reactive([
  { id:1, white:'DraughtsMaster_KZ', wR:2340, wImg:`${AVATAR_BASE}/p01.jpg`, black:'BoardWizard_NL',  bR:2231, bImg:`${AVATAR_BASE}/p02.jpg`, tc:'3+0' },
  { id:2, white:'TacticGod_DE',      wR:2176, wImg:`${AVATAR_BASE}/p03.jpg`, black:'AlmataKing',       bR:2154, bImg:`${AVATAR_BASE}/p04.jpg`, tc:'1+0' },
  { id:3, white:'CheckerKing_RU',    wR:2285, wImg:`${AVATAR_BASE}/p05.jpg`, black:'PieceMaster_FR',   bR:2198, bImg:`${AVATAR_BASE}/p06.jpg`, tc:'5+0' },
  { id:4, white:'NurSultan_Pro',     wR:2089, wImg:`${AVATAR_BASE}/p07.jpg`, black:'CheckerPro_US',    bR:2108, bImg:`${AVATAR_BASE}/p08.jpg`, tc:'1+0' },
])

/* ── Last-move highlighting — tracks from/to squares per game ── */
const lastMoves = reactive({})
const isLastMoveSq = (gid, ri, ci) => {
  const lm = lastMoves[gid]
  if (!lm) return false
  return (lm.from.r === ri && lm.from.c === ci) || (lm.to.r === ri && lm.to.c === ci)
}

/* ── Live clocks ── */
const clocks = reactive({})
const gameWinners = reactive({})   // { [gameId]: 'w' | 'b' } — set when clock hits 0
liveGames.forEach(g => {
  const base  = parseInt(g.tc) * 60
  const seed  = g.id * 37
  clocks[g.id] = {
    w: Math.floor(base * (0.45 + (seed % 30) / 100)),
    b: Math.floor(base * (0.55 + (seed % 20) / 100)),
    active: g.id % 2 === 0 ? 'b' : 'w',
  }
  lastMoves[g.id] = null
})

const fmt = s => {
  if (s <= 0) return '0:00'
  const m = Math.floor(s / 60), sec = s % 60
  return `${m}:${sec.toString().padStart(2,'0')}`
}

/* ── Live game engines ── */
const liveEngines = {}
const miniBoards  = reactive({})

liveGames.forEach((g, i) => {
  const eng = new Draughts10()
  const advanceMoves = 6 + i * 3
  for (let j = 0; j < advanceMoves; j++) {
    const s = eng.getState()
    if (s.over || !s.moves.length) break
    const mv = eng.bestMove()
    if (!mv) break
    eng.makeMove(mv)
  }
  liveEngines[g.id] = eng
  miniBoards[g.id] = eng.getState().board.map(r => [...r])
})

/* ── Piece helpers ── */
const cellBg  = (ri, ci) => (ri + ci) % 2 === 0 ? '#c8a96e' : '#6b4226'
const pieceBg = (v) => v > 0
  ? 'radial-gradient(circle at 32% 30%, #2a2a2a, #0c0c0c)'
  : 'radial-gradient(circle at 32% 30%, var(--paper), #dcdcdc)'
const pieceBorder = (v) => v > 0 ? '1.5px solid #111' : '1.5px solid #bbb'
const pieceShadow = (v) => v > 0
  ? '0 2px 5px rgba(0,0,0,.9), inset 0 1px rgba(255,255,255,.08)'
  : '0 2px 5px rgba(0,0,0,.4), inset 0 1px rgba(255,255,255,.85)'

/* ── Watch modal ── */
const watching     = ref(null)
const watchEngine  = ref(null)
const watchBoard   = ref([])
const watchDone    = ref(false)
const watchLastMove = ref(null)
const watchClocks  = reactive({ w: 180, b: 180, active: 'w' })
let watchTimer     = null

const watchCellBg = (ri, ci) => (ri + ci) % 2 === 0 ? '#c8a96e' : '#6b4226'

const openWatch = (game) => {
  if (watchTimer) clearTimeout(watchTimer)
  watching.value = game
  const eng = new Draughts10()
  const seed = game.id
  const advanceMoves = 6 + (seed - 1) * 3
  for (let j = 0; j < advanceMoves; j++) {
    const s = eng.getState()
    if (s.over || !s.moves.length) break
    const mv = eng.bestMove()
    if (!mv) break
    eng.makeMove(mv)
  }
  watchEngine.value  = eng
  watchBoard.value   = eng.getState().board.map(r => [...r])
  watchDone.value    = false
  watchLastMove.value = null
  watchClocks.w      = clocks[game.id].w
  watchClocks.b     = clocks[game.id].b
  watchClocks.active = clocks[game.id].active
  tick()
}

const tick = () => {
  watchTimer = setTimeout(() => {
    if (!watchEngine.value || watchDone.value) return
    const s = watchEngine.value.getState()
    if (s.over || !s.moves.length) { watchDone.value = true; return }
    watchClocks[watchClocks.active]--
    const mv = watchEngine.value.bestMove()
    if (!mv) { watchDone.value = true; return }
    const wdest = mv.path[mv.path.length - 1]
    watchLastMove.value = { from: mv.from, to: wdest }
    watchEngine.value.makeMove(mv)
    const ns = watchEngine.value.getState()
    watchBoard.value   = ns.board.map(r => [...r])
    watchClocks.active = watchClocks.active === 'w' ? 'b' : 'w'
    if (ns.over) { watchDone.value = true; return }
    tick()
  }, 700 + Math.random() * 900)
}

const closeWatch = () => {
  if (watchTimer) clearTimeout(watchTimer)
  watching.value = null; watchEngine.value = null; watchBoard.value = []
}

/* ── Premium plans ── */
const yearly = ref(true)

const plans = computed(() => [
  {
    id: 'free', name: t.value.home.planFree,
    monthlyPrice: 0, yearlyPrice: 0,
    highlight: false, cta: t.value.home.ctaCurrent,
    features: [true, true, true, false, false, false, false, false],
  },
  {
    id: 'gold', name: t.value.home.planGold, badge: null,
    monthlyPrice: 1700, yearlyPrice: 1000,
    highlight: false, cta: t.value.home.ctaGold,
    features: [true, true, true, true, false, false, true, false],
  },
  {
    id: 'platinum', name: t.value.home.planPlatinum, badge: null,
    monthlyPrice: 2700, yearlyPrice: 1667,
    highlight: false, cta: t.value.home.ctaPlatinum,
    features: [true, true, true, true, true, false, true, false],
  },
  {
    id: 'diamond', name: t.value.home.planDiamond, badge: 'Best Value',
    monthlyPrice: 4200, yearlyPrice: 2500,
    highlight: true, cta: t.value.home.ctaDiamond,
    features: [true, true, true, true, true, true, true, true],
  },
])

const featureRows = computed(() => [
  { label: t.value.home.featPuzzles },
  { label: t.value.home.featLessons },
  { label: t.value.home.featBot },
  { label: t.value.home.featAnalysis },
  { label: t.value.home.featMoves },
  { label: t.value.home.featProfile },
  { label: t.value.home.featAdFree },
  { label: t.value.home.featCourses },
])

/* ── Avatar image error: fall back to letter initial ── */
const avaErr = (e, game, side) => {
  if (side === 'w') game.wImg = null
  else game.bImg = null
}

/* ── Lifecycle ── */
let moveCounter = 0
onMounted(() => {
  animateCount(65,    v => tournamentsToday.value = v)
  animateCount(3007,  v => playersOnline.value    = v, 1800)
  animateCount(48293, v => gamesPlayed.value      = v, 2200)

  const clockId = setInterval(() => {
    // Tick the clock of the active player — only for games still running
    liveGames.forEach(g => {
      if (gameWinners[g.id]) return   // game already finished
      const c = clocks[g.id]
      c[c.active]--
      if (c[c.active] <= 0) {
        c[c.active] = 0
        // Clock hit zero → other player wins
        gameWinners[g.id] = c.active === 'w' ? 'b' : 'w'
      }
    })
    moveCounter++
    // Make a move every 3 seconds — THEN switch active player
    if (moveCounter % 3 === 0) {
      const game = liveGames[Math.floor(moveCounter / 3) % liveGames.length]
      if (gameWinners[game.id]) return  // skip finished games
      const eng  = liveEngines[game.id]
      if (eng) {
        const s = eng.getState()
        if (!s.over && s.moves.length > 0) {
          const mv = eng.bestMove()
          if (mv) {
            const dest = mv.path[mv.path.length - 1]
            lastMoves[game.id] = { from: mv.from, to: dest }
            eng.makeMove(mv)
            miniBoards[game.id] = eng.getState().board.map(r => [...r])
            // Switch active player only after a move is made
            clocks[game.id].active = clocks[game.id].active === 'w' ? 'b' : 'w'
          }
        }
      }
    }
  }, 1000)
  intervals.push(clockId)
})

onUnmounted(() => {
  intervals.forEach(clearInterval)
  if (watchTimer) clearTimeout(watchTimer)
})
</script>

<template>
<div class="home">

<!-- ══════════════════════ HERO ══════════════════════ -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-left">
      <p class="eyebrow">{{ t.home.eyebrow }}</p>
      <h1 class="hero-title">
        {{ t.home.heroTitle1 }}<br>
        <span class="hero-em">{{ t.home.heroTitle2 }}</span>
      </h1>
      <p class="hero-sub">{{ t.home.heroSub }}</p>
      <div class="hero-btns">
        <button class="btn-hero-primary" @click="router.push('/play')">{{ t.home.playNow }}</button>
        <button class="btn-hero-ghost" @click="router.push(isLoggedIn ? '/profile' : '/register')">
          {{ isLoggedIn ? t.home.myProfile : t.home.createAccount }}
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stat-row">
      <div class="stat">
        <span class="stat-n">{{ tournamentsToday }}</span>
        <span class="stat-l">{{ t.home.tournamentsToday }}</span>
      </div>
      <div class="stat-sep"/>
      <div class="stat">
        <span class="stat-n">{{ playersOnline.toLocaleString() }}</span>
        <span class="stat-l">{{ t.home.playersOnline }}</span>
      </div>
      <div class="stat-sep"/>
      <div class="stat">
        <span class="stat-n">{{ gamesPlayed.toLocaleString() }}</span>
        <span class="stat-l">{{ t.home.gamesToday }}</span>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════ TOURNAMENTS ════════════════════ -->
<section class="section">
  <div class="sec-head">
    <span class="sec-label">{{ t.home.todaysTournaments }}</span>
    <span class="sec-count">{{ tournaments.length }} {{ t.home.scheduled }}</span>
    <button class="sec-link" @click="router.push('/tournaments')">{{ t.home.viewAll }}</button>
  </div>

  <div class="timeline-scroll">
    <div class="time-rail">
      <div v-for="t in tournaments" :key="'tl-'+t.id" class="time-lbl" :style="{ color: typeColor[t.type] }">
        {{ t.time }}
      </div>
    </div>
    <div class="t-cards">
      <div v-for="t in tournaments" :key="t.id" class="t-card"
        :style="{ '--tc': typeColor[t.type] }"
        @click="router.push('/tournaments')">
        <div class="t-type-row">
          <span class="t-dot-color" :style="{ background: typeColor[t.type] }"/>
          <span class="t-type-lbl" :style="{ color: typeColor[t.type] }">{{ typeLabel[t.type] }}</span>
        </div>
        <div class="t-name">{{ t.name }}</div>
        <div class="t-footer">
          <span class="t-players-dot"/>
          <span class="t-players">{{ t.players }} players</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════ LIVE GAMES ════════════════════ -->
<section class="section section-alt">
  <div class="sec-head">
    <span class="live-indicator">
      <span class="live-dot"/>
      <span class="live-txt">{{ t.home.live }}</span>
    </span>
    <span class="sec-label">{{ t.home.activeGames }}</span>
    <span class="sec-count">{{ liveGames.length }} {{ t.home.inProgress }}</span>
  </div>

  <div class="games-grid">
    <div v-for="game in liveGames" :key="game.id" class="game-card" @click="openWatch(game)">

      <!-- Players row -->
      <div class="players-row">
        <div class="p-block">
          <div class="p-ava p-ava-dark">
              <img v-if="game.wImg" :src="game.wImg" class="ava-img" :alt="game.white" @error="avaErr($event, game, 'w')">
              <span v-else>{{ game.white[0] }}</span>
            </div>
          <div class="p-info">
            <span class="p-name">{{ game.white }}</span>
            <span class="p-rating">{{ game.wR }}</span>
          </div>
        </div>
        <div class="vs-col">
          <span class="tc-tag">{{ game.tc }}</span>
          <span class="vs-txt">vs</span>
        </div>
        <div class="p-block p-block-r">
          <div class="p-info p-info-r">
            <span class="p-name">{{ game.black }}</span>
            <span class="p-rating">{{ game.bR }}</span>
          </div>
          <div class="p-ava p-ava-light">
              <img v-if="game.bImg" :src="game.bImg" class="ava-img" :alt="game.black" @error="avaErr($event, game, 'b')">
              <span v-else>{{ game.black[0] }}</span>
            </div>
        </div>
      </div>

      <!-- Clocks -->
      <div class="game-clocks">
        <div class="game-clock" :class="{ 'clock-on': clocks[game.id].active === 'w' }">
          <span class="clock-piece clock-white"/>
          {{ fmt(clocks[game.id].w) }}
        </div>
        <div class="game-clock" :class="{ 'clock-on': clocks[game.id].active === 'b' }">
          <span class="clock-piece clock-black"/>
          {{ fmt(clocks[game.id].b) }}
        </div>
      </div>

      <!-- Mini board -->
      <div class="mini-board-wrap">
        <div class="mini-board">
          <template v-for="(row, ri) in miniBoards[game.id]" :key="ri">
            <div v-for="(piece, ci) in row" :key="ri+'-'+ci"
              class="mini-sq"
              :class="{ 'mini-sq-move': isLastMoveSq(game.id, ri, ci) }"
              :style="{ background: cellBg(ri, ci) }">
              <div v-if="piece !== 0" class="mini-piece"
                :style="{
                  background: pieceBg(piece),
                  border: pieceBorder(piece),
                  boxShadow: pieceShadow(piece)
                }">
                <span v-if="Math.abs(piece)===2" class="mini-crown"
                  :style="{ color: piece > 0 ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.4)' }">♛</span>
              </div>
            </div>
          </template>
        </div>
        <!-- Winner overlay when clock hits 0 -->
        <div v-if="gameWinners[game.id]" class="winner-overlay">
          <span class="winner-text">
            {{ gameWinners[game.id] === 'w' ? '⬜ White wins' : '⚫ Black wins' }}
          </span>
          <span class="winner-reason">on time</span>
        </div>
      </div>

      <div class="watch-cta">{{ t.home.watchGame }}</div>
    </div>
  </div>
</section>

<!-- ═══════════════════ MEMBERSHIP ═══════════════════ -->
<section class="section section-upgrade">
  <div class="upgrade-inner">
    <p class="upgrade-eyebrow">{{ t.home.membershipEyebrow }}</p>
    <h2 class="upgrade-title">{{ t.home.membershipTitle }}</h2>
    <p class="upgrade-sub">{{ t.home.membershipSub }}</p>

    <!-- Billing toggle -->
    <div class="billing-toggle">
      <span :class="{ 'tog-on': !yearly }" @click="yearly=false">{{ t.home.monthly }}</span>
      <button class="tog-switch" @click="yearly=!yearly">
        <span class="tog-thumb" :class="{ 'tog-right': yearly }"/>
      </button>
      <span :class="{ 'tog-on': yearly }" @click="yearly=true">
        {{ t.home.yearly }}
        <span class="save-tag">{{ t.home.save }}</span>
      </span>
    </div>

    <!-- Pricing table -->
    <div class="price-table">
      <!-- Header -->
      <div class="pt-grid pt-head-row">
        <div class="pt-feature-col">
          <span class="pt-feature-label">{{ t.home.featuresCol }}</span>
        </div>
        <div v-for="plan in plans" :key="plan.id" class="pt-plan-col" :class="{ 'pt-highlight': plan.highlight }">
          <div v-if="plan.badge" class="pt-badge">{{ plan.badge }}</div>
          <div class="pt-plan-name">{{ plan.name }}</div>
        </div>
      </div>

      <!-- Feature rows -->
      <div v-for="(feat, fi) in featureRows" :key="fi" class="pt-grid pt-feat-row">
        <div class="pt-feature-col">
          <span class="feat-label">{{ feat.label }}</span>
        </div>
        <div v-for="plan in plans" :key="plan.id" class="pt-plan-col" :class="{ 'pt-highlight': plan.highlight }">
          <span v-if="plan.features[fi]" class="pt-check" :class="{ 'pt-check-em': plan.highlight }">✓</span>
          <span v-else class="pt-cross">—</span>
        </div>
      </div>

      <!-- Price row -->
      <div class="pt-grid pt-price-row">
        <div class="pt-feature-col">
          <span class="price-note">{{ t.home.billedAnnually }}</span>
        </div>
        <div v-for="plan in plans" :key="plan.id" class="pt-plan-col" :class="{ 'pt-highlight': plan.highlight }">
          <template v-if="plan.id === 'free'">
            <div class="price-free">{{ t.home.freeForever }}</div>
          </template>
          <template v-else>
            <div v-if="yearly" class="price-was">{{ plan.monthlyPrice.toLocaleString() }} KZT/mo</div>
            <div class="price-now">
              {{ (yearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString() }}
              <span class="price-unit">KZT/mo</span>
            </div>
            <RouterLink v-if="plan.id !== 'free'" to="/premium"
              class="price-btn" :class="{ 'price-btn-em': plan.highlight }"
              style="text-decoration:none;display:block;text-align:center;">
              {{ plan.cta }}
            </RouterLink>
            <button v-else class="price-btn" disabled style="opacity:0.6;cursor:default;">
              {{ plan.cta }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <p class="price-footer">{{ t.home.subscriptionNote }}</p>
  </div>
</section>

<!-- ═══════════════════ WATCH MODAL ═══════════════════ -->
<Teleport to="body">
  <div v-if="watching" class="modal-overlay" @click="closeWatch">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <div class="modal-title">{{ watching.white }} vs {{ watching.black }}</div>
          <div class="modal-sub">{{ watching.tc }} · {{ t.home.watchSubtitle }}</div>
        </div>
        <button class="modal-close" @click="closeWatch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Clocks -->
      <div class="watch-clocks">
        <div class="watch-clock" :class="{ 'wc-on': watchClocks.active==='b' }">
          <span class="wc-piece wc-black"/>
          {{ watching.black }} — {{ fmt(watchClocks.b) }}
        </div>
        <div class="watch-clock" :class="{ 'wc-on': watchClocks.active==='w' }">
          <span class="wc-piece wc-white"/>
          {{ watching.white }} — {{ fmt(watchClocks.w) }}
        </div>
      </div>

      <!-- Live board -->
      <div class="watch-board">
        <template v-for="(row, ri) in watchBoard" :key="ri">
          <div v-for="(piece, ci) in row" :key="ri+'-'+ci"
            class="watch-sq"
            :class="{ 'watch-sq-move': watchLastMove && (watchLastMove.from.r===ri && watchLastMove.from.c===ci || watchLastMove.to.r===ri && watchLastMove.to.c===ci) }"
            :style="{ background: watchCellBg(ri, ci) }">
            <div v-if="piece !== 0" class="watch-piece"
              :style="{
                background: pieceBg(piece),
                border: pieceBorder(piece),
                boxShadow: pieceShadow(piece)
              }">
              <span v-if="Math.abs(piece)===2" class="watch-crown"
                :style="{ color: piece > 0 ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.4)' }">♛</span>
            </div>
          </div>
        </template>
      </div>

      <div class="modal-status">
        <span v-if="!watchDone" class="status-live">{{ t.home.statusLive }}</span>
        <span v-else class="status-done">{{ t.home.statusDone }}</span>
      </div>
    </div>
  </div>
</Teleport>

</div>
</template>

<style scoped>
.home { background: var(--ink); min-height: 100vh; color: var(--text0); }

/* ── HERO ── */
.hero {
  background: linear-gradient(160deg, var(--ink1) 0%, var(--ink) 60%);
  border-bottom: 1px solid var(--border);
  padding: 56px 48px 48px;
}
.hero-inner { max-width: 1100px; margin: 0 auto; }

.eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--amber);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.hero-title {
  font-size: 3.6rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 0.95;
  margin-bottom: 20px;
  color: var(--text0);
}
.hero-em { color: var(--amber); }

.hero-sub {
  font-size: 0.95rem;
  color: var(--text2);
  line-height: 1.65;
  margin-bottom: 28px;
  max-width: 420px;
  font-weight: 400;
}
.hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-hero-primary {
  background: var(--amber);
  color: var(--btn-ink);
  border: none;
  padding: 11px 24px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.12s;
  letter-spacing: 0.15px;
}
.btn-hero-primary:hover { background: var(--amber-l); transform: translateY(-1px); }

.btn-hero-ghost {
  background: transparent;
  color: var(--text1);
  border: 1px solid var(--border2);
  padding: 11px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.btn-hero-ghost:hover { border-color: var(--amber); color: var(--amber); }

/* Stats */
.stat-row {
  display: flex;
  align-items: center;
  margin-top: 40px;
  padding: 20px 24px;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 10px;
  max-width: 600px;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-n {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--amber);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stat-l {
  font-size: 0.66rem;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-align: center;
  font-weight: 500;
}
.stat-sep { width: 1px; height: 32px; background: var(--border2); flex-shrink: 0; margin: 0 8px; }

/* ── SECTIONS ── */
.section { padding: 48px; max-width: 1400px; margin: 0 auto; }
.section-alt {
  background: var(--ink1);
  max-width: 100%;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 0;
}
.section-alt .sec-head {
  padding: 40px 48px 0;
  max-width: 1400px;
  margin: 0 auto;
}

.sec-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.sec-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text0);
}
.sec-count {
  background: var(--ink3);
  color: var(--text3);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid var(--border);
}
.sec-link {
  background: transparent;
  border: none;
  color: var(--amber);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  font-family: inherit;
  padding: 0;
  transition: opacity 0.15s;
}
.sec-link:hover { opacity: 0.75; }

/* Live indicator */
.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}
.live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--red);
  box-shadow: 0 0 7px var(--red);
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
.live-txt {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ── TOURNAMENT TIMELINE ── */
.timeline-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--ink4) transparent;
}
.time-rail {
  display: flex;
  gap: 10px;
  min-width: max-content;
  margin-bottom: 6px;
}
.time-lbl {
  width: 144px;
  flex-shrink: 0;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.t-cards { display: flex; gap: 10px; min-width: max-content; }
.t-card {
  width: 144px;
  flex-shrink: 0;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-top: 2px solid var(--tc);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.t-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.45);
  border-color: var(--tc);
}
.t-type-row { display: flex; align-items: center; gap: 5px; }
.t-dot-color { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.t-type-lbl { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.t-name { font-size: 0.78rem; font-weight: 600; color: var(--text0); line-height: 1.3; }
.t-footer { display: flex; align-items: center; gap: 5px; }
.t-players-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
.t-players { font-size: 0.67rem; color: var(--text3); }

/* ── LIVE GAMES ── */
.games-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 48px 48px;
  max-width: 1400px;
  margin: 0 auto;
}
.game-card {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.game-card:hover {
  border-color: var(--amber);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.4);
}

/* Players */
.players-row { display: flex; align-items: center; gap: 6px; }
.p-block { flex: 1; display: flex; align-items: center; gap: 7px; min-width: 0; }
.p-block-r { flex-direction: row-reverse; }
.p-ava {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.8rem;
  flex-shrink: 0;
  overflow: hidden;
  padding: 0;
}
.ava-img {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
.p-ava-dark  { background: var(--ink4); color: var(--text1); border: 1px solid var(--border2); }
.p-ava-light { background: rgba(220,210,190,0.15); color: var(--text0); border: 1px solid rgba(220,210,190,0.2); }
.p-info { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
.p-info-r { align-items: flex-end; }
.p-name { font-size: 0.76rem; font-weight: 600; color: var(--text0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-rating { font-size: 0.68rem; color: var(--text3); font-variant-numeric: tabular-nums; }

.vs-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0; }
.tc-tag {
  background: var(--ink3);
  border: 1px solid var(--border2);
  color: var(--amber);
  font-size: 0.64rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}
.vs-txt { font-size: 0.64rem; color: var(--text3); font-weight: 500; }

/* Clocks */
.game-clocks { display: flex; gap: 6px; }
.game-clock {
  flex: 1;
  background: var(--ink3);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text3);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
  font-variant-numeric: tabular-nums;
}
.clock-on { background: var(--ink4); border-color: var(--amber); color: var(--amber); }
.clock-piece { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.clock-white { background: #e0d8d0; border: 1px solid #bbb; }
.clock-black { background: #1a1a1a; border: 1px solid #444; }

/* Mini board — padding-bottom trick for reliable 1:1 ratio in all browsers */
.mini-board-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 100%;   /* creates 1:1 aspect ratio */
  flex-shrink: 0;
}
.mini-board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  border-radius: 4px;
  overflow: hidden;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}
.winner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.72);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  backdrop-filter: blur(2px);
}
.winner-text {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--amber);
  text-align: center;
}
.winner-reason {
  font-size: 0.68rem;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.mini-sq { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; position: relative; }
.mini-sq-move::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(196, 148, 48, 0.45);
  box-shadow: inset 0 0 0 2px rgba(196, 148, 48, 0.85);
  pointer-events: none;
  z-index: 2;
}
.mini-piece { width: 72%; height: 72%; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.mini-crown { font-size: 36%; line-height: 1; }

.watch-cta {
  text-align: center;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--amber);
  padding: 4px 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.game-card:hover .watch-cta { opacity: 1; }

/* ── UPGRADE ── */
.section-upgrade {
  background: var(--ink);
  border-top: 1px solid var(--border);
  max-width: 100% !important;
  padding: 64px 48px 80px;
}
.upgrade-inner { max-width: 960px; margin: 0 auto; }
.upgrade-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--amber);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-align: center;
  margin-bottom: 12px;
}
.upgrade-title {
  font-size: 2.2rem;
  font-weight: 900;
  text-align: center;
  color: var(--text0);
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}
.upgrade-sub {
  text-align: center;
  color: var(--text2);
  font-size: 0.92rem;
  max-width: 480px;
  margin: 0 auto 36px;
  line-height: 1.6;
}

/* Billing toggle */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 36px;
  font-size: 0.86rem;
  color: var(--text2);
  cursor: pointer;
  user-select: none;
}
.tog-on { color: var(--text0); font-weight: 600; }
.tog-switch {
  width: 38px; height: 20px;
  background: var(--ink3);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  border: 1px solid var(--border2);
  padding: 0;
}
.tog-thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--amber);
  transition: left 0.2s;
}
.tog-right { left: 20px; }
.save-tag {
  background: rgba(42,143,92,0.12);
  color: var(--green);
  border: 1px solid rgba(42,143,92,0.25);
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  margin-left: 5px;
}

/* Pricing table */
.price-table {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.pt-grid {
  display: grid;
  grid-template-columns: 1fr repeat(4, 1fr);
}
.pt-head-row { background: var(--ink1); border-bottom: 1px solid var(--border); }
.pt-feat-row { border-bottom: 1px solid var(--border); }
.pt-feat-row:last-child { border-bottom: none; }
.pt-price-row { border-top: 1px solid var(--border2); }

.pt-feature-col {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pt-feature-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.feat-label { font-size: 0.84rem; color: var(--text1); }

.pt-plan-col {
  padding: 12px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  border-left: 1px solid var(--border);
}
.pt-highlight {
  background: rgba(196,148,48,0.04);
  border-left-color: rgba(196,148,48,0.25);
  border-right: 1px solid rgba(196,148,48,0.25);
}
.pt-badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--amber);
  color: var(--btn-ink);
  font-size: 0.62rem;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 0 0 5px 5px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pt-plan-name { font-size: 0.84rem; font-weight: 700; color: var(--text0); margin-top: 8px; }

.pt-check { color: var(--text2); font-weight: 600; font-size: 0.9rem; }
.pt-check-em { color: var(--amber); }
.pt-cross { color: var(--ink4); font-size: 0.85rem; }

.price-note { font-size: 0.7rem; color: var(--text3); }
.price-was { font-size: 0.7rem; color: var(--text3); text-decoration: line-through; }
.price-now { font-size: 0.9rem; font-weight: 700; color: var(--text0); }
.price-unit { font-size: 0.62rem; color: var(--text3); font-weight: 400; }
.price-free { font-size: 0.78rem; color: var(--text3); }
.price-btn {
  background: var(--ink3);
  border: 1px solid var(--border2);
  color: var(--text1);
  padding: 7px 14px;
  border-radius: 5px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
  font-family: inherit;
}
.price-btn:hover { border-color: var(--amber); color: var(--amber); }
.price-btn-em { background: var(--amber); border-color: var(--amber); color: var(--btn-ink); }
.price-btn-em:hover { background: var(--amber-l); color: var(--btn-ink); }

.price-footer {
  text-align: center;
  font-size: 0.76rem;
  color: var(--text3);
  margin-top: 16px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* ── WATCH MODAL ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--ink2);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; }
.modal-title { font-size: 0.95rem; font-weight: 700; color: var(--text0); }
.modal-sub { font-size: 0.73rem; color: var(--text3); margin-top: 3px; }
.modal-close {
  background: transparent;
  border: none;
  color: var(--text3);
  cursor: pointer;
  padding: 6px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}
.modal-close:hover { color: var(--text0); background: rgba(255,255,255,0.06); }

.watch-clocks { display: flex; gap: 8px; }
.watch-clock {
  flex: 1;
  background: var(--ink3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text2);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  font-variant-numeric: tabular-nums;
}
.wc-on { border-color: var(--amber); color: var(--text0); background: var(--ink4); }
.wc-piece { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.wc-white { background: #ddd; border: 1px solid #bbb; }
.wc-black { background: #222; border: 1px solid #555; }

.watch-board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  border-radius: 5px;
  overflow: hidden;
  aspect-ratio: 1;
}
.watch-sq { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; position: relative; }
.watch-sq-move::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(196, 148, 48, 0.38);
  box-shadow: inset 0 0 0 2px rgba(196, 148, 48, 0.85);
  pointer-events: none;
  z-index: 2;
}
.watch-piece { width: 76%; height: 76%; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.watch-crown { font-size: 38%; line-height: 1; }

.modal-status { text-align: center; font-size: 0.8rem; }
.status-live { color: var(--red); font-weight: 700; animation: pulse 1.5s infinite; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
.status-done { color: var(--text3); }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .hero, .section { padding-left: 20px; padding-right: 20px; }
  .hero-title { font-size: 2.6rem; }
  .stat-row { flex-direction: column; gap: 16px; padding: 16px 20px; }
  .stat-sep { width: 40px; height: 1px; }
  .games-grid { padding: 20px; grid-template-columns: repeat(2, 1fr); }
  .section-upgrade { padding: 44px 20px 60px; }
}
@media (max-width: 600px) {
  .hero-title { font-size: 2.1rem; }
  .hero-btns { flex-direction: column; }
  .pt-grid { grid-template-columns: 1fr repeat(2, 1fr); }
  .pt-plan-col:nth-child(n+4) { display: none; }
  .games-grid { grid-template-columns: 1fr; }
}
</style>
