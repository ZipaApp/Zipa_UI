<template>
    <main class="container">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
            <h1>Productos</h1>
            <div style="margin-left:auto">
                <button class="btn-primary" @click="goToCreateProduct">Crear producto</button>
            </div>
        </div>

        <section v-if="showList" class="product-grid">
            <article v-for="product in products" :key="product.prodId" class="product-card">
                <div class="product-media" aria-hidden></div>
                <div class="product-media" v-if="product.prodImagen && product.prodImagen.length > 0" style="width:120px; height:120px; background:#f6f8fa; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:6px;">
                    <img :src="imageUrl(product)" alt="" style="width:100%; height:100%; object-fit:cover; display:block;" @error="onImageError($event, product.prodImagen && product.prodImagen[0])" />
                </div>
                <div class="product-media" v-else aria-hidden style="width:120px; height:120px; background:#f6f8fa; border-radius:6px;"></div>

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
                    <NuxtLink :to="`/products/${product.prodId}`" class="nav-plain">Ver</NuxtLink>
                </div>
            </article>
        </section>
        <RouterView />
    </main>
</template>

<!-- Composición de scripts para gestión de productos -->
<script lang="ts" setup>

import { ref, onMounted, computed } from 'vue'
import { gatewayFetch } from '../utils/api'
import { useRoute } from '#imports'
const config = useRuntimeConfig();

type Product = {
    prodId: number;
    prodNombre: string;
    prodCodigo: string;
    prodPrecio: number;
    clasificacion?: { catNombre: string };
}

const products = ref<Product[]>([])
const route = useRoute()
const showList = computed(() => !route.params.id)

function imageUrl(p: any) {
    const imgPath = p.prodImagen && p.prodImagen.length > 0 ? p.prodImagen[0] : null
    if (!imgPath) return ''
    // Prefer direct inventory API host so uploaded files under `uploads/` are
    // fetched directly by the browser. Fall back to API Gateway if needed.
    const inventoryBase = (config.public.inventoryApiBaseUrl || '').replace(/\/+$/,'')
    if (inventoryBase) {
        return `${inventoryBase}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`
    }

    const gatewayBase = (config.public.apiGatewayBaseUrl || '').replace(/\/+$/,'')
    if (!gatewayBase) {
        console.warn('[products] No inventory or gateway URL configured')
        return imgPath
    }
    return `${gatewayBase}/inventory-service${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`
}

function onImageError(ev: Event) {
    // When an image fails to load, simply hide the <img> element so the
    // surrounding blank box remains. Do NOT retry or set placeholders.
    const target = ev && (ev.target as HTMLImageElement)
    if (!target) return
    target.style.display = 'none'
}

async function fetchProducts() {
    try {
            const data = await gatewayFetch('inventory-service/producto')
            if (!Array.isArray(data)) {
                products.value = []
                return
            }

            // Normalize backend shape: backend returns `prodPrecio` as string and
            // `clasificaciones` as an array. The UI expects `prodPrecio` as number
            // and `clasificacion` as the first classification object (optional).
            products.value = data.map((p: any) => ({
                ...p,
                prodPrecio: p.prodPrecio ? Number(p.prodPrecio) : 0,
                clasificacion: Array.isArray(p.clasificaciones) && p.clasificaciones.length > 0 ? p.clasificaciones[0] : undefined,
                // normalize prodImagen to array if backend returns single or undefined
                prodImagen: Array.isArray(p.prodImagen) ? p.prodImagen : (p.prodImagen ? [p.prodImagen] : []),
            })) as Product[]
    } catch (error) {
        console.error('Error al encontrar productos:', error)
    }
}

// Cargado de productos inicial
onMounted(fetchProducts)
console.log('products page mounted')

async function deleteProduct(prodId: number) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    try {
        await gatewayFetch(`inventory-service/producto/${prodId}`, { method: 'DELETE' })
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
