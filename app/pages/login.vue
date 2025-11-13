<template>
  <main>
    <div class="card" style="max-width:480px; margin:2rem auto;">
      <h1>Iniciar sesión</h1>
      <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:0.75rem;">
        <label>
          Correo electrónico
          <input v-model="email" type="email" required />
        </label>

        <label>
          Contraseña
          <input v-model="password" type="password" required />
        </label>

        <div style="display:flex; gap:0.5rem; justify-content:space-between; align-items:center;">
          <div style="color:var(--muted); font-size:0.95rem;">¿No tienes cuenta? <NuxtLink to="/register">Regístrate</NuxtLink></div>
          <div>
            <button class="btn-secondary" type="button" @click="cancel">Cancelar</button>
            <button class="btn-primary" type="submit">Entrar</button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { gatewayFetch } from '../utils/api'

const email = ref('')
const password = ref('')

// Global user state (persistimos en localStorage)
const user = useState('user')

function persistUserObject(userObj: any, token?: string) {
  try {
    if (userObj) localStorage.setItem('user', JSON.stringify(userObj))
    if (token) localStorage.setItem('token', token)
  } catch (e) {}
}

async function onSubmit() {
  if (!email.value || !password.value) return
  try {
    const res: any = await gatewayFetch('auth/login', {
      method: 'POST',
      body: { Usu_email: email.value, Usu_password: password.value },
    })
    const data = res?.data || res
    const token = data?.access_token || data?.accessToken || data?.token
    const usuario = data?.usuario || data?.user || data
    user.value = usuario
    persistUserObject(usuario, token)
    await navigateTo('/')
  } catch (e) {
    console.error('Login error', e)
    alert('Error en autenticación')
  }
}

function cancel() {
  navigateTo('/')
}

// Restaurar sesión si existe
if (!user.value) {
  try {
    const raw = localStorage.getItem('user')
    if (raw) user.value = JSON.parse(raw)
  } catch (e) {}
}
</script>
