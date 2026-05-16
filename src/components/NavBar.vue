<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['isDark'])
const emit = defineEmits(['toggleTheme'])
const router = useRouter()
const menuOpen = ref(false)

const navLinks = [
  { label: 'Play', path: '/play' },
  { label: 'Puzzles', path: '/puzzles' },
  { label: 'Lessons', path: '/lessons' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Tournaments', path: '/tournaments' },
]

const isLoggedIn = ref(!!localStorage.getItem('wc_user'))
const user = ref(JSON.parse(localStorage.getItem('wc_user') || 'null'))

const logout = () => {
  localStorage.removeItem('wc_user')
  isLoggedIn.value = false
  user.value = null
  router.push('/')
}
</script>

<template>
  <nav style="
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background-color: var(--nav-bg); color: var(--nav-text);
    height: 60px; display: flex; align-items: center;
    padding: 0 20px; gap: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <!-- Logo -->
    <RouterLink to="/" style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:20px; color: var(--accent); flex-shrink:0;">
      <span style="font-size:26px;">&#9822;</span>
      <span>World Checkers</span>
    </RouterLink>

    <!-- Desktop links -->
    <div class="desktop-links" style="display:flex; gap:4px; flex:1;">
      <RouterLink
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        style="padding:6px 14px; border-radius:6px; font-size:14px; font-weight:500; transition:background 0.15s;"
        active-class="nav-active"
        @mouseover="$event.target.style.background='rgba(255,255,255,0.08)'"
        @mouseleave="$event.target.style.background='transparent'"
      >{{ link.label }}</RouterLink>
    </div>

    <!-- Right side -->
    <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
      <!-- Theme toggle -->
      <button @click="$emit('toggleTheme')" style="
        background: rgba(255,255,255,0.1); border:none; color: var(--nav-text);
        width:36px; height:36px; border-radius:50%; cursor:pointer;
        font-size:16px; display:flex; align-items:center; justify-content:center;
        transition: background 0.15s;
      " :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>

      <template v-if="isLoggedIn && user">
        <RouterLink to="/profile" style="
          display:flex; align-items:center; gap:8px;
          background: rgba(255,255,255,0.08); padding:5px 12px;
          border-radius:20px; font-size:13px;
        ">
          <div style="
            width:28px; height:28px; border-radius:50%;
            background: var(--accent); display:flex; align-items:center;
            justify-content:center; font-weight:700; font-size:12px;
          ">{{ (user.username || 'U')[0].toUpperCase() }}</div>
          <span>{{ user.username }}</span>
          <span v-if="user.isPremium" style="font-size:11px; background:gold; color:#333; padding:1px 5px; border-radius:10px;">PRO</span>
        </RouterLink>
        <button @click="logout" style="
          background:transparent; border:1px solid rgba(255,255,255,0.3);
          color:var(--nav-text); padding:5px 12px; border-radius:6px;
          cursor:pointer; font-size:13px;
        ">Sign out</button>
      </template>
      <template v-else>
        <RouterLink to="/login" style="
          background:transparent; border:1px solid rgba(255,255,255,0.3);
          padding:6px 16px; border-radius:6px; font-size:14px; font-weight:500;
          transition:background 0.15s;
        ">Log in</RouterLink>
        <RouterLink to="/register" class="btn-primary" style="font-size:14px; padding:6px 16px;">
          Sign up
        </RouterLink>
      </template>

      <!-- Mobile menu button -->
      <button @click="menuOpen = !menuOpen" class="mobile-menu-btn" style="
        background:transparent; border:none; color:var(--nav-text);
        font-size:22px; cursor:pointer; display:none;
      ">&#9776;</button>
    </div>
  </nav>

  <!-- Mobile menu -->
  <div v-if="menuOpen" style="
    position:fixed; top:60px; left:0; right:0; z-index:99;
    background:var(--nav-bg); padding:12px 20px; display:flex;
    flex-direction:column; gap:4px; box-shadow:0 4px 8px rgba(0,0,0,0.3);
  ">
    <RouterLink
      v-for="link in navLinks"
      :key="link.path"
      :to="link.path"
      @click="menuOpen = false"
      style="padding:10px 14px; border-radius:6px; font-size:15px; display:block;"
    >{{ link.label }}</RouterLink>
  </div>
</template>

<style scoped>
.nav-active { background: rgba(127, 166, 80, 0.2) !important; color: var(--accent) !important; }

@media (max-width: 768px) {
  .desktop-links { display: none !important; }
  .mobile-menu-btn { display: flex !important; }
}
</style>
