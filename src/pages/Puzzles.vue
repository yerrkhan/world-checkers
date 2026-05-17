<script setup>
import { ref, computed, watch } from 'vue'
import { Draughts10 } from '../game/draughts10.js'
import { useI18n } from '../i18n.js'

const { t, lang } = useI18n()

// ── Puzzle definitions ────────────────────────────────────────────────────
// Each puzzle: seedMoves = number of engine moves to advance from start
// Interactive puzzles (id 1-15) use the engine's bestMove as the expected answer
// Bonus puzzles (id 16-25) reuse same boards as 1-10 but with different titles

const basePuzzleData = (langKey) => {
  const isRu = langKey === 'ru'
  return [
    // ── INTERACTIVE (1-15) ────────────────────────────────────────────────
    {
      id: 1, seedMoves: 6, interactive: true,
      title:       isRu ? 'Обязательное взятие'  : 'Forced Capture',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Белые обязаны взять чёрную шашку. Найдите единственный допустимый ход.'
                        : 'White must capture the black piece. Find the only legal move.',
      hint:        isRu ? 'Смотрите по диагонали вперёд — взятие обязательно!'
                        : 'Look diagonally forward — a capture is mandatory!',
    },
    {
      id: 2, seedMoves: 8, interactive: true,
      title:       isRu ? 'Двойной прыжок'       : 'Double Jump',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Белые могут взять две шашки за один ход. Найдите серию взятий.'
                        : 'White can capture two pieces in a single turn. Find the chain capture.',
      hint:        isRu ? 'После первого взятия ищите ещё одну шашку для прыжка.'
                        : 'After the first capture, look for another piece to jump over.',
    },
    {
      id: 3, seedMoves: 10, interactive: true,
      title:       isRu ? 'Стань дамкой!'        : 'King Me!',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Переведите свою шашку на последнюю горизонталь, чтобы она стала дамкой.'
                        : 'Move your piece to the back row to become a King.',
      hint:        isRu ? 'Дамки ходят назад — доберитесь до первой горизонтали!'
                        : 'Kings can move backwards — advance to row 1!',
    },
    {
      id: 4, seedMoves: 12, interactive: true,
      title:       isRu ? 'Защити шашку'         : 'Protect Your Piece',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Вашу шашку сейчас возьмут. Найдите защитный ход.'
                        : 'Your piece is about to be captured. Find the defensive move.',
      hint:        isRu ? 'Уведите атакованную шашку на безопасную клетку.'
                        : 'Move the threatened piece to a safe square.',
    },
    {
      id: 5, seedMoves: 14, interactive: true,
      title:       isRu ? 'Ловушка в углу'       : 'Corner Trap',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Загоните чёрную шашку в угол, откуда она не сможет выйти.'
                        : 'Force the black piece into a corner where it cannot move.',
      hint:        isRu ? 'Окружите шашку с двух диагональных направлений.'
                        : 'Surround the piece from two diagonal directions.',
    },
    {
      id: 6, seedMoves: 7, interactive: true,
      title:       isRu ? 'Жертва'               : 'The Sacrifice',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Пожертвуйте одну шашку, чтобы взять две. Найдите выигрышную комбинацию.'
                        : 'Give up one piece to gain two. Find the winning combination.',
      hint:        isRu ? 'Иногда потеря шашки ведёт к лучшей позиции.'
                        : 'Sometimes losing a piece leads to a better position.',
    },
    {
      id: 7, seedMoves: 9, interactive: true,
      title:       isRu ? 'Дамка против шашки'  : 'King vs Piece',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Ваша дамка имеет позиционное преимущество. Найдите выигрышный ход.'
                        : 'Your king has a positional advantage. Find the winning move.',
      hint:        isRu ? 'Дамки ходят назад — используйте это!'
                        : 'Kings can move backward — use it!',
    },
    {
      id: 8, seedMoves: 11, interactive: true,
      title:       isRu ? 'Путь к дамке'         : 'Run to Safety',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Вы отстаёте по материалу, но можете спастись и провести дамку.'
                        : 'You are down a piece but can escape to safety and promote.',
      hint:        isRu ? 'Ведите шашку вперёд, чтобы стать дамкой и изменить ход игры.'
                        : 'Advance your piece to become a King and change the game.',
    },
    {
      id: 9, seedMoves: 13, interactive: true,
      title:       isRu ? 'Мост'                 : 'The Bridge',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'Две шашки вместе могут контролировать доску. Найдите правильное построение.'
                        : 'Two pieces working together can control the board. Find the formation.',
      hint:        isRu ? 'Расположите две шашки по диагонали рядом для взаимной защиты.'
                        : 'Position two pieces diagonally adjacent for mutual protection.',
    },
    {
      id: 10, seedMoves: 15, interactive: true,
      title:       isRu ? 'Финиш эндшпиля'       : 'Endgame Finish',
      difficulty:  isRu ? 'Новичок'              : 'Beginner',
      description: isRu ? 'У вас две дамки против одной шашки. Найдите самый быстрый путь к победе.'
                        : 'You have two kings vs one piece. Find the fastest win.',
      hint:        isRu ? 'Используйте обе дамки, чтобы загнать одинокую шашку в угол.'
                        : 'Use both kings to corner the lone piece.',
    },
    // ── NEW interactive (11-15) ────────────────────────────────────────────
    {
      id: 11, seedMoves: 16, interactive: true,
      title:       isRu ? 'Форсированный выигрыш'  : 'Forced Win',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Найдите форсированную последовательность ходов, ведущую к победе.'
                        : 'Find the forced sequence of moves that leads to a win.',
      hint:        isRu ? 'Ищите серию взятий, которую соперник не может избежать.'
                        : 'Look for a chain of captures your opponent cannot avoid.',
    },
    {
      id: 12, seedMoves: 18, interactive: true,
      title:       isRu ? 'Засада'                 : 'Ambush',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Заманите шашку соперника в ловушку одним точным ходом.'
                        : 'Lure the opponent\'s piece into a trap with one precise move.',
      hint:        isRu ? 'Иногда лучший ход — не прямая атака, а подготовка ловушки.'
                        : 'Sometimes the best move isn\'t a direct attack, but setting a trap.',
    },
    {
      id: 13, seedMoves: 20, interactive: true,
      title:       isRu ? 'Прорыв'                 : 'Breakthrough',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Пройдите в дамки, несмотря на сопротивление соперника.'
                        : 'Break through to promotion despite the opponent\'s resistance.',
      hint:        isRu ? 'Используйте жертву, чтобы освободить путь для вашей шашки.'
                        : 'Use a sacrifice to clear a path for your promoting piece.',
    },
    {
      id: 14, seedMoves: 17, interactive: true,
      title:       isRu ? 'Двойной удар'           : 'Double Strike',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Создайте угрозу сразу двум шашкам соперника одним ходом.'
                        : 'Create a simultaneous threat to two of the opponent\'s pieces.',
      hint:        isRu ? 'Поставьте шашку туда, откуда она бьёт в обе стороны.'
                        : 'Place your piece where it threatens captures in both directions.',
    },
    {
      id: 15, seedMoves: 19, interactive: true,
      title:       isRu ? 'Оппозиция'              : 'Opposition',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Используйте правило оппозиции, чтобы заблокировать шашки соперника.'
                        : 'Use the opposition rule to block the opponent\'s pieces.',
      hint:        isRu ? 'В эндшпиле правильная оппозиция часто решает исход партии.'
                        : 'In the endgame, correct opposition often decides the outcome.',
    },
    // ── BONUS (16-25): same boards as 1-10, different framing ─────────────
    {
      id: 16, seedMoves: 6, interactive: false,
      title:       isRu ? 'Тактика: Форсирование'  : 'Tactic: Forcing Moves',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Изучите позицию и найдите форсирующий ход. Форсирующий ход ограничивает ответы соперника.'
                        : 'Study the position and find the forcing move — one that limits the opponent\'s responses.',
      hint:        isRu ? 'Взятие и угроза взятием — самые форсирующие ходы.'
                        : 'Captures and capture threats are the most forcing moves.',
    },
    {
      id: 17, seedMoves: 8, interactive: false,
      title:       isRu ? 'Серия взятий'            : 'Chain Captures',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'В этой позиции возможна серия взятий. Определите полную цепочку ходов.'
                        : 'A chain capture is possible in this position. Identify the full sequence.',
      hint:        isRu ? 'После каждого взятия ищите новую возможность для прыжка.'
                        : 'After each capture, look for a new opportunity to jump again.',
    },
    {
      id: 18, seedMoves: 10, interactive: false,
      title:       isRu ? 'Продвижение в дамки'     : 'Promotion Plan',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Определите, какая шашка имеет наибольшие шансы пройти в дамки. Составьте план.'
                        : 'Identify which piece has the best chance of promoting. Form a plan.',
      hint:        isRu ? 'Самая близкая к дамочной линии шашка — ваш главный кандидат.'
                        : 'The piece closest to the king row is your primary candidate.',
    },
    {
      id: 19, seedMoves: 12, interactive: false,
      title:       isRu ? 'Активная защита'         : 'Active Defense',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Вы под атакой. Найдите не пассивную, а активную защиту, создающую контругрозу.'
                        : 'You are under attack. Find an active defense that creates a counter-threat.',
      hint:        isRu ? 'Активная защита часто включает ответный удар или угрозу продвижения.'
                        : 'Active defense often includes a counter-capture or promotion threat.',
    },
    {
      id: 20, seedMoves: 14, interactive: false,
      title:       isRu ? 'Контроль поля'           : 'Square Control',
      difficulty:  isRu ? 'Средний'                : 'Intermediate',
      description: isRu ? 'Определите ключевые поля доски и найдите ход для их захвата.'
                        : 'Identify the key squares on the board and find the move to control them.',
      hint:        isRu ? 'Центральные поля обычно важнее краевых в миттельшпиле.'
                        : 'Central squares are usually more valuable than edge squares in the midgame.',
    },
    {
      id: 21, seedMoves: 7, interactive: false,
      title:       isRu ? 'Жертва ради позиции'     : 'Positional Sacrifice',
      difficulty:  isRu ? 'Продвинутый'             : 'Advanced',
      description: isRu ? 'Пожертвуйте шашку для получения долгосрочного позиционного преимущества.'
                        : 'Sacrifice a piece for a long-term positional advantage.',
      hint:        isRu ? 'После жертвы ваши оставшиеся шашки должны занять идеальные позиции.'
                        : 'After the sacrifice, your remaining pieces should occupy ideal positions.',
    },
    {
      id: 22, seedMoves: 9, interactive: false,
      title:       isRu ? 'Дамочное окончание'      : 'King Endgame',
      difficulty:  isRu ? 'Продвинутый'             : 'Advanced',
      description: isRu ? 'Эндшпиль с дамками требует точной игры. Найдите выигрышный метод.'
                        : 'King endgames require precise play. Find the winning method.',
      hint:        isRu ? 'Используйте преимущество дамки: длинные диагонали и движение назад.'
                        : 'Use the king\'s advantage: long diagonals and backward movement.',
    },
    {
      id: 23, seedMoves: 11, interactive: false,
      title:       isRu ? 'Финальный удар'           : 'Final Blow',
      difficulty:  isRu ? 'Продвинутый'             : 'Advanced',
      description: isRu ? 'Позиция созрела для решающей комбинации. Нанесите финальный удар.'
                        : 'The position is ripe for a decisive combination. Deliver the final blow.',
      hint:        isRu ? 'Ищите ход, после которого у соперника не остаётся хороших ответов.'
                        : 'Look for a move after which the opponent has no good responses.',
    },
    {
      id: 24, seedMoves: 13, interactive: false,
      title:       isRu ? 'Стратегическое давление' : 'Strategic Pressure',
      difficulty:  isRu ? 'Продвинутый'             : 'Advanced',
      description: isRu ? 'Создайте постоянное давление на позицию соперника без тактических ударов.'
                        : 'Build constant pressure on the opponent\'s position without tactical strikes.',
      hint:        isRu ? 'Постепенно ограничивайте подвижность шашек соперника.'
                        : 'Gradually restrict the mobility of the opponent\'s pieces.',
    },
    {
      id: 25, seedMoves: 15, interactive: false,
      title:       isRu ? 'Мастерский финиш'         : 'Master Finish',
      difficulty:  isRu ? 'Продвинутый'             : 'Advanced',
      description: isRu ? 'Мастерский эндшпиль: найдите самый быстрый путь к победе из этой позиции.'
                        : 'Master endgame: find the fastest path to victory from this position.',
      hint:        isRu ? 'Считайте ходы — в этом типе позиций точность важнее скорости.'
                        : 'Count moves — in this type of position precision matters more than speed.',
    },
  ]
}

