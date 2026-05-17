<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n.js'

const router = useRouter()
const { t } = useI18n()

const selectedVariant    = ref('international')  // default: 10x10 International
const selectedMode       = ref(null)
const selectedTC         = ref('rapid')
const selectedDifficulty = ref('medium')
const selectedSide       = ref('white')

const variants = computed(() => [
  {
    id: 'international',
    icon: '♟',
    title: t.value.play.intlTitle,
    sub:   t.value.play.intlSub,
    desc:  t.value.play.intlDesc,
    badge: t.value.play.badge,
  },
  {
    id: 'russian',
    icon: '♞',
    title: t.value.play.ruTitle,
    sub:   t.value.play.ruSub,
    desc:  t.value.play.ruDesc,
    badge: null,
  },
])

const modes = computed(() => [
  { id:'local',  icon:'🤝', title: t.value.play.localTitle,  desc: t.value.play.localDesc  },
  { id:'vsBot',  icon:'🤖', title: t.value.play.botTitle,    desc: t.value.play.botDesc    },
  { id:'online', icon:'🌍', title: t.value.play.onlineTitle, desc: t.value.play.onlineDesc },
  { id:'friend', icon:'👥', title: t.value.play.friendTitle, desc: t.value.play.friendDesc },
])

const timeControls = computed(() => [
  { id:'bullet', label: t.value.play.bullet,    sub: t.value.play.tcMin1   },
  { id:'blitz',  label: t.value.play.blitz,     sub: t.value.play.tcMin3   },
  { id:'rapid',  label: t.value.play.rapidLabel,sub: t.value.play.tcMin10  },
  { id:'none',   label: t.value.play.unlimited, sub: t.value.play.tcNoTimer},
])

const difficulties = computed(() => [
  { id: 'easy',   label: t.value.play.easy   },
  { id: 'medium', label: t.value.play.medium  },
  { id: 'hard',   label: t.value.play.hard    },
])

const sides = computed(() => [
  { id: 'white',  label: t.value.play.playWhite },
  { id: 'black',  label: t.value.play.playBlack },
  { id: 'random', label: t.value.play.random    },
])

const startGame = () => {
  if (!selectedMode.value) return

  // Friend mode → go to lobby for invite link
  if (selectedMode.value === 'friend') {
    router.push(`/friend?variant=${selectedVariant.value}&tc=${selectedTC.value}`)
    return
  }

  // In pass&play (local) white always goes first — no side choice
  let side = selectedMode.value === 'local' ? 'white' : selectedSide.value
  if (side === 'random') side = Math.random() < 0.5 ? 'white' : 'black'
  const params = new URLSearchParams({
    mode: selectedMode.value,
    tc: selectedTC.value,
    variant: selectedVariant.value,
    difficulty: selectedDifficulty.value,
    side,
  })
  router.push(`/game?${params}`)
}
</script>

<template>
<div class="play-page">
  <h1 class="play-title">{{ t.play.title }}</h1>
  <p class="play-sub">{{ t.play.sub }}</p>

  <!-- ── Variant selection ── -->
  <div class="section-label">{{ t.play.variantLabel }}</div>
  <div class="variant-grid">
    <div v-for="v in variants" :key="v.id"
      class="variant-card"
      :class="{ selected: selectedVariant === v.id }"
      @click="selectedVariant = v.id">
      <div class="vc-top">
        <span class="vc-icon">{{ v.icon }}</span>
        <div class="vc-texts">
          <div class="vc-title">{{ v.title }}</div>
          <div class="vc-sub">{{ v.sub }}</div>
        </div>
        <span v-if="v.badge" class="vc-badge">{{ v.badge }}</span>
      </div>
      <p class="vc-desc">{{ v.desc }}</p>
    </div>
  </div>

  <!-- ── Game mode ── -->
  <div class="section-label">{{ t.play.modeLabel }}</div>
  <div class="mode-grid">
    <div v-for="mode in modes" :key="mode.id"
      class="mode-card"
      :class="{ selected: selectedMode === mode.id }"
      @click="selectedMode = mode.id">
      <div class="mc-icon">{{ mode.icon }}</div>
      <div class="mc-title">{{ mode.title }}</div>
      <div class="mc-desc">{{ mode.desc }}</div>
    </div>
  </div>

  <!-- ── Time control ── -->
  <div class="section-label">{{ t.play.tcLabel }}</div>
  <div class="tc-row">
    <button v-for="tc in timeControls" :key="tc.id"
      class="tc-btn"
      :class="{ selected: selectedTC === tc.id }"
      @click="selectedTC = tc.id">
      {{ tc.label }} <span class="tc-sub">{{ tc.sub }}</span>
    </button>
  </div>

  <!-- ── Bot difficulty + Side chooser (only for vsBot) ── -->
  <template v-if="selectedMode === 'vsBot'">
    <div class="section-label">{{ t.play.sideLabel }}</div>
    <div class="tc-row">
      <button v-for="s in sides" :key="s.id"
        class="tc-btn"
        :class="{ selected: selectedSide === s.id }"
        @click="selectedSide = s.id">
        {{ s.label }}
      </button>
    </div>
  </template>

  <!-- ── Bot difficulty (only for vsBot) ── -->
  <template v-if="selectedMode === 'vsBot'">
    <div class="section-label">{{ t.play.difficultyLabel }}</div>
    <div class="tc-row">
      <button v-for="d in difficulties" :key="d.id"
        class="tc-btn"
        :class="{ selected: selectedDifficulty === d.id }"
        @click="selectedDifficulty = d.id">
        {{ d.label }}
      </button>
    </div>
  </template>

  <!-- ── Start ── -->
  <button class="start-btn" :class="{ disabled: !selectedMode }" @click="startGame">
    {{ selectedMode ? '▶ ' + t.play.startGame : t.play.selectMode }}
  </button>

  <div v-if="selectedMode==='online'" class="online-note">
    {{ t.play.onlineNote }}
    <RouterLink to="/register">{{ t.play.signupFree }}</RouterLink>
  </div>
