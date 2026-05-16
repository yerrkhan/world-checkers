<script setup>
import { ref } from 'vue'
import { Draughts10 } from '../game/draughts10.js'

const puzzles = [
  {
    id: 1, title: 'Forced Capture', difficulty: 'Beginner',
    description: 'White must capture the black piece. Find the only legal move.',
    hint: 'Look diagonally forward — a capture is mandatory!',
    solved: false,
  },
  {
    id: 2, title: 'Double Jump', difficulty: 'Beginner',
    description: 'White can capture two pieces in a single turn. Find the chain capture.',
    hint: 'After the first capture, look for another piece to jump over.',
    solved: false,
  },
  {
    id: 3, title: 'King Me!', difficulty: 'Beginner',
    description: 'Move your piece to the back row to become a King.',
    hint: 'Kings can move backwards — advance to row 1!',
    solved: false,
  },
  {
    id: 4, title: 'Protect Your Piece', difficulty: 'Beginner',
    description: 'Your piece is about to be captured. Find the defensive move.',
    hint: 'Move the threatened piece to a safe square.',
    solved: false,
  },
  {
    id: 5, title: 'Corner Trap', difficulty: 'Beginner',
    description: 'Force the black piece into a corner where it cannot move.',
    hint: 'Surround the piece from two diagonal directions.',
    solved: false,
  },
  {
    id: 6, title: 'The Sacrifice', difficulty: 'Beginner',
    description: 'Give up one piece to gain two. Find the winning combination.',
    hint: 'Sometimes losing a piece leads to a better position.',
    solved: false,
  },
  {
    id: 7, title: 'King vs Piece', difficulty: 'Beginner',
    description: 'Your king has a positional advantage. Find the winning move.',
    hint: 'Kings can move backward — use it!',
    solved: false,
  },
  {
    id: 8, title: 'Run to Safety', difficulty: 'Beginner',
    description: 'You are down a piece but can escape to safety and promote.',
    hint: 'Advance your piece to become a King and change the game.',
    solved: false,
  },
  {
    id: 9, title: 'The Bridge', difficulty: 'Beginner',
    description: 'Two pieces working together can control the board. Find the formation.',
    hint: 'Position two pieces diagonally adjacent for mutual protection.',
    solved: false,
  },
  {
    id: 10, title: 'Endgame Finish', difficulty: 'Beginner',
    description: 'You have two kings vs one piece. Find the fastest win.',
    hint: 'Use both kings to corner the lone piece.',
    solved: false,
  },
]

const activePuzzle = ref(null)
const showHint     = ref(false)
const solvedCount  = ref(0)
const localGame    = ref(null)
const localBoard   = ref([])

const openPuzzle = (p) => {
  activePuzzle.value = p
  showHint.value = false
  localGame.value = new Draughts10()
  const seed = p.id
  for (let i = 0; i < 6 + seed % 8; i++) {
    const s = localGame.value.getState()
    if (s.over || !s.moves.length) break
    localGame.value.makeMove(localGame.value.bestMove())
  }
  localBoard.value = localGame.value.getState().board
}

const markSolved = () => {
  if (!activePuzzle.value.solved) {
    activePuzzle.value.solved = true
    solvedCount.value++
  }
}

const cellBg = (ri, ci) => (ri + ci) % 2 === 1 ? '#769656' : '#eeeed2'
</script>