// Reactive puzzle list switches with language
const puzzleData = computed(() => basePuzzleData(lang.value))

// ── Solved state ───────────────────────────────────────────────────────────
const solvedIds   = ref(new Set())
const solvedCount = computed(() => solvedIds.value.size)

// ── Active puzzle & interactive state ────────────────────────────────────
const activePuzzleId   = ref(null)
const activePuzzle     = computed(() => puzzleData.value.find(p => p.id === activePuzzleId.value) || null)
const showHint         = ref(false)

// Board state
const localEngine      = ref(null)
const localBoard       = ref([])
const puzzleSel        = ref(null)    // {r,c} of selected piece
const puzzleTgts       = ref([])      // [{r,c,move}] legal destinations
const puzzleSolved     = ref(false)   // flash green
const puzzleFlash      = ref('')      // 'correct' | 'wrong'
const expectedMove     = ref(null)    // move object returned by bestMove

const colLabels = ['a','b','c','d','e','f','g','h','i','j']

const openPuzzle = (p) => {
  activePuzzleId.value = p.id
  showHint.value = false
  puzzleSel.value = null
  puzzleTgts.value = []
  puzzleSolved.value = false
  puzzleFlash.value = ''

  const eng = new Draughts10()
  for (let i = 0; i < p.seedMoves; i++) {
    const s = eng.getState()
    if (s.over || !s.moves.length) break
    eng.makeMove(eng.bestMove())
  }
  localEngine.value = eng
  const state = eng.getState()
  localBoard.value = state.board
  // Pre-compute expected best move
  if (p.interactive && !state.over && state.moves.length) {
    expectedMove.value = eng.bestMove()
  } else {
    expectedMove.value = null
  }
}

