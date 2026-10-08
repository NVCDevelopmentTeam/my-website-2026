/**
 * Polyfill for the ECMAScript 2026 `Uint8Array` hex/base64 methods:
 * `toHex()`, `toBase64()`, `Uint8Array.fromHex()` and `Uint8Array.fromBase64()`.
 *
 * Sveltia CMS (≥ 0.229) calls them directly, and browsers that predate them
 * (before Chrome 140 / Firefox 133 / Safari 18.2) fail with
 * "toHex is not a function" and the CMS shows "Unexpected error".
 * Each method is installed only when it is missing, so native versions always win.
 * Only the admin route imports this file — the public site never loads it.
 */

/**
 * @param {Record<string, any>} target
 * @param {string} name
 * @param {Function} implementation
 */
function define(target, name, implementation) {
  if (typeof target[name] === 'function') return
  Object.defineProperty(target, name, {
    value: implementation,
    writable: true,
    configurable: true
  })
}

export function installUint8ArrayPolyfill() {
  define(
    Uint8Array.prototype,
    'toHex',
    /** @this {Uint8Array} */ function toHex() {
      let hex = ''
      for (let i = 0; i < this.length; i++) hex += this[i].toString(16).padStart(2, '0')
      return hex
    }
  )

  define(
    Uint8Array.prototype,
    'toBase64',
    /**
     * @this {Uint8Array}
     * @param {{ alphabet?: string, omitPadding?: boolean }} [options]
     */ function toBase64(options) {
      let binary = ''
      // Chunked so very large files don't overflow the argument limit of apply()
      for (let i = 0; i < this.length; i += 0x8000) {
        binary += String.fromCharCode.apply(null, Array.from(this.subarray(i, i + 0x8000)))
      }
      let base64 = btoa(binary)
      if (options?.alphabet === 'base64url') base64 = base64.replace(/\+/g, '-').replace(/\//g, '_')
      if (options?.omitPadding) base64 = base64.replace(/=+$/, '')
      return base64
    }
  )

  define(
    Uint8Array,
    'fromHex',
    /** @param {string} string */ function fromHex(string) {
      if (typeof string !== 'string') throw new TypeError('Uint8Array.fromHex expects a string')
      if (string.length % 2 !== 0 || /[^0-9a-f]/i.test(string)) {
        throw new SyntaxError('Invalid hex string')
      }
      const bytes = new Uint8Array(string.length / 2)
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(string.slice(i * 2, i * 2 + 2), 16)
      return bytes
    }
  )

  define(
    Uint8Array,
    'fromBase64',
    /**
     * @param {string} string
     * @param {{ alphabet?: string }} [options]
     */ function fromBase64(string, options) {
      if (typeof string !== 'string') throw new TypeError('Uint8Array.fromBase64 expects a string')
      let base64 = string.replace(/[\t\n\f\r ]+/g, '')
      if (options?.alphabet === 'base64url') base64 = base64.replace(/-/g, '+').replace(/_/g, '/')
      base64 = base64.replace(/=+$/, '')
      if (/[^A-Za-z0-9+/]/.test(base64) || base64.length % 4 === 1) {
        throw new SyntaxError('Invalid base64 string')
      }
      const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      return bytes
    }
  )
}
