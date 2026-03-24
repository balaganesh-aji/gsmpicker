import { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft, CheckCircle2, Circle, ShoppingCart, ScanLine,
  Package, ChevronRight, Plus, Minus, PackageCheck,
  MapPin, ChevronDown, ChevronUp, AlertTriangle, XCircle, Layers
} from 'lucide-react'
import { LocationBadge, ProgressRing } from '../components/shared'
import { headerEnter, staggerCards } from '../utils/animations'

/* ─── helpers ─────────────────────────────────────────────── */
function orderColor(i) {
  const palette = ['#ee2c2c', '#2563eb', '#7c3aed', '#0891b2', '#d97706']
  return palette[i % palette.length]
}

function buildMergedItems(orders) {
  const map = {}
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!map[item.sku]) {
        map[item.sku] = {
          key: item.sku,
          name: item.name,
          sku: item.sku,
          barcode: item.barcode,
          location: item.location,
          totalQty: 0,
          cartQty: 0,
          status: 'pending',
          breakdown: [],
        }
      }
      map[item.sku].totalQty += item.qty
      map[item.sku].breakdown.push({ orderId: order.id, qty: item.qty })
    })
  })
  // Sort by location aisle so picker walks in order
  return Object.values(map).sort((a, b) => a.location.localeCompare(b.location))
}

