import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Zap, ZapOff, Search, CheckCircle2, XCircle, Keyboard } from 'lucide-react'
import { mockInventory } from '../data/mockData'

const MOCK_BARCODES = mockInventory.map(i => i.barcode)

export default function ScannerScreen({ onBack, onItemScanned }) {
  const [flashOn, setFlashOn]       = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning]     = useState(false)
  const [scanLine, setScanLine]     = useState(0)
  const [recentScans, setRecentScans] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (manualMode) return
    const t = setInterval(() => setScanLine(prev => (prev >= 100 ? 0 : prev + 1)), 20)
    return () => clearInterval(t)
  }, [manualMode])

  useEffect(() => {
    if (manualMode || scanResult) return
    const t = setTimeout(() => simulateScan(), 3500)
    return () => clearTimeout(t)
  }, [manualMode, scanResult])

  const simulateScan = () => {
    setScanning(true)
    setTimeout(() => {
      const rand = MOCK_BARCODES[Math.floor(Math.random() * MOCK_BARCODES.length)]
      processScan(rand)
      setScanning(false)
    }, 400)
  }

  const processScan = (barcode) => {
    const item = mockInventory.find(i => i.barcode === barcode)
    if (item) {
      const result = { type: 'success', item, barcode }
      setScanResult(result)
      setRecentScans(prev => [result, ...prev.slice(0, 4)])
      if (onItemScanned) onItemScanned(item)
    } else {
      setScanResult({ type: 'error', barcode, message: 'Product not found in system' })
    }
    setTimeout(() => setScanResult(null), 2500)
  }

  const handleManualSearch = (e) => {
    e.preventDefault()
    if (manualInput.trim()) { processScan(manualInput.trim()); setManualInput('') }
  }

  if (manualMode) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-5 pt-12 pb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setManualMode(false)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Manual Search</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-6">
          <form onSubmit={handleManualSearch} className="mb-6">
            <input autoFocus ref={inputRef} type="text" value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Enter barcode or product name…"
              className="w-full bg-white border border-gray-200 focus:border-[#ee2c2c] text-gray-900 rounded-2xl px-4 py-4 text-sm outline-none transition-colors mb-3 shadow-sm" />
            <button type="submit"
              className="w-full bg-[#ee2c2c] hover:bg-[#ee2c2c] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-200">
              <Search size={18} /> Search Product
            </button>
          </form>

          {scanResult && (
            <div className={`rounded-2xl p-4 border mb-4 animate-fade-in
              ${scanResult.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              {scanResult.type === 'success' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600">Product Found</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{scanResult.item.name}</p>
                  <p className="text-xs text-gray-400 mt-1">SKU: {scanResult.item.sku} · Stock: {scanResult.item.stock} · {scanResult.item.location}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle size={18} className="text-red-400" />
                    <span className="text-sm font-semibold text-red-500">Not Found</span>
                  </div>
                  <p className="text-xs text-gray-400">{scanResult.message}</p>
                </>
              )}
            </div>
          )}

          {recentScans.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Recent Scans</p>
              <div className="flex flex-col gap-2">
                {recentScans.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                    {s.type === 'success'
                      ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.item?.name || s.barcode}</p>
                      <p className="text-xs text-gray-400">{s.barcode}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Camera BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black opacity-95" />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)' }} />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-5 pt-12 pb-4 flex items-center justify-between">
        <button onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">Barcode Scanner</p>
          <p className="text-white/50 text-xs">{scanning ? 'Detecting…' : 'Point at barcode'}</p>
        </div>
        <button onClick={() => setFlashOn(f => !f)}
          className={`w-10 h-10 rounded-xl backdrop-blur-sm border flex items-center justify-center transition-colors
            ${flashOn ? 'bg-amber-400/80 border-amber-300/50 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
          {flashOn ? <Zap size={18} /> : <ZapOff size={18} />}
        </button>
      </div>

      {/* Scan Frame */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 bg-black/60" />
          <div className="flex items-stretch" style={{ height: 240 }}>
            <div className="flex-1 bg-black/60" />
            <div style={{ width: 240 }} />
            <div className="flex-1 bg-black/60" />
          </div>
          <div className="flex-1 bg-black/60" />
        </div>

        <div className="relative" style={{ width: 240, height: 240 }}>
          {[
            'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
            'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
            'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 ${cls} border-emerald-400`} />
          ))}
          <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] transition-none"
            style={{ top: `${scanLine}%` }} />
          {scanResult && (
            <div className={`absolute inset-0 rounded-lg flex items-center justify-center animate-fade-in
              ${scanResult.type === 'success' ? 'bg-emerald-500/30 border-2 border-emerald-400' : 'bg-red-500/30 border-2 border-red-400'}`}>
              {scanResult.type === 'success'
                ? <CheckCircle2 size={48} className="text-emerald-400 drop-shadow-lg" />
                : <XCircle size={48} className="text-red-400 drop-shadow-lg" />}
            </div>
          )}
        </div>

        {scanResult && (
          <div className={`relative z-10 mt-6 mx-8 rounded-2xl p-4 border backdrop-blur-md animate-fade-in
            ${scanResult.type === 'success' ? 'bg-white/90 border-emerald-200' : 'bg-white/90 border-red-200'}`}>
            {scanResult.type === 'success' ? (
              <>
                <p className="text-emerald-600 font-bold text-sm mb-1">✓ Product Matched</p>
                <p className="text-gray-900 text-sm font-semibold">{scanResult.item.name}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-gray-500">Stock: <strong className="text-gray-900">{scanResult.item.stock}</strong></span>
                  <span className="text-xs text-gray-500">Loc: <strong className="text-blue-600 font-mono">{scanResult.item.location}</strong></span>
                </div>
              </>
            ) : (
              <>
                <p className="text-red-500 font-bold text-sm mb-1">✗ Not Found</p>
                <p className="text-gray-500 text-xs">{scanResult.message}</p>
              </>
            )}
          </div>
        )}

        {!scanResult && (
          <p className="relative z-10 text-white/40 text-xs mt-6 text-center px-8">
            {scanning ? 'Scanning…' : 'Align barcode within the frame · Auto-detects instantly'}
          </p>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 flex-shrink-0 px-5 pb-6 pt-4 flex gap-3">
        <button onClick={simulateScan}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white py-4 rounded-2xl font-semibold hover:bg-white/20 transition-colors">
          <Search size={20} /> Simulate Scan
        </button>
        <button onClick={() => setManualMode(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#ee2c2c]/90 backdrop-blur-sm text-white py-4 rounded-2xl font-semibold hover:bg-[#ee2c2c] transition-colors">
          <Keyboard size={20} /> Manual Entry
        </button>
      </div>
    </div>
  )
}
