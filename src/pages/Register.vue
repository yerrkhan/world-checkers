<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '../supabase'

const router   = useRouter()
const username = ref('')
const email    = ref('')
const password = ref('')
const error    = ref('')
const success  = ref('')
const loading  = ref(false)

const register = async () => {
  error.value   = ''
  success.value = ''
  if (!username.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (username.value.length < 3) {
    error.value = 'Username must be at least 3 characters.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  loading.value = true
  try {
    await signUp(email.value, password.value, username.value)
    success.value = 'Account created! Check your email to confirm, then sign in.'
    setTimeout(() => router.push('/login'), 2500)
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
<div class="auth-page">
  <div class="auth-box">
    <!-- Logo -->
    <div class="auth-logo">
      <span class="auth-icon">♟</span>
      <span class="auth-brand">WORLD CHECKERS</span>
    </div>

    <h1 class="auth-title">Create your account</h1>
    <p class="auth-sub">Free forever. No credit card needed.</p>

    <div v-if="error"   class="msg-error">{{ error }}</div>
    <div v-if="success" class="msg-success">{{ success }}</div>

    <div class="form-fields">
      <div class="field">
        <label>Username</label>
        <input v-model="username" type="text" placeholder="CheckerPro2025" @keyup.enter="register" />
      </div>
      <div class="field">
        <label>Email address</label>
        <input v-model="email" type="email" placeholder="you@example.com" @keyup.enter="register" />
      </div>
      <div class="field">
        <label>Password <span class="hint">(min. 6 characters)</span></label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="register" />
      </div>

      <p class="terms">
        By registering you agree to our Terms of Service and Privacy Policy.
      </p>

      <button @click="register" class="btn-submit" :disabled="loading">
        {{ loading ? 'Creating account…' : 'Create Account' }}
      </button>
    </div>

    <p class="auth-switch">
      Already have an account?
      <RouterLink to="/login">Sign in →</RouterLink>
    </p>
  </div>
</div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-box {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 8px;
}
.auth-icon  { font-size: 28px; color: #f5b623; }
.auth-brand { font-weight: 900; font-size: 0.95rem; color: #fff; letter-spacing: 1.5px; }

.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  margin: 0;
}
.auth-sub {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin: -8px 0 4px;
}

.form-fields {
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint {
  font-weight: 400;
  color: #555;
  font-size: 0.78rem;
}

.terms {
  font-size: 0.75rem;
  color: #444;
  line-height: 1.5;
}

.btn-submit {
  background: #f5b623;
  color: #000;
  border: none;
  padding: 13px;
  border-radius: 7px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-submit:hover:not(:disabled) { background: #ffd740; }
.btn-submit:disabled { background: #2a2a2a; color: #555; cursor: not-allowed; }

.auth-switch {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
}
.auth-switch a { color: #f5b623; font-weight: 700; margin-left: 4px; }
.auth-switch a:hover { color: #ffd740; }
</style>
