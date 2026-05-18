<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ensureUserProfile, supabase } from './supabase.js'
import { useI18n } from './i18n.js'

const { t, lang, setLang } = useI18n()
const route = useRoute()

const user = ref(null)
const mobileOpen = ref(false)
const lightMode = ref(localStorage.getItem('wc_theme') === 'light')
const notifOpen = ref(false)
const titlePopupOpen = ref(localStorage.getItem('wc_title_popup_closed') !== '1')
const titlePopupReady = ref(false)
const showTitlePopup = computed(() => titlePopupReady.value && titlePopupOpen.value && route.path === '/')
let titlePopupTimer = null

const toggleTheme = () => {
  lightMode.value = !lightMode.value
  document.documentElement.classList.toggle('light-mode', lightMode.value)
  localStorage.setItem('wc_theme', lightMode.value ? 'light' : 'dark')
}

const navItems = computed(() => [
  { label: t.value.nav.lobby,       path: '/' },
  { label: t.value.nav.tournaments, path: '/tournaments' },
  { label: t.value.nav.puzzles,     path: '/puzzles' },
  { label: t.value.nav.lessons,     path: '/lessons' },
  { label: t.value.nav.players,     path: '/leaderboard' },
])

const logout = async () => {
  await supabase.auth.signOut()
  localStorage.removeItem('wc_user')
  user.value = null
}

const closeTitlePopup = () => {
  titlePopupOpen.value = false
  localStorage.setItem('wc_title_popup_closed', '1')
}

onMounted(async () => {
  if (lightMode.value) document.documentElement.classList.add('light-mode')
  if (titlePopupOpen.value) {
    titlePopupTimer = setTimeout(() => {
      titlePopupReady.value = true
    }, 30000)
  }
  const saved = localStorage.getItem('wc_user')
  if (saved) user.value = JSON.parse(saved)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    user.value = session.user
    ensureUserProfile(session.user)
  }
  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user ?? null
    if (session?.user) {
      localStorage.setItem('wc_user', JSON.stringify(session.user))
      ensureUserProfile(session.user)
    }
    else localStorage.removeItem('wc_user')
  })
})

onUnmounted(() => {
  if (titlePopupTimer) clearTimeout(titlePopupTimer)
})
</script>

<template>
  <div class="app-root">

    <!-- ═══ TOP NAV ═══ -->
    <nav class="topnav">

      <!-- Logo -->
      <RouterLink to="/" class="nav-logo">
        <span class="logo-mark">
          <span class="logo-word">WORLD</span><span class="logo-dot">·</span><span class="logo-em">CHECKERS</span>
        </span>
      </RouterLink>

      <!-- Center links -->
      <div class="nav-links">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          active-class="nav-link-active"
          exact-active-class="nav-link-active"
        >{{ item.label }}</RouterLink>
      </div>

      <!-- Right: auth + language slider -->
      <div class="nav-right">
        <RouterLink to="/premium" class="btn-upgrade-pro">
          <span>{{ t.nav.upgradePro }}</span>
          <span class="try-free-tag">{{ t.nav.tryFree }}</span>
        </RouterLink>
        <!-- Language slider -->
        <div class="lang-sw">
          <span class="ls-lbl" :class="{ 'ls-on': lang === 'en' }" @click="setLang('en')">EN</span>
          <button class="ls-track" @click="setLang(lang === 'en' ? 'ru' : 'en')" title="Switch language / Сменить язык">
            <span class="ls-thumb" :class="{ 'ls-right': lang === 'ru' }"/>
          </button>
          <span class="ls-lbl" :class="{ 'ls-on': lang === 'ru' }" @click="setLang('ru')">RU</span>
        </div>
        <div class="nav-sep"/>
        <button class="nav-icon-btn" @click="notifOpen=!notifOpen" :title="t.nav.notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <button class="nav-icon-btn" @click="toggleTheme" :title="lightMode ? t.nav.darkMode : t.nav.lightMode">
          <svg v-if="lightMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
        <div class="nav-sep"/>
        <template v-if="user">
          <RouterLink to="/profile" class="user-chip">
            <span class="user-ava">{{ (user.email||'U')[0].toUpperCase() }}</span>
            <span class="user-name">{{ user.email?.split('@')[0] }}</span>
          </RouterLink>
          <button @click="logout" class="btn-ghost">{{ t.nav.signOut }}</button>
        </template>
        <template v-else>
          <RouterLink to="/play" class="btn-play">{{ t.nav.lobby }}</RouterLink>
          <RouterLink to="/login" class="btn-ghost">{{ t.nav.login }}</RouterLink>
          <RouterLink to="/register" class="btn-register">{{ t.nav.register }}</RouterLink>
        </template>
      </div>

      <!-- Notification dropdown -->
      <div v-if="notifOpen" class="notif-panel" @click.stop>
        <div class="notif-head">{{ t.nav.notifications }}</div>
        <div class="notif-item">
          <span class="notif-icon notif-gold">T</span>
          <span>{{ t.nav.notif1 }}</span>
        </div>
        <div class="notif-item">
          <span class="notif-icon notif-blue">C</span>
          <span>{{ t.nav.notif2 }}</span>
        </div>
        <div class="notif-item">
          <span class="notif-icon notif-amber">P</span>
          <span>{{ t.nav.notif3 }}</span>
        </div>
      </div>

      <!-- Hamburger -->
      <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <!-- Mobile drawer -->
    <div class="mobile-drawer" :class="{ open: mobileOpen }" @click.self="mobileOpen=false">
      <div class="drawer-panel">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="drawer-link"
          @click="mobileOpen=false"
        >{{ item.label }}</RouterLink>
        <hr class="drawer-hr">
        <RouterLink to="/premium" class="drawer-link drawer-link-amber" @click="mobileOpen=false">{{ t.nav.upgradePro }} · {{ t.nav.tryFree }}</RouterLink>
        <RouterLink v-if="!user" to="/login"    class="drawer-link" @click="mobileOpen=false">{{ t.nav.login }}</RouterLink>
        <RouterLink v-if="!user" to="/register" class="drawer-link drawer-link-amber" @click="mobileOpen=false">{{ t.nav.signupFree }}</RouterLink>
        <RouterLink v-if="user"  to="/profile"  class="drawer-link" @click="mobileOpen=false">{{ t.nav.myProfile }}</RouterLink>
        <button     v-if="user"  @click="logout; mobileOpen=false" class="drawer-link">{{ t.nav.signOut }}</button>
      </div>
    </div>

    <!-- Page content -->
    <main class="page-main">
      <RouterView />
    </main>

    <aside v-if="showTitlePopup" class="title-popup" aria-label="FMJD title offer">
      <button class="title-popup-close" @click="closeTitlePopup" aria-label="Close">×</button>
      <div class="title-popup-mark"><span>FMJD</span></div>
      <p class="title-popup-kicker">PRO</p>
      <h2>{{ t.home.titleOffer }}</h2>
      <p>{{ t.home.titleOfferSub }}</p>
      <RouterLink to="/premium" class="title-popup-cta">{{ t.home.tryFree }}</RouterLink>
    </aside>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  background: var(--ink);
  color: var(--text0);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ── LANGUAGE SLIDER ── */
