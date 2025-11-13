<template>
  <main class="container">
    <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem;">
      <h1>Catálogo simulado</h1>
      <div style="margin-left:auto">
        <NuxtLink to="/products" class="nav-plain">Ir a Productos</NuxtLink>
      </div>
    </div>

    <p class="muted">Página de demostración con productos ficticios para probar la UI.</p>

    <section class="product-grid">
      <article v-for="p in products" :key="p.sku" class="product-card">
        <div class="product-media" aria-hidden></div>

        <div class="product-body">
          <div class="product-title-row">
            <h3 class="product-name">{{ p.name }}</h3>
            <div class="product-price">$ {{ p.price.toFixed(2) }}</div>
          </div>

          <p class="muted" style="margin:6px 0 12px 0; font-size:0.9rem">SKU: {{ p.sku }}</p>
          <p class="muted" style="font-size:0.9rem">{{ p.category }}</p>
        </div>

        <div class="product-actions">
          <button class="btn">Agregar</button>
          <NuxtLink :to="`/products?sku=${p.sku}`" class="nav-plain">Ver</NuxtLink>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const products = ref([
  { sku: 'PAC-001', name: 'Pañales para perro - Talla S', category: 'Higiene', price: 8.5, stock: 24, description: 'Pañales absorbentes para perros pequeños. Suave y cómodo.' },
  { sku: 'ALM-042', name: 'Alimento seco adulto - Pollo 5kg', category: 'Alimentos', price: 29.99, stock: 12, description: 'Alimento balanceado para perros adultos, sabor pollo.' },
  { sku: 'JUG-123', name: 'Juguete cuerda resistente', category: 'Juguetes', price: 6.0, stock: 50, description: 'Cuerda trenzada para juegos y entrenamiento. Muy resistente.' },
  { sku: 'COL-210', name: 'Collar ajuste rápido', category: 'Accesorios', price: 12.0, stock: 34, description: 'Collar con hebilla rápida y placa para identificación.' },
  { sku: 'AR-009', name: 'Arnés antitirones', category: 'Accesorios', price: 25.0, stock: 8, description: 'Arnés ergonómico que reduce tirones en paseos.' },
  { sku: 'LIM-77', name: 'Shampoo para mascotas 250ml', category: 'Higiene', price: 7.5, stock: 40, description: 'Shampoo suave, formulado para pieles sensibles.' },
  { sku: 'CAMA-11', name: 'Cama ortopédica mediana', category: 'Descanso', price: 49.99, stock: 6, description: 'Cama con soporte ortopédico para mayor confort.' },
  { sku: 'COM-300', name: 'Comedero antideslizante', category: 'Accesorios', price: 9.9, stock: 20, description: 'Comedero con base de goma antipérdida.' },
  { sku: 'PRE-55', name: 'Premios saludables 200g', category: 'Snacks', price: 4.99, stock: 80, description: 'Premios bajos en grasa para entrenamiento.' },
  { sku: 'RAS-002', name: 'Rasqueta para pelo', category: 'Higiene', price: 5.5, stock: 60, description: 'Herramienta para quitar pelo suelto de forma fácil.' },
  { sku: 'BOL-90', name: 'Bol plegable de viaje', category: 'Accesorios', price: 6.5, stock: 27, description: 'Bol plegable, perfecto para salidas y viajes.' },
  { sku: 'PLA-404', name: 'Plato interactivo slow-feeder', category: 'Alimentos', price: 14.25, stock: 14, description: 'Diseñado para ralentizar la ingesta y mejorar digestión.' }
])
</script>
