<template>
  <main class="container">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem;">
      <h1>Crear servicio</h1>
      <div class="muted">Tipo: <strong>{{ type }}</strong></div>
    </div>

    <form @submit.prevent="onSubmit" class="card">
      <div style="display:grid; gap:0.75rem; max-width:720px">
        <label>
          Nombre
          <input v-model="form.nombre" required />
        </label>

        <label>
          Descripción
          <textarea v-model="form.descripcion" rows="3"></textarea>
        </label>

        <div style="display:flex; gap:0.5rem;">
          <label style="flex:1">
            Precio
            <input v-model.number="form.precio" type="number" step="0.01" required />
          </label>
          <label style="width:160px">
            Duración (min)
            <input v-model.number="form.duracion" type="number" required />
          </label>
        </div>

        <label style="display:flex; align-items:center; gap:0.5rem">
          <input type="checkbox" v-model="form.activo" /> Activo
        </label>

        <label>
          Campos adicionales (JSON) — opcional
          <textarea v-model="extraJson" rows="4" placeholder='{"campo":"valor"}'></textarea>
        </label>

        <div style="display:flex; gap:0.5rem; margin-top:8px">
          <button class="btn-primary" type="submit">Crear</button>
          <NuxtLink to="/services" class="btn">Cancelar</NuxtLink>
        </div>
      </div>
    </form>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { servicesFetch } from '../../utils/api'
import { useRoute } from '#imports'

const route = useRoute()
const type = (route.query.type as string) || 'peluqueria'

const form = ref({ nombre: '', descripcion: '', precio: 0, duracion: 30, activo: true })

async function onSubmit() {
  const payload: any = { ...form.value }

  try {
    await servicesFetch(`servicios/${type}`, { method: 'POST', body: JSON.stringify(payload) })
    navigateTo('/services')
  } catch (err) {
    console.error('[services create] error', err)
    alert('Error al crear servicio')
  }
}
</script>

<style scoped>
.card { padding:12px; border-radius:8px; background:white; }
input, textarea { width:100%; padding:8px; border-radius:6px; border:1px solid #e5e7eb }
</style>
