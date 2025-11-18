<template>
    <main class="container">
        <div class="header-row">
            <h1>Servicios</h1>

            <div style="margin-left:auto; display:flex; gap:0.5rem; align-items:center;">
                <input v-model="q" placeholder="Buscar servicios..." class="search" />
                <button class="btn-primary" @click="goToCreate">Crear servicio</button>
            </div>
        </div>

        <nav class="tabs" aria-label="Filtrar por tipo">
            <button :class="['tab', { active: type === 'all' }]" @click="selectType('all')">Todos</button>
            <button :class="['tab', { active: type === 'peluqueria' }]" @click="selectType('peluqueria')">Peluquería</button>
            <button :class="['tab', { active: type === 'veterinaria' }]" @click="selectType('veterinaria')">Veterinaria</button>
            <button :class="['tab', { active: type === 'guarderia' }]" @click="selectType('guarderia')">Guardería</button>
            <button :class="['tab', { active: type === 'paseo' }]" @click="selectType('paseo')">Paseo</button>
        </nav>

        <section v-if="loading" class="muted">Cargando servicios...</section>

        <section v-else>
            <div v-if="filteredServices.length === 0" class="card muted">No hay servicios que coincidan.</div>

            <ul class="grid">
                <li v-for="s in filteredServices" :key="s._id" class="service-card">
                    <div class="card-content">
                        <div class="card-left">
                            <h3 class="svc-name">{{ s.nombre }}</h3>
                            <div class="muted svc-desc">{{ s.descripcion || '—' }}</div>
                            <div class="meta">Duración: <strong>{{ s.duracion }} min</strong></div>
                        </div>
                        <div class="card-right">
                            <div class="price">S/ {{ formatPrice(s.precio) }}</div>
                            <div class="badge">{{ prettyType(s._svcType || type) }}</div>
                            <div class="actions">
                                <NuxtLink :to="`/services/${s._svcType || type}/${s._id}`" class="nav-plain">Ver</NuxtLink>
                                <button class="btn" @click="removeService(s._id, s._svcType || type)">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </section>
    </main>
</template>

<script lang="ts" setup>

import { ref, onMounted, watch, computed } from 'vue'
import { servicesFetch } from '../utils/api'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

const AVAILABLE_TYPES = ['peluqueria', 'veterinaria', 'guarderia', 'paseo']

const type = ref('all')
const services = ref<any[]>([])
const loading = ref(false)
const q = ref('')

const filteredServices = computed(() => {
    const term = q.value && q.value.trim().toLowerCase()
    if (!term) return services.value
    return services.value.filter(s => (s.nombre || '').toLowerCase().includes(term) || (s.descripcion || '').toLowerCase().includes(term))
})

function formatPrice(p: any) {
    const n = Number(p || 0)
    return n.toFixed(2)
}

async function fetchServices() {
    loading.value = true
    try {
        if (type.value === 'all') {
            // fetch all types in parallel and annotate each item with its type
            const promises = AVAILABLE_TYPES.map(t => servicesFetch(`servicios/${t}`).then((d: any) => ({ type: t, data: Array.isArray(d) ? d : [] })).catch(() => ({ type: t, data: [] })))
            const results = await Promise.all(promises)
            const merged: any[] = []
            results.forEach(r => {
                r.data.forEach((item: any) => merged.push({ ...item, _svcType: r.type }))
            })
            services.value = merged
        } else {
            const data = await servicesFetch(`servicios/${type.value}`)
            services.value = (Array.isArray(data) ? data : []).map((i: any) => ({ ...i, _svcType: type.value }))
        }
    } catch (err) {
        console.error('[services] error fetching', err)
        services.value = []
    } finally {
        loading.value = false
    }
}

onMounted(fetchServices)
watch(type, () => fetchServices())

function selectType(t: string) {
    type.value = t
}

function goToCreate() {
    // open create form, prefer current type when it's specific
    const param = type.value === 'all' ? '' : `?type=${type.value}`
    navigateTo(`/create-service${param}`)
}

async function removeService(id: string, svcType: string) {
    if (!confirm('¿Eliminar servicio?')) return
    try {
        await servicesFetch(`servicios/${svcType}/${id}`, { method: 'DELETE' })
        await fetchServices()
    } catch (err) {
        console.error(err)
        alert('Error al eliminar servicio')
    }
}

function prettyType(t: string) {
    switch ((t || '').toLowerCase()) {
        case 'peluqueria': return 'Peluquería'
        case 'veterinaria': return 'Veterinaria'
        case 'guarderia': return 'Guardería'
        case 'paseo': return 'Paseo'
        case 'all': return 'Todos'
        default: return t
    }
}

</script>

<style scoped>
.card { padding:12px; border-radius:8px; background:white; box-shadow:0 1px 2px rgba(0,0,0,0.03);} 
.header-row { display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem }
.tabs { display:flex; gap:0.5rem; margin:0.5rem 0 1rem 0 }
.tab { padding:8px 12px; border-radius:8px; border:1px solid transparent; background:transparent; cursor:pointer }
.tab.active { background:#0369a1; color:white; border-color: rgba(0,0,0,0.06) }
.search { padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; min-width:220px }
.grid { list-style:none; padding:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem }
.service-card { padding:0 }
.card-content { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; padding:12px; border-radius:8px; background:white; box-shadow:0 1px 2px rgba(0,0,0,0.04) }
.card-left { flex:1 }
.svc-name { margin:0 0 6px 0 }
.svc-desc { font-size:0.95rem }
.meta { margin-top:8px; color:#374151 }
.card-right { width:140px; display:flex; flex-direction:column; align-items:flex-end; gap:8px }
.price { font-weight:700; font-size:1.05rem }
.badge { background:#eef2ff; color:#4338ca; padding:4px 8px; border-radius:999px; font-size:0.82rem }
.actions { display:flex; gap:8px; margin-top:6px }
.nav-plain { color:#0369a1; text-decoration:none }
.muted { color:#6b7280 }

@media (max-width:640px) {
    .card-right { width:100%; align-items:flex-start }
    .card-content { flex-direction:column; align-items:flex-start }
}
</style>