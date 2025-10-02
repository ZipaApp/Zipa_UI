<template>
    <main class="container">
        <h1>Crear nuevo producto</h1>
        <form @submit.prevent="onSubmit">
            <label>
                Código identificador
            <input v-model="form.codigo" type="number" required>
            </label>
            <label>
                Nombre/Descripción
            <input v-model="form.nombre" type="text" required>
            </label>
            <label>
                Precio (COP)
            <input v-model="form.precio" type="number" min="0" step="0.01" required>
            </label>
            <label>
                Categoría
                <select v-model="form.categoria" required>
                    <option value="">Seleccione una categoría</option>
                    <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                        {{ cat.nombre }}
                    </option>
                </select>
            </label>
            <button type="submit">Crear</button>
        </form>
    </main>
</template>

<!-- Colección de scripts para traer y enviar datos al backend -->
<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'
const config = useRuntimeConfig();
const form = reactive({     // Referencias a los campos del formulario
    codigo: '',
    nombre: '',
    precio: '',
    categoria: ''
});
const categorias = ref<Array<{ id: number, nombre: string }>>([])

// Fetch de categorías
onMounted(async () => {
    try {
        const data = await $fetch(`${config.public.inventoryApiBaseUrl}/clasificacion`)
        // Mapeo de nombres de categorías a IDs
        categorias.value = Array.isArray(data)
            ? data.map((item: { catId: number, catNombre: string }) => ({ id: item.catId, nombre: item.catNombre }))
            : []
    } catch (error) {
        console.error('Error fetching categorías:', error)
    }
})

// Envío de datos del formulario
async function onSubmit() {
    try {
        const result = await $fetch(`${config.public.inventoryApiBaseUrl}/producto`, {
            method: 'POST',
            body: {
                "prodCodigo": form.codigo,
                "prodNombre": form.nombre,
                "prodPrecio": form.precio,
                "catId": form.categoria
            }
        });
        await navigateTo('/products');
    } catch (error) {
        console.error("Error al crear el producto:", error);
    }
}
</script>