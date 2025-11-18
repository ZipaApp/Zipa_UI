<template>
  <main class="container">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem;">
      <h1>Crear servicio</h1>
      <div style="display:flex; gap:0.5rem; align-items:center">
        <label class="muted">Tipo:</label>
        <select v-model="svcType" style="padding:6px; border-radius:6px">
          <option value="peluqueria">Peluquería</option>
          <option value="veterinaria">Veterinaria</option>
          <option value="guarderia">Guardería</option>
          <option value="paseo">Paseo</option>
        </select>
      </div>
    </div>

    <form @submit.prevent="onSubmit" class="card">
      <div style="display:grid; gap:0.75rem; max-width:720px">
        <label>
          Nombre
          <input v-model="form.nombre" required />
        </label>

        <label>
          Descripción
          <textarea v-model="form.descripcion" rows="3"></textarea>
        </label>

        <div style="display:flex; gap:0.5rem;">
          <label style="flex:1">
            Precio
            <input v-model.number="form.precio" type="number" step="0.01" required />
          </label>
          <label style="width:160px">
            Duración (min)
            <input v-model.number="form.duracion" type="number" required />
          </label>
        </div>

        <!-- 'activo' omitted from form: backend sets default true -->

        <!-- Type-specific fields -->
        <div v-if="svcType === 'peluqueria'" style="display:grid; gap:0.5rem">
          <label>
            Modalidad (baño/corte/...)
            <select v-model="form.peluqueriaTipo">
              <option value="baño">baño</option>
              <option value="corte">corte</option>
              <option value="baño y corte">baño y corte</option>
              <option value="deslanado">deslanado</option>
            </select>
          </label>
          <label style="display:flex; gap:0.5rem; align-items:center">
            <input type="checkbox" v-model="form.incluyeTransporte" /> Incluye transporte
          </label>
          <label>
            Productos usados (coma-separado)
            <input v-model="form.productosUsadosCsv" placeholder="Champú, Acondicionador" />
          </label>
        </div>

        <div v-if="svcType === 'veterinaria'" style="display:grid; gap:0.5rem">
          <label>
            Tipo de consulta
            <select v-model="form.veterinariaTipo">
              <option value="consulta general">consulta general</option>
              <option value="vacunación">vacunación</option>
              <option value="desparasitación">desparasitación</option>
              <option value="control">control</option>
            </select>
          </label>
          <label>
            Veterinario responsable (opcional)
            <input v-model="form.veterinario" />
          </label>
          <label style="display:flex; gap:0.5rem; align-items:center">
            <input type="checkbox" v-model="form.requiereAyuno" /> Requiere ayuno
          </label>
        </div>

        <div v-if="svcType === 'guarderia'" style="display:grid; gap:0.5rem">
          <label>
            Modalidad
            <select v-model="form.guarderiaModalidad">
              <option value="medio día">medio día</option>
              <option value="día completo">día completo</option>
              <option value="noche">noche</option>
            </select>
          </label>
          <label style="display:flex; gap:0.5rem; align-items:center">
            <input type="checkbox" v-model="form.incluyeAlimentacion" /> Incluye alimentación
          </label>
        </div>

        <div v-if="svcType === 'paseo'" style="display:grid; gap:0.5rem">
          <label>
            Tipo de paseo
            <select v-model="form.tipoPaseo">
              <option value="individual">individual</option>
              <option value="grupal">grupal</option>
            </select>
          </label>
          <label>
            Duración del paseo (min)
            <input v-model.number="form.duracionPaseo" type="number" min="1" />
          </label>
          <label>
            Zona (opcional)
            <input v-model="form.zona" />
          </label>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:8px">
          <button class="btn-primary" type="submit">Crear</button>
          <NuxtLink to="/services" class="btn">Cancelar</NuxtLink>
        </div>
      </div>
    </form>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { servicesFetch } from '../utils/api'
import { useRoute } from '#imports'

const route = useRoute()
const routeType = (route.query.type as string) || ''
const svcType = ref(routeType || 'peluqueria')

const form = ref<any>({
  nombre: '',
  descripcion: '',
  precio: 0,
  duracion: 30,
  // peluqueria
  peluqueriaTipo: '',
  incluyeTransporte: false,
  productosUsadosCsv: '',
  // veterinaria
  veterinariaTipo: '',
  veterinario: '',
  requiereAyuno: false,
  // guarderia
  guarderiaModalidad: '',
  incluyeAlimentacion: false,
  // paseo
  tipoPaseo: '',
  duracionPaseo: 30,
  zona: '',
})

function validatePayload(base: any, type: string) {
  // basic required checks based on DTOs
  if (!base.nombre || base.nombre.trim().length === 0) return 'El nombre es obligatorio'
  if (base.precio == null || Number(base.precio) < 0) return 'Precio inválido'
  if (!base.duracion || Number(base.duracion) < 1) return 'Duración inválida'

  if (type === 'peluqueria') {
    // payload uses `tipo` for peluqueria
    if (!base.tipo) return 'Seleccione la modalidad de peluquería'
  }
  if (type === 'veterinaria') {
    if (!base.tipo) return 'Seleccione el tipo de consulta'
  }
  if (type === 'guarderia') {
    if (!base.modalidad) return 'Seleccione la modalidad de guardería'
  }
  if (type === 'paseo') {
    if (!base.tipoPaseo) return 'Seleccione el tipo de paseo'
    if (!base.duracionPaseo || Number(base.duracionPaseo) < 1) return 'Duración de paseo inválida'
  }
  return null
}

async function onSubmit() {
  const payload: any = {
    nombre: form.value.nombre,
    descripcion: form.value.descripcion,
    precio: Number(form.value.precio),
    duracion: Number(form.value.duracion),
  }

  // add type-specific fields
  const t = svcType.value
  if (t === 'peluqueria') {
    payload.tipo = form.value.peluqueriaTipo
    if (form.value.incluyeTransporte) payload.incluyeTransporte = true
    if (form.value.productosUsadosCsv) payload.productosUsados = form.value.productosUsadosCsv.split(',').map((s: string) => s.trim()).filter(Boolean)
  }
  if (t === 'veterinaria') {
    payload.tipo = form.value.veterinariaTipo
    if (form.value.veterinario) payload.veterinario = form.value.veterinario
    if (form.value.requiereAyuno) payload.requiereAyuno = true
  }
  if (t === 'guarderia') {
    payload.modalidad = form.value.guarderiaModalidad
    if (form.value.incluyeAlimentacion) payload.incluyeAlimentacion = true
  }
  if (t === 'paseo') {
    payload.tipoPaseo = form.value.tipoPaseo
    payload.duracionPaseo = Number(form.value.duracionPaseo)
    if (form.value.zona) payload.zona = form.value.zona
  }

  const validationError = validatePayload(payload, t)
  if (validationError) {
    alert(validationError)
    return
  }

  try {
    await servicesFetch(`servicios/${t}`, { method: 'POST', body: JSON.stringify(payload) })
    // Navigate back to services list after creation
    navigateTo('/services')
  } catch (err) {
    console.error('[services create] error', err)
    alert('Error al crear servicio')
  }
}
</script>

<style scoped>
.card { padding:12px; border-radius:8px; background:white; }
input, textarea { width:100%; padding:8px; border-radius:6px; border:1px solid #e5e7eb }
</style>
