<template>
  <main>
    <div class="card" style="max-width:720px; margin:1rem auto;">
      <h1>Direcciones de envío</h1>

      <form @submit.prevent="addAddress" style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1rem;">
        <label>
          Etiqueta — opcional
          <input v-model="Dir_etiqueta" placeholder="Casa, Trabajo, etc." />
        </label>

        <label>
          Línea 1 — obligatorio
          <input v-model="Dir_linea1" placeholder="Dirección (calle, número, etc.)" required />
        </label>

        <label>
          Ciudad — opcional
          <input v-model="Dir_ciudad" placeholder="Ciudad" />
        </label>

        <label>
          País — opcional
          <input v-model="Dir_pais" placeholder="País" />
        </label>

        <div v-if="error" style="color:#b91c1c">{{ error }}</div>

        <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn-secondary" type="button" @click="clearForm">Limpiar</button>
          <button class="btn-primary" type="submit">Agregar dirección</button>
        </div>
      </form>

      <div v-if="addresses.length === 0" style="color:var(--muted);">No hay direcciones guardadas.</div>

      <div style="display:grid; gap:0.6rem; margin-top:0.75rem;">
        <article v-for="(a, idx) in addresses" :key="a.Dir_id" class="card" style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
          <div>
            <strong>{{ a.Dir_etiqueta || 'Sin etiqueta' }}</strong>
            <div style="color:var(--muted); margin-top:0.25rem">{{ a.Dir_linea1 }}</div>
            <div style="color:var(--muted); margin-top:0.35rem">{{ a.Dir_ciudad ? a.Dir_ciudad + ', ' : '' }}{{ a.Dir_pais || '' }}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:flex-end;">
            <button class="btn-secondary" @click="removeAddress(idx)">Eliminar</button>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gatewayFetch } from '../utils/api'

type Address = { Dir_id: string; Dir_etiqueta?: string; Dir_linea1: string; Dir_ciudad?: string; Dir_pais?: string }

const addressesState = useState<Address[]>('addresses', () => [])

const Dir_etiqueta = ref('')
const Dir_linea1 = ref('')
const Dir_ciudad = ref('')
const Dir_pais = ref('')
const error = ref('')

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

async function fetchAddresses() {
  const uid = getUserId()
  if (!uid) return
  try {
    const res: any = await gatewayFetch(`auth/direcciones/usuario/${uid}`)
    const data = res?.data || res
    addressesState.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error fetching addresses', e)
  }
}

onMounted(fetchAddresses)

function clearForm() {
  Dir_etiqueta.value = Dir_linea1.value = Dir_ciudad.value = Dir_pais.value = ''
  error.value = ''
}

async function addAddress() {
  error.value = ''
  if (!Dir_linea1.value || String(Dir_linea1.value).trim() === '') {
    error.value = 'La Línea 1 (Dir_linea1) es obligatoria.'
    return
  }
  const uid = getUserId()
  if (!uid) { error.value = 'Usuario no autenticado'; return }
  try {
    await gatewayFetch(`auth/direcciones/${uid}`, {
      method: 'POST',
      body: {
        Dir_etiqueta: Dir_etiqueta.value || undefined,
        Dir_linea1: Dir_linea1.value,
        Dir_ciudad: Dir_ciudad.value || undefined,
        Dir_pais: Dir_pais.value || undefined,
      },
    })
    await fetchAddresses()
    clearForm()
  } catch (e) {
    console.error('Error adding address', e)
    error.value = 'Error al agregar dirección'
  }
}

async function removeAddress(idx: number) {
  const addr = addressesState.value[idx]
  if (!addr) return
  try {
    await gatewayFetch(`auth/direcciones/${addr.Dir_id}`, { method: 'DELETE' })
    await fetchAddresses()
  } catch (e) {
    console.error('Error removing address', e)
    alert('Error al eliminar la dirección')
  }
}

const addresses = addressesState
</script>
