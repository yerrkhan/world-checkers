import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/play', component: () => import('./pages/Play.vue') },
    { path: '/game', component: () => import('./pages/Game.vue') },
    { path: '/leaderboard', component: () => import('./pages/Leaderboard.vue') },
    { path: '/puzzles', component: () => import('./pages/Puzzles.vue') },
    { path: '/lessons', component: () => import('./pages/Lessons.vue') },
    { path: '/profile', component: () => import('./pages/Profile.vue') },
    { path: '/login', component: () => import('./pages/Login.vue') },
    { path: '/register', component: () => import('./pages/Register.vue') },
    { path: '/tournaments', component: () => import('./pages/Tournaments.vue') },
    { path: '/friend',      component: () => import('./pages/FriendLobby.vue') },
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
