<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n.js'

const { t } = useI18n()

const billingCycle = ref('yearly')   // 'monthly' | 'yearly'
const selectedPlan = ref(null)       // plan being purchased
const payStep      = ref('form')     // 'form' | 'processing' | 'success'
const cardNum      = ref('')
const cardExp      = ref('')
const cardCvv      = ref('')
const cardName     = ref('')

// Prices per plan
const plans = computed(() => [
  {
    id: 'free', name: t.value.premium.free,
    monthlyPrice: 0, yearlyPrice: 0,
    color: '#555', popular: false,
    cta: t.value.premium.ctaFree, current: true,
    features: [
      { label: t.value.premium.featPuzzles,  val: t.value.premium.puzzlesFree },
      { label: t.value.premium.featLessons,  val: t.value.premium.lessonsFree },
      { label: t.value.premium.featBot,      val: t.value.premium.botFree },
      { label: t.value.premium.featAnalysis, val: t.value.premium.analysisFree },
      { label: t.value.premium.featMoves,    val: t.value.premium.no },
      { label: t.value.premium.featProfile,  val: t.value.premium.no },
      { label: t.value.premium.featAdFree,   val: t.value.premium.no },
      { label: t.value.premium.featCourses,  val: t.value.premium.no },
    ],
  },
  {
    id: 'gold', name: t.value.premium.gold,
    monthlyPrice: 4.99, yearlyPrice: 3.49,
    color: '#c4a030', popular: false,
    cta: t.value.premium.ctaGold, current: false,
    features: [
      { label: t.value.premium.featPuzzles,  val: t.value.premium.puzzlesGold },
      { label: t.value.premium.featLessons,  val: t.value.premium.lessonsGold },
      { label: t.value.premium.featBot,      val: t.value.premium.botGold },
      { label: t.value.premium.featAnalysis, val: t.value.premium.analysisGold },
      { label: t.value.premium.featMoves,    val: t.value.premium.yes },
      { label: t.value.premium.featProfile,  val: t.value.premium.yes },
      { label: t.value.premium.featAdFree,   val: t.value.premium.yes },
      { label: t.value.premium.featCourses,  val: t.value.premium.no },
    ],
  },
  {
    id: 'platinum', name: t.value.premium.platinum,
    monthlyPrice: 9.99, yearlyPrice: 6.99,
    color: '#6aa0c4', popular: true,
    cta: t.value.premium.ctaPlatinum, current: false,
    features: [
      { label: t.value.premium.featPuzzles,  val: t.value.premium.puzzlesPlt },
      { label: t.value.premium.featLessons,  val: t.value.premium.lessonsPlt },
      { label: t.value.premium.featBot,      val: t.value.premium.botPlt },
      { label: t.value.premium.featAnalysis, val: t.value.premium.analysisPlt },
      { label: t.value.premium.featMoves,    val: t.value.premium.yes },
      { label: t.value.premium.featProfile,  val: t.value.premium.yes },
      { label: t.value.premium.featAdFree,   val: t.value.premium.yes },
      { label: t.value.premium.featCourses,  val: t.value.premium.yes },
    ],
  },
  {
    id: 'diamond', name: t.value.premium.diamond,
    monthlyPrice: 19.99, yearlyPrice: 13.99,
    color: '#5cb8c8', popular: false,
    cta: t.value.premium.ctaDiamond, current: false,
    features: [
      { label: t.value.premium.featPuzzles,  val: t.value.premium.puzzlesDia },
      { label: t.value.premium.featLessons,  val: t.value.premium.lessonsDia },
      { label: t.value.premium.featBot,      val: t.value.premium.botDia },
      { label: t.value.premium.featAnalysis, val: t.value.premium.analysisDia },
      { label: t.value.premium.featMoves,    val: t.value.premium.yes },
      { label: t.value.premium.featProfile,  val: t.value.premium.yes },
      { label: t.value.premium.featAdFree,   val: t.value.premium.yes },
      { label: t.value.premium.featCourses,  val: t.value.premium.yes },
    ],
  },
])

