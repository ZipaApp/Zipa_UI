<template>
	<main style="max-width:1100px; margin:2.5rem auto; padding:1rem;">
		<div style="display:grid; grid-template-columns: 1fr 420px; gap:2rem; align-items:start;">

			<!-- Gallery -->
			<section style="background:linear-gradient(180deg, #fff, #fbfdff); padding:1rem; border-radius:12px; box-shadow: 0 6px 20px rgba(16,24,40,0.06);">
				<div style="display:flex; gap:1rem;">
					<div style="flex:1;">
						<div v-if="images.length > 0" style="border-radius:12px; overflow:hidden; background:#f7fafc;">
							<img :src="currentImageUrl" alt="Imagen producto" style="width:100%; height:520px; object-fit:cover; display:block;" @error="onImageError($event, images[selectedIndex])" />
						</div>
						<div v-else style="width:100%; height:520px; background:linear-gradient(180deg,#f3f6fa,#eef3fa); border-radius:12px;"></div>
					</div>
				</div>

				<div style="display:flex; gap:0.6rem; margin-top:0.9rem; overflow:auto; padding-bottom:4px;">
					<button v-for="(img, i) in images" :key="i" @click="selectedIndex = i"
						:style="thumbnailStyle(i)"
						aria-label="Ver imagen">
						<img :src="thumbnailUrl(img)" alt="thumb" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:6px;" @error="onImageError($event, img)" />
					</button>
				</div>
			</section>

			<!-- Info / Purchase -->
			<aside style="position:relative; background:#ffffff; padding:1.25rem; border-radius:12px; box-shadow: 0 6px 20px rgba(16,24,40,0.06);">
				<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
					<div>
						<h2 style="margin:0; font-size:1.5rem; line-height:1.1">{{ product.prodNombre || 'Producto' }}</h2>
						<div style="color:#6b7280; margin-top:6px; font-size:0.95rem">Código: <strong style="color:#111827">{{ product.prodCodigo }}</strong></div>
					</div>
				</div>

				<div style="margin-top:1rem; display:flex; align-items:center; gap:1rem;">
					<div style="font-size:1.6rem; font-weight:700; color:#0f172a">$ {{ formattedPrice }}</div>
					<div style="color:#6b7280;">Stock: <strong>{{ product.prodCantidad ?? 0 }}</strong></div>
				</div>

				<div style="margin-top:1rem; color:#374151"> <strong>Categoría:</strong> {{ product.clasificacion?.catNombre || (product.clasificaciones && product.clasificaciones[0]?.catNombre) || '—' }}</div>

				<div style="margin-top:1rem; color:#4b5563; line-height:1.45">{{ product.prodDescripcion || 'No hay descripción disponible para este producto.' }}</div>

				<div style="margin-top:1.25rem; display:flex; gap:0.5rem; align-items:center;">
					<label style="display:flex; gap:0.5rem; align-items:center;">
						<div style="font-size:0.9rem; color:#374151">Cantidad</div>
						<input type="number" v-model.number="qty" min="1" :max="product.prodCantidad ?? 9999"
							style="width:80px; padding:0.5rem; border-radius:8px; border:1px solid #e6eef6; background:#fff;" />
					</label>
				</div>

				<div style="margin-top:1rem; display:flex; gap:0.6rem;">
					<button class="btn-primary" @click="addToCart" style="flex:1; padding:0.85rem 1rem; border-radius:10px; font-weight:700;">Agregar al carrito</button>
					<NuxtLink to="/products" class="btn-secondary" style="padding:0.7rem 0.9rem; border-radius:10px;">Volver</NuxtLink>
				</div>

				<div style="margin-top:1.1rem; font-size:0.85rem; color:#6b7280">Envío disponible en la mayoría de regiones. Política de devoluciones: 30 días.</div>
			</aside>

		</div>

		<!-- Tabs / Details -->
		<!-- Se eliminó la tarjeta 'Detalles del producto' porque era redundante con la descripción ya mostrada arriba. -->
	</main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#imports'
import { gatewayFetch } from '../../utils/api'

const route = useRoute()
const id = Number(route.params.id)
const product = ref<any>({ prodImagen: [], clasificaciones: [] })
const selectedIndex = ref(0)
const qty = ref(1)

function baseUrl() {
	const config = useRuntimeConfig()
	// Prefer calling the inventory service directly from the browser so
	// static files (uploads) are served from the inventory API host.
	// Fall back to the API Gateway if an explicit inventory URL is not configured.
	const inventoryBase = (config.public.inventoryApiBaseUrl || '').replace(/\/+$/g, '')
	if (inventoryBase) return inventoryBase
	const gateway = (config.public.apiGatewayBaseUrl || '').replace(/\/+$/g, '')
	if (gateway) return `${gateway}/inventory-service`
	return ''
}

function normalizeImages(p: any) {
	if (!p) return []
	if (Array.isArray(p.prodImagen)) return p.prodImagen
	if (p.prodImagen) return [p.prodImagen]
	return []
}

const images = computed(() => normalizeImages(product.value))

const currentImageUrl = computed(() => {
	const imgPath = images.value.length > 0 ? images.value[selectedIndex.value] : null
	if (!imgPath) return ''
	const base = baseUrl()
	if (!base) {
		// eslint-disable-next-line no-console
		console.log('[product detail] resolved image url ->', imgPath)
		return imgPath
	}
	const resolved = `${base}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`
	// eslint-disable-next-line no-console
	console.log('[product detail] resolved image url ->', resolved)
	return resolved
})

function thumbnailUrl(imgPath: string) {
	const base = baseUrl()
	if (!base) return imgPath
	return `${base}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`
}

function onImageError(...args: any[]) {
	// args[0] is the Event; any other args are ignored.
	const ev = args[0] as Event
	const target = ev && (ev.target as HTMLImageElement)
	if (!target) return
	// Hide the <img> element on error and do NOT retry or set placeholders.
	target.style.display = 'none'
}

function thumbnailStyle(i: number) {
	return {
		width: '96px',
		height: '72px',
		padding: '2px',
		borderRadius: '8px',
		border: selectedIndex.value === i ? '2px solid #1f6feb' : '1px solid #e6eef6',
		background: '#fff',
		cursor: 'pointer'
	}
}

const formattedPrice = computed(() => {
	const p = Number(product.value.prodPrecio || 0)
	return p.toFixed(2)
})

async function loadProduct() {
	try {
		console.log('product detail mounted', id)
		const res = await gatewayFetch(`inventory-service/producto/${id}`)
		product.value = res || { prodImagen: [], clasificaciones: [] }
	} catch (e) {
		console.error('Error fetching product', e)
	}
}

onMounted(loadProduct)

function addToCart() {
	// UI-only placeholder behavior: show a simple confirmation
	alert(`Añadido ${qty.value} × ${product.value.prodNombre || 'producto'} al carrito.`)
}
</script>

*** End Patch
