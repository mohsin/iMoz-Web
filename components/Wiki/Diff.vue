<script setup lang="ts">
import { diffLines, diffWords } from 'diff'
import { toWikitext, type PageRecord } from '~/utils/wiki/document'
import { useWiki } from '~/composables/useWiki'

const props = defineProps<{ older: PageRecord, newer: PageRecord }>()
const { state } = useWiki()

interface Row { kind: 'context' | 'change', left?: string, right?: string, leftHtml?: string, rightHtml?: string }

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(a: string, b: string): [string, string] {
  let left = ''
  let right = ''
  for (const part of diffWords(a, b)) {
    const t = escape(part.value)
    if (part.added) right += `<ins>${t}</ins>`
    else if (part.removed) left += `<del>${t}</del>`
    else { left += t; right += t }
  }
  return [left, right]
}

// Side-by-side rows in the style of MediaWiki's diff view.
const rows = computed<Row[]>(() => {
  const a = toWikitext(props.older, state.index.media)
  const b = toWikitext(props.newer, state.index.media)
  const parts = diffLines(a, b)
  const out: Row[] = []
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]
    const lines = p.value.replace(/\n$/, '').split('\n')
    if (!p.added && !p.removed) {
      if (lines.length > 4) {
        out.push({ kind: 'context', left: lines[0], right: lines[0] })
        out.push({ kind: 'context', left: '…', right: '…' })
        out.push({ kind: 'context', left: lines[lines.length - 1], right: lines[lines.length - 1] })
      } else lines.forEach(l => out.push({ kind: 'context', left: l, right: l }))
      continue
    }
    const next = parts[i + 1]
    if (p.removed && next?.added) {
      const added = next.value.replace(/\n$/, '').split('\n')
      for (let j = 0; j < Math.max(lines.length, added.length); j++) {
        const [l, r] = inline(lines[j] ?? '', added[j] ?? '')
        out.push({ kind: 'change', leftHtml: lines[j] !== undefined ? l : undefined, rightHtml: added[j] !== undefined ? r : undefined })
      }
      i++
    } else if (p.removed) lines.forEach(l => out.push({ kind: 'change', leftHtml: `<del>${escape(l)}</del>` }))
    else lines.forEach(l => out.push({ kind: 'change', rightHtml: `<ins>${escape(l)}</ins>` }))
  }
  return out
})

const fmt = (d: string) => new Date(d).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <table class="wp-diff">
    <colgroup><col style="width: 2%"><col style="width: 48%"><col style="width: 2%"><col style="width: 48%"></colgroup>
    <thead>
      <tr>
        <th colspan="2">Revision as of {{ fmt(older.updated) }}</th>
        <th colspan="2">Revision as of {{ fmt(newer.updated) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!rows.some(r => r.kind === 'change')"><td colspan="4" style="text-align: center">No difference</td></tr>
      <tr v-for="(r, i) in rows" :key="i">
        <template v-if="r.kind === 'context'">
          <td class="marker" /><td class="context">{{ r.left }}</td>
          <td class="marker" /><td class="context">{{ r.right }}</td>
        </template>
        <template v-else>
          <td class="marker">{{ r.leftHtml !== undefined ? '−' : '' }}</td>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <td :class="{ deleted: r.leftHtml !== undefined }" v-html="r.leftHtml ?? ''" />
          <td class="marker">{{ r.rightHtml !== undefined ? '+' : '' }}</td>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <td :class="{ added: r.rightHtml !== undefined }" v-html="r.rightHtml ?? ''" />
        </template>
      </tr>
    </tbody>
  </table>
</template>
