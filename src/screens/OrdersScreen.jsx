import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Clock, Package, ChevronRight, ShoppingCart, AlertCircle, Search, Equal } from 'lucide-react'
import { StatusBadge, timeAgo } from '../components/shared'
import { headerEnter, staggerCards, buttonPress } from '../utils/animations'
import { useOrders } from '../hooks/useOrders'

const FILTERS = ['all', 'pending', 'in-progress', 'packed']

function OrderCard({ order, onStart }) {
  const isPacked     = order.status === 'packed'
  const isInProgress = order.status === 'in-progress'
  const progress     = order.itemCount > 0 ? (order.pickedCount / order.itemCount) * 100 : 0

  return (
    <div onClick={() => !isPacked && onStart(order)}
      className={`bg-white rounded-xl border transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm
        ${isPacked ? 'border-[#d1fae5]' : isInProgress ? 'border-[#ffe0e0]' : 'border-[#ededed]'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base font-bold text-[#111827] tracking-tight">#{order.id}</span>
              {order.priority === 'urgent' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2] flex items-center gap-1">
                  <AlertCircle size={9} /> URGENT
                </span>
              )}
            </div>
            <p className="text-sm text-[#6b7280]">{order.customer}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {isInProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#9ca3af]">Progress</span>
              <span className="text-xs font-semibold" style={{ color: '#ee2c2c' }}>
                {order.pickedCount}/{order.itemCount} items
              </span>
            </div>
            <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: '#ee2c2c' }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#9ca3af]">
              <Package size={13} />
              <span className="text-xs">{order.itemCount} items</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1 text-[#9ca3af]">
              <Clock size={13} />
              <span className="text-xs">{timeAgo(order.createdAt)}</span>
            </div>
          </div>
          {!isPacked && (
            <button
              onClick={e => { e.stopPropagation(); buttonPress(e.currentTarget); onStart(order) }}
              className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-semibold transition-all duration-150"
              style={isInProgress
                ? { backgroundColor: '#ee2c2c', color: 'white' }
                : { backgroundColor: '#f3f4f6', color: '#374151' }}>
              {isInProgress ? 'Continue' : 'Start Picking'}
              <ChevronRight size={13} />
            </button>
          )}
          {isPacked && (
            <span className="text-xs text-[#059669] font-semibold flex items-center gap-1">✓ Complete</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrdersScreen({ onStartPicking }) {
  const { orders, loading } = useOrders()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const headerRef = useRef(null)
  const cardsRef  = useRef(null)

  const pending    = orders.filter(o => o.status === 'pending').length
  const inProgress = orders.filter(o => o.status === 'in-progress').length
  const packed     = orders.filter(o => o.status === 'packed').length

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  useEffect(() => {
    headerEnter(headerRef.current)
    const cards = Array.from(cardsRef.current?.children || [])
    staggerCards(cards, { delay: 0.2 })
    return () => {
      gsap.killTweensOf(headerRef.current)
      gsap.killTweensOf(Array.from(cardsRef.current?.children || []))
    }
  }, [])

  useEffect(() => {
    const cards = Array.from(cardsRef.current?.children || [])
    staggerCards(cards, { delay: 0.05 })
  }, [filter])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>

      {/* Dark Header */}
      <div ref={headerRef} className="flex-shrink-0 px-5 pt-12 pb-5 rounded-b-[16px] shadow-sm" style={{ backgroundColor: '#1b1a20' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/Target_Bullseye-Logo_Red.jpg" alt="Logo" className="w-[81%] h-[81%] object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.6px]"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Today · Mon, 23 Mar</p>
              <h1 className="text-[20px] font-bold text-[#fafafa] leading-tight">Hello Arjun Rawat</h1>
            </div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Equal size={28} className="text-white" strokeWidth={2} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#2e2e36' }}>
          {[
            { label: 'Pending',     val: pending },
            { label: 'In Progress', val: inProgress },
            { label: 'Packed',      val: packed },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex-1 flex">
              <div className="flex-1 py-3 text-center">
                <p className="text-2xl font-bold text-white leading-7">{s.val}</p>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: '#c4c4c4' }}>{s.label}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px self-stretch my-3" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 h-10 rounded-lg px-3" style={{ backgroundColor: '#2e2e36' }}>
          <Search size={16} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Order ID or customer name…"
            className="flex-1 bg-transparent text-sm outline-none placeholder-[#9ca3af] text-white"
          />
        </div>
      </div>

      {/* White card container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-[10px] mt-3 mb-3 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-5 pb-4">

            <h2 className="text-lg font-bold mb-4" style={{ color: '#363636' }}>Total Orders</h2>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="flex-shrink-0 h-[34px] px-4 rounded-lg text-xs font-semibold capitalize transition-all duration-150 border"
                  style={filter === f
                    ? { backgroundColor: '#ee2c2c', borderColor: '#ee2c2c', color: 'white' }
                    : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  {f === 'in-progress' ? 'In Progress'
                    : f === 'all' ? `All (${orders.length})`
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Order cards */}
            <div ref={cardsRef} className="flex flex-col gap-2">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-[#ee2c2c] border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading orders…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30 text-gray-300" />
                  <p className="text-sm text-gray-400">No orders found</p>
                </div>
              ) : (
                filtered.map(order => (
                  <OrderCard key={order.id} order={order} onStart={onStartPicking} />
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
