<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getArticleObjects, type ArticleObjects, type Unit } from '@/api'

const route = useRoute()
const data = ref<ArticleObjects>()
const error = ref('')

onMounted(async () => {
  try {
    data.value = await getArticleObjects(route.params.id as string)
  } catch (e) {
    error.value = (e as Error).message
  }
})

const unitLabels: Record<Unit, string> = { M: 'm', M2: 'm²', M3: 'm³', KG: 'kg', PIECE: 'pc' }
const quantityFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 3 })

function money(value: number) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: data.value!.currency }).format(value)
}
</script>

<template>
  <nav class="mb-2 text-sm text-muted" aria-label="Breadcrumb">
    <RouterLink to="/">Articles</RouterLink> / {{ data?.article.code ?? '…' }}
  </nav>

  <p
    v-if="error"
    class="my-4 rounded-lg border border-error-line bg-error-soft px-4 py-3 text-error"
    role="alert"
  >
    {{ error }}
  </p>
  <p v-else-if="!data" class="my-4 text-muted">Loading objects…</p>
  <template v-else>
    <h1 class="mb-5 text-2xl font-bold tracking-tight">
      <span class="text-muted tabular-nums">{{ data.article.code }}</span> {{ data.article.title }}
    </h1>

    <div
      v-if="data.objects.length === 0"
      class="rounded-xl border border-dashed border-line bg-white px-6 py-8 text-center text-muted"
    >
      <p class="font-semibold text-ink">No objects in this article.</p>
      <p class="mt-1">Objects assigned to its child articles are listed on their own pages.</p>
    </div>
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white">
      <!-- min-w: on small screens the table scrolls sideways instead of squeezing the names. -->
      <table class="w-full min-w-[44rem] text-[0.9375rem]">
        <thead class="border-b border-line bg-surface-alt text-[0.8125rem] text-muted">
          <tr>
            <th scope="col" class="px-3 py-2.5 text-left font-semibold">Object</th>
            <th scope="col" class="px-3 py-2.5 text-left font-semibold">Type</th>
            <th scope="col" class="px-3 py-2.5 text-right font-semibold">Quantity</th>
            <th scope="col" class="px-3 py-2.5 text-left font-semibold">Unit</th>
            <th scope="col" class="px-3 py-2.5 text-right font-semibold">Unit price</th>
            <th scope="col" class="px-3 py-2.5 text-right font-semibold">Line total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="object in data.objects" :key="object.id" class="hover:bg-surface-alt">
            <td class="px-3 py-2.5">{{ object.name }}</td>
            <td class="px-3 py-2.5 text-muted">{{ object.type }}</td>
            <td class="px-3 py-2.5 text-right tabular-nums">{{ quantityFormat.format(object.quantity) }}</td>
            <td class="px-3 py-2.5">{{ unitLabels[object.unit] }}</td>
            <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{{ money(object.unitPrice) }}</td>
            <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{{ money(object.lineTotal) }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t-2 border-ink font-bold">
          <tr>
            <th scope="row" colspan="5" class="px-3 py-2.5 text-left">Total of objects in this article</th>
            <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{{ money(data.total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p v-if="data.objects.length > 0" class="mt-1.5 text-[0.8125rem] text-muted">
      Objects of child articles are not included. The total is calculated from unrounded line totals,
      so it can differ by a cent from the sum of the rows shown.
    </p>
  </template>
</template>