// Interactive board click
const puzzleClick = (ri, ci) => {
  if (!activePuzzle.value?.interactive) return
  if (puzzleSolved.value) return
  const state = localEngine.value.getState()
  if (state.over || !state.moves.length) return

  const mySign = state.turn === 'dark' ? 1 : -1
  const cell   = localBoard.value[ri][ci]

  if (!puzzleSel.value) {
    if (cell && Math.sign(cell) === mySign) pickPuzzlePiece(ri, ci)
  } else {
    const tgt = puzzleTgts.value.find(t => t.r === ri && t.c === ci)
    if (tgt) {
      checkMove(tgt.move)
    } else if (cell && Math.sign(cell) === mySign) {
      pickPuzzlePiece(ri, ci)
    } else {
      puzzleSel.value = null; puzzleTgts.value = []
    }
  }
}

const pickPuzzlePiece = (r, c) => {
  puzzleSel.value = { r, c }
  const state = localEngine.value.getState()
  const pMoves = state.moves.filter(m => m.from.r === r && m.from.c === c)
  puzzleTgts.value = pMoves.map(m => {
    const dest = m.path[m.path.length - 1]
    return { r: dest.r, c: dest.c, move: m }
  })
}

const checkMove = (move) => {
  puzzleSel.value = null; puzzleTgts.value = []
  const exp = expectedMove.value
  const dest = move.path[move.path.length - 1]
  const expDest = exp ? exp.path[exp.path.length - 1] : null

  const isCorrect = exp &&
    move.from.r === exp.from.r && move.from.c === exp.from.c &&
    dest.r === expDest.r && dest.c === expDest.c

  if (isCorrect) {
    localEngine.value.makeMove(move)
    localBoard.value = localEngine.value.getState().board
    puzzleFlash.value = 'correct'
    puzzleSolved.value = true
    solvedIds.value = new Set([...solvedIds.value, activePuzzleId.value])
    setTimeout(() => { puzzleFlash.value = '' }, 1200)
  } else {
    puzzleFlash.value = 'wrong'
    setTimeout(() => { puzzleFlash.value = '' }, 700)
  }
}

