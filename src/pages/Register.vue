<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '../supabase'
import { useI18n } from '../i18n.js'

const router   = useRouter()
const { t } = useI18n()
const firstName = ref('')
const lastName  = ref('')
const username = ref('')
const email    = ref('')
const password = ref('')
const country  = ref('')
const language = ref('en')
const error    = ref('')
const success  = ref('')
const loading  = ref(false)

const countries = [
  // Central Asia (prominent)
  'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan',
  // CIS / Eastern Europe
  'Russia', 'Ukraine', 'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan',
  // Europe
  'Germany', 'France', 'Netherlands', 'Poland', 'Italy', 'Spain', 'Portugal',
  'United Kingdom', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania',
  'Bulgaria', 'Croatia', 'Serbia', 'Greece', 'Turkey', 'Latvia', 'Lithuania',
  'Estonia', 'Slovenia', 'Bosnia and Herzegovina', 'North Macedonia', 'Albania',
  'Kosovo', 'Montenegro', 'Luxembourg', 'Malta', 'Iceland', 'Ireland',
  // North America
  'United States', 'Canada', 'Mexico',
  // South America
  'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Venezuela', 'Ecuador',
  'Bolivia', 'Paraguay', 'Uruguay',
  // Africa
  'Nigeria', 'Ethiopia', 'Egypt', 'South Africa', 'Kenya', 'Ghana',
  'Tanzania', 'Uganda', 'Algeria', 'Morocco', 'Tunisia', 'Senegal',
  'Ivory Coast', 'Cameroon', 'Madagascar', 'Mozambique', 'Angola',
  'Zambia', 'Zimbabwe', 'Mali', 'Burkina Faso', 'Niger',
  // Asia
  'China', 'India', 'Japan', 'South Korea', 'Indonesia', 'Pakistan',
  'Bangladesh', 'Vietnam', 'Thailand', 'Philippines', 'Malaysia',
  'Singapore', 'Taiwan', 'Hong Kong', 'Israel', 'Saudi Arabia',
  'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Jordan', 'Lebanon', 'Iraq', 'Iran', 'Afghanistan', 'Sri Lanka',
  'Nepal', 'Myanmar', 'Cambodia', 'Laos', 'Mongolia',
  // Oceania
  'Australia', 'New Zealand', 'Papua New Guinea',
  // Caribbean & Central America
  'Cuba', 'Dominican Republic', 'Guatemala', 'Honduras', 'El Salvador',
  'Nicaragua', 'Costa Rica', 'Panama', 'Jamaica', 'Trinidad and Tobago',
]

const register = async () => {
  error.value   = ''
  success.value = ''
  if (!username.value || !email.value || !password.value) {
    error.value = t.value.register.errFields
    return
  }
  if (username.value.length < 3) {
    error.value = t.value.register.errUsername
    return
  }
  if (password.value.length < 6) {
    error.value = t.value.register.errPassword
    return
  }
  loading.value = true
  try {
    await signUp(email.value, password.value, username.value, { firstName: firstName.value, lastName: lastName.value })
    success.value = t.value.register.successCreated
    setTimeout(() => router.push('/login'), 2500)
  } catch (err) {
    error.value = err.message || t.value.register.errGeneric
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

    <h1 class="auth-title">{{ t.register.title }}</h1>
    <p class="auth-sub">{{ t.register.subAlt }}</p>

    <div v-if="error"   class="msg-error">{{ error }}</div>
    <div v-if="success" class="msg-success">{{ success }}</div>

    <div class="form-fields">
      <!-- Name row -->
      <div class="field-row">
        <div class="field">
          <label>{{ t.register.firstName }}</label>
          <input v-model="firstName" type="text" :placeholder="t.register.firstNamePh" @keyup.enter="register" />
        </div>
        <div class="field">
          <label>{{ t.register.lastName }}</label>
          <input v-model="lastName" type="text" :placeholder="t.register.lastNamePh" @keyup.enter="register" />
        </div>
      </div>

      <div class="field">
        <label>{{ t.register.username }}</label>
        <input v-model="username" type="text" placeholder="CheckerPro2025" @keyup.enter="register" />
      </div>
      <div class="field">
        <label>{{ t.register.email }}</label>
        <input v-model="email" type="email" placeholder="you@example.com" @keyup.enter="register" />
      </div>
      <div class="field">
        <label>{{ t.register.password }}</label>
        <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="register" />
      </div>

      <div class="field">
        <label>{{ t.register.country }}</label>
        <select v-model="country" class="field-select">
          <option value="" disabled>{{ t.register.countryPh }}</option>
          <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="field">
        <label>{{ t.register.language }}</label>
        <select v-model="language" class="field-select">
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <p class="terms">{{ t.register.terms }}</p>

      <button @click="register" class="btn-submit" :disabled="loading">
        {{ loading ? t.register.signingUp : t.register.signUp }}
      </button>
    </div>

    <p class="auth-switch">
      {{ t.register.hasAccount }}
      <RouterLink to="/login">{{ t.register.login }}</RouterLink>
    </p>
  </div>
</div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-box {
  width: 100%;
  max-width: 440px;
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
.auth-icon  { font-size: 28px; color: var(--amber); }
.auth-brand { font-weight: 900; font-size: 0.95rem; color: var(--text0); letter-spacing: 1.5px; }

.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text0);
  text-align: center;
  margin: 0;
}
.auth-sub {
  font-size: 0.875rem;
  color: var(--text2);
  text-align: center;
  margin: -8px 0 4px;
}

.form-fields {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-select {
  background: var(--ink3);
  border: 1px solid var(--border2);
  border-radius: 7px;
  color: var(--text0);
  font-size: 0.9rem;
  padding: 10px 12px;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.field-select:hover, .field-select:focus { border-color: var(--amber); }
.field-select option { background: var(--ink2); }

.terms {
  font-size: 0.75rem;
  color: var(--text3);
  line-height: 1.5;
}

.btn-submit {
  background: var(--amber);
  color: #000;
  border: none;
  padding: 13px;
  border-radius: 7px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-submit:hover:not(:disabled) { background: var(--amber-l); }
.btn-submit:disabled { background: var(--ink3); color: var(--text3); cursor: not-allowed; }

.auth-switch {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text2);
}
.auth-switch a { color: var(--amber); font-weight: 700; margin-left: 4px; }
.auth-switch a:hover { color: var(--amber-l); }
</style>
