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
            <label style="display: flex; align-items: center; gap: 0.5rem;">
                Categoría
                <select v-model="form.categoria" required>
                    <option value="">Seleccione una categoría</option>
                    <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                        {{ cat.nombre }}
                    </option>
                </select>
                <button style="font-size: 1.2em; padding: 0 0.5em;" type="button" @click="showAddCat = true">+</button>
            </label>
            <dialog v-if="showAddCat" ref="addCatDialog" open style="max-width: 350px;">
                <form style="display: flex; flex-direction: column; gap: 1em;" @submit.prevent="addCategoria">
                    <label>Nombre nueva categoría
                        <input v-model="newCatName" type="text" required autofocus>
                    </label>
                    <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
                        <button type="submit">Agregar</button>
                        <button type="button" @click="closeAddCat">Cancelar</button>
                    </div>
                </form>
            </dialog>
            <button type="submit">Crear</button>
        </form>
    </main>
</template>

<!-- Colección de scripts para traer y enviar datos al backend -->
<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'
const config = useRuntimeConfig();

// Referencias a los campos del formulario
const form = reactive({
    codigo: '',
    nombre: '',
    precio: '',
    categoria: ''
});
const categorias = ref<Array<{ id: number, nombre: string }>>([])
const showAddCat = ref(false)
const newCatName = ref('')
const addCatDialog = ref<null | HTMLDialogElement>(null)

async function fetchCategorias() {
    try {
        const data = await $fetch(`${config.public.inventoryApiBaseUrl}/clasificacion`)
        // Mapeo de IDs a nombres
        categorias.value = Array.isArray(data)
            ? data.map((item: { catId: number, catNombre: string }) => ({ id: item.catId, nombre: item.catNombre }))
            : []
    } catch (error) {
        console.error('Error fetching categorías:', error)
    }
}

// Cargado de categorías inicial
onMounted(fetchCategorias)

function closeAddCat() {
    showAddCat.value = false
    newCatName.value = ''
}

async function addCategoria() {
    if (!newCatName.value.trim()) return
    try {
        await $fetch(`${config.public.inventoryApiBaseUrl}/clasificacion`, {
            method: 'POST',
            body: { catNombre: newCatName.value }
        })
        await fetchCategorias()
        closeAddCat()
    } catch (error) {
        alert('Error al agregar la categoría')
        console.error(error)
    }
}

// Envío de datos del formulario
async function onSubmit() {
    try {
    await $fetch(`${config.public.inventoryApiBaseUrl}/producto`, {
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