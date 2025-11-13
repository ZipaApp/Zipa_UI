<template>
    <main>
        <div class="card" style="max-width:720px; margin:auto;">
            <h1>Crear nuevo producto</h1>
            <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:0.75rem;">
                <label>
                    Código identificador
                    <input v-model="form.codigo" type="number" required />
                </label>

                <label>
                    Nombre/Descripción
                    <input v-model="form.nombre" type="text" required />
                </label>

                <label>
                    Precio (COP)
                    <input v-model="form.precio" type="number" min="0" step="0.01" required />
                </label>

                <label>
                    Categoría
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <select v-model="form.categoria" required style="flex:1;">
                            <option value="">Seleccione una categoría</option>
                            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                                {{ cat.nombre }}
                            </option>
                        </select>
                        <button type="button" class="btn-secondary" @click="showAddCat = true">+</button>
                    </div>
                </label>

                <div v-if="showAddCat" style="border-top:1px solid #eef2f6; padding-top:0.75rem;">
                    <label>
                        Nombre nueva categoría
                        <input v-model="newCatName" type="text" required autofocus />
                    </label>
                    <div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.5rem;">
                        <button class="btn-primary" @click.prevent="addCategoria">Agregar</button>
                        <button class="btn-secondary" @click.prevent="closeAddCat">Cancelar</button>
                    </div>
                </div>

                <div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.5rem;">
                    <button class="btn-primary" type="submit">Crear</button>
                </div>
            </form>
        </div>
    </main>
</template>

<!-- Colección de scripts para traer y enviar datos al backend -->
<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'
import { gatewayFetch } from '../utils/api'
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
            const data = await gatewayFetch('inventory/clasificacion')
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
        await gatewayFetch('inventory/clasificacion', {
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
        await gatewayFetch('inventory/producto', {
            method: 'POST',
            body: {
                prodCodigo: form.codigo,
                prodNombre: form.nombre,
                prodPrecio: form.precio,
                catId: form.categoria,
            }
        })
        await navigateTo('/products');
    } catch (error) {
        console.error("Error al crear el producto:", error);
    }
}
</script>