const displayPrice = (plan) => {
  if (plan.id === 'free') return '$0'
  const price = billingCycle.value === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
  return `$${price.toFixed(2)}`
}

const displayPeriod = computed(() => billingCycle.value === 'yearly' ? t.value.premium.perMonth : t.value.premium.perMonth)

const totalAmount = computed(() => {
  if (!selectedPlan.value || selectedPlan.value.id === 'free') return '$0'
  if (billingCycle.value === 'yearly') {
    return `$${(selectedPlan.value.yearlyPrice * 12).toFixed(2)}`
  }
  return `$${selectedPlan.value.monthlyPrice.toFixed(2)}`
})

const openPayment = (plan) => {
  if (plan.id === 'free' || plan.current) return
  selectedPlan.value = plan
  payStep.value = 'form'
  cardNum.value = ''; cardExp.value = ''; cardCvv.value = ''; cardName.value = ''
}

const formatCard = (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0,16)
  cardNum.value = v.replace(/(.{4})/g, '$1 ').trim()
}
const formatExp = (e) => {
  let v = e.target.value.replace(/\D/g,'').slice(0,4)
  if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2)
  cardExp.value = v
}

const submitPayment = () => {
  payStep.value = 'processing'
  setTimeout(() => { payStep.value = 'success' }, 1800)
}
</script>

<template>
<div class="premium-page">

  <!-- Header -->
  <div class="prem-header">
    <div class="prem-eyebrow">PREMIUM</div>
    <h1 class="prem-title">{{ t.premium.title }}</h1>
    <p class="prem-sub">{{ t.premium.sub }}</p>

    <!-- Billing toggle -->
    <div class="billing-toggle">
      <button :class="['tog-btn', billingCycle==='monthly' && 'tog-active']" @click="billingCycle='monthly'">
        {{ t.premium.monthly }}
      </button>
      <button :class="['tog-btn', billingCycle==='yearly' && 'tog-active']" @click="billingCycle='yearly'">
        {{ t.premium.yearly }}
        <span class="save-chip">{{ t.premium.save }}</span>
      </button>
    </div>
  </div>

  <!-- Plans grid -->
  <div class="plans-grid">
    <div v-for="plan in plans" :key="plan.id"
      class="plan-card"
      :class="{ 'plan-popular': plan.popular, 'plan-free': plan.id==='free' }">

      <div v-if="plan.popular" class="popular-badge">{{ t.premium.popular }}</div>

      <div class="plan-name" :style="{ color: plan.color }">{{ plan.name }}</div>
      <div class="plan-price">
        <span class="price-num">{{ displayPrice(plan) }}</span>
        <span v-if="plan.id !== 'free'" class="price-per">{{ displayPeriod }}</span>
      </div>
      <div v-if="plan.id !== 'free' && billingCycle==='yearly'" class="billed-note">
        {{ t.premium.billed }}
      </div>

      <div class="plan-features">
        <div v-for="f in plan.features" :key="f.label" class="feat-row">
          <span class="feat-label">{{ f.label }}</span>
          <span class="feat-val"
            :style="{
              color: f.val === t.premium.no ? 'var(--text3)' : f.val === t.premium.yes ? '#4caf50' : 'var(--amber)',
              fontWeight: f.val === t.premium.yes || f.val === t.premium.no ? '700' : '600',
            }">{{ f.val }}</span>
        </div>
      </div>

      <button
        class="plan-btn"
        :class="{ 'plan-btn-current': plan.current || plan.id==='free', 'plan-btn-popular': plan.popular }"
        :style="plan.id!=='free' && !plan.current ? { background: plan.color } : {}"
        :disabled="plan.current || plan.id==='free'"
        @click="openPayment(plan)">
        {{ plan.cta }}
      </button>
    </div>
  </div>

  <p class="sub-note">{{ t.premium.subscriptionNote }}</p>

</div>

