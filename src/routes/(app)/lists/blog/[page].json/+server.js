import { json } from '@sveltejs/kit'
import { blogList, blogEntries } from '#lib/data/lists.js'

export const prerender = true
export const entries = blogEntries

/** @type {import('./$types').RequestHandler} */
export const GET = ({ params }) => json(blogList(Number(params.page)))
