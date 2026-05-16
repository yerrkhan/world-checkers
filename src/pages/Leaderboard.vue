<script setup>
import { ref, computed } from 'vue'

const fmjdTab = ref('standard')
const eloTab  = ref('bullet')

// FMJD Over-the-board rankings
const fmjdRankings = {
  standard: [
    { rank:1,  name:'Roel Boomstra',      country:'NED', flag:'🇳🇱', rating:2591, title:'GM' },
    { rank:2,  name:'Alexander Georgiev', country:'RUS', flag:'🇷🇺', rating:2562, title:'GM' },
    { rank:3,  name:'Mart Nagel',         country:'NED', flag:'🇳🇱', rating:2538, title:'GM' },
    { rank:4,  name:'Alexei Chizhov',     country:'RUS', flag:'🇷🇺', rating:2519, title:'GM' },
    { rank:5,  name:'Norbert Cottens',    country:'BEL', flag:'🇧🇪', rating:2497, title:'GM' },
    { rank:6,  name:'Jan Groenendijk',    country:'NED', flag:'🇳🇱', rating:2476, title:'GM' },
    { rank:7,  name:'Ivan Kovalev',       country:'BLR', flag:'🇧🇾', rating:2458, title:'GM' },
    { rank:8,  name:'Daniil Misyans',     country:'RUS', flag:'🇷🇺', rating:2441, title:'IM' },
    { rank:9,  name:'Kai Goverts',        country:'NED', flag:'🇳🇱', rating:2429, title:'IM' },
    { rank:10, name:'Timur Begimbekov',   country:'KAZ', flag:'🇰🇿', rating:2417, title:'IM' },
  ],
  blitz: [
    { rank:1,  name:'Alexander Georgiev', country:'RUS', flag:'🇷🇺', rating:2540, title:'GM' },
    { rank:2,  name:'Roel Boomstra',      country:'NED', flag:'🇳🇱', rating:2518, title:'GM' },
    { rank:3,  name:'Alexei Chizhov',     country:'RUS', flag:'🇷🇺', rating:2494, title:'GM' },
    { rank:4,  name:'Jan Groenendijk',    country:'NED', flag:'🇳🇱', rating:2471, title:'GM' },
    { rank:5,  name:'Norbert Cottens',    country:'BEL', flag:'🇧🇪', rating:2452, title:'GM' },
    { rank:6,  name:'Ivan Kovalev',       country:'BLR', flag:'🇧🇾', rating:2438, title:'GM' },
    { rank:7,  name:'Mart Nagel',         country:'NED', flag:'🇳🇱', rating:2420, title:'GM' },
    { rank:8,  name:'Timur Begimbekov',   country:'KAZ', flag:'🇰🇿', rating:2405, title:'IM' },
    { rank:9,  name:'Daniil Misyans',     country:'RUS', flag:'🇷🇺', rating:2389, title:'IM' },
    { rank:10, name:'Kai Goverts',        country:'NED', flag:'🇳🇱', rating:2374, title:'IM' },
  ],
  rapid: [
    { rank:1,  name:'Mart Nagel',         country:'NED', flag:'🇳🇱', rating:2557, title:'GM' },
    { rank:2,  name:'Roel Boomstra',      country:'NED', flag:'🇳🇱', rating:2533, title:'GM' },
    { rank:3,  name:'Alexander Georgiev', country:'RUS', flag:'🇷🇺', rating:2508, title:'GM' },
    { rank:4,  name:'Ivan Kovalev',       country:'BLR', flag:'🇧🇾', rating:2486, title:'GM' },
    { rank:5,  name:'Alexei Chizhov',     country:'RUS', flag:'🇷🇺', rating:2463, title:'GM' },
    { rank:6,  name:'Norbert Cottens',    country:'BEL', flag:'🇧🇪', rating:2445, title:'GM' },
    { rank:7,  name:'Timur Begimbekov',   country:'KAZ', flag:'🇰🇿', rating:2428, title:'IM' },
    { rank:8,  name:'Jan Groenendijk',    country:'NED', flag:'🇳🇱', rating:2411, title:'GM' },
    { rank:9,  name:'Daniil Misyans',     country:'RUS', flag:'🇷🇺', rating:2394, title:'IM' },
    { rank:10, name:'Kai Goverts',        country:'NED', flag:'🇳🇱', rating:2378, title:'IM' },
  ],
}

