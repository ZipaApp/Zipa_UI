<template>
    <main class="container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Productos para mascotas</h1>
            <button @click="goToCreateProduct" style="margin-left: auto;">Crear producto</button>
        </div>
        <article
            v-for="product in products"
            :key="product.prodId"
        >
            <h3>{{ product.prodNombre }}</h3>
            <p><strong>Código:</strong> {{ product.prodCodigo }}</p>
            <p><strong>Precio:</strong> ${{ product.prodPrecio }}</p>
            <p><strong>Categoría:</strong> {{ product.clasificacion?.catNombre }}</p>
        </article>
    </main>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const { data: products, error, pending } = await useFetch(`${config.public.inventoryApiBaseUrl}/producto`);

function goToCreateProduct() {
    navigateTo('/createProduct')
}
</script>
