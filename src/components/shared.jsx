import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { animateBars } from '../utils/animations'

/* ── Status Badge ── */
export function StatusBadge({ status }) {
  const map = {
    pending:       'bg-gray-100 text-gray-500 border-gray-200',
    'in-progress': 'bg-red-50 border-red-100',
    packed:        'bg-emerald-50 text-emerald-600 border-emerald-100',
    picked:        'bg-emerald-50 text-emerald-600 border-emerald-100',
    substituted:   'bg-amber-50 text-amber-600 border-amber-100',
    'out-of-stock':'bg-red-50 text-red-500 border-red-100',
    delivered:     'bg-emerald-50 text-emerald-600 border-emerald-100',
    'in-transit':  'bg-blue-50 text-blue-600 border-blue-100',
    urgent:        'bg-red-50 text-red-500 border-red-100',
    high:          'bg-amber-50 text-amber-600 border-amber-100',
    normal:        'bg-gray-100 text-gray-500 border-gray-200',
  }
  const labels = {
    pending: 'Pending', 'in-progress': 'In Progress', packed: 'Packed',
    picked: 'Picked', substituted: 'Substituted', 'out-of-stock': 'Out of Stock',
    delivered: 'Delivered', 'in-transit': 'In Transit', urgent: 'Urgent',
    high: 'High', normal: 'Normal',
  }
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${map[status] || map.pending}`}
      style={status === 'in-progress' ? { color: '#ee2c2c' } : {}}>
      {labels[status] || status}
    </span>
  )
}

/* ── Location Badge ── */
export function LocationBadge({ location }) {
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg font-mono tracking-[0.275px]"
      style={{ backgroundColor: '#ffeeee', color: '#ee2c2c', border: '1px solid #ffe0e0' }}>
      {location}
    </span>
  )
}

/* ── Bottom Sheet ── */
export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl border-t border-gray-100 animate-slide-up max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, description, confirmLabel, confirmClass, onConfirm, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl border border-gray-100 w-full max-w-sm p-6 animate-fade-in shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-500 mb-5 leading-relaxed">{description}</p>}
        {children}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-colors ${confirmClass || 'bg-indigo-600 hover:bg-indigo-500'}`}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Progress Ring ── */
export function ProgressRing({ value, max, size = 56, stroke = 5, color = '#6366f1' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? value / max : 0
  const dash = circ * pct
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  )
}

/* ── Search Bar ── */
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-2xl pl-10 pr-4 py-3 border border-gray-200 focus:border-indigo-400 focus:bg-white focus:outline-none transition-colors" />
    </div>
  )
}

/* ── Mini Bar Chart ── */
export function MiniBarChart({ data, labels, color = '#6366f1', height = 80, animated = false }) {
  const max = Math.max(...data)
  const barRefs = useRef([])

  useEffect(() => {
    if (animated && barRefs.current.length) {
      animateBars(barRefs.current.filter(Boolean))
    }
  }, [animated])

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            ref={el => barRefs.current[i] = el}
            className="w-full rounded-t-lg"
            style={{
              height: `${(v / max) * (height - 20)}px`,
              backgroundColor: color,
              opacity: 0.75,
              // When not animated, keep the original CSS transition
              transition: animated ? undefined : 'all 0.5s',
            }}
          />
          {labels && <span className="text-[9px] text-gray-400">{labels[i]}</span>}
        </div>
      ))}
    </div>
  )
}

export function timeAgo(date) {
  const mins = Math.floor((Date.now() - date) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