.lang-sw {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.ls-lbl {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text3);
  letter-spacing: 0.6px;
  cursor: pointer;
  transition: color 0.15s;
  user-select: none;
  line-height: 1;
}
.ls-on { color: var(--text0); }
.ls-track {
  width: 30px;
  height: 16px;
  background: var(--ink3);
  border: 1px solid var(--border2);
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.2s;
  flex-shrink: 0;
}
.ls-track:hover { border-color: var(--amber); }
.ls-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--amber);
  transition: left 0.2s cubic-bezier(0.4,0,0.2,1);
}
.ls-right { left: 16px; }

/* ── NAV ── */
.topnav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 54px;
  background: var(--ink1);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 500;
  box-shadow: 0 1px 0 var(--border);
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 28px;
}
.logo-mark {
  display: flex;
  align-items: baseline;
  gap: 0;
}
.logo-word {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--text0);
}
.logo-dot {
  font-size: 0.8rem;
  color: var(--amber);
  margin: 0 3px;
  font-weight: 800;
}
.logo-em {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--amber);
}

/* Nav links */
.nav-links {
  display: flex;
  gap: 2px;
  flex: 1;
}
.nav-link {
  padding: 6px 12px;
  border-radius: 5px;
  color: var(--text2);
  font-size: 0.84rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
}
.nav-link:hover { color: var(--text0); background: rgba(255,255,255,0.04); }
.nav-link-active { color: var(--text0) !important; font-weight: 600; }

/* Right side */
.nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.nav-sep {
  width: 1px;
  height: 18px;
  background: var(--border2);
  flex-shrink: 0;
  margin: 0 2px;
}

/* Icon buttons */
.nav-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text2);
  padding: 7px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}
.nav-icon-btn:hover { color: var(--text0); background: rgba(255,255,255,0.06); }

/* Buttons */
.btn-play {
  background: var(--amber);
  color: var(--btn-ink);
  padding: 6px 16px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.8rem;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
  letter-spacing: 0.2px;
}
.btn-play:hover { background: var(--amber-l); color: var(--btn-ink); }

.btn-upgrade {
  background: transparent;
  border: 1px solid rgba(196,148,48,0.35);
  color: var(--amber);
  padding: 5px 13px;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s;
}
.btn-upgrade:hover { background: rgba(196,148,48,0.1); color: var(--amber-l); }

