import { json } from '@sveltejs/kit'
import { categoryList, categoryEntries } from '#lib/data/lists.js'

export const prerender = true
export const entries = categoryEntries

/** @type {import('./$types').RequestHandler} */
export const GET = ({ params }) => json(categoryList(params.category, Number(params.page)))
