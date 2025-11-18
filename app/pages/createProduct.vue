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
                    Nombre
                    <input v-model="form.nombre" type="text" required />
                </label>

                <div style="margin-bottom:1rem;">
                    <div style="font-weight:700; margin-bottom:0.25rem;">Descripción</div>
                    <textarea v-model="form.descripcion" placeholder="Descripción corta (máx 200 caracteres)" style="width:100%; height:120px; max-height:200px; resize:vertical; padding:0.6rem; border:1px solid #e6e9ef; border-radius:8px; box-shadow: 0 1px 2px rgba(16,24,40,0.03);"></textarea>
                </div>

                <label>
                    Precio (COP)
                    <input v-model="form.precio" type="number" min="0" step="0.01" required />
                </label>

                <label>
                    Cantidad (stock)
                    <input v-model="form.cantidad" type="number" min="0" step="1" />
                </label>

                

                <label>
                    Categorías (seleccione una o varias)
                    <div style="display:flex; gap:0.5rem; align-items:flex-start;">
                        <div style="flex:1; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; padding:0.4rem; border:1px solid #eef2f6; border-radius:8px; background:#fff;">
                            <button
                                v-for="cat in categorias"
                                :key="cat.id"
                                type="button"
                                @click="toggleCategory(cat.id)"
                                :aria-pressed="selectedSet.has(cat.id)"
                                :style="chipStyle(selectedSet.has(cat.id))"
                            >
                                {{ cat.nombre }}
                            </button>
                        </div>
                        <button type="button" class="btn-secondary" @click="showAddCat = true">+</button>
                    </div>
                    <div style="margin-top:0.45rem; color:#6b7280; font-size:0.9rem">Seleccionadas: {{ form.categorias.length }}</div>
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
                <div style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.75rem;">
                    <button type="submit" class="btn-primary">Crear producto</button>
                    <NuxtLink to="/products" class="btn-secondary">Cancelar</NuxtLink>
                </div>
            </form>
            <div style="max-width:720px; margin:auto; margin-top:0.5rem;">
                <label style="display:block; margin-top:0.5rem;">
                    Imágenes (opcional, hasta 5)
                    <input type="file" multiple accept="image/*" @change="onFilesChange" />
                </label>
            </div>
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
    categorias: [] as number[],
    cantidad: '',
    descripcion: ''
});
const categorias = ref<Array<{ id: number, nombre: string }>>([])
const showAddCat = ref(false)
const newCatName = ref('')
const addCatDialog = ref<null | HTMLDialogElement>(null)
const files = ref<FileList | null>(null)

function onFilesChange(e: Event) {
    const target = e.target as HTMLInputElement | null
    files.value = target?.files || null
}

function toggleCategory(id: number) {
    const idx = form.categorias.indexOf(id)
    if (idx === -1) form.categorias.push(id)
    else form.categorias.splice(idx, 1)
}


import { computed } from 'vue'

const selectedSet = computed(() => new Set(form.categorias.map((v: any) => Number(v))))

function chipStyle(selected: boolean) {
    return {
        padding: '0.45rem 0.7rem',
        borderRadius: '999px',
        border: selected ? '1px solid rgba(31,111,235,0.15)' : '1px solid #e6eef6',
        background: selected ? 'linear-gradient(180deg,#e6f0ff,#dbeeff)' : '#fff',
        color: selected ? '#0f172a' : '#374151',
        fontWeight: selected ? 700 : 500,
        cursor: 'pointer',
        boxShadow: selected ? '0 4px 12px rgba(31,111,235,0.08)' : 'none',
        transition: 'all 160ms ease'
    }
}

async function fetchCategorias() {
    try {
            const data = await gatewayFetch('inventory-service/clasificacion')
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
        await gatewayFetch('inventory-service/clasificacion', {
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
        // Ensure at least one category is provided and send as `catIds` array (backend expects array of integers)
        if (!Array.isArray(form.categorias) || form.categorias.length === 0) {
            alert('Seleccione al menos una categoría para el producto')
            return
        }

        // If files selected, send multipart/form-data to the /upload endpoint
            if (files.value && files.value.length > 0) {
            const fd = new FormData()
            fd.append('prodCodigo', String(form.codigo))
            fd.append('prodNombre', form.nombre)
            fd.append('prodPrecio', String(form.precio))
                if (form.cantidad !== '' && form.cantidad !== null && form.cantidad !== undefined) {
                    fd.append('prodCantidad', String(form.cantidad))
                }
                if (form.descripcion) {
                    fd.append('prodDescripcion', form.descripcion)
                }
            // send catIds as repeated form fields so backend receives an array of values
            // Append both `catIds` and `catIds[]` variants for compatibility with different parsers
            form.categorias.map((v: any) => Number(v)).forEach((id: number) => {
                fd.append('catIds', String(id))
                fd.append('catIds[]', String(id))
            })
            // (debug payload removed — backend forbids unknown fields)
            for (let i = 0; i < (files.value?.length || 0); i++) {
                const file = files.value?.[i]
                if (file) fd.append('prodImagen', file as Blob, file.name)
            }

            // debug: dump keys for quick DevTools check
            // eslint-disable-next-line no-console
            console.log('Sending multipart FormData keys:', Array.from((fd as any).keys ? (fd as any).keys() : []))
            await gatewayFetch('inventory-service/producto/upload', {
                method: 'POST',
                body: fd,
            })
        } else {
            // No files: send JSON payload
            const payload: any = {
                prodCodigo: Number(form.codigo) || form.codigo,
                prodNombre: form.nombre,
                prodPrecio: Number(form.precio) || form.precio,
                catIds: form.categorias.map((v: any) => Number(v)),
            }
            if (form.cantidad !== '' && form.cantidad !== null && form.cantidad !== undefined) {
                payload.prodCantidad = Number(form.cantidad)
            }
            if (form.descripcion) payload.prodDescripcion = form.descripcion

            await gatewayFetch('inventory-service/producto', {
                method: 'POST',
                body: payload
            })
        }
        await navigateTo('/products');
    } catch (error) {
        console.error("Error al crear el producto:", error);
    }
}
</script>