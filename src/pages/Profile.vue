<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n.js'

const router = useRouter()
const { t } = useI18n()
const user = ref(JSON.parse(localStorage.getItem('wc_user') || 'null'))

if (!user.value) router.push('/login')

const gamesWon   = computed(() => user.value?.gamesWon   || 0)
const gamesLost  = computed(() => user.value?.gamesLost  || 0)
const gamesDraws = computed(() => user.value?.gamesDraws || 0)
const totalGames = computed(() => gamesWon.value + gamesLost.value + gamesDraws.value)
const winRate    = computed(() => totalGames.value === 0 ? 0 : Math.round((gamesWon.value / totalGames.value) * 100))

const totalPlayers = 48291
const userElo = computed(() => user.value?.elo || 1000)
const betterThan = computed(() => {
  const rank = Math.floor((1 - (userElo.value - 800) / 1600) * totalPlayers)
  return Math.max(0, Math.min(99, Math.round((1 - rank / totalPlayers) * 100)))
})

const eloLevel = computed(() => {
  const elo = userElo.value
  if (elo >= 2000) return { label: t.value.profile.eloGrandMaster, color: '#9b59b6', icon: '👑' }
  if (elo >= 1700) return { label: t.value.profile.eloExpert,       color: '#c0392b', icon: '⭐' }
  if (elo >= 1400) return { label: t.value.profile.eloIntermediate, color: '#e67e22', icon: '🔥' }
  if (elo >= 1100) return { label: t.value.profile.eloDeveloping,   color: '#27ae60', icon: '📈' }
  return { label: t.value.profile.eloBeginner, color: '#7fa650', icon: '🌱' }
})

// ELO title progression
const titles = computed(() => [
  { elo: 1100, key: 'acm', short: 'ACM' },
  { elo: 1400, key: 'afm', short: 'AFM' },
  { elo: 1700, key: 'aim', short: 'AIM' },
  { elo: 2000, key: 'agm', short: 'AGM' },
])
const nextTitle = computed(() => titles.value.find(tt => userElo.value < tt.elo) || null)
const sliderMin = 800
const sliderMax = 2200
const eloPercent = computed(() => Math.max(0, Math.min(100, ((userElo.value - sliderMin) / (sliderMax - sliderMin)) * 100)))
const titlePercent = (elo) => Math.max(0, Math.min(100, ((elo - sliderMin) / (sliderMax - sliderMin)) * 100))

const fullName = computed(() => {
  const fn = user.value?.firstName || user.value?.user_metadata?.firstName || ''
  const ln = user.value?.lastName  || user.value?.user_metadata?.lastName  || ''
  return [fn, ln].filter(Boolean).join(' ') || user.value?.username || user.value?.email?.split('@')[0] || 'Player'
})

// Load match history from localStorage (saved by friend games)
const storedHistory = ref([])
onMounted(() => {
  try {
    storedHistory.value = JSON.parse(localStorage.getItem('wc_game_history') || '[]')
  } catch(e) {
    storedHistory.value = []
  }
})
const recentGames = computed(() => storedHistory.value)

const premiumFeatures = [
  { icon: '🤖', name: 'AI Post-Match Analysis',        desc: 'Get move-by-move analysis of every game' },
  { icon: '📊', name: 'Skill Improvement Tracking',    desc: 'See your strengths and weaknesses over time' },
  { icon: '🎨', name: 'Custom Board Designs',          desc: 'Unlock exclusive piece sets and board themes' },
  { icon: '🏅', name: 'Premium Profile Badge',         desc: 'Gold PRO badge displayed next to your username' },
  { icon: '📚', name: 'AI-Powered Lessons',            desc: 'Personalized lessons based on your game history' },
]
</script>