const markSolved = () => {
  if (!solvedIds.value.has(activePuzzleId.value)) {
    solvedIds.value = new Set([...solvedIds.value, activePuzzleId.value])
  }
}

// ── Board rendering ────────────────────────────────────────────────────────
const cellBg = (ri, ci) => {
  const dark = (ri + ci) % 2 === 1
  if (!dark) return '#eeeed2'
  if (puzzleSel.value?.r === ri && puzzleSel.value?.c === ci) return '#5fa832'
  if (puzzleTgts.value.some(t => t.r === ri && t.c === ci)) return '#7ac44a'
  return '#769656'
}

// Difficulty color
const diffColor = (diff) => {
  if (diff === 'Beginner' || diff === 'Новичок') return 'var(--amber)'
  if (diff === 'Intermediate' || diff === 'Средний') return '#4a9eff'
  return '#c45ab3'
}
</script>

<template>
<div class="puzzles-page">

  <!-- Header -->
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">{{ t.puzzles.title }}</h1>
      <p class="page-sub">{{ t.puzzles.sub }}</p>
    </div>
    <div class="progress-chip">{{ solvedCount }} / {{ puzzleData.length }} {{ t.puzzles.solved }}</div>
  </div>

  <!-- Progress bar -->
  <div class="progress-track">
    <div class="progress-fill" :style="{ width: (solvedCount / puzzleData.length * 100) + '%' }"/>
  </div>

  <!-- Section labels -->
  <div class="section-label">{{ lang === 'ru' ? '🎯 Интерактивные задачи' : '🎯 Interactive Puzzles' }}</div>
  <div class="puzzle-grid" style="margin-bottom:32px;">
    <div
      v-for="puzzle in puzzleData.slice(0, 15)"
      :key="puzzle.id"
      class="puzzle-card"
      :class="{ 'puzzle-solved': solvedIds.has(puzzle.id) }"
      @click="openPuzzle(puzzle)"
    >
      <div v-if="solvedIds.has(puzzle.id)" class="solved-badge">✓</div>
      <div class="interactive-badge">▶</div>
      <div class="puzzle-num">#{{ puzzle.id }}</div>
      <div class="puzzle-diff" :style="{ color: diffColor(puzzle.difficulty) }">{{ puzzle.difficulty }}</div>
      <div class="puzzle-title">{{ puzzle.title }}</div>
      <div class="puzzle-desc">{{ puzzle.description }}</div>
    </div>
  </div>

  <div class="section-label">{{ lang === 'ru' ? '📖 Разбор позиций' : '📖 Position Studies' }}</div>
  <div class="puzzle-grid">
    <div
      v-for="puzzle in puzzleData.slice(15)"
      :key="puzzle.id"
      class="puzzle-card puzzle-card-study"
      :class="{ 'puzzle-solved': solvedIds.has(puzzle.id) }"
      @click="openPuzzle(puzzle)"
    >
      <div v-if="solvedIds.has(puzzle.id)" class="solved-badge">✓</div>
      <div class="puzzle-num">#{{ puzzle.id }}</div>
      <div class="puzzle-diff" :style="{ color: diffColor(puzzle.difficulty) }">{{ puzzle.difficulty }}</div>
      <div class="puzzle-title">{{ puzzle.title }}</div>
      <div class="puzzle-desc">{{ puzzle.description }}</div>
    </div>
  </div>

  <!-- Puzzle modal -->
  <Teleport to="body">
    <div v-if="activePuzzle" class="modal-overlay" @click.self="activePuzzleId = null">
      <div class="modal" :class="{ 'flash-correct': puzzleFlash==='correct', 'flash-wrong': puzzleFlash==='wrong' }">
        <div class="modal-head">
          <div>
            <div class="modal-eyebrow">{{ t.puzzles.puzzleLabel }} {{ activePuzzle.id }}</div>
            <h2 class="modal-title">{{ activePuzzle.title }}</h2>
          </div>
          <button class="modal-close" @click="activePuzzleId = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p class="modal-desc">{{ activePuzzle.description }}</p>

        <!-- Solved banner -->
        <div v-if="puzzleSolved" class="solved-banner">
          ✓ {{ lang === 'ru' ? 'Верно! Отличный ход!' : 'Correct! Great move!' }}
        </div>

        <!-- 10×10 board -->
        <div class="board-wrap">
          <div class="mini-board" :class="{ 'board-interactive': activePuzzle.interactive }">
            <template v-for="(row, rIdx) in localBoard" :key="rIdx">
              <div v-for="(cell, cIdx) in row" :key="cIdx"
                class="board-sq"
                :style="{ background: cellBg(rIdx, cIdx), cursor: activePuzzle.interactive ? 'pointer' : 'default' }"
                @click="activePuzzle.interactive && (rIdx + cIdx) % 2 === 1 && puzzleClick(rIdx, cIdx)">
                <!-- Move target dot -->
                <div v-if="puzzleTgts.some(t => t.r===rIdx && t.c===cIdx) && !cell" class="move-dot"/>
                <!-- Piece -->
                <div v-if="cell !== 0" class="board-piece"
                  :style="{
                    background: cell > 0
                      ? 'radial-gradient(circle at 32% 30%, #2a2a2a, #0c0c0c)'
                      : 'radial-gradient(circle at 32% 30%, #fff, #dcdcdc)',
                    boxShadow: puzzleSel?.r===rIdx && puzzleSel?.c===cIdx
                      ? '0 0 0 3px #fff, 0 0 0 5px #5fa832'
                      : cell > 0 ? '0 2px 6px rgba(0,0,0,.9)' : '0 2px 6px rgba(0,0,0,.4)',
                    border: cell > 0 ? '1.5px solid #111' : '1.5px solid #bbb',
                    transform: puzzleSel?.r===rIdx && puzzleSel?.c===cIdx ? 'scale(1.12)' : 'scale(1)',
                  }">
                  <span v-if="Math.abs(cell)===2" class="board-king"
                    :style="{ color: cell > 0 ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.5)' }">♛</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Interactive hint -->
        <div v-if="activePuzzle.interactive && !puzzleSolved" class="interactive-label">
          {{ lang === 'ru' ? '▶ Кликните на шашку, затем на клетку назначения' : '▶ Click a piece, then click its destination' }}
        </div>

        <!-- Hint -->
        <div v-if="showHint" class="hint-box">
          <span class="hint-label">{{ lang === 'ru' ? 'Подсказка' : 'Hint' }}</span>
          {{ activePuzzle.hint }}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-secondary" @click="showHint = !showHint">
            {{ showHint ? t.puzzles.hideHint : t.puzzles.showHint }}
          </button>
          <button v-if="!activePuzzle.interactive" class="btn-primary" @click="markSolved(); activePuzzleId = null">
            {{ t.puzzles.markSolved }}
          </button>
          <RouterLink to="/game?tc=rapid&mode=local" class="btn-secondary" @click="activePuzzleId = null">
            {{ t.puzzles.practice }}
          </RouterLink>
        </div>
      </div>
    </div>
  </Teleport>

