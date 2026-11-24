// Creates ENGAGEMENT_SECRET.txt with a random secret, to copy into the Netlify environment
// variable ENGAGEMENT_SECRET (optional, see netlify/lib/engagement.mjs).
//
//   node scripts/make-secret.mjs
//
// The secret is 48 characters made only of the digits 0-9 and the letters a-f, so it is easy to
// select and copy. The file is added to .gitignore: delete it after you have pasted the secret.
import { randomBytes } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const file = 'ENGAGEMENT_SECRET.txt'
writeFileSync(file, `${randomBytes(24).toString('hex')}\n`)

const ignore = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8') : ''
if (!ignore.includes(file)) {
  appendFileSync(
    '.gitignore',
    `${ignore && !ignore.endsWith('\n') ? '\n' : ''}\n# Local secrets\n${file}\n`
  )
}

console.log(`Done: open ${file}, copy the line in it (Ctrl+A, Ctrl+C) and paste it as the value of`)
console.log('the variable ENGAGEMENT_SECRET in Netlify. Delete the file afterwards.')
