<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Checkers } from '@ayshrj/checkers.js'

const props = defineProps({
  boardTheme: { type: String, default: 'classic' },
  gameMode: { type: String, default: 'local' },
  timeControl: { type: Object, default: () => ({ type: 'rapid', seconds: 600 }) },
})

const emit = defineEmits(['gameOver', 'moveMade'])

const boardThemes = {
  classic:  { light: '#f0d9b5', dark: '#b58863' },
  green:    { light: '#eeeed2', dark: '#769656' },
  midnight: { light: '#6e85b5', dark: '#3d4b6e' },
}

const game = ref(new Checkers())
const board = ref([])
const currentTurn = ref('red')
const allowedMoves = ref([])
const gameStatus = ref('playing')
const statusMsg = ref('')
const moveHistory = ref([])
const selectedPos = ref(null)
const validMoveTargets = ref([])
const lastMove = ref(null)
const timers = ref({ red: props.timeControl.seconds, black: props.timeControl.seconds })
const timerInterval = ref(null)
const botThinking = ref(false)
const noTimer = computed(() => props.timeControl.type === 'none')
const boardColors = computed(() => boardThemes[props.boardTheme] || boardThemes.classic)

// Match report state
const showMatchReport = ref(false)
const matchStats = ref({ best: 0, excellent: 0, mistakes: 0 })
const matchResult = ref({ winner: '', reason: '' })

const coachMessages = {
  win: [
    'Excellent performance! You maintained strong control and successfully converted your advantage into victory.',
    'Great game! Your piece activity was impressive — you dominated the board from start to finish.',
    'Well played! You spotted the key tactical opportunities and executed them flawlessly.',
  ],
  loss: [
    'You played well and had an advantage until the midgame. Tough loss, but let\'s work on it together.',
    'A close game! Your opening was solid, but the endgame technique needs some polish. Keep practicing!',
    'Don\'t be discouraged — every loss is a lesson. Your positional play showed real promise.',
  ],
  botLoss: [
    'You played well and had an advantage until the midgame. Tough defeat, but let\'s work on it together.',
    'The bot found some strong moves in the endgame. Study the key positions and you\'ll improve quickly!',
    'Great effort! The bot is a tough opponent. Focus on piece coordination for your next game.',
  ],
}

const coachMessage = computed(() => {
  const w = matchResult.value.winner
  if (props.gameMode === 'vsBot') {
    if (w === 'red_wins') return coachMessages.win[Math.floor(Math.random() * 3)]   // human=white wins
    return coachMessages.botLoss[Math.floor(Math.random() * 3)]
  }
  if (w === 'red_wins') return coachMessages.win[Math.floor(Math.random() * 3)]
  return coachMessages.loss[Math.floor(Math.random() * 3)]
})

const triggerMatchReport = (winner, reason = 'no_moves') => {
  const total = Math.max(moveHistory.value.length, 4)
  matchStats.value = {
    best: Math.floor(total * 0.35) + Math.floor(Math.random() * 3),
    excellent: Math.floor(total * 0.22) + Math.floor(Math.random() * 3),
    mistakes: Math.max(1, Math.floor(total * 0.08) + Math.floor(Math.random() * 2)),
  }
  matchResult.value = { winner, reason }
  setTimeout(() => { showMatchReport.value = true }, 600)
}

const updateFromEngine = () => {
  const state = game.value.getCurrentState()
  board.value = state.board.map(r => [...r])
  currentTurn.value = state.turn
  allowedMoves.value = state.allowedMoves
  if (allowedMoves.value.length === 0) {
    const winner = currentTurn.value === 'red' ? 'black_wins' : 'red_wins'
    gameStatus.value = winner
    statusMsg.value = winner === 'black_wins' ? 'Black wins!' : 'White wins!'
    stopTimer()
    emit('gameOver', { winner })
    triggerMatchReport(winner, 'no_moves')
  } else {
    statusMsg.value = `${currentTurn.value === 'red' ? 'White' : 'Black'}'s turn`
  }
}