<!-- Payment Modal -->
<Teleport to="body">
  <div v-if="selectedPlan" class="pay-overlay" @click.self="selectedPlan=null">
    <div class="pay-modal">

      <!-- Success state -->
      <div v-if="payStep==='success'" class="pay-success">
        <div class="pay-success-icon">🎉</div>
        <div class="pay-success-title">{{ t.premium.paySuccess }} {{ selectedPlan.name }}!</div>
        <button class="pay-close-btn" @click="selectedPlan=null">{{ t.premium.payClose }}</button>
      </div>

      <!-- Form / Processing state -->
      <template v-else>
        <div class="pay-head">
          <h2 class="pay-title">{{ t.premium.payTitle }}</h2>
          <button class="pay-x" @click="selectedPlan=null">✕</button>
        </div>

        <!-- Summary -->
        <div class="pay-summary">
          <div class="pay-row">
            <span>{{ t.premium.payPlan }}</span>
            <span class="pay-plan-name" :style="{ color: selectedPlan.color }">{{ selectedPlan.name }}</span>
          </div>
          <div class="pay-row">
            <span>{{ t.premium.payBilling }}</span>
            <span>{{ billingCycle === 'yearly' ? t.premium.yearly : t.premium.monthly }}</span>
          </div>
          <div class="pay-row pay-total">
            <span>{{ t.premium.payTotal }}</span>
            <span class="pay-amount">{{ totalAmount }}</span>
          </div>
        </div>

        <!-- Card form -->
        <div class="pay-form" :style="{ opacity: payStep==='processing' ? 0.5 : 1, pointerEvents: payStep==='processing' ? 'none' : 'auto' }">
          <div class="form-group">
            <label>{{ t.premium.cardNumber }}</label>
            <input :value="cardNum" @input="formatCard" :placeholder="t.premium.cardNumberPh" maxlength="19" class="pay-input"/>
          </div>
          <div class="form-row2">
            <div class="form-group">
              <label>{{ t.premium.expiry }}</label>
              <input :value="cardExp" @input="formatExp" :placeholder="t.premium.expiryPh" maxlength="7" class="pay-input"/>
            </div>
            <div class="form-group">
              <label>{{ t.premium.cvv }}</label>
              <input v-model="cardCvv" :placeholder="t.premium.cvvPh" maxlength="3" class="pay-input"/>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t.premium.cardName }}</label>
            <input v-model="cardName" :placeholder="t.premium.cardNamePh" class="pay-input"/>
          </div>
        </div>

        <button class="pay-submit-btn" @click="submitPayment" :disabled="payStep==='processing'">
          {{ payStep==='processing' ? t.premium.payProcessing : t.premium.payBtn }}
        </button>

        <div class="pay-secure">{{ t.premium.paySecure }}</div>
      </template>
    </div>
  </div>
</Teleport>
</template>

<style scoped>
.premium-page {
  max-width: 1060px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  color: var(--text0);
}

/* Header */
.prem-header {
  text-align: center;
  margin-bottom: 40px;
}
.prem-eyebrow {
  font-size: 0.7rem; font-weight: 800; color: var(--amber);
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;
}
.prem-title {
  font-size: 2rem; font-weight: 800; color: var(--text0);
  margin-bottom: 10px; letter-spacing: -0.3px;
}
.prem-sub {
  font-size: 0.92rem; color: var(--text2); max-width: 520px;
  margin: 0 auto 24px; line-height: 1.6;
}

/* Billing toggle */
.billing-toggle {
  display: inline-flex; gap: 0;
  background: var(--ink2); border: 1px solid var(--border);
  border-radius: 8px; padding: 3px;
}
.tog-btn {
  background: transparent; border: none; cursor: pointer;
  padding: 7px 20px; border-radius: 6px; font-size: 0.85rem;
  font-weight: 600; color: var(--text2); transition: all 0.15s;
  display: flex; align-items: center; gap: 6px; font-family: inherit;
}
.tog-active {
  background: var(--ink3); color: var(--text0);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.save-chip {
  background: rgba(76,175,80,0.15); color: #4caf50;
  border-radius: 4px; padding: 1px 6px;
  font-size: 0.7rem; font-weight: 800;
}

/* Plans grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.plan-card {
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 16px;
  position: relative;
  transition: border-color 0.2s;
}
.plan-popular {
  border-color: var(--amber);
  box-shadow: 0 0 0 1px rgba(196,148,48,0.15), 0 8px 32px rgba(196,148,48,0.1);
}
.plan-free { opacity: 0.8; }

.popular-badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--amber); color: var(--btn-ink);
  font-size: 0.68rem; font-weight: 800;
  padding: 3px 12px; border-radius: 10px;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.plan-name {
  font-size: 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
}
.plan-price {
  display: flex; align-items: baseline; gap: 4px;
}
.price-num {
  font-size: 2rem; font-weight: 800; color: var(--text0);
}
.price-per {
  font-size: 0.82rem; color: var(--text2);
}
.billed-note {
  font-size: 0.72rem; color: var(--text3); margin-top: -12px;
}

/* Feature list */
.plan-features {
  display: flex; flex-direction: column; gap: 8px; flex: 1;
}
.feat-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.82rem;
}
.feat-label { color: var(--text2); }
.feat-val { text-align: right; }

