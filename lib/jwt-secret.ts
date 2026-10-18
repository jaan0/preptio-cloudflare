const FALLBACK_SECRETS = new Set([
  'your-secret-key',
  'your-secret-key-123',
])

/**
 * Resolve a secret/env var on Cloudflare Workers.
 *
 * On Workers, bindings and secrets are delivered on the request `env` object,
 * NOT on `process.env`. `@opennextjs/cloudflare` publishes that object on
 * `globalThis[Symbol.for('__cloudflare-context__')]` (AsyncLocalStorage), and
 * only lazily copies string entries into `process.env` on the first request of
 * an isolate — so reading `process.env` directly is not reliable here.
 */
function readEnv(name: string): string | undefined {
  try {
    const context = (globalThis as never as Record<symbol, { env?: Record<string, unknown> } | undefined>)[
      Symbol.for('__cloudflare-context__')
    ]
    const fromContext = context?.env?.[name]
    if (typeof fromContext === 'string' && fromContext.trim()) return fromContext.trim()
  } catch {
    // No request context (build time, scripts, tests) — fall through.
  }

  const fromProcess = process.env[name]
  if (typeof fromProcess === 'string' && fromProcess.trim()) return fromProcess.trim()

  return undefined
}

export function getJwtSecret() {
  const secret = readEnv('JWT_SECRET')
  if (!secret || FALLBACK_SECRETS.has(secret)) {
    throw new Error(
      'JWT_SECRET must be configured with a non-default value. ' +
        'Add it as a Secret named exactly "JWT_SECRET" on this Worker ' +
        '(Workers & Pages > preptio > Settings > Variables and Secrets).'
    )
  }
  return secret
}
