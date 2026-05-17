<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from '../supabase'
import { useI18n } from '../i18n.js'

const router = useRouter()
const { t } = useI18n()
const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

const login = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = t.value.login.errFields
    return
  }
  loading.value = true
  try {
    const { user } = await signIn(email.value, password.value)
    localStorage.setItem('wc_user', JSON.stringify({ id: user.id, email: user.email }))
    router.push('/profile')
  } catch {
    error.value = t.value.login.errCreds
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

    <h1 class="auth-title">{{ t.login.welcome }}</h1>
    <p class="auth-sub">{{ t.login.sub }}</p>

    <div v-if="error" class="msg-error">{{ error }}</div>

    <div class="form-fields">
      <div class="field">
        <label>{{ t.login.email }}</label>
        <input v-model="email" type="email" placeholder="you@example.com" @keyup.enter="login" />
      </div>
      <div class="field">
        <label>{{ t.login.password }}</label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="login" />
      </div>

      <button @click="login" class="btn-submit" :disabled="loading">
        {{ loading ? t.login.signingIn : t.login.signIn }}
      </button>
    </div>

    <p class="auth-switch">
      {{ t.login.noAccount }}
      <RouterLink to="/register">{{ t.login.register }}</RouterLink>
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
  max-width: 380px;
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
.auth-icon {
  font-size: 28px;
  color: #f5b623;
}
.auth-brand {
  font-weight: 900;
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: 1.5px;
}

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
  margin-top: 4px;
}
.btn-submit:hover:not(:disabled) { background: #ffd740; }
.btn-submit:disabled { background: #2a2a2a; color: #555; cursor: not-allowed; }

.auth-switch {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
}
.auth-switch a {
  color: #f5b623;
  font-weight: 700;
  margin-left: 4px;
}
.auth-switch a:hover { color: #ffd740; }
</style>
