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
  {
    id: 6, title: 'The Strong Center',
    duration: '6 min', category: 'Strategy',
    description: 'Build a compact center that gives your pieces more routes and keeps your opponent short on space.',
    content: [
      { heading: 'Central Squares Matter', text: 'A piece in the center usually controls more playable diagonals than a piece near the side.' },
      { heading: 'Do Not Overextend', text: 'A big center is only strong when the pieces defend each other. Unsupported advanced pieces become targets.' },
      { heading: 'Trade From Strength', text: 'When you own the center, exchanges often leave your remaining pieces with better squares.' },
      { heading: 'When to Release', text: 'If the center becomes blocked, open one diagonal before your opponent can freeze your formation.' },
    ],
  },
  {
    id: 7, title: 'Tempo and Waiting Moves',
    duration: '5 min', category: 'Strategy',
    description: 'Learn when a quiet move changes the move order and forces your opponent to break their own position.',
    content: [
      { heading: 'What Tempo Means', text: 'Tempo is the right to move at the right moment. Sometimes the best move simply hands the problem back.' },
      { heading: 'Useful Waiting', text: 'A waiting move keeps your threats alive while forcing the opponent to choose a weakness.' },
      { heading: 'Avoid Empty Waiting', text: 'Do not pass time without a purpose. Your waiting move should improve defense, control, or promotion chances.' },
      { heading: 'Endgame Value', text: 'Tempo is most visible in king endings, where one move can decide who controls the final diagonal.' },
    ],
  },
  {
    id: 8, title: 'Traps on the Edge',
    duration: '7 min', category: 'Tactics',
    description: 'Use the side of the board to reduce escape squares and create forcing capture patterns.',
    content: [
      { heading: 'Why Edges Trap Pieces', text: 'A piece on the edge has fewer legal diagonals, so one defender can often control several escape routes.' },
      { heading: 'Push, Then Block', text: 'First guide the enemy piece toward the side, then place a blocker where it wants to run.' },
      { heading: 'Forced Capture Hooks', text: 'Offer a piece that must be taken, then recapture into a stronger square or into a multi-capture route.' },
      { heading: 'Do Not Trap Yourself', text: 'Edge pressure is useful only if your own pieces keep enough space to retreat.' },
    ],
  },
  {
    id: 9, title: 'Reading Multi-Captures',
    duration: '9 min', category: 'Tactics',
    description: 'Train your eye to calculate long capture sequences without losing track of the landing square.',
    content: [
      { heading: 'Start With Landing Squares', text: 'Before counting captured pieces, identify where each jump ends. The final landing square often matters most.' },
      { heading: 'Branch Points', text: 'When several captures are available, compare the final position, not only the number of pieces taken.' },
      { heading: 'Remove Pieces Mentally', text: 'After each jump, imagine the captured piece gone. New diagonals may open that were hidden at first.' },
      { heading: 'Check the Reply', text: 'A brilliant capture is bad if the opponent immediately wins your king or starts a stronger chain.' },
    ],
  },
  {
    id: 10, title: 'King vs Pieces Technique',
    duration: '8 min', category: 'Advanced',
    description: 'Use one king actively against regular pieces without letting them promote for free.',
    content: [
      { heading: 'Stay on Long Diagonals', text: 'A king controls the board best from long diagonals where it can switch sides quickly.' },
      { heading: 'Cut the Promotion Route', text: 'Do not chase every piece. First control the path to promotion, then collect targets.' },
      { heading: 'Force Separation', text: 'Regular pieces defend each other in groups. Use the king to make one piece move away from the rest.' },
      { heading: 'Convert Calmly', text: 'When ahead, choose simple moves that keep control. Fast captures are less important than stopping counterplay.' },
    ],
  },
  {
    id: 11, title: 'The Back Rank Guard',
    duration: '6 min', category: 'Strategy',
    description: 'Keep control of the promotion row without freezing your whole army.',
    content: [
      { heading: 'Why the Back Rank Matters', text: 'The last row is the door to kings. A single careless move can give the opponent a permanent advantage.' },
      { heading: 'Keep One Guard', text: 'You do not need to keep every back piece still. Usually one well-placed guard is enough to stop easy promotion.' },
      { heading: 'Release at the Right Time', text: 'When the center opens, move a back-rank piece only if it joins a threat or prevents a stronger threat.' },
      { heading: 'Avoid Passive Defense', text: 'A guard should support your position. If it only waits while the opponent improves, it becomes a weakness.' },
    ],
  },
  {
    id: 12, title: 'Majority Captures',
    duration: '7 min', category: 'Tactics',
    description: 'Understand maximum-capture rules and choose the legal sequence that wins the most material.',
    content: [
      { heading: 'The Rule', text: 'In International Draughts, when several captures are possible, the line taking the most pieces must be played.' },
      { heading: 'Count Before Moving', text: 'Do not stop after seeing the first jump. Count every branch and compare the full capture length.' },
      { heading: 'Use the Rule as a Weapon', text: 'You can force the opponent into a longer capture that leaves them on a worse square.' },
      { heading: 'Final Square Check', text: 'The biggest capture is not always the safest, but if it is mandatory you must prepare for the final landing square.' },
    ],
  },
  {
    id: 13, title: 'Breakthrough Patterns',
    duration: '8 min', category: 'Tactics',
    description: 'Clear a promotion route by sacrificing, blocking, and timing the final advance.',
    content: [
      { heading: 'Find the Runner', text: 'Choose the piece with the clearest path to the king row, not always the most advanced piece.' },
      { heading: 'Remove One Defender', text: 'Many breakthroughs start by trading away the defender that controls the final diagonal.' },
      { heading: 'Force the Blocker', text: 'If the opponent must capture, you can pull their blocker away from your runner.' },
      { heading: 'Run Only When Ready', text: 'A premature race can lose. Start the run when every reply either fails or gives you promotion.' },
    ],
  },
  {
    id: 14, title: 'Flying King Geometry',
    duration: '9 min', category: 'Advanced',
    description: 'Use long diagonals with kings to cut routes, switch wings, and create double threats.',
    content: [
      { heading: 'Long Diagonals', text: 'A flying king controls many squares at once. Long diagonals let it defend and attack without wasting moves.' },
      { heading: 'Cut the Board', text: 'Place the king where enemy pieces cannot cross safely. This turns space into a tactical weapon.' },
      { heading: 'Switch Wings', text: 'Kings can move from one side to the other quickly. Use that mobility to attack the side the opponent leaves loose.' },
      { heading: 'Do Not Overchase', text: 'A king chasing one piece can abandon the main diagonal. Control first, collect later.' },
    ],
  },
  {
    id: 15, title: 'Planning Under Time Pressure',
    duration: '5 min', category: 'Basics',
    description: 'Make reliable decisions in bullet and blitz without calculating everything.',
    content: [
      { heading: 'Use Candidate Moves', text: 'Quickly list two or three sensible moves. This prevents panic clicks and obvious blunders.' },
      { heading: 'Check Captures First', text: 'Mandatory captures decide many fast games. Always scan for captures before quiet moves.' },
      { heading: 'Prefer Simple Advantages', text: 'In time trouble, choose the move that keeps material and structure stable unless you see a clear tactic.' },
      { heading: 'Clock Discipline', text: 'Do not spend all your time looking for perfection. Good and fast often beats best and too late.' },
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
  {
    id: 6, title: 'Сильный центр',
    duration: '6 мин', category: 'Стратегия',
    description: 'Стройте плотный центр, чтобы получать больше маршрутов и ограничивать пространство соперника.',
    content: [
      { heading: 'Центральные поля важны', text: 'Шашка в центре обычно контролирует больше игровых диагоналей, чем шашка на краю.' },
      { heading: 'Не уходите слишком далеко', text: 'Центр силен только тогда, когда шашки защищают друг друга. Одинокая продвинутая шашка становится целью.' },
      { heading: 'Меняйтесь из силы', text: 'Когда центр ваш, размены часто оставляют вашим шашкам лучшие поля.' },
      { heading: 'Когда вскрывать игру', text: 'Если центр заблокирован, откройте одну диагональ до того, как соперник заморозит построение.' },
    ],
  },
  {
    id: 7, title: 'Темп и выжидательные ходы',
    duration: '5 мин', category: 'Стратегия',
    description: 'Поймите, когда тихий ход меняет очередь и заставляет соперника портить свою позицию.',
    content: [
      { heading: 'Что такое темп', text: 'Темп это право сделать ход в нужный момент. Иногда лучший ход просто возвращает проблему сопернику.' },
      { heading: 'Полезное ожидание', text: 'Выжидательный ход сохраняет угрозы и заставляет соперника выбрать слабость.' },
      { heading: 'Не ждите без причины', text: 'Тихий ход должен улучшать защиту, контроль или шансы на проход в дамки.' },
      { heading: 'Ценность в эндшпиле', text: 'Темп особенно важен в дамочных окончаниях, где один ход решает контроль главной диагонали.' },
    ],
  },
  {
    id: 8, title: 'Ловушки на краю',
    duration: '7 мин', category: 'Тактика',
    description: 'Используйте край доски, чтобы уменьшить число ходов соперника и создать форсированные взятия.',
    content: [
      { heading: 'Почему край опасен', text: 'У шашки на краю меньше диагоналей, поэтому один защитник часто перекрывает несколько путей.' },
      { heading: 'Сначала вытесните, потом блокируйте', text: 'Направьте шашку соперника к краю, затем поставьте блок на поле ухода.' },
      { heading: 'Приманка под обязательное взятие', text: 'Отдайте шашку, которую соперник обязан взять, и получите ответное взятие или цепочку.' },
      { heading: 'Не поймайте себя', text: 'Давление на краю полезно только если ваши шашки сохраняют пространство для отхода.' },
    ],
  },
  {
    id: 9, title: 'Расчет серийных взятий',
    duration: '9 мин', category: 'Тактика',
    description: 'Тренируйте расчет длинных цепочек взятий и не теряйте из виду конечное поле.',
    content: [
      { heading: 'Начинайте с полей приземления', text: 'Перед подсчетом взятых шашек определите, где заканчивается каждый прыжок.' },
      { heading: 'Точки выбора', text: 'Если есть несколько взятий, сравнивайте итоговую позицию, а не только количество взятых шашек.' },
      { heading: 'Убирайте шашки мысленно', text: 'После каждого прыжка представляйте, что взятая шашка исчезла. Могут открыться новые диагонали.' },
      { heading: 'Проверьте ответ', text: 'Красивое взятие плохо, если соперник сразу выигрывает вашу дамку или начинает более сильную цепочку.' },
    ],
  },
  {
    id: 10, title: 'Дамка против простых',
    duration: '8 мин', category: 'Продвинутый',
    description: 'Активно играйте дамкой против простых шашек и не позволяйте им пройти в дамки бесплатно.',
    content: [
      { heading: 'Держитесь длинных диагоналей', text: 'Дамка лучше всего контролирует доску с длинных диагоналей, где быстро меняет фланг.' },
      { heading: 'Отрежьте путь в дамки', text: 'Не гонитесь за каждой шашкой. Сначала перекройте дорогу к превращению, затем собирайте цели.' },
      { heading: 'Разъединяйте группу', text: 'Простые шашки сильны вместе. Дамкой заставьте одну шашку отойти от остальных.' },
      { heading: 'Реализуйте спокойно', text: 'При преимуществе выбирайте простые ходы, сохраняющие контроль. Остановить контригру важнее быстрой добычи.' },
    ],
  },
  {
    id: 11, title: 'Back Rank Guard',
    duration: '6 min', category: 'Strategy',
    description: 'Keep the promotion row protected without freezing your whole position.',
    content: [
      { heading: 'Guard the King Row', text: 'A back-rank piece stops easy promotion and forces the opponent to work for every king.' },
      { heading: 'One Guard Is Enough', text: 'Do not freeze four pieces forever. Keep one guard, then use the rest to fight for space.' },
      { heading: 'Release With Purpose', text: 'Move the guard only when it joins a threat or prevents a stronger breakthrough.' },
      { heading: 'Stay Active', text: 'Defense must still create pressure. Passive guards eventually become targets.' },
    ],
  },
  {
    id: 12, title: 'Majority Captures',
    duration: '7 min', category: 'Tactics',
    description: 'Practice the maximum-capture rule and learn how it shapes combinations.',
    content: [
      { heading: 'Count Every Branch', text: 'When several captures are available, compare full lines, not only the first jump.' },
      { heading: 'Maximum Capture', text: 'International Draughts requires the line that captures the most pieces.' },
      { heading: 'Force Bad Landings', text: 'You can offer material so the opponent must take more pieces and land badly.' },
      { heading: 'Prepare the Reply', text: 'A forced capture is strongest when the final square is already controlled.' },
    ],
  },
  {
    id: 13, title: 'Breakthrough Patterns',
    duration: '8 min', category: 'Tactics',
    description: 'Clear a lane to promotion with sacrifice, timing, and blockers.',
    content: [
      { heading: 'Choose the Runner', text: 'Pick the piece with the clearest promotion path, not just the most advanced piece.' },
      { heading: 'Remove the Defender', text: 'Trade or lure away the piece that controls your runner.' },
      { heading: 'Use a Sacrifice', text: 'A small sacrifice can open the diagonal your runner needs.' },
      { heading: 'Run at the Right Moment', text: 'Start the breakthrough when every reply either fails or gives you promotion.' },
    ],
  },
  {
    id: 14, title: 'Flying King Geometry',
    duration: '9 min', category: 'Advanced',
    description: 'Use long diagonals to control routes and create double threats.',
    content: [
      { heading: 'Long Diagonals', text: 'A flying king is strongest when it controls several routes from one square.' },
      { heading: 'Cut the Board', text: 'Place the king where enemy pieces cannot cross safely.' },
      { heading: 'Switch Wings', text: 'Use king mobility to attack whichever side the opponent weakens.' },
      { heading: 'Control First', text: 'Do not chase one piece if it means abandoning the important diagonal.' },
    ],
  },
  {
    id: 15, title: 'Planning Under Time Pressure',
    duration: '5 min', category: 'Basics',
    description: 'Make reliable bullet and blitz decisions without calculating every line.',
    content: [
      { heading: 'Find Candidate Moves', text: 'Quickly choose two or three reasonable moves before deciding.' },
      { heading: 'Check Captures First', text: 'Mandatory captures decide many fast games, so scan for them first.' },
      { heading: 'Choose Simple Control', text: 'In time trouble, a stable move often beats a risky tactic you cannot verify.' },
      { heading: 'Use the Clock', text: 'Do not spend all your time seeking perfection. Good and fast wins many blitz positions.' },
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
  color: var(--btn-ink);
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
  color: var(--btn-ink);
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
