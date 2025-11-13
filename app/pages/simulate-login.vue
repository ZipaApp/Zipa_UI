<template>
  <main>
    <div class="card" style="max-width:520px; margin:2rem auto; text-align:center;">
      <h1>Simular sesión</h1>
      <p style="color:var(--muted);">Usa esta página para crear una sesión de prueba y ver las páginas protegidas.</p>

      <div style="display:flex; gap:0.5rem; justify-content:center; margin-top:1rem;">
        <button class="btn-primary" @click="simulateAndGo('/addresses')">Simular y ver Direcciones</button>
        <button class="btn-primary" @click="simulateAndGo('/payments')">Simular y ver Pagos</button>
      </div>

      <div style="margin-top:1rem; display:flex; gap:0.5rem; justify-content:center;">
        <button class="btn-secondary" @click="simulateOnly">Simular sin redirigir</button>
        <button class="btn-secondary" @click="clearSession">Borrar sesión de prueba</button>
      </div>

      <div v-if="user" style="margin-top:1rem; text-align:left; max-width:420px; margin-left:auto; margin-right:auto;">
        <h3>Usuario actual (prueba)</h3>
        <div><strong>Nombre:</strong> {{ user.name }}</div>
        <div><strong>Email:</strong> {{ user.email }}</div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const userState = useState<any>('user', () => null)


function persist(u: any) {
  try {
    if (u) {
      localStorage.setItem('user', JSON.stringify(u))
      if (u.token) localStorage.setItem('token', u.token)
    }
  } catch (e) {}
}

function simulate(u: any) {
  userState.value = u
  persist(u)
}

function simulateAndGo(path: string) {
  simulate({ name: 'Demo User', email: 'demo@example.com', token: 'demo-token', id: 'demo-user' })
  navigateTo(path)
}

function simulateOnly() {
  simulate({ name: 'Demo User', email: 'demo@example.com', token: 'demo-token', id: 'demo-user' })
}

function clearSession() {
  userState.value = null
  try { localStorage.removeItem('user'); localStorage.removeItem('token') } catch (e) {}
}

const user = userState
</script>