.btn-upgrade-pro {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 13px;
  border: 1px solid var(--amber);
  border-radius: 4px;
  color: var(--amber);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.btn-upgrade-pro:hover {
  background: rgba(196,148,48,0.12);
  color: var(--amber-l);
}
.try-free-tag {
  position: absolute;
  right: -10px;
  top: -13px;
  transform: rotate(5deg);
  background: var(--red);
  color: var(--paper);
  border-radius: 2px;
  padding: 2px 7px;
  font-size: 0.66rem;
  font-weight: 900;
  line-height: 1;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: var(--text2);
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
  font-family: inherit;
}
.btn-ghost:hover { color: var(--text0); background: rgba(255,255,255,0.04); }

.btn-register {
  background: rgba(196,148,48,0.1);
  border: 1px solid rgba(196,148,48,0.3);
  color: var(--amber);
  padding: 5px 13px;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s;
}
.btn-register:hover { background: rgba(196,148,48,0.18); color: var(--amber-l); }

/* User chip */
.user-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--text1);
  font-size: 0.8rem;
  transition: background 0.15s, border-color 0.15s;
}
.user-chip:hover { background: rgba(255,255,255,0.07); border-color: var(--border2); }
.user-ava {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--amber);
  color: var(--btn-ink);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.75rem;
  flex-shrink: 0;
}
.user-name { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Notification panel */
.notif-panel {
  position: absolute;
  top: 54px;
  right: 130px;
  width: 284px;
  background: var(--ink2);
  border: 1px solid var(--border2);
  border-radius: 10px;
  overflow: hidden;
  z-index: 600;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}
.notif-head {
  padding: 10px 14px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text3);
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}
.notif-item {
  padding: 11px 14px;
  font-size: 0.82rem;
  color: var(--text1);
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  transition: background 0.12s;
}
.notif-item:hover { background: rgba(255,255,255,0.03); }
.notif-item:last-child { border-bottom: none; }
.notif-icon {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800;
  flex-shrink: 0;
}
.notif-gold  { background: rgba(196,148,48,0.15); color: var(--amber); }
.notif-blue  { background: rgba(58,108,170,0.15); color: #6a9dd8; }
.notif-amber { background: rgba(196,148,48,0.15); color: var(--amber); }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  margin-left: 10px;
}
.hamburger span {
  display: block;
  width: 18px; height: 2px;
  background: var(--text1);
  border-radius: 2px;
  transition: background 0.15s;
}
.hamburger:hover span { background: var(--text0); }

/* Mobile drawer */
.mobile-drawer {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 490;
}
.mobile-drawer.open { display: block; }
.drawer-panel {
  position: absolute;
  top: 54px; left: 0; right: 0;
  background: var(--ink1);
  border-bottom: 1px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.drawer-link {
  display: block;
  padding: 10px 14px;
  border-radius: 6px;
  color: var(--text1);
  font-size: 0.92rem;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.drawer-link:hover { background: rgba(255,255,255,0.04); color: var(--text0); }
.drawer-link-amber { color: var(--amber); font-weight: 600; }
.drawer-hr { border: none; border-top: 1px solid var(--border); margin: 4px 0; }

/* Main content */
.page-main {
  padding-top: 54px;
  min-height: 100vh;
  background: var(--ink);
}

.title-popup {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 1200;
  width: min(340px, calc(100vw - 28px));
  background: linear-gradient(135deg, var(--amber), var(--amber-l));
  color: var(--btn-ink);
  border-radius: 8px;
  padding: 24px 22px 22px;
  box-shadow: 0 24px 70px oklch(5% 0.015 90 / 0.5);
}
.title-popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  background: transparent;
  border: 0;
  color: var(--btn-ink);
  font-size: 1.4rem;
  line-height: 1;
}
.title-popup-mark {
  width: 72px;
  height: 52px;
  margin-bottom: 8px;
  display: grid;
  place-items: end center;
  background:
    radial-gradient(circle at 25% 55%, var(--btn-ink) 0 18px, transparent 19px),
    radial-gradient(circle at 52% 35%, var(--btn-ink) 0 23px, transparent 24px),
    radial-gradient(circle at 78% 56%, var(--btn-ink) 0 18px, transparent 19px);
}
.title-popup-mark span {
  position: relative;
  bottom: -2px;
  background: var(--btn-ink);
  color: var(--amber-l);
  border-radius: 2px;
  padding: 2px 5px;
  font-size: 0.62rem;
  font-weight: 900;
}
.title-popup-kicker {
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 4px;
}
.title-popup h2 {
  max-width: 260px;
  font-size: 2rem;
  font-weight: 950;
  line-height: 0.95;
  margin-bottom: 12px;
}
.title-popup p:not(.title-popup-kicker) {
  font-size: 0.86rem;
  line-height: 1.4;
  margin-bottom: 18px;
  color: oklch(18% 0.018 84 / 0.82);
}
.title-popup-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  background: var(--btn-ink);
  color: var(--paper);
  border-radius: 4px;
  font-weight: 950;
  text-transform: uppercase;
  text-decoration: none;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .nav-links { display: none; }
  .btn-register { display: none; }
  .btn-upgrade,
  .btn-upgrade-pro { display: none; }
  .hamburger { display: flex; }
}
@media (max-width: 600px) {
  .btn-ghost { display: none; }
  .user-name { display: none; }
  .nav-icon-btn { display: none; }
  .nav-sep { display: none; }
}
</style>
