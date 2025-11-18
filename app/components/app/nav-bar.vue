<template>
    <header class="container app-navbar">
        <a class="brand" href="/">
            <img :src="logoSrc" alt="Zipa logo" class="brand-logo" @error="onImgError" />
            <div style="display:flex; flex-direction:column; line-height:1;">
                <strong>Zipa</strong>
                <small style="color:var(--muted); font-weight:400;">Tienda para mascotas</small>
            </div>
        </a>

                <nav aria-label="Main navigation">
                        <button class="nav-toggle" @click="toggleMenu" :aria-expanded="menuOpen">☰</button>

                        <ul class="nav-main" :class="{ open: menuOpen }">
                                <li><NuxtLink to="/">Inicio</NuxtLink></li>
                                <li><NuxtLink to="/products">Productos</NuxtLink></li>
                                <li><NuxtLink to="/services">Servicios</NuxtLink></li>
                        </ul>

                        <div class="nav-actions">
                            <template v-if="!user">
                                <NuxtLink to="/login" class="nav-plain">Login</NuxtLink>
                                <NuxtLink to="/register" class="nav-plain">Registro</NuxtLink>
                            </template>

                            <template v-else>
                                <div class="user-menu" @click.stop="toggleUserMenu">
                                    <button class="user-button"><span class="user-icon" aria-hidden>
                                      <!-- simple gear SVG -->
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="currentColor" opacity="0.95"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.9.9a1 1 0 0 1-1.4 1.4l-.9-.9a1 1 0 0 0-1.1-.2 7.3 7.3 0 0 1-1.6.9 1 1 0 0 0-.6 1V20a1 1 0 0 1-2 0v-.2a1 1 0 0 0-.6-1 7.3 7.3 0 0 1-1.6-.9 1 1 0 0 0-1.1.2l-.9.9A1 1 0 0 1 3.1 17l.9-.9a1 1 0 0 0 .2-1.1 7.3 7.3 0 0 1-.9-1.6 1 1 0 0 0-1-.6H3a1 1 0 0 1 0-2h.2c.4 0 .8-.3 1-.6.3-.6.6-1.2.9-1.6a1 1 0 0 0-.2-1.1L3.1 4.1A1 1 0 0 1 4.5 2.7l.9.9c.4.3.9.2 1.1-.2.4-.6.9-1.2 1.6-1.6.3-.2.6-.1 1-.1H11a1 1 0 0 1 0 2h-.2c-.4 0-.8.3-1 .6-.3.6-.6 1.2-.9 1.6a1 1 0 0 0 .2 1.1l.9.9a1 1 0 0 1 0 1.4l-.9.9a1 1 0 0 0-.2 1.1c.3.4.6 1 .9 1.6.3.4.7.6 1 .6H11a1 1 0 0 1 0 2h-.2c-.3 0-.7.1-1 .1-.6.3-1.2.6-1.6.9a1 1 0 0 0-.2 1.1l.9.9A1 1 0 0 1 6.9 21l-.9-.9A1 1 0 0 0 4.6 20a7.3 7.3 0 0 1-.9-1.6 1 1 0 0 0-1-.6H3a1 1 0 0 1 0-2h.2c.3 0 .6-.1 1-.1.6-.3 1.2-.6 1.6-.9a1 1 0 0 0 .2-1.1L5.8 12a1 1 0 0 1 0-1.4l.9-.9a1 1 0 0 0-.2-1.1 7.3 7.3 0 0 1-.9-1.6c-.2-.3-.1-.6-.1-1H6a1 1 0 0 1 0-2h.2c.4 0 .8-.3 1-.6.3-.6.6-1.2.9-1.6.3-.4.7-.6 1-.6H10a1 1 0 0 1 0 2H9.8c-.4 0-.8.3-1 .6-.3.6-.6 1.2-.9 1.6a1 1 0 0 0 .2 1.1l.9.9A1 1 0 0 1 9.8 9l-.9.9a1 1 0 0 0-.2 1.1c.3.4.6 1 .9 1.6.3.4.7.6 1 .6H11a1 1 0 0 1 0 2H10.8c-.3 0-.7.1-1 .1-.6.3-1.2.6-1.6.9a1 1 0 0 0-.2 1.1l.9.9A1 1 0 0 1 8.1 20l.9-.9c.4-.3.9-.2 1.1.2.4.6.9 1.2 1.6 1.6.3.2.6.1 1 .1H12"/>
                                    </svg>
                                    </span> <span style="margin-left:6px">{{ displayName }}</span> ▾</button>
                                    <div class="user-dropdown" v-show="userMenuOpen">
                                        <NuxtLink to="/addresses">Direcciones</NuxtLink>
                                        <NuxtLink to="/payments">Pagos</NuxtLink>
                                        <NuxtLink to="/profile">Perfil</NuxtLink>
                                        <button class="btn-secondary" @click.prevent="logout">Cerrar sesión</button>
                                    </div>
                                </div>
                            </template>
                        </div>
                </nav>
    </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const logoSrc = ref('/logo.png')
const menuOpen = ref(false)
const userMenuOpen = ref(false)

function toggleMenu() { menuOpen.value = !menuOpen.value }
function toggleUserMenu() { userMenuOpen.value = !userMenuOpen.value }

function onImgError() {
    if (logoSrc.value !== '/logo.svg') {
        logoSrc.value = '/logo.svg'
    }
}

// user state (inicializado a null para evitar errores en SSR/TS)
const user = useState<any>('user', () => null)

// Display-friendly name: prefer `name`, then Spanish `nombre`, then `Usu_fullName`, then email.
const displayName = computed(() => {
    if (!user || !user.value) return ''
    const u = user.value
    return (u.name || u.nombre || u.Usu_fullName || u.email || '')
})

function logout() {
    user.value = null
    try { localStorage.removeItem('user') } catch (e) {}
    userMenuOpen.value = false
    navigateTo('/')
}
</script>
