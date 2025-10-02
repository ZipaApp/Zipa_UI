<template>
    <main class="container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Servicios para mascotas</h1>
            <button style="margin-left: auto;" @click="goToCreateService">Crear servicio</button>
        </div>
        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-top: 2rem;">
            <article v-for="type in serviceTypes" :key="type.key" class="card">
                <h2>{{ type.label }}</h2>
                <ul v-if="Array.isArray(servicesByType[type.key]) && servicesByType[type.key].length">
                    <li v-for="serv in servicesByType[type.key]" :key="serv._id || serv.id || serv.name" style="margin-bottom: 1em;">
                        <strong>{{ serv.name }}</strong><br>
                        <span>{{ serv.description }}</span><br>
                        <span><b>Precio:</b> ${{ serv.price }}</span>
                    </li>
                </ul>
                <p v-else style="color: #888;">No hay servicios disponibles.</p>
            </article>
        </section>
    </main>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
const config = useRuntimeConfig();

type Service = {
    _id?: string;
    id?: string|number;
    name: string;
    description: string;
    price: number;
    duration?: number;
    assignedTo?: string;
}

const serviceTypes = [
    { key: 'bano', label: 'Baño' },
    { key: 'vacunacion', label: 'Vacunación' },
    { key: 'paseo', label: 'Paseo' },
    { key: 'corteunas', label: 'Corte de uñas' },
]

const servicesByType = ref<Record<string, Service[]>>({})

async function fetchServices() {
    const result: Record<string, Service[]> = {}
    for (const type of serviceTypes) {
        try {
            const data = await $fetch(`${config.public.serviceApiBaseUrl}/servicios/${type.key}`)
            result[type.key] = Array.isArray(data) ? data as Service[] : []
        } catch (error) {
            result[type.key] = []
            console.error(`Error al encontrar servicios de tipo ${type.label}:`, error)
        }
    }
    servicesByType.value = result
}

onMounted(fetchServices)

function goToCreateService() {
    navigateTo('/createService')
}
</script>