const startTimer = () => {
  if (noTimer.value) return
  stopTimer()
  timerInterval.value = setInterval(() => {
    if (gameStatus.value !== 'playing') return
    const side = currentTurn.value
    timers.value[side]--
    if (timers.value[side] <= 0) {
      timers.value[side] = 0
      const winner = side === 'red' ? 'black_wins' : 'red_wins'
      gameStatus.value = winner
      statusMsg.value = `${side === 'red' ? 'Black' : 'White'} wins on time!`
      stopTimer()
      emit('gameOver', { winner, reason: 'time' })
      triggerMatchReport(winner, 'time')
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value)
}

const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const handleSquareClick = (row, col) => {
  if (gameStatus.value !== 'playing') return
  if (props.gameMode === 'vsBot' && currentTurn.value === 'black') return
  if (botThinking.value) return

  const cell = board.value[row]?.[col]

  if (!selectedPos.value) {
    if (cell && cell.color === currentTurn.value) {
      selectedPos.value = { row, col }
      const pieceMoves = allowedMoves.value.filter(m => m.from.row === row && m.from.col === col)
      validMoveTargets.value = pieceMoves.map(m => m.path[m.path.length - 1])
    }
  } else {
    const move = allowedMoves.value.find(m => {
      if (m.from.row !== selectedPos.value.row || m.from.col !== selectedPos.value.col) return false
      const dest = m.path[m.path.length - 1]
      return dest.row === row && dest.col === col
    })
    if (move) {
      const from = { ...selectedPos.value }
      game.value.move(move)
      lastMove.value = { from, to: { row, col } }
      moveHistory.value.push({ from, to: { row, col } })
      selectedPos.value = null
      validMoveTargets.value = []
      updateFromEngine()
      emit('moveMade', moveHistory.value)
      if (props.gameMode === 'vsBot' && gameStatus.value === 'playing') runBotMove()
    } else {
      if (cell && cell.color === currentTurn.value) {
        selectedPos.value = { row, col }
        const pieceMoves = allowedMoves.value.filter(m => m.from.row === row && m.from.col === col)
        validMoveTargets.value = pieceMoves.map(m => m.path[m.path.length - 1])
      } else {
        selectedPos.value = null
        validMoveTargets.value = []
      }
    }
  }
}

const runBotMove = () => {
  botThinking.value = true
  setTimeout(() => {
    const best = game.value.bestMove(3)
    if (best) {
      const from = { ...best.from }
      const to = best.path[best.path.length - 1]
      game.value.move(best)
      lastMove.value = { from, to }
      moveHistory.value.push({ from, to })
      updateFromEngine()
      emit('moveMade', moveHistory.value)
    }
    botThinking.value = false
  }, 500)
}

const resetGame = () => {
  game.value.reset()
  selectedPos.value = null
  validMoveTargets.value = []
  lastMove.value = null
  moveHistory.value = []
  gameStatus.value = 'playing'
  showMatchReport.value = false
  timers.value = { red: props.timeControl.seconds, black: props.timeControl.seconds }
  updateFromEngine()
  startTimer()
}

const isSelected = (r, c) => selectedPos.value?.row === r && selectedPos.value?.col === c
const isTarget = (r, c) => validMoveTargets.value.some(t => t.row === r && t.col === c)
const isLast = (r, c) => lastMove.value && (
  (lastMove.value.from.row === r && lastMove.value.from.col === c) ||
  (lastMove.value.to.row === r && lastMove.value.to.col === c)
)

const squareBg = (r, c) => {
  const isDark = (r + c) % 2 === 1
  if (isSelected(r, c)) return '#6a9932'
  if (isTarget(r, c)) return isDark ? '#7ab04a' : 'rgba(127,166,80,0.4)'
  if (isLast(r, c)) return isDark ? '#cbb666' : '#e8d89a'
  return isDark ? boardColors.value.dark : boardColors.value.light
}

updateFromEngine()
startTimer()
onUnmounted(stopTimer)
defineExpose({ resetGame, moveHistory, gameStatus })
</script>

<template>
  <div style="display:flex; flex-direction:column; align-items:center; gap:10px; width:100%;">

    <!-- Status -->
    <div style="
      display:flex; align-items:center; justify-content:space-between;
      width:100%; max-width:520px; padding:8px 14px;
      background:var(--bg-secondary); border-radius:8px; border:1px solid var(--border);
    ">
      <span style="font-weight:600; font-size:15px;">
        {{ botThinking ? '🤖 Bot is thinking...' : statusMsg }}
      </span>
    </div>

    <!-- Black timer -->
    <div v-if="!noTimer" :style="{
      width: 'min(520px, 90vw)', padding:'6px 16px', borderRadius:'8px', fontWeight:'700', fontSize:'20px',
      background: currentTurn==='black' && gameStatus==='playing' ? '#333' : 'var(--bg-surface)',
      color: currentTurn==='black' && gameStatus==='playing' ? 'white' : 'var(--text-secondary)',
      border: '2px solid ' + (timers.black < 30 ? '#e74c3c' : 'transparent'),
      transition: 'all 0.3s', display:'flex', justifyContent:'space-between',
    }">
      <span>⚫ {{ gameMode === 'vsBot' ? 'Bot (Black)' : 'Black' }}</span>
      <span>{{ formatTime(timers.black) }}</span>
    </div>

    <!-- Board container -->
    <div style="position:relative;">
      <div style="position:absolute; left:-20px; top:0; height:100%; display:flex; flex-direction:column; justify-content:space-around; pointer-events:none;">
        <span v-for="n in 8" :key="n" style="font-size:10px; color:var(--text-secondary); width:16px; text-align:center;">{{ 9-n }}</span>
      </div>

      <div :style="{
        display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gridTemplateRows:'repeat(8, 1fr)',
        width:'min(520px, 90vw)', height:'min(520px, 90vw)',
        borderRadius:'4px', overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
      }">
        <template v-for="(row, rIdx) in board" :key="rIdx">
          <div
            v-for="(cell, cIdx) in row" :key="cIdx"
            @click="handleSquareClick(rIdx, cIdx)"
            :style="{
              background: squareBg(rIdx, cIdx),
              cursor: (cell && cell.color===currentTurn) || isTarget(rIdx, cIdx) ? 'pointer' : 'default',
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative', transition:'background 0.1s',
            }"
          >
            <div v-if="isTarget(rIdx, cIdx) && !cell" style="width:30%; height:30%; border-radius:50%; background:rgba(0,0,0,0.22); pointer-events:none;"/>
            <div v-if="cell" :style="{
              width:'76%', height:'76%', borderRadius:'50%',
              background: cell.color==='red'
                ? 'radial-gradient(circle at 32% 30%, #ffffff, #d8d8d8)'
                : 'radial-gradient(circle at 32% 30%, #2e2e2e, #0a0a0a)',
              border: cell.color==='red' ? '2px solid #bbb' : '2px solid #111',
              boxShadow: isSelected(rIdx, cIdx)
                ? '0 0 0 3px #fff, 0 0 0 5px #6a9932'
                : cell.color==='red'
                  ? '0 3px 8px rgba(0,0,0,0.4), inset 0 1px rgba(255,255,255,0.9)'
                  : '0 3px 8px rgba(0,0,0,0.9), inset 0 1px rgba(255,255,255,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transform: isSelected(rIdx, cIdx) ? 'scale(1.1)' : 'scale(1)',
              transition:'transform 0.1s, box-shadow 0.1s', cursor:'pointer',
            }">
              <span v-if="cell.type==='king'" :style="{ fontSize:'42%', lineHeight:'1', color: cell.color==='red' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)' }">♛</span>
            </div>
          </div>
        </template>
      </div>

      <div style="display:flex; width:min(520px, 90vw); justify-content:space-around; margin-top:4px;">
        <span v-for="c in ['a','b','c','d','e','f','g','h']" :key="c" style="font-size:10px; color:var(--text-secondary);">{{ c }}</span>
      </div>
    </div>

    <!-- White timer -->
    <div v-if="!noTimer" :style="{
      width:'min(520px, 90vw)', padding:'6px 16px', borderRadius:'8px', fontWeight:'700', fontSize:'20px',
      background: currentTurn==='red' && gameStatus==='playing' ? '#e8e8e8' : 'var(--bg-surface)',
      color: currentTurn==='red' && gameStatus==='playing' ? '#111' : 'var(--text-secondary)',
      border: '2px solid ' + (timers.red < 30 ? '#e74c3c' : 'transparent'),
      transition:'all 0.3s', display:'flex', justifyContent:'space-between',
    }">
      <span>⬜ {{ gameMode === 'vsBot' ? 'White (You)' : 'White' }}</span>
      <span>{{ formatTime(timers.red) }}</span>
    </div>

    <!-- Buttons -->
    <div style="display:flex; gap:10px; margin-top:4px;">
      <button @click="resetGame" class="btn-secondary" style="font-size:13px; padding:7px 18px;">↺ New Game</button>
      <button v-if="gameStatus !== 'playing'" @click="resetGame" class="btn-primary" style="font-size:13px; padding:7px 18px;">Play Again</button>
    </div>

    <!-- Move history -->
    <div v-if="moveHistory.length > 0" style="
      width:100%; max-width:520px; background:var(--bg-secondary);
      border:1px solid var(--border); border-radius:8px;
      padding:10px 14px; max-height:100px; overflow-y:auto;
    ">
      <div style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:5px; letter-spacing:0.05em;">MOVE HISTORY</div>
      <div style="display:flex; flex-wrap:wrap; gap:4px;">
        <span v-for="(move, i) in moveHistory" :key="i"
          style="font-size:11px; font-family:monospace; background:var(--bg-surface); padding:2px 6px; border-radius:4px;">
          {{ i+1 }}. {{ String.fromCharCode(97+move.from.col) }}{{ 8-move.from.row }}→{{ String.fromCharCode(97+move.to.col) }}{{ 8-move.to.row }}
        </span>
      </div>
    </div>
  </div>

  <!-- ─── Match Report Modal ─── -->
  <Teleport to="body">
    <div v-if="showMatchReport" style="
      position:fixed; inset:0; background:rgba(0,0,0,0.75);
      display:flex; align-items:center; justify-content:center;
      z-index:3000; padding:20px;
    " @click.self="showMatchReport = false">
      <div style="
        background:var(--bg-secondary); border-radius:16px; padding:28px;
        max-width:380px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,0.55);
        text-align:center; animation:slideUp 0.3s ease;
      ">
        <!-- Result header -->
        <div :style="{
          fontSize:'20px', fontWeight:'800', marginBottom:'3px',
          color: matchResult.winner==='red_wins' ? '#aaa' : '#555',
        }">
          {{ matchResult.winner === 'red_wins' ? '⬜ White wins' : '⚫ Black wins' }}
        </div>
        <div style="font-size:13px; color:var(--text-secondary); margin-bottom:22px;">
          {{ matchResult.reason === 'time' ? 'on time' : 'by blocking all moves' }}
        </div>

        <!-- Coach message -->
        <div style="
          background:var(--bg-surface); border-radius:12px; padding:16px 18px;
          margin-bottom:22px; display:flex; gap:14px; text-align:left;
          border:1px solid var(--border);
        ">
          <div style="
            width:42px; height:42px; border-radius:50%; flex-shrink:0;
            background:linear-gradient(135deg, #6b8fd4, #4a6db5);
            display:flex; align-items:center; justifyContent:center; font-size:22px;
            align-items:center; justify-content:center;
          ">🤖</div>
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.55; margin:0;">
            {{ coachMessage }}
          </p>
        </div>

        <!-- Move quality stats -->
        <div style="display:flex; gap:10px; margin-bottom:22px; justify-content:center;">
          <div style="text-align:center;">
            <div style="
              width:52px; height:52px; border-radius:50%; margin:0 auto 5px;
              background:rgba(39,174,96,0.12); border:2px solid #27ae60;
              display:flex; align-items:center; justify-content:center;
              font-size:20px; font-weight:800; color:#27ae60;
            ">{{ matchStats.best }}</div>
            <div style="font-size:11px; color:var(--text-secondary); font-weight:600;">Best</div>
          </div>
          <div style="text-align:center;">
            <div style="
              width:52px; height:52px; border-radius:50%; margin:0 auto 5px;
              background:rgba(52,152,219,0.12); border:2px solid #3498db;
              display:flex; align-items:center; justify-content:center;
              font-size:20px; font-weight:800; color:#3498db;
            ">{{ matchStats.excellent }}</div>
            <div style="font-size:11px; color:var(--text-secondary); font-weight:600;">Excellent</div>
          </div>
          <div style="text-align:center;">
            <div style="
              width:52px; height:52px; border-radius:50%; margin:0 auto 5px;
              background:rgba(231,76,60,0.12); border:2px solid #e74c3c;
              display:flex; align-items:center; justify-content:center;
              font-size:20px; font-weight:800; color:#e74c3c;
            ">{{ matchStats.mistakes }}</div>
            <div style="font-size:11px; color:var(--text-secondary); font-weight:600;">Mistakes</div>
          </div>
        </div>

        <!-- Upgrade to Pro for full report -->
        <div style="
          background:linear-gradient(135deg, rgba(127,166,80,0.1), rgba(127,166,80,0.05));
          border:1px solid rgba(127,166,80,0.35); border-radius:10px;
          padding:12px 16px; margin-bottom:18px; text-align:left;
          display:flex; align-items:center; gap:10px;
        ">
          <span style="font-size:20px; flex-shrink:0;">🔒</span>
          <div>
            <div style="font-size:13px; font-weight:700; margin-bottom:2px;">Full Game Report</div>
            <div style="font-size:12px; color:var(--text-secondary);">
              Upgrade to PRO for move-by-move analysis and improvement tips.
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display:flex; gap:10px;">
          <button @click="showMatchReport=false; resetGame()" style="
            flex:1; padding:11px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600;
            border:1px solid var(--border); background:var(--bg-surface); color:var(--text-primary);
          ">
            New {{ timeControl.type === 'bullet' ? '1' : timeControl.type === 'blitz' ? '3' : timeControl.type === 'rapid' ? '10' : '∞' }} min
          </button>
          <button @click="showMatchReport=false; resetGame()" class="btn-primary" style="flex:1; padding:11px; font-size:14px;">
            Rematch
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