// ELO Rated rankings
const eloRankings = {
  bullet: [
    { rank:1,  name:'DraughtsMaster_KZ', flag:'🇰🇿', rating:2568, title:'GM' },
    { rank:2,  name:'SpeedKing_RU',      flag:'🇷🇺', rating:2554, title:'GM' },
    { rank:3,  name:'BlitzBoss_NL',      flag:'🇳🇱', rating:2536, title:'IM' },
    { rank:4,  name:'FastMover_DE',      flag:'🇩🇪', rating:2443, title:'IM' },
    { rank:5,  name:'RapidFire_RU',      flag:'🇷🇺', rating:2405, title:'FM' },
    { rank:6,  name:'BulletAce_FR',      flag:'🇫🇷', rating:2403, title:'FM' },
    { rank:7,  name:'QuickDraw_PL',      flag:'🇵🇱', rating:2396, title:'AGM' },
    { rank:8,  name:'AlmataSpeed',       flag:'🇰🇿', rating:2390, title:'AGM' },
    { rank:9,  name:'LightningFoot_AR',  flag:'🇦🇷', rating:2390, title:'AGM' },
    { rank:10, name:'NightOwl_TR',       flag:'🇹🇷', rating:2387, title:'AGM' },
  ],
  blitz: [
    { rank:1,  name:'BlitzKing_NL',      flag:'🇳🇱', rating:2601, title:'GM' },
    { rank:2,  name:'CheckerFlash_RU',   flag:'🇷🇺', rating:2578, title:'GM' },
    { rank:3,  name:'DraughtsMaster_KZ', flag:'🇰🇿', rating:2551, title:'GM' },
    { rank:4,  name:'StrikeForce_BE',    flag:'🇧🇪', rating:2527, title:'IM' },
    { rank:5,  name:'TimePressure_US',   flag:'🇺🇸', rating:2499, title:'IM' },
    { rank:6,  name:'ThunderMove_DE',    flag:'🇩🇪', rating:2476, title:'IM' },
    { rank:7,  name:'NurSultan_Pro',     flag:'🇰🇿', rating:2452, title:'FM' },
    { rank:8,  name:'BoltCheck_FR',      flag:'🇫🇷', rating:2428, title:'FM' },
    { rank:9,  name:'RushMaster_PL',     flag:'🇵🇱', rating:2407, title:'AGM' },
    { rank:10, name:'SpeedPiece_IT',     flag:'🇮🇹', rating:2384, title:'AGM' },
  ],
  rapid: [
    { rank:1,  name:'CheckerKing_RU',    flag:'🇷🇺', rating:2620, title:'GM' },
    { rank:2,  name:'PositionGod_NL',    flag:'🇳🇱', rating:2597, title:'GM' },
    { rank:3,  name:'BoardWizard_FR',    flag:'🇫🇷', rating:2571, title:'GM' },
    { rank:4,  name:'AlmataKing',        flag:'🇰🇿', rating:2548, title:'GM' },
    { rank:5,  name:'DeepThinker_DE',    flag:'🇩🇪', rating:2519, title:'IM' },
    { rank:6,  name:'StrategistPro_BE',  flag:'🇧🇪', rating:2495, title:'IM' },
    { rank:7,  name:'CalculatorPL',      flag:'🇵🇱', rating:2471, title:'IM' },
    { rank:8,  name:'MasterMind_US',     flag:'🇺🇸', rating:2448, title:'FM' },
    { rank:9,  name:'DraughtsMaster_KZ', flag:'🇰🇿', rating:2424, title:'GM' },
    { rank:10, name:'SlowBurn_TR',       flag:'🇹🇷', rating:2401, title:'FM' },
  ],
  classic: [
    { rank:1,  name:'GrandOld_NL',       flag:'🇳🇱', rating:2644, title:'GM' },
    { rank:2,  name:'TimelessMaster_RU', flag:'🇷🇺', rating:2618, title:'GM' },
    { rank:3,  name:'ClocklessKing_FR',  flag:'🇫🇷', rating:2589, title:'GM' },
    { rank:4,  name:'PatienceGod_DE',    flag:'🇩🇪', rating:2563, title:'IM' },
    { rank:5,  name:'ThinkLong_KZ',      flag:'🇰🇿', rating:2539, title:'IM' },
    { rank:6,  name:'InfinityPlay_PL',   flag:'🇵🇱', rating:2511, title:'IM' },
    { rank:7,  name:'NoClock_US',        flag:'🇺🇸', rating:2487, title:'FM' },
    { rank:8,  name:'FullTime_BE',       flag:'🇧🇪', rating:2462, title:'FM' },
    { rank:9,  name:'ClassicStyle_TR',   flag:'🇹🇷', rating:2438, title:'AGM' },
    { rank:10, name:'DeepGame_IT',       flag:'🇮🇹', rating:2415, title:'AGM' },
  ],
  puzzles: [
    { rank:1,  name:'PuzzleMaster_NL',   flag:'🇳🇱', rating:3201, title:'GM' },
    { rank:2,  name:'TacticKing_RU',     flag:'🇷🇺', rating:3187, title:'GM' },
    { rank:3,  name:'SolverPro_KZ',      flag:'🇰🇿', rating:3162, title:'GM' },
    { rank:4,  name:'PuzzleGod_FR',      flag:'🇫🇷', rating:3148, title:'IM' },
    { rank:5,  name:'TacticStar_DE',     flag:'🇩🇪', rating:3124, title:'IM' },
    { rank:6,  name:'BrainTease_US',     flag:'🇺🇸', rating:3109, title:'IM' },
    { rank:7,  name:'MindBender_PL',     flag:'🇵🇱', rating:3091, title:'FM' },
    { rank:8,  name:'Riddles_BE',        flag:'🇧🇪', rating:3078, title:'FM' },
    { rank:9,  name:'Enigma_TR',         flag:'🇹🇷', rating:3052, title:'AGM' },
    { rank:10, name:'Teaser_IT',         flag:'🇮🇹', rating:3031, title:'AGM' },
  ],
}

