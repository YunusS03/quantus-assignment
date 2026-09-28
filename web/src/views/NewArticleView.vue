<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createArticle, getArticles, type Article } from '@/api'

const router = useRouter()
const articles = ref<Article[]>([])
const code = ref('')
const title = ref('')
const description = ref('')
const parentId = ref<number | null>(null)
const saving = ref(false)
const error = ref('')

const parentCode = computed(() => articles.value.find((a) => a.id === parentId.value)?.code)

onMounted(async () => {
  try {
    articles.value = await getArticles()
  } catch (e) {
    error.value = (e as Error).message
  }
})

async function submit() {
  saving.value = true
  error.value = ''
  try {
    await createArticle({
      code: code.value,
      title: title.value,
      description: description.value,
      parentId: parentId.value,
    })
    await router.push('/')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <nav class="mb-2 text-sm text-muted" aria-label="Breadcrumb">
    <RouterLink to="/">Articles</RouterLink> / New article
  </nav>
  <h1 class="mb-5 text-2xl font-bold tracking-tight">New article</h1>

  <form class="grid max-w-lg" @submit.prevent="submit">
    <label for="parent" class="mb-1.5 text-sm font-semibold">Parent article</label>
    <select
      id="parent"
      v-model="parentId"
      class="w-full rounded-lg border border-line bg-white px-2.5 py-2 focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent-soft"
    >
      <option :value="null">None (top-level article)</option>
      <option v-for="article in articles" :key="article.id" :value="article.id">
        {{ article.code }} {{ article.title }}
      </option>
    </select>

    <label for="code" class="mt-4 mb-1.5 text-sm font-semibold">Code</label>
    <input
      id="code"
      v-model.trim="code"
      class="w-full rounded-lg border border-line bg-white px-2.5 py-2 focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent-soft"
      required
      autocomplete="off"
      aria-describedby="code-hint"
    />
    <p id="code-hint" class="mt-1.5 text-[0.8125rem] text-muted">
      <template v-if="parentCode">
        {{ parentCode }} plus one two-digit group, for example {{ parentCode }}10.
      </template>
      <template v-else>One two-digit group ending in a dot, for example 50.</template>
    </p>

    <label for="title" class="mt-4 mb-1.5 text-sm font-semibold">Title</label>
    <input
      id="title"
      v-model.trim="title"
      class="w-full rounded-lg border border-line bg-white px-2.5 py-2 focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent-soft"
      required
    />

    <label for="description" class="mt-4 mb-1.5 text-sm font-semibold">Description</label>
    <textarea
      id="description"
      v-model="description"
      rows="5"
      class="w-full resize-y rounded-lg border border-line bg-white px-2.5 py-2 focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent-soft"
    ></textarea>
    <p class="mt-1.5 text-[0.8125rem] text-muted">
      HTML is allowed, for example &lt;p&gt;Walls of 14 cm&lt;/p&gt;.
    </p>

    <p
      v-if="error"
      class="mt-4 rounded-lg border border-error-line bg-error-soft px-4 py-3 text-error"
      role="alert"
    >
      {{ error }}
    </p>

    <div class="mt-6 flex gap-3">
      <button
        type="submit"
        class="cursor-pointer rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="saving"
      >
        {{ saving ? 'Saving…' : 'Create article' }}
      </button>
      <RouterLink
        to="/"
        class="rounded-lg border border-line bg-white px-4 py-2 font-semibold text-ink no-underline hover:bg-surface-alt hover:text-ink"
      >
        Cancel
      </RouterLink>
    </div>
  </form>
</template>
