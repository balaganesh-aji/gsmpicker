import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [prompt,    setPrompt]    = useState(null)
  const [visible,   setVisible]   = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setVisible(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setVisible(false)
    setPrompt(null)
  }

  if (!visible || installed) return null

  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl p-4 shadow-2xl flex items-center gap-3"
      style={{ backgroundColor: '#1b1a20', border: '1px solid rgba(255,255,255,0.1)' }}>

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="/icons/icon-192x192.png" alt="GrocerPick" className="w-full h-full object-cover" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight">Install GrocerPick</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Add to home screen for offline access
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: '#ee2c2c' }}>
          <Download size={13} /> Install
        </button>
        <button
          onClick={() => setVisible(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <X size={15} color="white" />
        </button>
      </div>
    </div>
  )
}
