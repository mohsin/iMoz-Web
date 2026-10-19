import { Extension, InputRule, Mark, Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import { normalizeTitle, titleToPath } from './document'
import WikiImageView from '~/components/Wiki/nodes/ImageView.vue'
import InfoboxView from '~/components/Wiki/nodes/InfoboxView.vue'
import RefView from '~/components/Wiki/nodes/RefView.vue'
import PortalBoxView from '~/components/Wiki/nodes/PortalBoxView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: { setWikiLink: (target: string) => ReturnType, unsetWikiLink: () => ReturnType }
    wikiRef: { insertRef: (text: string) => ReturnType }
    wikiImage: { insertWikiImage: (attrs: { mediaId: string, caption?: string }) => ReturnType }
    infobox: { insertInfobox: () => ReturnType }
    portalBox: { insertPortalBox: () => ReturnType }
  }
}

/** Internal link to another page; rendered red when the page doesn't exist. */
export const WikiLink = Mark.create<{ exists: (title: string) => boolean }>({
  name: 'wikiLink',
  inclusive: false,
  priority: 1100,
  addOptions: () => ({ exists: () => true }),
  addAttributes: () => ({
    target: {
      default: null,
      parseHTML: el => el.getAttribute('data-target'),
      renderHTML: attrs => ({ 'data-target': attrs.target }),
    },
  }),
  parseHTML: () => [{ tag: 'a[data-target]' }],
  renderHTML({ mark, HTMLAttributes }) {
    const target = normalizeTitle(mark.attrs.target ?? '')
    const missing = !this.options.exists(target)
    return ['a', mergeAttributes(HTMLAttributes, {
      href: titleToPath(target),
      class: missing ? 'wiki-link new' : 'wiki-link',
      title: missing ? `${target} (page does not exist)` : target,
    }), 0]
  },
  addCommands() {
    return {
      setWikiLink: target => ({ commands }) => commands.setMark(this.name, { target: normalizeTitle(target) }),
      unsetWikiLink: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },
  addInputRules() {
    // Typing [[Target]] or [[Target|label]] turns into a link, like wikitext.
    return [new InputRule({
      find: /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/,
      handler: ({ state, range, match }) => {
        const target = normalizeTitle(match[1])
        const label = (match[2] ?? match[1]).trim()
        state.tr.replaceWith(range.from, range.to, state.schema.text(label, [this.type.create({ target })]))
        state.tr.removeStoredMark(this.type)
      },
    })]
  },
})

/** Footnote reference, numbered in order and listed under References. */
export const WikiRef = Node.create({
  name: 'wikiRef',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes: () => ({ text: { default: '' } }),
  parseHTML: () => [{ tag: 'sup[data-ref]', getAttrs: el => ({ text: (el as HTMLElement).getAttribute('data-ref') }) }],
  renderHTML: ({ node }) => ['sup', { 'data-ref': node.attrs.text, class: 'reference' }, '[*]'],
  addNodeView: () => VueNodeViewRenderer(RefView as any),
  addCommands() {
    return { insertRef: text => ({ commands }) => commands.insertContent({ type: this.name, attrs: { text } }) }
  },
})

/** Thumbnail image with caption (encrypted media, decrypted in the browser). */
export const WikiImage = Node.create({
  name: 'wikiImage',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes: () => ({
    mediaId: { default: null },
    caption: { default: '' },
    align: { default: 'right' },
    width: { default: 220 },
  }),
  parseHTML: () => [{ tag: 'figure[data-media]' }],
  renderHTML: ({ HTMLAttributes }) => ['figure', mergeAttributes(HTMLAttributes, { 'data-media': HTMLAttributes.mediaId })],
  addNodeView: () => VueNodeViewRenderer(WikiImageView as any),
  addCommands() {
    return { insertWikiImage: attrs => ({ commands }) => commands.insertContent({ type: this.name, attrs }) }
  },
})

/** Wikipedia-style infobox: title, lead image, label/value rows. */
export const Infobox = Node.create({
  name: 'infobox',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes: () => ({
    title: { default: '' },
    mediaId: { default: null },
    caption: { default: '' },
    rows: { default: [] },
  }),
  parseHTML: () => [{ tag: 'aside[data-infobox]' }],
  renderHTML: ({ HTMLAttributes }) => ['aside', mergeAttributes(HTMLAttributes, { 'data-infobox': '' })],
  addNodeView: () => VueNodeViewRenderer(InfoboxView as any),
  addCommands() {
    return {
      insertInfobox: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: { title: 'Title', rows: [{ label: 'Status', value: '' }, { label: 'Target', value: '' }] },
      }),
    }
  },
})

/** Coloured box with a heading, as on Wikipedia's Main Page. */
export const PortalBox = Node.create({
  name: 'portalBox',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes: () => ({
    title: { default: 'Featured' },
    tone: { default: 'blue' },
    width: { default: 'half' },
  }),
  parseHTML: () => [{ tag: 'section[data-portal]' }],
  renderHTML: ({ HTMLAttributes }) => ['section', mergeAttributes(HTMLAttributes, { 'data-portal': '' }), 0],
  addNodeView: () => VueNodeViewRenderer(PortalBoxView as any),
  addCommands() {
    return {
      // Insert the box and put the cursor inside it, ready to type.
      insertPortalBox: () => ({ tr, state, dispatch }) => {
        const box = this.type.create({ title: 'Featured' }, state.schema.nodes.paragraph.create())
        if (dispatch) {
          tr.replaceSelectionWith(box)
          const start = tr.selection.from - box.nodeSize
          tr.setSelection(TextSelection.create(tr.doc, start + 2)).scrollIntoView()
        }
        return true
      },
    }
  },
})

/** Holds images added while editing until the page is published. */
export const MediaStaging = Extension.create({
  name: 'mediaStaging',
  addStorage: () => ({ pendingMedia: [] as unknown[] }),
})

export function wikiExtensions(exists: (title: string) => boolean, placeholder = '') {
  return [
    StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: 'external', rel: 'noopener', target: '_blank' } }),
    Table.configure({ resizable: false, HTMLAttributes: { class: 'wikitable' } }),
    TableRow, TableHeader, TableCell,
    Placeholder.configure({ placeholder }),
    WikiLink.configure({ exists }),
    WikiRef, WikiImage, Infobox, PortalBox, MediaStaging,
  ]
}