</div>
</template>

<style scoped>
.puzzles-page {
  max-width: 940px;
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
  margin-bottom: 28px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--amber);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* Section label */
.section-label {
  font-size: 0.72rem; font-weight: 800; color: var(--text3);
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 12px;
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
.puzzle-card-study { opacity: 0.85; }
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
  z-index: 1;
}
.interactive-badge {
  position: absolute;
  top: 10px; left: 10px;
  background: rgba(95,168,50,0.15); color: #5fa832;
  border: 1px solid rgba(95,168,50,0.3);
  border-radius: 4px; padding: 2px 6px;
  font-size: 0.62rem; font-weight: 800;
  letter-spacing: 0.3px;
}

.puzzle-num {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  margin-top: 6px;
}
.puzzle-diff {
  font-size: 0.68rem;
  font-weight: 700;
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
  max-height: 92vh;
  overflow-y: auto;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.flash-correct { border-color: #5fa832 !important; box-shadow: 0 0 0 3px rgba(95,168,50,0.3), 0 24px 80px rgba(0,0,0,0.6) !important; }
.flash-wrong   { border-color: #e74c3c !important; box-shadow: 0 0 0 3px rgba(231,76,60,0.25), 0 24px 80px rgba(0,0,0,0.6) !important; }

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
  margin-bottom: 16px;
  line-height: 1.6;
}

/* Solved banner */
.solved-banner {
  background: rgba(76,175,80,0.12);
  border: 1px solid rgba(76,175,80,0.35);
  border-radius: 7px;
  padding: 9px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #4caf50;
  margin-bottom: 14px;
  text-align: center;
}

/* Board */
.board-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
.mini-board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  width: 310px;
  height: 310px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.6);
}
.board-interactive { cursor: pointer; }
.board-sq {
  display: flex; align-items: center; justify-content: center;
  position: relative;
  transition: background 0.08s;
}
.move-dot {
  width: 30%; height: 30%;
  border-radius: 50%;
  background: rgba(0,0,0,0.2);
  pointer-events: none;
}
.board-piece {
  width: 72%; height: 72%;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.1s, box-shadow 0.1s;
  cursor: pointer;
}
.board-king { font-size: 38%; line-height: 1; }

/* Interactive label */
.interactive-label {
  text-align: center;
  font-size: 0.75rem;
  color: #5fa832;
  margin-bottom: 12px;
  font-weight: 600;
}

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

/* Buttons (shared) */
.btn-primary {
  background: var(--amber); color: #0b0e15; border: none;
  padding: 9px 18px; border-radius: 6px;
  font-weight: 800; font-size: 0.85rem; cursor: pointer;
  font-family: inherit;
}
.btn-primary:hover { background: var(--amber-l); }
.btn-secondary {
  background: transparent; border: 1.5px solid var(--border2); color: var(--text1);
  padding: 9px 18px; border-radius: 6px;
  font-weight: 600; font-size: 0.85rem; cursor: pointer;
  text-decoration: none; display: inline-flex; align-items: center;
  font-family: inherit;
}
.btn-secondary:hover { border-color: var(--border2); color: var(--text0); }
</style>