<template>
  <div v-if="user" style="max-width:900px; margin:0 auto; padding:40px 20px;">

    <!-- Profile header -->
    <div class="card" style="display:flex; align-items:center; gap:24px; margin-bottom:24px; flex-wrap:wrap;">
      <div :style="{
        width:'80px', height:'80px', borderRadius:'50%',
        background: 'linear-gradient(135deg, var(--amber), var(--amber-d))',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'30px', fontWeight:'700', color:'var(--btn-ink)', flexShrink:0,
      }">{{ fullName[0].toUpperCase() }}</div>

      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:6px;">
          <h1 style="font-size:22px; font-weight:700; color:var(--text0);">{{ fullName }}</h1>
          <span v-if="user.isPremium" style="background:var(--amber); color:var(--btn-ink); padding:2px 10px; border-radius:10px; font-size:13px; font-weight:700;">PRO</span>
          <span :style="{
            background: eloLevel.color + '22', color: eloLevel.color,
            border: '1px solid ' + eloLevel.color + '55',
            padding:'2px 10px', borderRadius:'10px', fontSize:'12px', fontWeight:'700',
          }">{{ eloLevel.icon }} {{ eloLevel.label }}</span>
        </div>
        <div style="font-size:13px; color:var(--text2);">
          {{ user.username }}
          <span v-if="user.createdAt"> · {{ t.profile.memberSince }} {{ new Date(user.createdAt).toLocaleDateString('en', { month:'long', year:'numeric' }) }}</span>
        </div>
      </div>

      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:36px; font-weight:800; color:var(--amber);">{{ userElo }}</div>
        <div style="font-size:13px; color:var(--text2);">{{ t.profile.eloRating }}</div>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:14px; margin-bottom:24px;">
      <div v-for="stat in [
        { label: t.profile.betterThan, value: betterThan + '%', sub: t.profile.ofAll },
        { label: t.profile.winRate,    value: winRate + '%',    sub: totalGames + ' ' + t.profile.gamesTotal },
        { label: t.profile.wins,       value: gamesWon,         sub: t.profile.totalWins },
        { label: t.profile.losses,     value: gamesLost,        sub: t.profile.totalLosses },
        { label: t.profile.draws,      value: gamesDraws,       sub: t.profile.totalDraws },
      ]" :key="stat.label" class="card" style="text-align:center;">
        <div style="font-size:26px; font-weight:700; color:var(--amber);">{{ stat.value }}</div>
        <div style="font-size:13px; font-weight:600; margin:3px 0; color:var(--text0);">{{ stat.label }}</div>
        <div style="font-size:12px; color:var(--text2);">{{ stat.sub }}</div>
      </div>
    </div>

    <!-- ELO Title Progression Slider -->
    <div class="card" style="margin-bottom:24px;">
      <div style="font-size:0.68rem; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;">
        {{ t.profile.titleProgress }}
      </div>

      <!-- Next title banner -->
      <div v-if="nextTitle" style="
        background:linear-gradient(135deg, rgba(33,100,200,0.12), rgba(33,100,200,0.06));
        border:1px solid rgba(33,100,200,0.3); border-radius:8px;
        padding:12px 16px; margin-bottom:16px; font-size:0.86rem; color:var(--text1);
        line-height:1.55;
      ">
        {{ t.profile.titleMaintain }} <strong style="color:var(--amber);">{{ nextTitle.elo }}</strong>
        {{ t.profile.titleFor }} 150 {{ t.profile.titleGames }}
        <strong style="color:var(--amber);">{{ t.profile[nextTitle.key] }}</strong>
        {{ t.profile.titleLabel }}
      </div>
      <div v-else style="font-size:0.86rem; color:var(--amber); margin-bottom:16px; font-weight:700;">
        👑 {{ t.profile.eloGrandMaster }}
      </div>

      <!-- Progress bar -->
      <div style="position:relative; margin:0 8px 24px;">
        <div style="height:8px; background:var(--ink3); border-radius:4px; overflow:hidden; position:relative;">
          <div :style="{ width: eloPercent + '%', height:'100%', background:'linear-gradient(90deg, var(--amber-d), var(--amber))', borderRadius:'4px', transition:'width 0.4s' }"/>
        </div>
        <!-- Current ELO marker -->
        <div :style="{
          position:'absolute', top:'-4px',
          left: 'calc(' + eloPercent + '% - 8px)',
          width:'16px', height:'16px', borderRadius:'50%',
          background:'var(--amber)', border:'2px solid var(--btn-ink)',
          boxShadow:'0 0 8px rgba(196,148,48,0.6)',
          transition:'left 0.4s',
        }"/>
        <!-- Title milestones -->
        <div v-for="tt in titles" :key="tt.elo"
          :style="{ position:'absolute', top:'12px', left:'calc('+titlePercent(tt.elo)+'% - 16px)', textAlign:'center', width:'32px' }">
          <div style="font-size:0.6rem; font-weight:800; color:var(--text3);">{{ tt.short }}</div>
          <div style="font-size:0.58rem; color:var(--text3);">{{ tt.elo }}</div>
        </div>
      </div>

      <!-- Title labels row -->
      <div style="display:flex; justify-content:space-between; margin-top:4px;">
        <span v-for="tt in titles" :key="tt.elo"
          :style="{
            fontSize:'0.62rem', fontWeight:'700',
            color: userElo >= tt.elo ? 'var(--amber)' : 'var(--text3)',
            background: userElo >= tt.elo ? 'rgba(196,148,48,0.1)' : 'transparent',
            padding:'2px 6px', borderRadius:'4px',
          }">
          {{ tt.short }}
        </span>
      </div>
    </div>

    <!-- Recent games -->
    <div class="card" style="margin-bottom:24px;">
      <h3 style="font-weight:700; font-size:15px; margin-bottom:14px; color:var(--text0);">{{ t.profile.recentGames }}</h3>
      <div v-if="recentGames.length === 0" style="color:var(--text2); font-size:14px; text-align:center; padding:20px;">
        {{ t.profile.noGamesYet }} <RouterLink to="/play" style="color:var(--amber);">{{ t.profile.playFirst }}</RouterLink>
      </div>
      <div v-for="game in recentGames" :key="game.id || game.date" style="
        display:flex; justify-content:space-between; align-items:center;
        padding:10px 0; border-bottom:1px solid var(--border);
        font-size:14px;
      ">
        <div>
          <div style="font-weight:600; color:var(--text0);">vs {{ game.opponent }}</div>
          <div style="font-size:12px; color:var(--text2);">{{ game.tc }} · {{ game.date }}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span :style="{
            fontWeight:'700', padding:'3px 10px', borderRadius:'4px', fontSize:'12px',
            background: game.result === 'Win' ? 'rgba(39,174,96,0.15)' : game.result === 'Draw' ? 'rgba(150,150,150,0.15)' : 'rgba(231,76,60,0.15)',
            color: game.result === 'Win' ? '#27ae60' : game.result === 'Draw' ? '#aaa' : '#e74c3c',
          }">{{ game.result }}</span>
          <span :style="{ fontWeight:'600', color: game.elo.startsWith('+') && game.elo !== '+0' ? '#27ae60' : game.elo.startsWith('-') ? '#e74c3c' : 'var(--text2)' }">{{ game.elo }}</span>
        </div>
      </div>
    </div>

    <!-- Premium upgrade -->
    <div v-if="!user.isPremium" style="
      background:linear-gradient(135deg, var(--ink2), var(--ink3));
      border: 1px solid var(--border2);
      border-radius:12px; padding:28px; color:var(--text0);
    ">
      <h3 style="font-size:20px; font-weight:700; margin-bottom:6px;">👑 {{ t.profile.upgradeTitle }}</h3>
      <p style="color:var(--text2); font-size:14px; margin-bottom:20px;">{{ t.profile.upgradeSub }}</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:24px;">
        <div v-for="f in premiumFeatures" :key="f.name" style="display:flex; gap:10px; align-items:flex-start;">
          <span style="font-size:20px; flex-shrink:0;">{{ f.icon }}</span>
          <div>
            <div style="font-weight:600; font-size:14px; color:var(--text0);">{{ f.name }}</div>
            <div style="font-size:12px; color:var(--text2);">{{ f.desc }}</div>
          </div>
        </div>
      </div>
      <RouterLink to="/premium" class="btn-primary" style="font-weight:700; font-size:15px; padding:12px 32px; text-decoration:none; display:inline-block;">
        {{ t.profile.upgradeBtn }}
      </RouterLink>
    </div>
  </div>
</template>
