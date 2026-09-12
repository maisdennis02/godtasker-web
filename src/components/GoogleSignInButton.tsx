import { useEffect, useRef } from 'react'

// "Sign in with Google" via Google Identity Services (GIS). The script is
// loaded on demand, the official button is rendered into a div, and the
// resulting ID token is handed to the caller — who POSTs it to /sessions/google
// so the *server* verifies it. Renders nothing when VITE_GOOGLE_CLIENT_ID is
// unset, so environments without a client id simply don't show the option.
//
// Google Cloud → Credentials → the Web client must list this site's origin
// (scheme + host + port, no path) under "Authorized JavaScript origins".

const GSI_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

let loader: Promise<void> | null = null
function loadGsi(): Promise<void> {
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      loader = null
      reject(new Error('Could not load Google Sign-In'))
    }
    document.head.appendChild(script)
  })
  return loader
}

export const googleSignInEnabled = !!CLIENT_ID

export function GoogleSignInButton({
  onCredential,
  onError,
  text = 'continue_with',
}: {
  onCredential: (idToken: string) => void
  onError?: (err: Error) => void
  text?: GsiButtonConfiguration['text']
}) {
  const host = useRef<HTMLDivElement>(null)
  // Keep the latest callbacks without re-initialising GIS on every render.
  const callbacks = useRef({ onCredential, onError })
  useEffect(() => {
    callbacks.current = { onCredential, onError }
  })

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGsi()
      .then(() => {
        const el = host.current
        if (cancelled || !el || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: r => callbacks.current.onCredential(r.credential),
          ux_mode: 'popup',
          itp_support: true,
        })
        el.innerHTML = '' // StrictMode runs effects twice; don't stack buttons
        window.google.accounts.id.renderButton(el, {
          theme: 'filled_black',
          size: 'large',
          shape: 'rectangular',
          text,
          logo_alignment: 'left',
          width: Math.min(400, Math.max(200, el.clientWidth || 320)),
        })
      })
      .catch(err => callbacks.current.onError?.(err as Error))
    return () => {
      cancelled = true
    }
  }, [text])

  if (!CLIENT_ID) return null
  return <div ref={host} className="flex min-h-10 w-full justify-center" />
}
