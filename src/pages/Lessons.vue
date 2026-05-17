<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n.js'

const { t, lang } = useI18n()

const lessonsEN = [
  {
    id: 1, title: 'How to Play Checkers',
    duration: '5 min', category: 'Basics',
    description: 'Learn the fundamental rules: board setup, how pieces move, capturing, and winning conditions.',
    content: [
      { heading: 'The Board', text: 'Checkers is played on a 10×10 board in International Draughts. Pieces only move on the dark squares.' },
      { heading: 'Moving Pieces', text: 'Regular pieces move diagonally forward one square. They cannot move backward — until promoted.' },
      { heading: 'Capturing', text: 'Jump over an opponent\'s piece diagonally to capture it. Captures are mandatory — if you can jump, you must.' },
      { heading: 'Winning', text: 'You win by capturing all of your opponent\'s pieces, or by blocking them so they cannot move.' },
    ],
  },
  {
    id: 2, title: 'Kings — Power Pieces',
    duration: '4 min', category: 'Basics',
    description: 'Understand how pieces get promoted to kings and why kings are so powerful in International Draughts.',
    content: [
      { heading: 'Getting a King', text: 'When your piece reaches the opponent\'s back row, it becomes a King. It gains vastly greater mobility.' },
      { heading: 'King Movement', text: 'Kings can move diagonally in any direction — forward and backward, any number of squares (flying king).' },
      { heading: 'King Captures', text: 'Kings can jump in any direction, making them much more powerful than regular pieces.' },
      { heading: 'King Endgames', text: 'A single king can defeat multiple regular pieces if played correctly.' },
    ],
  },
  {
    id: 3, title: 'Tactics: Forced Captures',
    duration: '6 min', category: 'Tactics',
    description: 'Learn to use mandatory capture rules to your advantage and force your opponent into bad positions.',
    content: [
      { heading: 'Mandatory Captures', text: 'In checkers, if a capture is available, you MUST take it. This rule can be exploited!' },
      { heading: 'The Sacrifice', text: 'Offer a piece to your opponent. When they capture it, your piece captures two of theirs.' },
      { heading: 'Chain Captures', text: 'Plan multi-jump sequences where one piece captures 3+ pieces in one turn.' },
      { heading: 'Forcing Their Move', text: 'Set up positions where every opponent move leads to a capture opportunity for you.' },
    ],
  },
  {
    id: 4, title: 'Opening Principles',
    duration: '7 min', category: 'Strategy',
    description: 'Start your games well. Learn the key opening principles that give you a strong position.',
    content: [
      { heading: 'Control the Center', text: 'Occupy the central squares — pieces here control more of the board.' },
      { heading: 'Protect Your Back Row', text: 'Keep pieces on your back row until necessary. This prevents your opponent from getting kings easily.' },
      { heading: 'Advance in Groups', text: 'Move pieces in connected formations. Isolated pieces are easier to capture.' },
      { heading: 'Avoid Edges', text: 'Edge pieces have fewer moves and are easily trapped.' },
    ],
  },
  {
    id: 5, title: 'Endgame Mastery',
    duration: '8 min', category: 'Advanced',
    description: 'When few pieces remain, endgame technique decides the winner. Learn how to convert advantages.',
    content: [
      { heading: 'Two Kings Win', text: 'Two kings vs one piece: use both kings to corner the lone piece on the edge.' },
      { heading: 'The Opposition', text: 'Position your king directly in front of opponent\'s king to control movement.' },
      { heading: 'Pacing', text: 'Don\'t rush — a slow methodical advance with multiple pieces wins cleanly.' },
      { heading: 'Timing Promotion', text: 'In the endgame, race your piece to promotion while blocking opponent\'s advance.' },
    ],
  },
]

