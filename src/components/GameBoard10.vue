<script setup>
/**
 * GameBoard10.vue — International Draughts (10×10) board UI
 * Uses Draughts10 engine from src/game/draughts10.js
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Draughts10 } from '../game/draughts10.js'

const props = defineProps({
  boardTheme:     { type: String, default: 'classic' },
  gameMode:       { type: String, default: 'local' },   // 'local' | 'vsBot'
  timeControl:    { type: Object, default: () => ({ type: 'rapid', seconds: 600 }) },
  botDifficulty:  { type: String, default: 'medium' },  // 'easy' | 'medium' | 'hard'
  playerSide:     { type: String, default: 'white' },   // 'white' | 'black'
})
const emit = defineEmits(['gameOver', 'moveMade'])

// ─── Board themes ────────────────────────────────────────────────────────
const themes = {
  classic:  { light: '#f0d9b5', dark: '#b58863' },
  green:    { light: '#eeeed2', dark: '#769656' },
  midnight: { light: '#6e85b5', dark: '#3d4b6e' },
}
const colors = computed(() => themes[props.boardTheme] || themes.classic)

// ─── Engine ──────────────────────────────────────────────────────────────
const engine  = ref(new Draughts10())
const board   = ref([])
const moves   = ref([])       // all legal moves for current player
const history = ref([])
const status  = ref('playing')
const winner  = ref('')
const sel     = ref(null)     // selected square {r,c}
const targets = ref([])       // destination squares for selected piece
const lastMove= ref(null)
const botBusy = ref(false)

// ─── Timers ──────────────────────────────────────────────────────────────
const noTimer = computed(() => props.timeControl.type === 'none')
const clocks  = ref({ dark: props.timeControl.seconds, light: props.timeControl.seconds })
const activeC = computed(() => syncedTurn.value)
const syncedTurn = ref('dark')
let clockId = null

const fmt = s => {
  const m = Math.floor(s / 60), sec = s % 60
  return `${m}:${sec.toString().padStart(2,'0')}`
}

const startClock = () => {
  if (noTimer.value) return
  stopClock()
  clockId = setInterval(() => {
    if (status.value !== 'playing') return stopClock()
    const side = syncedTurn.value
    clocks.value[side]--
    if (clocks.value[side] <= 0) {
      clocks.value[side] = 0
      const w = side === 'dark' ? 'light' : 'dark'
      endGame(w, 'time')
    }
  }, 1000)
}
const stopClock = () => { if (clockId) { clearInterval(clockId); clockId = null } }

// ─── Match report ─────────────────────────────────────────────────────────
const report     = ref(false)
const reportData = ref({ winner:'', reason:'', best:0, excellent:0, mistakes:0 })
const messages = {
  win:  ['Excellent! You dominated the board and converted cleanly.',
         'Well played! Your tactical awareness was outstanding.',
         'Great game — your endgame technique was impressive.'],
  loss: ['A tough fight — study the midgame transition to improve.',
         'Close game! Focus on piece coordination next time.',
         'Every loss teaches something. Keep practicing!'],
}
const reportMsg = computed(() => {
  const w = reportData.value.winner
  const isWin = (props.gameMode === 'vsBot' && w === 'dark') || (props.gameMode === 'local' && w === 'dark')
  const pool = isWin ? messages.win : messages.loss
  return pool[Math.floor(Math.random() * pool.length)]
})

// ─── Core helpers ─────────────────────────────────────────────────────────
const refresh = () => {
  const s    = engine.value.getState()
  board.value = s.board
  moves.value = s.moves
  syncedTurn.value = s.turn
  if (s.over) endGame(s.winner, 'no_moves')
}

const endGame = (w, reason) => {
  status.value = w === 'dark' ? 'dark_wins' : 'light_wins'
  winner.value  = w
  stopClock()
  emit('gameOver', { winner: w })
  const total = Math.max(history.value.length, 4)
  reportData.value = {
    winner: w, reason,
    best:      Math.floor(total * 0.35) + Math.floor(Math.random() * 3),
    excellent: Math.floor(total * 0.22) + Math.floor(Math.random() * 3),
    mistakes:  Math.max(1, Math.floor(total * 0.08) + 1),
  }
  setTimeout(() => { report.value = true }, 600)
}

// ─── Bot difficulty depth ─────────────────────────────────────────────────
const botDepth = computed(() => {
  if (props.botDifficulty === 'easy') return 1
  if (props.botDifficulty === 'hard') return 5
  return 3  // medium
})

// humanTurn: 'light' if player chose white, 'dark' if player chose black
const humanTurn = computed(() => props.playerSide === 'black' ? 'dark' : 'light')

// ─── Square click ─────────────────────────────────────────────────────────
const clickSquare = (r, c) => {
  if (status.value !== 'playing') return
  if (props.gameMode === 'vsBot' && syncedTurn.value !== humanTurn.value) return
  if (botBusy.value) return

  const mySign = syncedTurn.value === 'dark' ? 1 : -1
  const cell   = board.value[r][c]

  if (!sel.value) {
    if (cell && Math.sign(cell) === mySign) pickPiece(r, c)
  } else {
    const tgt = targets.value.find(t => t.r === r && t.c === c)
    if (tgt) {
      executeMove(tgt.move)
    } else if (cell && Math.sign(cell) === mySign) {
      pickPiece(r, c)
    } else {
      sel.value = null; targets.value = []
    }
  }
}

const pickPiece = (r, c) => {
  sel.value = { r, c }
  const pieceMoves = moves.value.filter(m => m.from.r === r && m.from.c === c)
  targets.value = pieceMoves.map(m => {
    const dest = m.path[m.path.length - 1]
    return { r: dest.r, c: dest.c, move: m }
  })
}

const executeMove = (move) => {
  const dest = move.path[move.path.length - 1]
  lastMove.value = { from: move.from, to: dest }
  history.value.push(move)
  engine.value.makeMove(move)
  sel.value = null; targets.value = []
  refresh()
  emit('moveMade', history.value)
  // In vsBot mode trigger bot when it's not the human's turn
  if (props.gameMode === 'vsBot' && syncedTurn.value !== humanTurn.value && status.value === 'playing') {
    botBusy.value = true
    setTimeout(runBot, 400 + Math.random() * 600)
  }
}

const runBot = () => {
  const best = engine.value.bestMove(botDepth.value)
  if (best) {
    const dest = best.path[best.path.length - 1]
    lastMove.value = { from: best.from, to: dest }
    history.value.push(best)
    engine.value.makeMove(best)
    refresh()
  }
  botBusy.value = false
}

// ─── Highlight helpers ────────────────────────────────────────────────────
const isSel    = (r, c) => sel.value?.r === r && sel.value?.c === c
const isTgt    = (r, c) => targets.value.some(t => t.r === r && t.c === c)
const isLast   = (r, c) => lastMove.value && (
  (lastMove.value.from.r === r && lastMove.value.from.c === c) ||
  (lastMove.value.to.r   === r && lastMove.value.to.c   === c))

const cellBg = (r, c) => {
  const dark = (r + c) % 2 === 1
  if (!dark) return colors.value.light
  if (isSel(r, c))  return '#5fa832'
  if (isTgt(r, c))  return '#7ac44a'
  if (isLast(r, c)) return '#c8b45a'
  return colors.value.dark
}

// ─── Reset / expose ───────────────────────────────────────────────────────
const resetGame = () => {
  engine.value.reset()
  history.value = []; lastMove.value = null; sel.value = null; targets.value = []
  status.value = 'playing'; winner.value = ''; report.value = false
  clocks.value = { dark: props.timeControl.seconds, light: props.timeControl.seconds }
  refresh()
  startClock()
  if (props.gameMode === 'vsBot' && props.playerSide === 'black' && status.value === 'playing') {
    botBusy.value = true
    setTimeout(runBot, 600)
  }
}

onMounted(() => {
  refresh()
  startClock()
  // If player chose black and mode is vsBot, bot plays first (white/light goes first)
  if (props.gameMode === 'vsBot' && props.playerSide === 'black' && status.value === 'playing') {
    botBusy.value = true
    setTimeout(runBot, 600)
  }
})
onUnmounted(stopClock)
defineExpose({ resetGame, history, status })

// ─── Column/Row labels ────────────────────────────────────────────────────
const colLabels = ['a','b','c','d','e','f','g','h','i','j']

// ─── Board orientation (static — white always at bottom) ─────────────────
// flipped=false means white (light) pieces are at the bottom rows (rows 6-9)
const flipped      = computed(() => props.playerSide === 'black')
const rowIndices   = computed(() => flipped.value ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9])
const colIndices   = computed(() => flipped.value ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9])
const rowLabels    = computed(() => flipped.value ? [1,2,3,4,5,6,7,8,9,10] : [10,9,8,7,6,5,4,3,2,1])
const colLabelsDisp= computed(() => flipped.value ? [...colLabels].reverse() : colLabels)
</script>

<template>
<div class="gb10-wrap">

  <!-- Status bar -->
  <div class="status-bar">
    <span v-if="botBusy">🤖 Bot thinking…</span>
    <span v-else-if="status==='playing'">
      {{ syncedTurn === 'dark' ? '⚫ Black' : '⬜ White' }}'s turn
    </span>
    <span v-else-if="status==='dark_wins'">⚫ Black wins!</span>
    <span v-else>⬜ White wins!</span>
  </div>

  <!-- Top clock (opponent) -->
  <div v-if="!noTimer" class="clock"
    :class="{
      active: flipped ? (syncedTurn==='light' && status==='playing') : (syncedTurn==='light' && status==='playing'),
      low: flipped ? clocks.dark < 30 : clocks.light < 30
    }">
    <span>{{ flipped ? '⚫ Black' : '⬜ White' }}</span>
    <span class="clock-time">{{ flipped ? fmt(clocks.dark) : fmt(clocks.light) }}</span>
  </div>

  <!-- Board -->
  <div class="board-outer">
    <!-- Row labels (left) -->
    <div class="row-labels">
      <span v-for="(lbl, i) in rowLabels" :key="i">{{ lbl }}</span>
    </div>

    <!-- Grid -->
    <div class="board-grid">
      <template v-for="(ri, rdi) in rowIndices" :key="rdi">
        <div
          v-for="(ci, cdi) in colIndices"
          :key="cdi"
          class="sq"
          :style="{ background: cellBg(ri, ci) }"
          @click="(ri+ci)%2===1 && clickSquare(ri, ci)"
        >
          <!-- Move target dot -->
          <div v-if="isTgt(ri,ci) && !board[ri]?.[ci]" class="move-dot"/>

          <!-- Piece -->
          <div v-if="board[ri]?.[ci]" class="piece"
            :class="{
              'piece-dark':  board[ri][ci] > 0,
              'piece-light': board[ri][ci] < 0,
              selected: isSel(ri, ci)
            }"
          >
            <span v-if="Math.abs(board[ri][ci])===2" class="king-crown">♛</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Column labels (bottom) -->
    <div class="col-labels">
      <span v-for="l in colLabelsDisp" :key="l">{{ l }}</span>
    </div>
  </div>

  <!-- Bottom clock (current player = always at bottom) -->
  <div v-if="!noTimer" class="clock"
    :class="{
      active: flipped ? (syncedTurn==='dark' && status==='playing') : (syncedTurn==='dark' && status==='playing'),
      low: flipped ? clocks.light < 30 : clocks.dark < 30
    }">
    <span>{{ flipped ? '⬜ White' : '⚫ Black' }}{{ gameMode==='vsBot' ? ' (You)' : '' }}</span>
    <span class="clock-time">{{ flipped ? fmt(clocks.light) : fmt(clocks.dark) }}</span>
  </div>

  <!-- Buttons -->
  <div class="board-btns">
    <button @click="resetGame" class="btn-secondary">↺ New Game</button>
    <button v-if="status !== 'playing'" @click="resetGame" class="btn-primary">Play Again</button>
  </div>

  <!-- Move history -->
  <div v-if="history.length" class="move-hist">
    <div class="hist-label">MOVE HISTORY</div>
    <div class="hist-moves">
      <span v-for="(m, i) in history" :key="i" class="hist-move">
        {{ i+1 }}. {{ colLabels[m.from.c] }}{{ 10-m.from.r }}→{{ colLabels[m.path[m.path.length-1].c] }}{{ 10-m.path[m.path.length-1].r }}
      </span>
    </div>
  </div>
</div>

<!-- Match Report Modal -->
<Teleport to="body">
  <div v-if="report" class="report-backdrop" @click.self="report=false">
    <div class="report-card">
      <div class="report-result" :class="reportData.winner==='dark' ? 'win' : 'loss'">
        {{ reportData.winner==='dark' ? '⚫ Black wins' : '⬜ White wins' }}
      </div>
      <div class="report-reason">
        {{ reportData.reason==='time' ? 'on time' : 'by blocking all moves' }}
      </div>

      <div class="coach-box">
        <div class="coach-ava">🤖</div>
        <p class="coach-msg">{{ reportMsg }}</p>
      </div>

      <div class="report-stats">
        <div class="rstat green">
          <div class="rstat-n">{{ reportData.best }}</div>
          <div class="rstat-l">Best</div>
        </div>
        <div class="rstat blue">
          <div class="rstat-n">{{ reportData.excellent }}</div>
          <div class="rstat-l">Excellent</div>
        </div>
        <div class="rstat red">
          <div class="rstat-n">{{ reportData.mistakes }}</div>
          <div class="rstat-l">Mistakes</div>
        </div>
      </div>

      <div class="upgrade-bar">
        <span>🔒</span>
        <div>
          <div style="font-weight:700;font-size:.85rem;margin-bottom:2px;">Full Game Report</div>
          <div style="font-size:.78rem;color:#666;">Upgrade to PRO for move-by-move analysis.</div>
        </div>
      </div>

      <div class="report-btns">
        <button @click="report=false;resetGame()" class="btn-outline">New Game</button>
        <button @click="report=false;resetGame()" class="btn-primary">Rematch</button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<style scoped>
.gb10-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.status-bar {
  width: min(580px, 95vw);
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 7px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.92rem;
  color: #ddd;
}

/* Clocks */
.clock {
  width: min(580px, 95vw);
  background: #111;
  border: 2px solid #1e1e1e;
  border-radius: 7px;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #666;
  transition: all 0.3s;
}
.clock.active {
  background: #1a1a1a;
  border-color: #f5b623;
  color: #fff;
}
.clock.low { border-color: #f44336 !important; }
.clock.low .clock-time { color: #f44336; }
.clock-time { font-size: 1.4rem; font-variant-numeric: tabular-nums; }

/* Board layout */
.board-outer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.row-labels {
  position: absolute;
  left: -22px;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  pointer-events: none;
}
.row-labels span {
  font-size: 9px;
  color: #555;
  text-align: center;
  width: 16px;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  width: min(580px, 95vw);
  height: min(580px, 95vw);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 28px rgba(0,0,0,0.6);
}

.col-labels {
  display: flex;
  width: min(580px, 95vw);
  justify-content: space-around;
  margin-top: 4px;
}
.col-labels span { font-size: 9px; color: #555; }

/* Squares */
.sq {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: default;
  transition: background 0.08s;
}

.move-dot {
  width: 28%;
  height: 28%;
  border-radius: 50%;
  background: rgba(0,0,0,0.2);
  pointer-events: none;
}

/* Pieces */
.piece {
  width: 74%;
  height: 74%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s;
}
.piece-dark {
  background: radial-gradient(circle at 32% 30%, #3d3d3d, #0a0a0a);
  box-shadow: 0 3px 10px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.12);
  border: 2px solid #1a1a1a;
}
.piece-light {
  background: radial-gradient(circle at 32% 30%, #ffffff, #d8d8d8);
  box-shadow: 0 3px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.9);
  border: 2px solid #bbb;
}
.piece.selected {
  transform: scale(1.12);
  box-shadow: 0 0 0 3px #fff, 0 0 0 5px #5fa832;
}
.king-crown {
  font-size: 40%;
  color: rgba(255,255,255,0.75);
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}
.piece-light .king-crown { color: rgba(0,0,0,0.5); text-shadow: none; }

/* Buttons */
.board-btns {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.btn-primary {
  background: #f5b623; color: #000; border: none;
  padding: 8px 20px; border-radius: 6px;
  font-weight: 800; font-size: 0.88rem; cursor: pointer;
}
.btn-primary:hover { background: #ffd740; }
.btn-secondary {
  background: transparent; border: 1.5px solid #333; color: #ccc;
  padding: 8px 20px; border-radius: 6px;
  font-weight: 600; font-size: 0.88rem; cursor: pointer;
}
.btn-secondary:hover { border-color: #555; color: #fff; }
.btn-outline {
  background: transparent; border: 1px solid #2a2a2a; color: #ccc;
  padding: 10px; border-radius: 7px; cursor: pointer; font-size: 0.9rem;
  flex: 1; font-weight: 600;
}
.btn-outline:hover { border-color: #444; color: #fff; }

/* Move history */
.move-hist {
  width: min(580px, 95vw);
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 7px;
  padding: 10px 14px;
  max-height: 90px;
  overflow-y: auto;
}
.hist-label {
  font-size: 10px; font-weight: 700; color: #555;
  letter-spacing: 0.08em; margin-bottom: 5px;
}
.hist-moves { display: flex; flex-wrap: wrap; gap: 4px; }
.hist-move {
  font-size: 10px; font-family: monospace;
  background: #1a1a1a; padding: 2px 6px;
  border-radius: 4px; color: #888;
}

/* Report modal */
.report-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center;
  z-index: 3000; padding: 20px;
}
.report-card {
  background: #111; border: 1px solid #222;
  border-radius: 14px; padding: 28px;
  max-width: 360px; width: 100%;
  display: flex; flex-direction: column; gap: 16px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
.report-result { font-size: 1.2rem; font-weight: 800; text-align: center; }
.report-result.win  { color: #f5b623; }
.report-result.loss { color: #888; }
.report-reason { text-align: center; font-size: 0.82rem; color: #555; margin-top: -10px; }

.coach-box {
  display: flex; gap: 12px; align-items: flex-start;
  background: #1a1a1a; border: 1px solid #252525;
  border-radius: 9px; padding: 14px;
}
.coach-ava {
  font-size: 22px; width: 36px; height: 36px;
  border-radius: 50%; background: #252525;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.coach-msg { font-size: 0.82rem; color: #888; line-height: 1.5; margin: 0; }

.report-stats {
  display: flex; gap: 10px; justify-content: center;
}
.rstat {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  flex: 1;
}
.rstat-n {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800;
}
.rstat-l { font-size: 0.72rem; color: #555; font-weight: 600; }
.green .rstat-n { background: rgba(76,175,80,.12); border: 2px solid #4caf50; color: #4caf50; }
.blue  .rstat-n { background: rgba(33,150,243,.12); border: 2px solid #2196f3; color: #2196f3; }
.red   .rstat-n { background: rgba(244,67,54,.12);  border: 2px solid #f44336; color: #f44336; }

.upgrade-bar {
  display: flex; align-items: center; gap: 10px;
  background: rgba(245,182,35,.06);
  border: 1px solid rgba(245,182,35,.2);
  border-radius: 8px; padding: 10px 14px; font-size: 1.1rem;
}

.report-btns { display: flex; gap: 10px; }
</style>
