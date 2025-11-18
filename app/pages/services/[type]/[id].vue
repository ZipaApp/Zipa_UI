<template>
  <main class="container">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem;">
      <h1>{{ service.nombre || 'Servicio' }}</h1>
      <div style="text-align:right">
        <div class="muted">Tipo: <strong>{{ type }}</strong></div>
        <div style="margin-top:6px">Duración: {{ service.duracion }} min</div>
      </div>
    </div>

    <section class="card">
      <p>{{ service.descripcion || 'Sin descripción' }}</p>
      <p style="margin-top:8px"><strong>Precio:</strong> S/ {{ formatPrice(service.precio) }}</p>
      <p style="margin-top:8px"><strong>Activo:</strong> {{ service.activo ? 'Sí' : 'No' }}</p>

      <div style="margin-top:12px; display:flex; gap:0.5rem">
        <NuxtLink to="/services" class="btn">Volver</NuxtLink>
        <NuxtLink :to="`/services/create?type=${type}`" class="btn">Crear otro</NuxtLink>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { servicesFetch } from '../../../utils/api'
import { useRoute } from '#imports'

const route = useRoute()
const type = route.params.type as string
const id = route.params.id as string

const service = ref<any>({})

function formatPrice(p: any) { return Number(p || 0).toFixed(2) }

async function fetchService() {
  try {
    const data = await servicesFetch(`servicios/${type}/${id}`)
    service.value = data || {}
  } catch (err) {
    console.error('[service detail] error', err)
    service.value = {}
  }
}

onMounted(fetchService)
</script>

<style scoped>
.card { padding:12px; border-radius:8px; background:white; }
</style>
