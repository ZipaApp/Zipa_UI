<template>
    <main class="container">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
            <h1>Productos</h1>
            <div style="margin-left:auto">
                <button class="btn-primary" @click="goToCreateProduct">Crear producto</button>
            </div>
        </div>

        <section class="product-grid">
            <article v-for="product in products" :key="product.prodId" class="product-card">
                <div class="product-media" aria-hidden></div>

                <div class="product-body">
                    <div class="product-title-row">
                        <h3 class="product-name">{{ product.prodNombre }}</h3>
                        <div class="product-price">$ {{ product.prodPrecio.toFixed(2) }}</div>
                    </div>

                    <p class="muted" style="margin:6px 0 12px 0; font-size:0.9rem">Código: {{ product.prodCodigo }}</p>
                    <p class="muted" style="font-size:0.9rem">{{ product.clasificacion?.catNombre || 'Sin categoría' }}</p>
                </div>

                <div class="product-actions">
                    <button class="btn">Agregar</button>
                    <NuxtLink :to="`/products?sku=${product.prodCodigo}`" class="nav-plain">Ver</NuxtLink>
                </div>
            </article>
        </section>
    </main>
</template>

<!-- Composición de scripts para gestión de productos -->
<script lang="ts" setup>

import { ref, onMounted } from 'vue'
import { gatewayFetch } from '../utils/api'
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
            const data = await gatewayFetch('inventory/producto')
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
        await gatewayFetch(`inventory/producto/${prodId}`, { method: 'DELETE' })
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
