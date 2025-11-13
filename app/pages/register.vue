<template>
  <main>
    <div class="card" style="max-width:480px; margin:2rem auto;">
      <h1>Crear cuenta</h1>
      <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:0.75rem;">
        <label>
          Nombre completo
          <input v-model="name" type="text" required />
        </label>

        <label>
          Correo electrónico
          <input v-model="email" type="email" required />
        </label>

        <label>
          Contraseña
          <input v-model="password" type="password" minlength="6" required />
        </label>
    
        <label>
          Confirmar contraseña
          <input v-model="confirmPassword" type="password" minlength="6" required />
        </label>

        <div v-if="error" style="color:#b91c1c; font-size:0.95rem;">{{ error }}</div>

        <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn-secondary" type="button" @click="cancel">Cancelar</button>
          <button class="btn-primary" type="submit">Registrarme</button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { gatewayFetch } from '../utils/api'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const user = useState<any>('user')

function persistUserObject(userObj: any, token?: string) {
  try {
    if (userObj) localStorage.setItem('user', JSON.stringify(userObj))
    if (token) localStorage.setItem('token', token)
  } catch (e) {}
}

async function onSubmit() {
  error.value = ''
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    // NOTE: RegisterDto expects Rol_id. Using default Rol_id = 2 (adjust if needed).
    const res: any = await gatewayFetch('auth/register', {
      method: 'POST',
      body: { Usu_email: email.value, Usu_password: password.value, Usu_fullName: name.value, Rol_id: 2 },
    })
    const data = res?.data || res
    const token = data?.access_token || data?.accessToken || data?.token
    const usuario = data?.usuario || data?.user || data
    user.value = usuario
    persistUserObject(usuario, token)
    await navigateTo('/')
  } catch (e) {
    console.error('Register error', e)
    error.value = 'Error al crear la cuenta'
  }
}

function cancel() { navigateTo('/') }

// Restaurar sesión si existe
try {
  const raw = localStorage.getItem('user')
  if (raw && !user.value) user.value = JSON.parse(raw)
} catch (e) {}
</script>