const fmjdTabs = ['standard', 'blitz', 'rapid']
const eloTabs  = ['bullet', 'blitz', 'rapid', 'classic', 'puzzles']

const currentFmjd = computed(() => fmjdRankings[fmjdTab.value])
const currentElo  = computed(() => eloRankings[eloTab.value])

const rankColor = (rank) => rank === 1 ? '#f5b623' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : '#555'
const titleColor = (t) => t === 'GM' ? '#e53935' : t === 'IM' ? '#f57c00' : t === 'FM' ? '#43a047' : '#1e88e5'
const medal = (r) => r <= 3 ? ['🥇','🥈','🥉'][r-1] : `#${r}`

const currentUser = ref(JSON.parse(localStorage.getItem('wc_user') || 'null'))
const userElo = currentUser.value?.elo || 1000
const totalPlayers = 48291
const userRank = Math.floor((1 - (userElo - 800) / 1600) * totalPlayers)
const betterThan = Math.max(0, Math.min(99, Math.round((1 - userRank / totalPlayers) * 100)))
</script>

<template>
<div class="lb-page">
  <div class="lb-header">
    <h1 class="lb-title">Players</h1>
    <p class="lb-sub">Official FMJD rankings · Online ELO ratings</p>
  </div>

  <!-- Your stats (only when logged in) -->
  <div v-if="currentUser" class="your-stats">
    <div class="ys-item">
      <div class="ys-label">Your Rating</div>
      <div class="ys-value gold">{{ userElo }}</div>
    </div>
    <div class="ys-sep"/>
    <div class="ys-item">
      <div class="ys-label">Better than</div>
      <div class="ys-value gold">{{ betterThan }}%</div>
      <div class="ys-tiny">of all players</div>
    </div>
    <div class="ys-sep"/>
    <div class="ys-item">
      <div class="ys-label">World Rank</div>
      <div class="ys-value">#{{ userRank.toLocaleString() }}</div>
    </div>
  </div>

  <!-- Two-column layout: FMJD left, ELO right -->
  <div class="two-col">

    <!-- ── LEFT: FMJD Over-the-board ── -->
    <div class="col-card">
      <div class="col-head">
        <div class="col-icon">🏛</div>
        <div>
          <div class="col-title">FMJD Over-the-board</div>
          <div class="col-desc">Official FMJD classical ratings</div>
        </div>
      </div>

      <div class="tab-row">
        <button v-for="t in fmjdTabs" :key="t"
          class="tab-btn" :class="{ active: fmjdTab === t }"
          @click="fmjdTab = t">
          {{ t.charAt(0).toUpperCase() + t.slice(1) }}
        </button>
      </div>

      <div class="rank-table">
        <div v-for="p in currentFmjd" :key="p.rank" class="rank-row">
          <div class="rank-num" :style="{ color: rankColor(p.rank) }">{{ medal(p.rank) }}</div>
          <div class="rank-ava purple">{{ p.name[0] }}</div>
          <div class="rank-info">
            <div class="rank-name">{{ p.name }}
              <span class="title-badge" :style="{ color: titleColor(p.title), background: titleColor(p.title)+'22' }">{{ p.title }}</span>
            </div>
            <div class="rank-country">{{ p.flag }} {{ p.country }}</div>
          </div>
          <div class="rank-rating">{{ p.rating }}</div>
        </div>
      </div>
      <div class="see-more">Show full FMJD rating list →</div>
    </div>

    <!-- ── RIGHT: ELO Rated ── -->
    <div class="col-card">
      <div class="col-head">
        <div class="col-icon">⚡</div>
        <div>
          <div class="col-title">ELO Rated</div>
          <div class="col-desc">Online platform ratings by time control</div>
        </div>
      </div>

      <div class="tab-row">
        <button v-for="t in eloTabs" :key="t"
          class="tab-btn" :class="{ active: eloTab === t }"
          @click="eloTab = t">
          {{ t.charAt(0).toUpperCase() + t.slice(1) }}
        </button>
      </div>

      <div class="rank-table">
        <div v-for="p in currentElo" :key="p.rank" class="rank-row">
          <div class="rank-num" :style="{ color: rankColor(p.rank) }">{{ medal(p.rank) }}</div>
          <div class="rank-ava gold-ava">{{ p.name[0] }}</div>
          <div class="rank-info">
            <div class="rank-name">{{ p.name }}
              <span class="title-badge" :style="{ color: titleColor(p.title), background: titleColor(p.title)+'22' }">{{ p.title }}</span>
            </div>
            <div class="rank-country">{{ p.flag }}</div>
          </div>
          <div class="rank-rating gold">{{ p.rating }}</div>
        </div>
      </div>
      <div class="see-more">Show full ELO rating list →</div>
    </div>

  </div><!-- /two-col -->

  <div v-if="!currentUser" class="cta-row">
    <RouterLink to="/register" class="cta-btn">Create account to see your ranking →</RouterLink>
  </div>
