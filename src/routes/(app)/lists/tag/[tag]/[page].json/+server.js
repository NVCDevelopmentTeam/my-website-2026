import { json } from '@sveltejs/kit'
import { tagList, tagEntries } from '#lib/data/lists.js'

export const prerender = true
export const entries = tagEntries

/** @type {import('./$types').RequestHandler} */
export const GET = ({ params }) => json(tagList(params.tag, Number(params.page)))
