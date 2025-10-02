
<template>
    <main class="container">
        <h1>Crear nuevo servicio</h1>
        <form @submit.prevent="onSubmit">
            <label>
                Tipo de servicio
                <select v-model="form.type" required>
                    <option value="">Seleccione un tipo</option>
                    <option value="bano">Baño</option>
                    <option value="vacunacion">Vacunación</option>
                    <option value="paseo">Paseo</option>
                    <option value="corteunas">Corte de uñas</option>
                </select>
            </label>
            <label>
                Nombre
                <input v-model="form.name" type="text" required>
            </label>
            <label>
                Descripción
                <input v-model="form.description" type="text" required>
            </label>
            <label>
                Precio (COP)
                <input v-model="form.price" type="number" min="0" step="0.01" required>
            </label>
            <label>
                Duración (en minutos)
                <input v-model="form.duration" type="number" min="1" step="1" required>
            </label>
            <label>
                Responsable
                <input v-model="form.assignedTo" type="text" required>
            </label>
            <button type="submit">Crear</button>
        </form>
    </main>
</template>


<!-- Colección de scripts para traer y enviar datos al backend -->
<script setup lang="ts">
import { reactive } from 'vue'
const config = useRuntimeConfig();

// Referencias a los campos del formulario
const form = reactive({
    type: '',
    name: '',
    description: '',
    price: '',
    duration: '',
    assignedTo: ''
})

// Envío de datos del formulario
async function onSubmit() {
    try {
        await $fetch(`${config.public.serviceApiBaseUrl}/servicios/${form.type}`, {
            method: 'POST',
            body: {
                name: form.name,
                description: form.description,
                price: form.price,
                duration: form.duration,
                assignedTo: form.assignedTo
            }
        })
        await navigateTo('/services')
    } catch (error) {
        console.error('Error al crear el servicio:', error)
    }
}
</script>