</div>
</template>

<style scoped>
.play-page { max-width: 820px; margin: 0 auto; padding: 40px 24px 60px; }
.play-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; color: var(--text0); }
.play-sub   { color: var(--text2); font-size: .88rem; margin-bottom: 32px; }
.section-label {
  font-size: .72rem; font-weight: 700; color: var(--text3);
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 12px; margin-top: 28px;
}

/* Variants */
.variant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .variant-grid { grid-template-columns: 1fr; } }

.variant-card {
  background: var(--ink2); border: 2px solid var(--border);
  border-radius: 10px; padding: 16px;
  cursor: pointer; transition: all .15s;
}
.variant-card:hover { border-color: var(--border2); background: var(--ink3); }
.variant-card.selected { border-color: var(--amber); background: rgba(196,148,48,.06); }

.vc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.vc-icon { font-size: 1.6rem; flex-shrink: 0; }
.vc-texts { flex: 1; }
.vc-title { font-size: .92rem; font-weight: 700; color: var(--text0); }
.vc-sub   { font-size: .75rem; color: var(--text3); }
.vc-badge {
  background: rgba(196,148,48,.15); border: 1px solid rgba(196,148,48,.3);
  color: var(--amber); font-size: .65rem; font-weight: 800;
  padding: 2px 8px; border-radius: 10px; white-space: nowrap;
}
.vc-desc { font-size: .78rem; color: var(--text2); line-height: 1.4; }

/* Modes */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}
.mode-card {
  background: var(--ink2); border: 2px solid var(--border);
  border-radius: 9px; padding: 16px;
  cursor: pointer; transition: all .15s;
}
.mode-card:hover { border-color: var(--border2); background: var(--ink3); }
.mode-card.selected { border-color: var(--amber); background: rgba(196,148,48,.06); }
.mc-icon  { font-size: 1.5rem; margin-bottom: 8px; }
.mc-title { font-size: .88rem; font-weight: 700; color: var(--text0); margin-bottom: 4px; }
.mc-desc  { font-size: .75rem; color: var(--text2); line-height: 1.4; }

/* Time control */
.tc-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tc-btn {
  background: var(--ink2); border: 2px solid var(--border); color: var(--text2);
  padding: 9px 18px; border-radius: 7px;
  cursor: pointer; font-size: .85rem; font-weight: 600;
  transition: all .15s; font-family: inherit;
}
.tc-btn:hover { border-color: var(--border2); color: var(--text0); }
.tc-btn.selected { border-color: var(--amber); color: var(--amber); background: rgba(196,148,48,.06); }
.tc-sub { font-size: .72rem; opacity: .75; }

/* Start */
.start-btn {
  margin-top: 28px;
  width: 100%; max-width: 300px;
  background: var(--amber); color: var(--btn-ink); border: none;
  padding: 14px; border-radius: 7px;
  font-weight: 800; font-size: .95rem; cursor: pointer;
  transition: background .15s; display: block;
}
.start-btn:hover { background: var(--amber-l); }
.start-btn.disabled { background: var(--ink3); color: var(--text3); cursor: not-allowed; }

.online-note {
  margin-top: 14px; padding: 12px 14px;
  background: var(--ink2); border: 1px solid var(--border);
  border-radius: 7px; font-size: .82rem; color: var(--text2);
}
.online-note a { color: var(--amber); font-weight: 700; margin-left: 4px; }
</style>
