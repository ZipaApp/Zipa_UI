<template>
  <main>
    <div class="card" style="max-width:720px; margin:1rem auto;">
      <h1>Métodos de pago</h1>

      <form @submit.prevent="addPayment" style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1rem;">
        <label>
          Tipo (obligatorio)
          <select v-model="Met_tipo" required>
            <option value="">Seleccione un tipo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="paypal">PayPal</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </label>

        <!-- Detalle depende del tipo -->
        <div v-if="Met_tipo === 'tarjeta'">
          <input v-model="card.titular" placeholder="Titular" required />
          <input v-model="card.numero" placeholder="Número de tarjeta" inputmode="numeric" required />
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
            <input v-model="card.mes" placeholder="MM" required />
            <input v-model="card.anio" placeholder="AAAA" required />
          </div>
          <input v-model="card.cvc" placeholder="CVC" inputmode="numeric" required />
        </div>

        <div v-if="Met_tipo === 'paypal'">
          <input v-model="paypal.email" placeholder="Email de PayPal" required />
        </div>

        <div v-if="Met_tipo === 'transferencia'">
          <input v-model="transfer.account" placeholder="Número de cuenta / Detalle" required />
        </div>

        <label style="display:flex; gap:0.5rem; align-items:center;">
          <input type="checkbox" v-model="Met_predeterminado" />
          <span>Marcar como método predeterminado</span>
        </label>

        <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn-secondary" type="button" @click="clearForm">Limpiar</button>
          <button class="btn-primary" type="submit">Guardar método</button>
        </div>
      </form>

      <div v-if="payments.length === 0" style="color:var(--muted);">No hay métodos de pago guardados.</div>

      <div style="display:grid; gap:0.6rem; margin-top:0.75rem;">
        <article v-for="(p, idx) in payments" :key="p.Met_id" class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>{{ p.Met_tipo }}</strong>
            <div style="color:var(--muted)">
              <template v-if="p.Met_tipo === 'tarjeta'">
                **** **** **** {{ (p.Met_detalle?.numero || '').slice(-4) }} • {{ p.Met_detalle?.mes }}/{{ p.Met_detalle?.anio }}
              </template>
              <template v-else-if="p.Met_tipo === 'paypal'">
                PayPal • {{ p.Met_detalle?.email || '—' }}
              </template>
              <template v-else>
                {{ p.Met_detalle?.account || 'Detalle guardado' }}
              </template>
            </div>
            <div v-if="p.Met_predeterminado" style="color:var(--brand-600); font-weight:600; margin-top:0.25rem">Predeterminado</div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-secondary" @click="removePayment(idx)">Eliminar</button>
            <button v-if="!p.Met_predeterminado" class="btn" @click="setPredeterminado(p.Met_id)">Marcar predeterminado</button>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gatewayFetch } from '../utils/api'

type Payment = { Met_id: string; Met_tipo: string; Met_detalle?: any; Met_predeterminado?: boolean }

const paymentsState = useState<Payment[]>('payments', () => [])

const Met_tipo = ref('')
const Met_detalle = ref<any>(null)
const Met_predeterminado = ref(false)

// fields for each type
const card = ref({ titular: '', numero: '', mes: '', anio: '', cvc: '' })
const paypal = ref({ email: '' })
const transfer = ref({ account: '' })

const user = useState<any>('user')

function getUserId() {
  if (user.value?.id) return user.value.id
  if (user.value?.Usu_id) return user.value.Usu_id
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const u = JSON.parse(raw)
      return u?.id || u?.Usu_id
    }
  } catch (e) {}
  return null
}

async function fetchPayments() {
  const uid = getUserId()
  if (!uid) return
  try {
    const res: any = await gatewayFetch(`auth/metodos-pago/usuario/${uid}`)
    const data = res?.data || res
    paymentsState.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error fetching payments', e)
  }
}

onMounted(fetchPayments)

function clearForm() {
  Met_tipo.value = ''
  Met_predeterminado.value = false
  card.value = { titular: '', numero: '', mes: '', anio: '', cvc: '' }
  paypal.value = { email: '' }
  transfer.value = { account: '' }
}

async function addPayment() {
  if (!Met_tipo.value) return
  const uid = getUserId()
  if (!uid) { alert('Usuario no autenticado'); return }

  let detalle: any = {}
  if (Met_tipo.value === 'tarjeta') {
    if (!card.value.numero || card.value.numero.replace(/\s+/g, '').length < 12) return
    detalle = { titular: card.value.titular, numero: card.value.numero.replace(/\s+/g, ''), mes: card.value.mes, anio: card.value.anio }
  } else if (Met_tipo.value === 'paypal') {
    detalle = { email: paypal.value.email }
  } else if (Met_tipo.value === 'transferencia') {
    detalle = { account: transfer.value.account }
  }

  try {
    await gatewayFetch(`auth/metodos-pago/${uid}`, {
      method: 'POST',
      body: { Met_tipo: Met_tipo.value, Met_detalle: detalle, Met_predeterminado: Met_predeterminado.value },
    })
    // If marked predeterminado, backend will set; just refresh list
    await fetchPayments()
    clearForm()
  } catch (e) {
    console.error('Error adding payment', e)
    alert('Error al agregar método de pago')
  }
}

async function removePayment(idx: number) {
  const p = paymentsState.value[idx]
  if (!p) return
  try {
    await gatewayFetch(`auth/metodos-pago/${p.Met_id}`, { method: 'DELETE' })
    await fetchPayments()
  } catch (e) {
    console.error('Error removing payment', e)
    alert('Error al eliminar método')
  }
}

async function setPredeterminado(metId: string) {
  const uid = getUserId()
  if (!uid) return
  try {
    await gatewayFetch(`auth/metodos-pago/predeterminado/${uid}/${metId}`, { method: 'PUT' })
    await fetchPayments()
  } catch (e) {
    console.error('Error setting predeterminado', e)
  }
}

const payments = paymentsState
</script>
