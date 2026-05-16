<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('wc_user') || 'null'))

if (!user.value) router.push('/login')

const totalGames = computed(() => (user.value?.gamesWon || 0) + (user.value?.gamesLost || 0))
const winRate = computed(() => totalGames.value === 0 ? 0 : Math.round((user.value.gamesWon / totalGames.value) * 100))

const totalPlayers = 48291
const userElo = computed(() => user.value?.elo || 1000)
const betterThan = computed(() => {
  const rank = Math.floor((1 - (userElo.value - 800) / 1600) * totalPlayers)
  return Math.max(0, Math.min(99, Math.round((1 - rank / totalPlayers) * 100)))
})

const eloLevel = computed(() => {
  const elo = userElo.value
  if (elo >= 2000) return { label: 'Grand Master', color: '#9b59b6', icon: '👑' }
  if (elo >= 1700) return { label: 'Expert', color: '#c0392b', icon: '⭐' }
  if (elo >= 1400) return { label: 'Intermediate', color: '#e67e22', icon: '🔥' }
  if (elo >= 1100) return { label: 'Developing', color: '#27ae60', icon: '📈' }
  return { label: 'Beginner', color: '#7fa650', icon: '🌱' }
})

const recentGames = [
  { opponent: 'Bot (Easy)', result: 'Win', elo: '+16', tc: 'Rapid', date: '2 hours ago' },
  { opponent: 'Bot (Medium)', result: 'Loss', elo: '-16', tc: 'Blitz', date: '3 hours ago' },
  { opponent: 'Pass & Play', result: 'Win', elo: '+0', tc: 'No timer', date: '1 day ago' },
]

const premiumFeatures = [
  { icon: '🤖', name: 'AI Post-Match Analysis', desc: 'Get move-by-move analysis of every game' },
  { icon: '📊', name: 'Skill Improvement Tracking', desc: 'See your strengths and weaknesses over time' },
  { icon: '🎨', name: 'Custom Board Designs', desc: 'Unlock exclusive piece sets and board themes' },
  { icon: '🏅', name: 'Premium Profile Badge', desc: 'Gold PRO badge displayed next to your username' },
  { icon: '📚', name: 'AI-Powered Lessons', desc: 'Personalized lessons based on your game history' },
]

const analysisUsed = ref(1)
const analysisLimit = 2
</script>