/* Plan button */
.plan-btn {
  padding: 11px 16px; border-radius: 8px;
  font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  border: none; color: var(--btn-ink);
  font-family: inherit;
}
.plan-btn-current {
  background: var(--ink3); color: var(--text3); cursor: default;
  border: 1px solid var(--border);
}
.plan-btn:not(.plan-btn-current):hover { filter: brightness(1.1); }

.sub-note {
  text-align: center; font-size: 0.78rem; color: var(--text3);
  max-width: 600px; margin: 0 auto; line-height: 1.6;
}

/* Payment modal */
.pay-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.82);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
  backdrop-filter: blur(4px);
}
.pay-modal {
  background: var(--ink2); border: 1px solid var(--border2);
  border-radius: 14px; padding: 28px;
  max-width: 420px; width: 100%;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.pay-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.pay-title {
  font-size: 1.1rem; font-weight: 800; color: var(--text0);
}
.pay-x {
  background: transparent; border: none; color: var(--text3);
  cursor: pointer; font-size: 1rem; padding: 4px 6px;
  border-radius: 5px; transition: color 0.15s;
}
.pay-x:hover { color: var(--text0); }

.pay-summary {
  background: var(--ink3); border: 1px solid var(--border);
  border-radius: 9px; padding: 14px; margin-bottom: 20px;
  display: flex; flex-direction: column; gap: 8px;
}
.pay-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.85rem; color: var(--text2);
}
.pay-total { border-top: 1px solid var(--border); padding-top: 8px; margin-top: 2px; }
.pay-plan-name { font-weight: 700; }
.pay-amount { font-size: 1rem; font-weight: 800; color: var(--amber); }

.pay-form {
  display: flex; flex-direction: column; gap: 14px;
  margin-bottom: 18px; transition: opacity 0.2s;
}
.form-group {
  display: flex; flex-direction: column; gap: 5px;
}
.form-group label {
  font-size: 0.75rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px;
}
.form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pay-input {
  background: var(--ink3); border: 1px solid var(--border2);
  border-radius: 7px; padding: 10px 12px;
  font-size: 0.9rem; color: var(--text0);
  outline: none; transition: border-color 0.15s;
  font-family: inherit;
}
.pay-input:focus { border-color: var(--amber); }

.pay-submit-btn {
  width: 100%; padding: 13px;
  background: var(--amber); color: var(--btn-ink);
  border: none; border-radius: 8px;
  font-size: 0.95rem; font-weight: 800;
  cursor: pointer; transition: background 0.15s;
  font-family: inherit; margin-bottom: 12px;
}
.pay-submit-btn:hover { background: var(--amber-l); }
.pay-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.pay-secure {
  font-size: 0.74rem; color: var(--text3); text-align: center; line-height: 1.5;
}

/* Success */
.pay-success {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 20px 0;
}
.pay-success-icon { font-size: 3rem; }
.pay-success-title { font-size: 1rem; font-weight: 700; color: var(--text0); text-align: center; }
.pay-close-btn {
  background: var(--amber); color: var(--btn-ink); border: none;
  border-radius: 8px; padding: 10px 28px; font-size: 0.9rem;
  font-weight: 800; cursor: pointer; font-family: inherit;
}
</style>
