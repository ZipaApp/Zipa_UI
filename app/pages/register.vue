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

        <!-- Roles are handled automatically by the backend; hidden from users -->

        <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn-secondary" type="button" @click="cancel">Cancelar</button>
          <button class="btn-primary" type="submit">Registrarme</button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gatewayFetch } from '../utils/api'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const roles = ref<Array<any>>([])
const selectedRol = ref<number | null>(null)

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
    // Ensure we have a role id to send. We prefer a role named 'user' (or similar),
    // otherwise create a default 'user' role and use it.
    try {
      // Fetch roles from the server (do not expose them in the UI)
      await fetchRoles()
    } catch (e) {
      // fetchRoles handles warnings and sets roles.value = [] on failure
    }

    // Find a preferred role by name
    let preferred = (roles.value || []).find((r: any) => /^(user|cliente|customer)$/i.test(String(r.Rol_nombre)))
    let rolToSend: number | null = preferred ? Number(preferred.Rol_id) : null

    if (!rolToSend) {
      // If no preferred role found, try to use the first role available
      if (roles.value && roles.value.length > 0) {
        rolToSend = Number(roles.value[0].Rol_id)
      }
    }

    if (!rolToSend) {
      // No roles present: attempt to create a default 'user' role and reload
      try {
        await gatewayFetch('user-service/roles', {
          method: 'POST',
          body: { Rol_nombre: 'user', Rol_descripcion: 'Cliente estándar' },
        })
        await fetchRoles()
        preferred = (roles.value || []).find((r: any) => /^(user|cliente|customer)$/i.test(String(r.Rol_nombre)))
        rolToSend = preferred ? Number(preferred.Rol_id) : (roles.value[0] ? Number(roles.value[0].Rol_id) : null)
      } catch (e) {
        console.error('Failed to create default role', e)
        error.value = 'No hay roles disponibles y no se pudo crear el rol por defecto.'
        return
      }
    }
    const res: any = await gatewayFetch('user-service/auth/register', {
      method: 'POST',
      body: { Usu_email: email.value, Usu_password: password.value, Usu_fullName: name.value, Rol_id: rolToSend },
    })
    const data = res?.data || res
    const token = data?.access_token || data?.accessToken || data?.token
    const usuario = data?.usuario || data?.user || data
    user.value = usuario
    persistUserObject(usuario, token)
    await navigateTo('/')
  } catch (e: any) {
    console.error('Register error', e)
    const msg = e?.response?.data?.message || e?.message || 'Error al crear la cuenta'
    error.value = msg
  }
}

function cancel() { navigateTo('/') }

// Restaurar sesión si existe
try {
  const raw = localStorage.getItem('user')
  if (raw && !user.value) user.value = JSON.parse(raw)
} catch (e) {}

async function fetchRoles() {
  try {
    const data = await gatewayFetch('user-service/roles')
    if (Array.isArray(data) && data.length > 0) {
      roles.value = data
      const preferred = data.find((r: any) => /user|cliente|customer/i.test(r.Rol_nombre))
      // Do not populate any UI selection; just keep roles in memory for logic
      // selectedRol is intentionally not used in the UI
      // selectedRol.value = preferred ? Number(preferred.Rol_id) : Number(data[0].Rol_id)
    } else {
      roles.value = []
    }
  } catch (e) {
    console.warn('Could not fetch roles for registration', e)
    roles.value = []
  }
}

// Do not fetch roles automatically on mount to keep roles hidden from the UI.
</script>
