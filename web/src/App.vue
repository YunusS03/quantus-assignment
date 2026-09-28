<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="flex items-baseline gap-3 border-b border-line bg-white px-6 py-3.5">
    <RouterLink to="/" class="font-bold text-ink no-underline hover:text-ink">Quantus</RouterLink>
    <span class="text-sm text-muted">Bill of quantities</span>
  </header>
  <main class="mx-auto max-w-5xl px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
    <RouterView />
  </main>
</template>