<template>
  <div v-if="user" style="max-width:900px; margin:0 auto; padding:40px 20px;">

    <!-- Profile header -->
    <div class="card" style="display:flex; align-items:center; gap:24px; margin-bottom:24px; flex-wrap:wrap;">
      <div :style="{
        width:'80px', height:'80px', borderRadius:'50%',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'30px', fontWeight:'700', color:'white', flexShrink:0,
      }">{{ (user.username || 'U')[0].toUpperCase() }}</div>

      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:6px;">
          <h1 style="font-size:24px; font-weight:700;">{{ user.username }}</h1>
          <span v-if="user.isPremium" style="background:gold; color:#333; padding:2px 10px; border-radius:10px; font-size:13px; font-weight:700;">PRO</span>
          <span :style="{
            background: eloLevel.color, color:'white',
            padding:'2px 10px', borderRadius:'10px', fontSize:'12px', fontWeight:'700',
          }">{{ eloLevel.icon }} {{ eloLevel.label }}</span>
        </div>
        <div style="font-size:14px; color:var(--text-secondary);">
          🇰🇿 Kazakhstan · Member since {{ new Date(user.createdAt).toLocaleDateString('en', { month:'long', year:'numeric' }) }}
        </div>
      </div>

      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:36px; font-weight:800; color:var(--accent);">{{ userElo }}</div>
        <div style="font-size:13px; color:var(--text-secondary);">ELO Rating</div>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:14px; margin-bottom:24px;">
      <div v-for="stat in [
        { label: 'Better than', value: betterThan + '%', sub: 'of all players' },
        { label: 'Win Rate', value: winRate + '%', sub: totalGames + ' games total' },
        { label: 'Wins', value: user.gamesWon, sub: 'total wins' },
        { label: 'Losses', value: user.gamesLost, sub: 'total losses' },
      ]" :key="stat.label" class="card" style="text-align:center;">
        <div style="font-size:26px; font-weight:700; color:var(--accent);">{{ stat.value }}</div>
        <div style="font-size:13px; font-weight:600; margin:3px 0;">{{ stat.label }}</div>
        <div style="font-size:12px; color:var(--text-secondary);">{{ stat.sub }}</div>
      </div>
    </div>

    <!-- Free analysis status -->
    <div class="card" style="margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="font-weight:700; font-size:15px;">Post-Match Analysis (Free)</h3>
        <span style="font-size:13px; color:var(--text-secondary);">{{ analysisUsed }} / {{ analysisLimit }} used today</span>
      </div>
      <div style="width:100%; height:8px; background:var(--bg-surface); border-radius:4px; margin-bottom:12px; overflow:hidden;">
        <div :style="{ width: (analysisUsed/analysisLimit*100)+'%', height:'100%', background:'var(--accent)', borderRadius:'4px' }"/>
      </div>
      <p style="font-size:13px; color:var(--text-secondary);">
        Free users get {{ analysisLimit }} analyses per day.
        <button class="btn-primary" style="font-size:12px; padding:4px 14px; margin-left:8px;">Upgrade for unlimited</button>
      </p>
    </div>

    <!-- Recent games -->
    <div class="card" style="margin-bottom:24px;">
      <h3 style="font-weight:700; font-size:15px; margin-bottom:14px;">Recent Games</h3>
      <div v-if="recentGames.length === 0" style="color:var(--text-secondary); font-size:14px; text-align:center; padding:20px;">
        No games yet. <RouterLink to="/play" style="color:var(--accent);">Play your first game →</RouterLink>
      </div>
      <div v-for="game in recentGames" :key="game.date" style="
        display:flex; justify-content:space-between; align-items:center;
        padding:10px 0; border-bottom:1px solid var(--border);
        font-size:14px;
      ">
        <div>
          <div style="font-weight:600;">vs {{ game.opponent }}</div>
          <div style="font-size:12px; color:var(--text-secondary);">{{ game.tc }} · {{ game.date }}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span :style="{
            fontWeight:'700', padding:'3px 10px', borderRadius:'4px',
            background: game.result === 'Win' ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)',
            color: game.result === 'Win' ? '#27ae60' : '#e74c3c',
          }">{{ game.result }}</span>
          <span :style="{ fontWeight:'600', color: game.elo.startsWith('+') ? '#27ae60' : '#e74c3c' }">{{ game.elo }}</span>
        </div>
      </div>
    </div>

    <!-- Premium upgrade -->
    <div v-if="!user.isPremium" style="
      background:linear-gradient(135deg, #1e2023, #2d3436);
      border-radius:12px; padding:28px; color:white;
    ">
      <h3 style="font-size:20px; font-weight:700; margin-bottom:6px;">👑 Upgrade to Premium</h3>
      <p style="color:#aaa; font-size:14px; margin-bottom:20px;">Unlock the full World Checkers experience.</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:24px;">
        <div v-for="f in premiumFeatures" :key="f.name" style="display:flex; gap:10px; align-items:flex-start;">
          <span style="font-size:20px; flex-shrink:0;">{{ f.icon }}</span>
          <div>
            <div style="font-weight:600; font-size:14px;">{{ f.name }}</div>
            <div style="font-size:12px; color:#888;">{{ f.desc }}</div>
          </div>
        </div>
      </div>
      <button class="btn-primary" style="background:gold; color:#333; font-weight:700; font-size:16px; padding:12px 32px;">
        Upgrade to Premium
      </button>
    </div>
  </div>
</template>
