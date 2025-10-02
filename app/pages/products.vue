<template>
    <main class="container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Productos para mascotas</h1>
            <button @click="goToCreateProduct" style="margin-left: auto;">Crear producto</button>
        </div>
        <article
            v-for="product in products"
            :key="product.prodId"
            class="card"
            style="display: flex; flex-direction: column; min-height: 200px; justify-content: space-between;"
        >
            <div>
                <h3>{{ product.prodNombre }}</h3>
                <p><strong>Código:</strong> {{ product.prodCodigo }}</p>
                <p><strong>Precio:</strong> ${{ product.prodPrecio }}</p>
                <p><strong>Categoría:</strong> {{ product.clasificacion?.catNombre }}</p>
            </div>
            <div style="display: flex; justify-content: flex-end;">
                <button class="secondary" style="background-color: #d9534f; color: #fff;" @click="deleteProduct(product.prodId)">Eliminar</button>
            </div>
        </article>
    </main>
</template>

<!-- Composición de scripts para gestión de productos -->
<script lang="ts" setup>

import { ref, onMounted } from 'vue'
const config = useRuntimeConfig();

type Product = {
    prodId: number;
    prodNombre: string;
    prodCodigo: string;
    prodPrecio: number;
    clasificacion?: { catNombre: string };
}

const products = ref<Product[]>([])

async function fetchProducts() {
    try {
        const data = await $fetch(`${config.public.inventoryApiBaseUrl}/producto`)
        products.value = Array.isArray(data) ? data as Product[] : []
    } catch (error) {
        console.error('Error al encontrar productos:', error)
    }
}

// Cargado de productos inicial
onMounted(fetchProducts)

async function deleteProduct(prodId: number) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    try {
        await $fetch(`${config.public.inventoryApiBaseUrl}/producto/${prodId}`, { method: 'DELETE' })
        await fetchProducts()
    } catch (error) {
        console.error(error)
        alert('Error al eliminar el producto')
    }
}

function goToCreateProduct() {
    navigateTo('/createProduct')
}
</script>
