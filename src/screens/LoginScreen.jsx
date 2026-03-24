import { useState, useEffect, useRef } from 'react'
import { Fingerprint, ShieldCheck, Delete, Mail } from 'lucide-react'
import gsap from 'gsap'
import { useAuth } from '../context/AuthContext'
import { SUPABASE_ACTIVE } from '../lib/supabase'

const PIN_LENGTH = 4
const DEMO_PIN   = '1234'
const DEMO_EMAIL = 'demo@grocerpick.com'

/* ── PIN dot ── */
function PinDot({ filled, error }) {
  return (
    <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200
      ${error
        ? 'bg-red-500 border-red-500 scale-110'
        : filled ? 'scale-110 border-transparent' : 'border-gray-300 bg-transparent'
      }`}
      style={filled && !error ? { backgroundColor: '#ee2c2c', borderColor: '#ee2c2c' } : {}}
    />
  )
}

/* ── Number pad key ── */
function PadKey({ label, sub, onPress, icon }) {
  const [pressed, setPressed] = useState(false)
  const handle = () => { setPressed(true); setTimeout(() => setPressed(false), 100); onPress() }
  if (icon) {
    return (
      <button onPointerDown={handle}
        className={`flex items-center justify-center h-[68px] rounded-2xl transition-all duration-100 select-none ${pressed ? 'scale-95 opacity-60' : ''}`}>
        {icon}
      </button>
    )
  }
  return (
    <button onPointerDown={handle}
      className={`flex flex-col items-center justify-center h-[68px] rounded-2xl transition-all duration-100 select-none ${pressed ? 'scale-95 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
      <span className="text-[28px] font-light text-gray-900 leading-none">{label}</span>
      {sub && <span className="text-[9px] font-semibold tracking-[1.5px] text-gray-400 mt-0.5">{sub}</span>}
    </button>
  )
}

const KEYS = [
  { label: '1', sub: '' },    { label: '2', sub: 'ABC' }, { label: '3', sub: 'DEF' },
  { label: '4', sub: 'GHI' }, { label: '5', sub: 'JKL' }, { label: '6', sub: 'MNO' },
  { label: '7', sub: 'PQRS' },{ label: '8', sub: 'TUV' }, { label: '9', sub: 'WXYZ' },
]

/* ── Email login form (for Supabase) ── */
function EmailLoginForm({ onBack, onLogin }) {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      onLogin()
    } catch (err) {
      setError(err.message || 'Sign in failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-6" style={{ paddingTop: '48px' }}>
      <div className="text-center mb-8">
        <h2 className="font-bold text-gray-900 text-[22px]">Sign In</h2>
        <p className="text-[14px] text-gray-500 mt-1">Use your warehouse credentials</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@warehouse.com" required
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#ee2c2c] text-gray-900 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" required
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#ee2c2c] text-gray-900 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 text-center font-medium bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="w-full h-[52px] rounded-xl text-white font-semibold text-[15px] transition-all active:scale-[0.98] mt-2 shadow-md shadow-red-200"
          style={{ backgroundColor: '#ee2c2c', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <button onClick={onBack}
        className="text-[12px] text-gray-400 text-center py-3 mt-3">
        ← Back to PIN
      </button>
    </div>
  )
}

export default function LoginScreen({ onLogin }) {
  const { signIn } = useAuth()
  const [mode,     setMode]     = useState('biometric')
  const [bioState, setBioState] = useState('idle')
  const [pin,      setPin]      = useState('')
  const [error,    setError]    = useState(false)
  const [shake,    setShake]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  const logoRef = useRef(null)
  const cardRef = useRef(null)

  /* ── Splash → Login GSAP animation ── */
  useEffect(() => {
    const logoEl = logoRef.current
    const cardEl = cardRef.current
    const shift  = (window.innerHeight / 2) - (logoEl.offsetHeight / 2)
    gsap.set(logoEl, { y: shift })
    gsap.set(cardEl, { y: '100%' })
    const tl = gsap.timeline({ delay: 3 })
    tl.to(logoEl, { y: 0, duration: 0.85, ease: 'power3.inOut' })
      .to(cardEl,  { y: 0, duration: 0.85, ease: 'power3.inOut' }, '<')
    return () => tl.kill()
  }, [])

  /* ── Biometric scan simulation ── */
  useEffect(() => {
    if (bioState !== 'scanning') return
    const t = setTimeout(async () => {
      setBioState('success')
      if (SUPABASE_ACTIVE) {
        try {
          await signIn(DEMO_EMAIL, `bio_${DEMO_PIN}`)
        } catch {
          // biometric simulation — skip auth error in demo
        }
      }
      setTimeout(() => onLogin(), 700)
    }, 1400)
    return () => clearTimeout(t)
  }, [bioState, onLogin, signIn])

  /* ── PIN handling ── */
  const appendDigit = (d) => {
    if (pin.length >= PIN_LENGTH || error || loading) return
    const next = pin + d
    setPin(next)
    if (next.length === PIN_LENGTH) {
      setTimeout(async () => {
        if (SUPABASE_ACTIVE) {
          setLoading(true)
          try {
            await signIn(DEMO_EMAIL, next)
            onLogin()
          } catch {
            triggerError()
          } finally {
            setLoading(false)
          }
        } else {
          // Demo mode: hardcoded PIN
          if (next === DEMO_PIN) {
            onLogin()
          } else {
            triggerError()
          }
        }
      }, 100)
    }
  }

  const triggerError = () => {
    setApiError('')
    setError(true)
    setShake(true)
    setTimeout(() => { setError(false); setShake(false); setPin('') }, 650)
  }

  const deleteDigit  = () => { if (error) { setError(false); setPin(''); return } setPin(p => p.slice(0,-1)) }
  const switchToPin  = () => { setMode('pin');       setPin(''); setError(false); setBioState('idle') }
  const switchToBio  = () => { setMode('biometric'); setBioState('idle') }
  const switchToEmail = () => { setMode('email') }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#1b1a20' }}>

      {/* ── Dark top: logo + branding ── */}
      <div ref={logoRef} className="flex-shrink-0 flex flex-col items-center px-6"
        style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div className="w-[88px] h-[88px] rounded-[22px] bg-white flex items-center justify-center overflow-hidden mb-5"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
          <img src="/Target_Bullseye-Logo_Red.jpg" alt="GrocerPick" className="w-[78%] h-[78%] object-contain" />
        </div>
        <h1 className="text-[26px] font-bold text-white tracking-tight">GrocerPick</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Warehouse · Fulfilment Suite</p>
      </div>

      {/* ── White login card ── */}
      <div ref={cardRef} className="flex-1 bg-white rounded-t-[28px] flex flex-col overflow-hidden"
        style={{ marginTop: '6px', boxShadow: '0 -4px 32px rgba(0,0,0,0.15)' }}>

        {/* BIOMETRIC */}
        {mode === 'biometric' && (
          <div className="flex-1 flex flex-col px-6 pb-6" style={{ paddingTop: '64px' }}>
            <div className="text-center mb-7">
              <h2 className="font-bold text-gray-900" style={{ fontSize: '24px' }}>Welcome back</h2>
              <p className="text-[14px] text-gray-500 mt-1">Verify your identity to continue</p>
            </div>

            <div className="flex flex-col items-center gap-3 mb-7">
              <button
                onClick={() => (bioState === 'idle' || bioState === 'fail') && setBioState('scanning')}
                disabled={bioState === 'scanning' || bioState === 'success'}
                className="relative flex items-center justify-center active:scale-95 transition-transform duration-150">
                {bioState === 'scanning' && (
                  <div className="absolute w-[110px] h-[110px] rounded-full animate-ping opacity-10 bg-gray-400" />
                )}
                <div className={`w-[92px] h-[92px] rounded-full flex items-center justify-center transition-all duration-300
                  ${bioState === 'success' ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                  {bioState === 'success'
                    ? <ShieldCheck size={40} color="#10b981" strokeWidth={1.5} />
                    : <Fingerprint size={40} color="#374151" strokeWidth={1.5} />
                  }
                </div>
              </button>
              {bioState === 'idle'     && <p className="text-[13px] text-gray-400">Tap fingerprint to sign in</p>}
              {bioState === 'scanning' && <p className="text-[13px] text-gray-500 font-medium">Scanning…</p>}
              {bioState === 'success'  && <p className="text-[13px] font-semibold text-emerald-500">Verified ✓</p>}
              {bioState === 'fail'     && <p className="text-[13px] font-medium text-red-500">Not recognised. Tap to retry.</p>}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[12px] text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button onClick={switchToPin}
              className="w-full h-[52px] rounded-xl bg-gray-100 text-[15px] font-semibold text-gray-800 transition-all active:scale-[0.98] active:bg-gray-200 mb-3">
              Use PIN instead
            </button>

            {SUPABASE_ACTIVE && (
              <button onClick={switchToEmail}
                className="w-full h-[46px] rounded-xl border border-gray-200 text-[14px] font-medium text-gray-500 flex items-center justify-center gap-2">
                <Mail size={15} /> Sign in with email
              </button>
            )}

            {!SUPABASE_ACTIVE && (
              <p className="text-center text-[10px] text-amber-500 mt-2 bg-amber-50 rounded-lg px-3 py-2">
                Demo mode — PIN: {DEMO_PIN}
              </p>
            )}

            <p className="text-center text-[10px] text-gray-300 mt-auto pt-4">
              GrocerPick v2.4 · Secured by 256-bit AES
            </p>
          </div>
        )}

        {/* PIN */}
        {mode === 'pin' && (
          <div className="flex-1 flex flex-col px-6 pt-8 pb-4 overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="font-bold text-gray-900" style={{ fontSize: '24px' }}>Enter PIN</h2>
              <p className="text-[14px] text-gray-500 mt-1">
                {SUPABASE_ACTIVE ? 'Use your 4-digit PIN' : `Demo PIN: ${DEMO_PIN}`}
              </p>
            </div>
            <div className={`flex items-center justify-center gap-5 mb-2 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <PinDot key={i} filled={i < pin.length} error={error && i < pin.length} />
              ))}
            </div>
            <div className={`h-5 mb-5 transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-[12px] text-red-500 text-center font-medium">Incorrect PIN. Try again.</p>
            </div>
            {loading && (
              <div className="text-center mb-3">
                <p className="text-[13px] text-gray-400">Signing in…</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {KEYS.map(k => (
                <PadKey key={k.label} label={k.label} sub={k.sub} onPress={() => appendDigit(k.label)} />
              ))}
              <PadKey onPress={switchToBio} icon={<Fingerprint size={22} color="#9ca3af" strokeWidth={1.5} />} />
              <PadKey label="0" sub="" onPress={() => appendDigit('0')} />
              <PadKey onPress={deleteDigit} icon={<Delete size={20} color="#9ca3af" strokeWidth={1.5} />} />
            </div>
            <button onClick={switchToBio}
              className="text-[12px] text-gray-400 text-center py-1">
              Use biometric instead
            </button>
          </div>
        )}

        {/* EMAIL (Supabase) */}
        {mode === 'email' && (
          <EmailLoginForm onBack={() => setMode('pin')} onLogin={onLogin} />
        )}
      </div>
    </div>
  )
}