</div>
</template>

<style scoped>
.lb-page { max-width: 1200px; margin: 0 auto; padding: 44px 24px 80px; background: var(--ink); min-height: 100vh; color: var(--text0); }

.lb-header { margin-bottom: 28px; }
.lb-title { font-size: 1.6rem; font-weight: 800; color: var(--text0); margin-bottom: 6px; letter-spacing: -0.3px; }
.lb-sub   { color: var(--text2); font-size: .88rem; }

/* Your stats */
.your-stats {
  display: flex; align-items: center;
  background: var(--ink2);
  border: 1px solid rgba(196,148,48,0.2);
  border-radius: 10px; padding: 20px 28px;
  margin-bottom: 28px; flex-wrap: wrap; gap: 8px;
}
.ys-item  { flex: 1; text-align: center; min-width: 80px; }
.ys-label { font-size: .68rem; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 600; }
.ys-value { font-size: 1.75rem; font-weight: 900; color: var(--text1); }
.ys-value.gold { color: var(--amber); }
.ys-tiny  { font-size: .68rem; color: var(--text3); }
.ys-sep   { width: 1px; height: 36px; background: var(--border2); flex-shrink: 0; margin: 0 16px; }

/* Two column layout */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 800px) {
  .two-col { grid-template-columns: 1fr; }
}

.col-card {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.col-head {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);
}
.col-icon { font-size: 1.2rem; }
.col-title { font-size: .88rem; font-weight: 700; color: var(--text0); margin-bottom: 2px; }
.col-desc  { font-size: .72rem; color: var(--text3); }

.tab-row {
  display: flex; gap: 3px;
  padding: 8px 14px;
  background: var(--ink1);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text2);
  padding: 5px 11px;
  border-radius: 5px;
  font-size: .76rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: color .15s, background .15s;
  text-transform: capitalize;
}
.tab-btn:hover { color: var(--text0); background: rgba(255,255,255,.04); }
.tab-btn.active { background: var(--amber); color: #0b0e15; }

.rank-table { display: flex; flex-direction: column; }
.rank-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  transition: background .12s;
}
.rank-row:hover { background: rgba(255,255,255,0.025); }
.rank-row:last-child { border-bottom: none; }

.rank-num {
  font-size: .84rem; font-weight: 800;
  min-width: 28px; text-align: center;
}
.rank-ava {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .74rem;
  flex-shrink: 0;
}
.purple  { background: rgba(100,80,180,0.3); color: #a090e0; border: 1px solid rgba(100,80,180,0.4); }
.gold-ava{ background: rgba(196,148,48,0.2); color: var(--amber); border: 1px solid rgba(196,148,48,0.35); }

.rank-info { flex: 1; min-width: 0; }
.rank-name {
  font-size: .82rem; font-weight: 600; color: var(--text0);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center; gap: 5px;
}
.rank-country { font-size: .7rem; color: var(--text3); margin-top: 2px; }

.title-badge {
  font-size: .62rem; font-weight: 700;
  padding: 1px 5px; border-radius: 3px;
  white-space: nowrap; flex-shrink: 0;
}
.rank-rating {
  font-size: .9rem; font-weight: 800;
  color: var(--text2); font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.rank-rating.gold { color: var(--amber); }

.see-more {
  padding: 10px 16px;
  font-size: .75rem;
  color: var(--amber);
  cursor: pointer;
  border-top: 1px solid var(--border);
  background: var(--ink1);
  transition: opacity .15s;
}
.see-more:hover { opacity: 0.75; }

.cta-row { margin-top: 28px; text-align: center; }
.cta-btn {
  display: inline-block;
  background: var(--amber); color: #0b0e15;
  padding: 11px 24px; border-radius: 6px;
  font-weight: 700; font-size: .88rem;
  text-decoration: none; transition: background .15s;
}
.cta-btn:hover { background: var(--amber-l); }
</style>