const lessonsRU = [
  {
    id: 1, title: 'Как играть в шашки',
    duration: '5 мин', category: 'Основы',
    description: 'Изучите основные правила: расстановка, движение шашек, взятие и условия победы.',
    content: [
      { heading: 'Доска', text: 'В международных шашках используется доска 10×10. Шашки ходят только по тёмным клеткам.' },
      { heading: 'Ход шашки', text: 'Обычная шашка ходит вперёд по диагонали на одну клетку. Ход назад возможен только для дамки.' },
      { heading: 'Взятие', text: 'Перепрыгните через шашку соперника по диагонали, чтобы взять её. Взятие обязательно — если можете бить, вы обязаны это сделать.' },
      { heading: 'Победа', text: 'Победа достигается взятием всех шашек соперника или лишением его всех ходов.' },
    ],
  },
  {
    id: 2, title: 'Дамки — главная сила',
    duration: '4 мин', category: 'Основы',
    description: 'Узнайте, как шашки становятся дамками и почему дамки так сильны в международных шашках.',
    content: [
      { heading: 'Получение дамки', text: 'Когда шашка достигает последней горизонтали соперника, она становится дамкой и получает огромную силу.' },
      { heading: 'Ход дамки', text: 'Дамка ходит по диагонали в любом направлении на любое количество клеток (дамка-летун).' },
      { heading: 'Взятие дамкой', text: 'Дамка может бить в любом направлении, что делает её гораздо сильнее обычной шашки.' },
      { heading: 'Эндшпиль дамки', text: 'Одна дамка при правильной игре способна победить несколько простых шашек соперника.' },
    ],
  },
  {
    id: 3, title: 'Тактика: вынужденные взятия',
    duration: '6 мин', category: 'Тактика',
    description: 'Используйте правило обязательного взятия в свою пользу и вынуждайте соперника к невыгодным позициям.',
    content: [
      { heading: 'Обязательное взятие', text: 'В шашках, если есть возможность бить, вы обязаны это сделать. Это правило можно использовать!' },
      { heading: 'Жертва', text: 'Пожертвуйте шашку сопернику. Когда он её возьмёт, ваша шашка бьёт сразу две его шашки.' },
      { heading: 'Серийные взятия', text: 'Планируйте многоходовые цепочки взятий, где одна шашка берёт 3 и более шашек за один ход.' },
      { heading: 'Форсирование', text: 'Создавайте позиции, в которых любой ход соперника ведёт к выгодному для вас взятию.' },
    ],
  },
  {
    id: 4, title: 'Принципы дебюта',
    duration: '7 мин', category: 'Стратегия',
    description: 'Правильно начинайте партии. Изучите ключевые принципы, дающие сильную позицию с первых ходов.',
    content: [
      { heading: 'Контроль центра', text: 'Занимайте центральные клетки — шашки там контролируют больше пространства на доске.' },
      { heading: 'Защита задней горизонтали', text: 'Не спешите выдвигать шашки с задней линии. Это не даст сопернику легко получить дамку.' },
      { heading: 'Группировка', text: 'Продвигайте шашки связными группами. Изолированные шашки легко берутся.' },
      { heading: 'Избегайте краёв', text: 'Шашки на краях доски имеют меньше ходов и легче поддаются окружению.' },
    ],
  },
  {
    id: 5, title: 'Мастерство эндшпиля',
    duration: '8 мин', category: 'Продвинутый',
    description: 'В эндшпиле техника игры решает всё. Научитесь реализовывать преимущество.',
    content: [
      { heading: 'Две дамки побеждают', text: 'Две дамки против одной простой: используйте обе дамки, чтобы загнать её в угол.' },
      { heading: 'Оппозиция', text: 'Поставьте свою дамку прямо перед дамкой соперника, чтобы ограничить её движение.' },
      { heading: 'Не спешите', text: 'Медленное методичное наступление несколькими шашками надёжно ведёт к победе.' },
      { heading: 'Время для дамки', text: 'В эндшпиле гоните шашку в дамки, одновременно блокируя прорыв соперника.' },
    ],
  },
]

const lessons = computed(() => lang.value === 'ru' ? lessonsRU : lessonsEN)

const activeLesson   = ref(null)
const currentStep    = ref(0)
const completedLessons = ref(new Set())

const openLesson = (lesson) => {
  activeLesson.value = lesson
  currentStep.value  = 0
}

const nextStep = () => {
  if (currentStep.value < activeLesson.value.content.length - 1) {
    currentStep.value++
  } else {
    completedLessons.value.add(activeLesson.value.id)
    activeLesson.value = null
  }
}

const catStyle = (cat) => {
  const map = {
    'Basics':    { color: '#3a6caa', bg: 'rgba(58,108,170,0.12)' },
    'Tactics':   { color: '#c49430', bg: 'rgba(196,148,48,0.12)' },
    'Strategy':  { color: '#2a8f5c', bg: 'rgba(42,143,92,0.12)' },
    'Advanced':  { color: '#8a4cb0', bg: 'rgba(138,76,176,0.12)' },
    'Основы':         { color: '#3a6caa', bg: 'rgba(58,108,170,0.12)' },
    'Тактика':        { color: '#c49430', bg: 'rgba(196,148,48,0.12)' },
    'Стратегия':      { color: '#2a8f5c', bg: 'rgba(42,143,92,0.12)' },
    'Продвинутый':    { color: '#8a4cb0', bg: 'rgba(138,76,176,0.12)' },
  }
  return map[cat] || { color: '#888', bg: 'rgba(136,136,136,0.1)' }
}
</script>