/* ─── STEP 1: Order Selection ─────────────────────────────── */
function SelectStep({ orders, selected, onToggle, onStart, onBack }) {
  const pickable = orders.filter(o => o.status !== 'packed')
  const totalItems = useMemo(() =>
    orders.filter(o => selected.includes(o.id)).reduce((s, o) => s + o.itemCount, 0),
    [orders, selected])

  const headerRef = useRef(null)
  const listRef   = useRef(null)
  useEffect(() => {
    headerEnter(headerRef.current)
    staggerCards(Array.from(listRef.current?.children || []), { delay: 0.15 })
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>

      {/* Dark header */}
      <div ref={headerRef} className="flex-shrink-0 px-5 pt-12 pb-5 rounded-b-[20px]"
        style={{ backgroundColor: '#1b1a20' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#2e2e36' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.6px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}>Batch Picking</p>
            <h1 className="text-[20px] font-bold text-white leading-tight">Select Orders</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: '#2e2e36' }}>
            <Layers size={14} style={{ color: '#ee2c2c' }} />
            <span className="text-[13px] font-bold text-white">{selected.length}</span>
            <span className="text-[11px]" style={{ color: '#c4c4c4' }}>selected</span>
          </div>
        </div>
        <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Select multiple orders to pick together in one warehouse run
        </p>
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div ref={listRef} className="flex flex-col gap-2">
          {pickable.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No pending orders</div>
          )}
          {pickable.map((order, idx) => {
            const isSelected = selected.includes(order.id)
            const colorIdx   = selected.indexOf(order.id)
            const color      = isSelected ? orderColor(colorIdx) : '#e5e7eb'
            return (
              <button key={order.id} onClick={() => onToggle(order.id)}
                className="w-full text-left rounded-xl border-2 bg-white transition-all duration-150 active:scale-[0.98] shadow-sm"
                style={{ borderColor: isSelected ? color : '#ededed' }}>
                <div className="p-4 flex items-center gap-3">
                  {/* Checkbox */}
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                    style={{ borderColor: isSelected ? color : '#d1d5db',
                      backgroundColor: isSelected ? color : 'transparent' }}>
                    {isSelected && <CheckCircle2 size={14} color="white" fill="white" />}
                  </div>

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[15px] font-bold text-[#111827]">#{order.id}</span>
                      {order.priority === 'urgent' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-100">URGENT</span>
                      )}
                      <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full
                        ${order.status === 'in-progress' ? 'bg-red-50 text-[#ee2c2c]' : 'bg-gray-100 text-gray-500'}`}>
                        {order.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500">{order.customer}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{order.itemCount} items</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Start button */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white border-t border-[#f3f4f6]
        shadow-[0px_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          disabled={selected.length === 0}
          onClick={onStart}
          className="w-full h-14 rounded-xl flex items-center justify-between px-5 text-white font-bold text-[15px] transition-all active:scale-[0.98]"
          style={selected.length > 0
            ? { backgroundColor: '#ee2c2c', boxShadow: '0 4px 14px rgba(238,44,44,0.3)' }
            : { backgroundColor: '#e5e7eb', cursor: 'not-allowed', color: '#9ca3af' }}>
          <span>
            {selected.length === 0
              ? 'Select orders to continue'
              : `Start Batch Pick · ${selected.length} order${selected.length > 1 ? 's' : ''}`}
          </span>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] opacity-80">{totalItems} items</span>
              <ChevronRight size={18} />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

/* ─── STEP 2: Batch Picking ───────────────────────────────── */
function PickStep({ mergedItems: initialItems, selectedOrders, onBack, onDone }) {
  const [items, setItems]       = useState(initialItems)
  const [cartOpen, setCartOpen] = useState(false)

  const handled     = items.filter(i => i.cartQty >= i.totalQty || i.status === 'oos').length
  const total       = items.length
  const pct         = total > 0 ? Math.round((handled / total) * 100) : 0
  const allHandled  = handled === total
  const cartCount   = items.filter(i => i.cartQty > 0 || i.status === 'oos').length

  const addToCart = (key) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i
      const newQty = Math.min(i.cartQty + 1, i.totalQty)
      return { ...i, cartQty: newQty, status: newQty >= i.totalQty ? 'done' : 'partial' }
    }))
  }

  const removeFromCart = (key) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i
      const newQty = Math.max(i.cartQty - 1, 0)
      return { ...i, cartQty: newQty, status: newQty === 0 ? 'pending' : 'partial' }
    }))
  }

  const markOOS = (key) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, status: 'oos', cartQty: 0 } : i))
  }

  // Group items by aisle letter
  const grouped = useMemo(() => {
    const g = {}
    items.forEach(item => {
      const aisle = item.location.split('-')[0]
      if (!g[aisle]) g[aisle] = []
      g[aisle].push(item)
    })
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>

      {/* Dark header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-5 rounded-b-[20px]"
        style={{ backgroundColor: '#1b1a20' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#2e2e36' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.6px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Batch · {selectedOrders.length} Orders
            </p>
            <h1 className="text-[20px] font-bold text-white">Picking Run</h1>
          </div>
          <div className="text-right">
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Progress</p>
            <p className="text-[14px] font-bold" style={{ color: allHandled ? '#10b981' : '#ee2c2c' }}>
              {handled}/{total}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#2e2e36' }}>
          <ProgressRing value={handled} max={total} size={48} stroke={5}
            color={allHandled ? '#10b981' : '#ee2c2c'} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-semibold text-white">{handled} of {total} items handled</span>
              <span className="text-[13px] font-bold" style={{ color: allHandled ? '#10b981' : '#ee2c2c' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: allHandled ? '#10b981' : '#ee2c2c' }} />
            </div>
            {/* Order colour dots */}
            <div className="flex items-center gap-1.5 mt-2">
              {selectedOrders.map((o, i) => (
                <div key={o.id} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: orderColor(i) }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>#{o.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Item list — grouped by aisle */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
        {grouped.map(([aisle, aisleItems]) => (
          <div key={aisle}>
            {/* Aisle header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: '#1b1a20' }}>
                <MapPin size={11} style={{ color: '#ee2c2c' }} />
                <span className="text-[11px] font-bold text-white tracking-wider">AISLE {aisle}</span>
              </div>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400">{aisleItems.length} item{aisleItems.length > 1 ? 's' : ''}</span>
            </div>

            {/* Items in this aisle */}
            <div className="flex flex-col gap-2">
              {aisleItems.map(item => {
                const isDone    = item.status === 'done' || item.cartQty >= item.totalQty
                const isOOS     = item.status === 'oos'
                const isPartial = item.cartQty > 0 && !isDone && !isOOS
                return (
                  <div key={item.key}
                    className={`rounded-xl border p-3 transition-all duration-200
                      ${isOOS     ? 'bg-red-50 border-red-100'
                      : isDone    ? 'bg-emerald-50 border-emerald-200'
                      : isPartial ? 'bg-[#fff8f0] border-amber-100'
                      : 'bg-white border-[#ededed]'}`}>

                    {/* Top: status + name + location */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="mt-0.5 flex-shrink-0">
                        {isOOS  ? <XCircle size={16} className="text-red-400" />
                        : isDone? <CheckCircle2 size={16} className="text-emerald-500" />
                        : isPartial ? <div className="w-4 h-4 rounded-full border-2 border-amber-400" />
                        : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold leading-tight
                          ${isOOS ? 'line-through text-gray-400' : 'text-[#111827]'}`}>
                          {item.name}
                        </p>
                        {/* Which orders need this */}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {item.breakdown.map((b, bi) => {
                            const orderIdx = selectedOrders.findIndex(o => o.id === b.orderId)
                            return (
                              <span key={b.orderId}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                                style={{ backgroundColor: orderColor(orderIdx) }}>
                                #{b.orderId.split('-')[1]} ×{b.qty}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <LocationBadge location={item.location} />
                    </div>

                    {/* Bottom: qty info + stepper */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-400">Need</span>
                          <span className="text-[13px] font-bold text-gray-900">{item.totalQty}</span>
                        </div>
                        {!isOOS && (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-400">Cart</span>
                            <span className={`text-[13px] font-bold
                              ${isDone ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-gray-400'}`}>
                              {item.cartQty}
                            </span>
                          </div>
                        )}
                        {isOOS && <span className="text-[11px] font-semibold text-red-400">Out of Stock</span>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* OOS toggle */}
                        {!isOOS && (
                          <button onClick={() => markOOS(item.key)}
                            className="h-7 px-2 rounded-lg text-[10px] font-semibold border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors">
                            OOS
                          </button>
                        )}
                        {isOOS && (
                          <button onClick={() => setItems(prev => prev.map(i =>
                            i.key === item.key ? { ...i, status: 'pending', cartQty: 0 } : i))}
                            className="h-7 px-2 rounded-lg text-[10px] font-semibold bg-red-50 border border-red-100 text-red-500">
                            Undo
                          </button>
                        )}
                        {/* − + stepper */}
                        {!isOOS && (
                          <div className="flex items-center gap-1">
                            {item.cartQty > 0 && (
                              <button onClick={() => removeFromCart(item.key)}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 active:scale-90 transition-all">
                                <Minus size={12} />
                              </button>
                            )}
                            <button onClick={() => addToCart(item.key)}
                              disabled={isDone}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white active:scale-90 transition-all disabled:opacity-40"
                              style={{ backgroundColor: isDone ? '#10b981' : '#ee2c2c' }}>
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 pt-3 pb-6
        shadow-[0px_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2">
          <button className="w-14 h-14 rounded-xl border border-[#ededed] flex items-center justify-center text-gray-400 active:scale-95 transition-all">
            <ScanLine size={22} />
          </button>
          <button onClick={() => allHandled ? onDone(items) : setCartOpen(true)}
            className="flex-1 h-14 rounded-xl flex items-center justify-between px-4 text-white font-bold text-[15px] active:scale-[0.98] transition-all"
            style={allHandled
              ? { backgroundColor: '#10b981', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }
              : { backgroundColor: '#ee2c2c', boxShadow: '0 4px 14px rgba(238,44,44,0.25)' }}>
            <div className="flex items-center gap-2">
              {allHandled ? <PackageCheck size={20} /> : <ShoppingCart size={20} />}
              <span>{allHandled ? 'Pack Orders' : 'View Cart'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/25 rounded-lg px-2 py-0.5 text-[12px] font-bold">
                {cartCount}/{total}
              </div>
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Mini cart sheet */}
      {cartOpen && (
        <div className="absolute inset-0 z-30" onClick={() => setCartOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl max-h-[65vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-2">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">Cart Review</h3>
              <p className="text-[12px] text-gray-400 mb-4">{cartCount} of {total} items added</p>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {items.map(item => {
                const isDone = item.cartQty >= item.totalQty
                const isOOS  = item.status === 'oos'
                return (
                  <div key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border
                      ${isOOS ? 'bg-red-50 border-red-100'
                      : isDone ? 'bg-emerald-50 border-emerald-100'
                      : item.cartQty > 0 ? 'bg-[#fff8f0] border-amber-100'
                      : 'bg-gray-50 border-dashed border-gray-200'}`}>
                    <div className="flex-shrink-0">
                      {isOOS  ? <XCircle size={15} className="text-red-400" />
                      : isDone? <CheckCircle2 size={15} className="text-emerald-500" />
                      : item.cartQty > 0 ? <div className="w-4 h-4 rounded-full border-2 border-amber-400" />
                      : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold truncate ${isOOS ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {isOOS ? 'Out of Stock' : `${item.cartQty}/${item.totalQty} picked`}
                      </p>
                    </div>
                    <LocationBadge location={item.location} />
                  </div>
                )
              })}
            </div>
            <div className="px-4 pb-6 pt-2 border-t border-gray-100">
              <button onClick={() => { setCartOpen(false); if (allHandled) onDone(items) }}
                disabled={!allHandled}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all"
                style={allHandled
                  ? { backgroundColor: '#10b981', color: 'white', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }
                  : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                <PackageCheck size={18} />
                {allHandled ? 'Proceed to Packing' : `${total - handled} more item${(total-handled)!==1?'s':''} remaining`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── STEP 3: Pack Per Order ──────────────────────────────── */
function PackStep({ selectedOrders, pickedItems, onBack, onComplete }) {
  const [packedOrders, setPackedOrders] = useState([])
  const [expanded, setExpanded]         = useState(selectedOrders[0]?.id || null)

  const packOrder = (orderId) => {
    setPackedOrders(prev => [...prev, orderId])
    // Auto-expand next unpacked order
    const remaining = selectedOrders.filter(o => !packedOrders.includes(o.id) && o.id !== orderId)
    if (remaining.length > 0) setExpanded(remaining[0].id)
  }

  const allPacked = selectedOrders.every(o => packedOrders.includes(o.id))

  useEffect(() => {
    if (allPacked && selectedOrders.length > 0) {
      const t = setTimeout(onComplete, 1800)
      return () => clearTimeout(t)
    }
  }, [allPacked]) // eslint-disable-line react-hooks/exhaustive-deps

  if (allPacked) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white gap-5">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-200">
          <PackageCheck size={40} className="text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">All Orders Packed!</h2>
          <p className="text-gray-400 text-sm">{selectedOrders.length} orders ready for dispatch</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-200">
          <CheckCircle2 size={18} /> QR Codes Generated
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>

      {/* Dark header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-5 rounded-b-[20px]"
        style={{ backgroundColor: '#1b1a20' }}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#2e2e36' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.6px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}>Batch Picking</p>
            <h1 className="text-[20px] font-bold text-white">Pack Orders</h1>
          </div>
          <div className="text-right">
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Packed</p>
            <p className="text-[16px] font-bold" style={{ color: '#10b981' }}>
              {packedOrders.length}/{selectedOrders.length}
            </p>
          </div>
        </div>
        {/* Pack progress */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(packedOrders.length/selectedOrders.length)*100}%`, backgroundColor: '#10b981' }} />
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Pack each order into a separate bag and scan to confirm
        </p>
      </div>

      {/* Order accordion list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-3">
        {selectedOrders.map((order, orderIdx) => {
          const isPacked   = packedOrders.includes(order.id)
          const isExpanded = expanded === order.id && !isPacked
          const color      = orderColor(orderIdx)
          // Items for this order from the picked list
          const orderItems = pickedItems.flatMap(pi =>
            pi.breakdown
              .filter(b => b.orderId === order.id)
              .map(b => ({ ...pi, neededQty: b.qty,
                pickedQty: pi.status === 'oos' ? 0 : Math.min(pi.cartQty, b.qty) }))
          )

          return (
            <div key={order.id}
              className={`rounded-2xl border-2 bg-white overflow-hidden transition-all duration-200
                ${isPacked ? 'border-emerald-200 opacity-70' : 'border-gray-100 shadow-sm'}`}
              style={!isPacked && isExpanded ? { borderColor: color } : {}}>

              {/* Order header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : order.id)}
                disabled={isPacked}
                className="w-full flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: isPacked ? '#d1fae5' : color + '20' }}>
                  {isPacked
                    ? <CheckCircle2 size={16} className="text-emerald-500" />
                    : <Package size={16} style={{ color }} />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-gray-900">#{order.id}</p>
                  <p className="text-[12px] text-gray-500">{order.customer} · {orderItems.length} items</p>
                </div>
                {isPacked
                  ? <span className="text-[11px] font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">Packed ✓</span>
                  : isExpanded ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {/* Expanded: item list + pack button */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="px-4 py-3 space-y-2">
                    {orderItems.map((item, ii) => {
                      const isOOS = item.status === 'oos'
                      return (
                        <div key={item.key + ii} className="flex items-center gap-2.5">
                          <div className="flex-shrink-0">
                            {isOOS
                              ? <XCircle size={14} className="text-red-400" />
                              : item.pickedQty >= item.neededQty
                              ? <CheckCircle2 size={14} className="text-emerald-500" />
                              : <AlertTriangle size={14} className="text-amber-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] font-semibold truncate ${isOOS ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {isOOS
                                ? 'Out of Stock'
                                : `${item.pickedQty}/${item.neededQty} · ${item.location}`}
                            </p>
                          </div>
                          <LocationBadge location={item.location} />
                        </div>
                      )
                    })}
                  </div>

                  {/* Pack this order CTA */}
                  <div className="px-4 pb-4 pt-2">
                    <button onClick={() => packOrder(order.id)}
                      className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-[14px] transition-all active:scale-[0.98]"
                      style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}40` }}>
                      <PackageCheck size={18} />
                      Pack #{order.id} — {order.customer}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── ROOT BatchScreen ────────────────────────────────────── */
export default function BatchScreen({ orders, onBack }) {
  const [step, setStep]               = useState('select')
  const [selectedIds, setSelectedIds] = useState([])
  const [pickedItems, setPickedItems] = useState([])

  const selectedOrders = orders.filter(o => selectedIds.includes(o.id))
  const mergedItems    = useMemo(() => buildMergedItems(selectedOrders), [selectedIds]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOrder = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col h-full">
      {step === 'select' && (
        <SelectStep
          orders={orders}
          selected={selectedIds}
          onToggle={toggleOrder}
          onStart={() => setStep('pick')}
          onBack={onBack}
        />
      )}
      {step === 'pick' && (
        <PickStep
          mergedItems={mergedItems}
          selectedOrders={selectedOrders}
          onBack={() => setStep('select')}
          onDone={(items) => { setPickedItems(items); setStep('pack') }}
        />
      )}
      {step === 'pack' && (
        <PackStep
          selectedOrders={selectedOrders}
          pickedItems={pickedItems}
          onBack={() => setStep('pick')}
          onComplete={onBack}
        />
      )}
    </div>
  )
}
