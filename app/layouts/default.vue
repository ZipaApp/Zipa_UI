<template>
    <div>
        <AppNavBar />

        <section class="container" style="padding-top:0.5rem;">
            <slot />
        </section>

        <footer style="margin-top:2rem; background:transparent; padding:1.5rem 0;">
            <div class="container" style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
                <div>
                    <strong>Zipa</strong>
                    <div style="color:var(--muted);">Tienda y servicios para mascotas — Atención amable y experta</div>
                </div>
                <div style="color:var(--muted);">Contacto: info@zipa.example • Tel: +57 300 000 0000</div>
            </div>
        </footer>
    </div>
</template>