<template>
<div class="lessons-page">

  <!-- Header -->
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">{{ t.lessons.title }}</h1>
      <p class="page-sub">{{ t.lessons.sub }}</p>
    </div>
    <div class="progress-chip">
      {{ completedLessons.size }} / {{ lessons.length }} {{ t.lessons.completed }}
    </div>
  </div>

  <!-- Lessons list -->
  <div class="lessons-list">
    <div
      v-for="lesson in lessons"
      :key="lesson.id"
      class="lesson-row"
      :class="{ 'lesson-done': completedLessons.has(lesson.id) }"
      @click="openLesson(lesson)"
    >
      <!-- Category + duration -->
      <div class="lesson-meta">
        <span class="lesson-cat"
          :style="{
            color: catStyle(lesson.category).color,
            background: catStyle(lesson.category).bg,
          }">{{ lesson.category }}</span>
        <span class="lesson-dur">{{ lesson.duration }}</span>
      </div>

      <!-- Title + description -->
      <div class="lesson-body">
        <div class="lesson-title">{{ lesson.title }}</div>
        <div class="lesson-desc">{{ lesson.description }}</div>
      </div>

      <!-- Status -->
      <div class="lesson-status">
        <div v-if="completedLessons.has(lesson.id)" class="status-done">✓</div>
        <div v-else class="status-arrow">›</div>
      </div>
    </div>
  </div>

  <!-- Premium banner -->
  <div class="premium-banner">
    <div class="premium-content">
      <div class="premium-icon">★</div>
      <div class="premium-text">
        <div class="premium-title">{{ t.lessons.upgradeTitle }}</div>
        <div class="premium-desc">{{ t.lessons.upgradeDesc }}</div>
      </div>
    </div>
    <button class="btn-primary">{{ t.lessons.upgradeBtn }}</button>
  </div>

  <!-- Lesson modal -->
  <Teleport to="body">
    <div v-if="activeLesson" class="modal-overlay" @click.self="activeLesson = null">
      <div class="modal">
        <!-- Header -->
        <div class="modal-head">
          <div>
            <div class="modal-eyebrow">
              {{ t.lessons.lessonLabel }} {{ activeLesson.id }} · {{ t.lessons.stepOf }} {{ currentStep + 1 }} {{ t.lessons.of }} {{ activeLesson.content.length }}
            </div>
            <h2 class="modal-title">{{ activeLesson.title }}</h2>
          </div>
          <button class="modal-close" @click="activeLesson = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar">
          <div class="progress-fill"
            :style="{ width: ((currentStep + 1) / activeLesson.content.length * 100) + '%' }"/>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <h3 class="content-heading">{{ activeLesson.content[currentStep].heading }}</h3>
          <p class="content-text">{{ activeLesson.content[currentStep].text }}</p>
        </div>

        <!-- Navigation -->
        <div class="modal-nav">
          <button v-if="currentStep > 0" class="btn-secondary" @click="currentStep--">{{ t.lessons.back }}</button>
          <button class="btn-primary" style="flex:1;" @click="nextStep">
            {{ currentStep < activeLesson.content.length - 1 ? t.lessons.next : t.lessons.completeLesson }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

</div>
</template>

<style scoped>
.lessons-page {
  max-width: 860px;
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
  margin-bottom: 32px;
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
  line-height: 1.5;
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

/* Lessons list */
.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.lesson-row {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 18px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.lesson-row:hover {
  border-color: var(--border2);
  box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  transform: translateX(3px);
}
.lesson-done { border-color: rgba(196,148,48,0.3); }

.lesson-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 96px;
  flex-shrink: 0;
  margin-right: 16px;
}
.lesson-cat {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 4px;
}
.lesson-dur {
  font-size: 0.7rem;
  color: var(--text3);
}

.lesson-body { flex: 1; min-width: 0; }
.lesson-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text0);
  margin-bottom: 4px;
}
.lesson-desc {
  font-size: 0.8rem;
  color: var(--text2);
  line-height: 1.5;
}

.lesson-status { flex-shrink: 0; margin-left: 16px; }
.status-done {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--amber);
  color: #0b0e15;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
}
.status-arrow {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--ink3);
  border: 1px solid var(--border);
  color: var(--text3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  transition: background 0.15s, color 0.15s;
}
.lesson-row:hover .status-arrow { background: var(--ink4); color: var(--text1); }

/* Premium banner */
.premium-banner {
  background: var(--ink2);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.premium-content { display: flex; align-items: center; gap: 16px; }
.premium-icon {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(196,148,48,0.12);
  border: 1px solid rgba(196,148,48,0.25);
  display: flex; align-items: center; justify-content: center;
  color: var(--amber);
  font-size: 1rem;
  font-weight: 800;
  flex-shrink: 0;
}
.premium-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text0);
  margin-bottom: 4px;
}
.premium-desc {
  font-size: 0.8rem;
  color: var(--text2);
  line-height: 1.5;
  max-width: 420px;
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
  max-width: 520px;
  width: 100%;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.modal-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text3);
  margin-bottom: 6px;
  font-weight: 600;
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

.progress-bar {
  width: 100%;
  height: 3px;
  background: var(--ink3);
  border-radius: 2px;
  margin-bottom: 24px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--amber);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.modal-content { min-height: 120px; margin-bottom: 28px; }
.content-heading {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--amber);
}
.content-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text0);
}

.modal-nav {
  display: flex;
  gap: 10px;
}
</style>
