<template>
    <div class="card" style="text-align:center; max-width:820px; margin:1rem auto;">
        <h1>Bienvenido/a a Zipa</h1>
        <p style="color:var(--muted);">Gestiona productos y servicios para mascotas con facilidad. Crea, edita y administra tu catálogo.</p>
        <div style="margin-top:1rem; display:flex; gap:0.5rem; justify-content:center;">
            <NuxtLink to="/products" class="btn-primary">Ver productos</NuxtLink>
            <NuxtLink to="/services" class="btn-secondary">Ver servicios</NuxtLink>
        </div>
    </div>
</template>