<template>
<div class="puzzles-page">

  <!-- Header -->
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Puzzles</h1>
      <p class="page-sub">Train your tactics with these beginner checkers puzzles.</p>
    </div>
    <div class="progress-chip">{{ solvedCount }} / {{ puzzles.length }} solved</div>
  </div>

  <!-- Progress bar -->
  <div class="progress-track">
    <div class="progress-fill" :style="{ width: (solvedCount / puzzles.length * 100) + '%' }"/>
  </div>

  <!-- Puzzle grid -->
  <div class="puzzle-grid">
    <div
      v-for="puzzle in puzzles"
      :key="puzzle.id"
      class="puzzle-card"
      :class="{ 'puzzle-solved': puzzle.solved }"
      @click="openPuzzle(puzzle)"
    >
      <div v-if="puzzle.solved" class="solved-badge">✓</div>

      <div class="puzzle-num">#{{ puzzle.id }}</div>
      <div class="puzzle-diff">{{ puzzle.difficulty }}</div>
      <div class="puzzle-title">{{ puzzle.title }}</div>
      <div class="puzzle-desc">{{ puzzle.description }}</div>
    </div>
  </div>

  <!-- Puzzle modal -->
  <Teleport to="body">
    <div v-if="activePuzzle" class="modal-overlay" @click.self="activePuzzle = null">
      <div class="modal">
        <div class="modal-head">
          <div>
            <div class="modal-eyebrow">Puzzle {{ activePuzzle.id }}</div>
            <h2 class="modal-title">{{ activePuzzle.title }}</h2>
          </div>
          <button class="modal-close" @click="activePuzzle = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p class="modal-desc">{{ activePuzzle.description }}</p>

        <!-- 10×10 board -->
        <div class="board-wrap">
          <div class="mini-board">
            <template v-for="(row, rIdx) in localBoard" :key="rIdx">
              <div v-for="(cell, cIdx) in row" :key="cIdx"
                class="board-sq"
                :style="{ background: cellBg(rIdx, cIdx) }">
                <div v-if="cell !== 0" class="board-piece"
                  :style="{
                    background: cell > 0
                      ? 'radial-gradient(circle at 32% 30%, #2a2a2a, #0c0c0c)'
                      : 'radial-gradient(circle at 32% 30%, #fff, #dcdcdc)',
                    boxShadow: cell > 0
                      ? '0 2px 6px rgba(0,0,0,.9)'
                      : '0 2px 6px rgba(0,0,0,.4)',
                    border: cell > 0 ? '1.5px solid #111' : '1.5px solid #bbb',
                  }">
                  <span v-if="Math.abs(cell)===2" class="board-king"
                    :style="{ color: cell > 0 ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.5)' }">♛</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Hint -->
        <div v-if="showHint" class="hint-box">
          <span class="hint-label">Hint</span>
          {{ activePuzzle.hint }}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-secondary" @click="showHint = !showHint">
            {{ showHint ? 'Hide hint' : 'Show hint' }}
          </button>
          <button class="btn-primary" @click="markSolved(); activePuzzle = null">
            Mark as solved
          </button>
          <RouterLink to="/game?tc=rapid&mode=local" class="btn-secondary" @click="activePuzzle = null">
            Practice on board
          </RouterLink>
        </div>
      </div>
    </div>
  </Teleport>

</div>
</template>

<style scoped>
.puzzles-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 44px 24px 80px;
  color: var(--text0);
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text0);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}
.page-sub {
  font-size: 0.88rem;
  color: var(--text2);
}
.progress-chip {
  background: var(--amber);
  color: #0b0e15;
  padding: 5px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.82rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Progress track */
.progress-track {
  width: 100%;
  height: 4px;
  background: var(--ink3);
  border-radius: 2px;
  margin-bottom: 32px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--amber);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* Puzzle grid */
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 14px;
}

.puzzle-card {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  position: relative;
  overflow: hidden;
}
.puzzle-card:hover {
  transform: translateY(-2px);
  border-color: var(--border2);
  box-shadow: 0 8px 28px rgba(0,0,0,0.4);
}
.puzzle-solved { border-color: rgba(196,148,48,0.3); }

.solved-badge {
  position: absolute;
  top: 10px; right: 10px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--amber);
  color: #0b0e15;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
}

.puzzle-num {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.puzzle-diff {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--amber);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.puzzle-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text0);
  margin-bottom: 6px;
}
.puzzle-desc {
  font-size: 0.8rem;
  color: var(--text2);
  line-height: 1.5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.82);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--ink2);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 28px;
  max-width: 540px;
  width: 100%;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.modal-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--amber);
  margin-bottom: 5px;
  font-weight: 700;
}
.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text0);
}
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
.modal-desc {
  font-size: 0.88rem;
  color: var(--text2);
  margin-bottom: 20px;
  line-height: 1.6;
}

/* Board */
.board-wrap { display: flex; justify-content: center; margin-bottom: 20px; }
.mini-board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  width: 300px;
  height: 300px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.6);
}
.board-sq { display: flex; align-items: center; justify-content: center; }
.board-piece {
  width: 72%; height: 72%;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.board-king { font-size: 38%; line-height: 1; }

/* Hint */
.hint-box {
  background: rgba(196,148,48,0.08);
  border: 1px solid rgba(196,148,48,0.25);
  border-radius: 7px;
  padding: 12px 14px;
  margin-bottom: 18px;
  font-size: 0.85rem;
  color: var(--text0);
  line-height: 1.55;
}
.hint-label {
  font-weight: 700;
  color: var(--amber);
  margin-right: 6px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
