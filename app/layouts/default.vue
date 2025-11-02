<template>
  <div class="d-flex flex-column min-vh-100">
    <a href="#main-content" class="skip-link">Skip to content</a>

    <nav class="navbar navbar-expand-lg border-bottom sticky-top bg-body" aria-label="Main navigation">
      <div class="container">
        <NuxtLink to="/" class="navbar-brand">SmartHome</NuxtLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#primaryNavbar"
          aria-controls="primaryNavbar"
          :aria-expanded="navExpanded ? 'true' : 'false'"
          aria-label="Toggle navigation"
          @click="navExpanded = !navExpanded"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div class="collapse navbar-collapse" id="primaryNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <NuxtLink to="/" class="nav-link" active-class="active" exact-active-class="active">Home</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/rooms" class="nav-link">Rooms</NuxtLink>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-2">
            <button
              id="theme-toggle"
              class="btn btn-outline-secondary"
              type="button"
              role="switch"
              :aria-checked="theme === 'dark' ? 'true' : 'false'"
              aria-label="Toggle dark mode"
              @click="toggleTheme()"
            >
              <span class="d-inline d-lg-none">Theme</span>
              <span class="d-none d-lg-inline">{{ theme === 'dark' ? 'Dark' : 'Light' }} mode</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main id="main-content" class="container my-4 flex-grow-1" tabindex="-1">
      <slot />
    </main>

    <footer class="border-top py-3 bg-body-tertiary mt-auto">
      <div class="container text-center text-body-secondary small">© {{ year }} SmartHome Dashboard</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
const { theme, toggleTheme, initTheme } = useTheme()
const navExpanded = ref(false)

onMounted(() => {
  initTheme()
  // Collapse navbar on route change (mobile UX)
  const route = useRoute()
  watch(() => route.fullPath, () => {
    const el = document.getElementById('primaryNavbar')
    // bootstrap Collapse API if available
    const anyWin = window as any
    if (el && anyWin?.bootstrap?.Collapse) {
      const instance = anyWin.bootstrap.Collapse.getOrCreateInstance(el)
      instance.hide()
    }
    navExpanded.value = false
  })
})
</script>

<style scoped>
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus-visible {
  left: 16px;
  top: 8px;
  z-index: 1050;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  padding: .375rem .75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: .5rem;
}
</style>
