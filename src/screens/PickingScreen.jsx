import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import {
  ArrowLeft, ScanLine, ShoppingCart, Plus, Minus,
  CheckCircle2, AlertTriangle, XCircle, PackageCheck,
  ChevronRight, Trash2
} from 'lucide-react'
import { BottomSheet, Modal, LocationBadge, ProgressRing } from '../components/shared'
import { headerEnter, staggerCards, pickSuccess, fillProgressBar } from '../utils/animations'

/* ── Timer hook ── */
function useTimer() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

/* ── Substitute options ── */
const SUBS = [
  { id: 's1', name: 'Organic Skimmed Milk 2L', price: 3.29, diff: -0.20 },
  { id: 's2', name: 'Semi-Skimmed Milk 2L',    price: 2.99, diff: -0.50 },
  { id: 's3', name: 'Oat Milk 1L',              price: 2.79, diff: -0.70 },
]

/* ── Item card — pick-to-cart style ── */
function ItemCard({ item, cartEntry, onAdd, onRemove, onException, cardRef }) {
  const qty       = cartEntry?.qty || 0
  const isOOS     = cartEntry?.status === 'oos'
  const isSub     = cartEntry?.status === 'sub'
  const isDone    = qty >= item.qty || isOOS || isSub
  const isPartial = qty > 0 && qty < item.qty && !isOOS && !isSub

  const bgClass = isOOS     ? 'bg-red-50   border-red-100'
                : isSub     ? 'bg-amber-50  border-amber-100'
                : isDone    ? 'bg-emerald-50 border-emerald-200'
                : isPartial ? 'bg-[#fff8f0] border-amber-100'
                : 'bg-white border-[#ededed]'

  return (
    <div ref={cardRef} className={`rounded-xl border transition-all duration-200 ${bgClass}`}>
      <div className="p-4">
        {/* Top row: status icon + name + location */}
        <div className="flex items-start gap-3 mb-3">
          <div className="mt-0.5 flex-shrink-0">
            {isOOS     ? <XCircle size={18} className="text-red-400" />
            : isSub    ? <AlertTriangle size={18} className="text-amber-500" />
            : isDone   ? <CheckCircle2 size={18} className="text-emerald-500" />
            : isPartial? <div className="w-[18px] h-[18px] rounded-full border-2 border-amber-400" />
            : <div className="w-[18px] h-[18px] rounded-full border-2 border-[#d1d5db]" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[14px] font-semibold leading-tight tracking-[-0.15px]
                ${isOOS ? 'line-through text-gray-400' : 'text-[#111827]'}`}>
                {item.name}
              </p>
              <LocationBadge location={item.location} />
            </div>
            {isSub && <p className="text-xs text-amber-600 mt-1">↪ {cartEntry.subName}</p>}
            {isOOS && <p className="text-xs text-red-400 mt-1 font-semibold">Out of Stock</p>}
          </div>
        </div>

        {/* Bottom row: need / cart qty / +- / exception */}
        <div className="flex items-center justify-between">
          {/* Need + Cart count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#9ca3af] font-medium">Need</span>
              <span className="text-[13px] font-bold text-[#111827]">{item.qty}</span>
            </div>
            {!isOOS && !isSub && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#9ca3af] font-medium">Cart</span>
                <span className={`text-[13px] font-bold
                  ${isDone ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-[#374151]'}`}>
                  {qty}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Exception button */}
            {!isOOS && !isSub && (
              <button onClick={() => onException(item)}
                className="h-8 px-2.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors flex-shrink-0">
                ···
              </button>
            )}

            {/* ±  stepper — hidden when OOS/sub */}
            {!isOOS && !isSub && (
              <div className="flex items-center gap-1">
                {qty > 0 && (
                  <button onClick={() => onRemove(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors active:scale-90">
                    <Minus size={13} />
                  </button>
                )}
                <button onClick={() => onAdd(item)}
                  disabled={qty >= item.qty}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-40"
                  style={{ backgroundColor: isDone ? '#10b981' : '#ee2c2c' }}>
                  <Plus size={14} />
                </button>
              </div>
            )}

            {/* Remove exception tag */}
            {(isOOS || isSub) && (
              <button onClick={() => onRemove(item.id)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Cart Sheet ── */
function CartSheet({ open, onClose, items, cart, onAdd, onRemove, onFinalise }) {
  const cartItems    = items.filter(i => cart[i.id])
  const pendingItems = items.filter(i => !cart[i.id])
  const allHandled   = items.every(i => {
    const c = cart[i.id]
    return c && (c.qty >= i.qty || c.status === 'oos' || c.status === 'sub')
  })

  return (
    <BottomSheet open={open} onClose={onClose}
      title={`Your Cart · ${cartItems.length}/${items.length} items`}>
      <div className="space-y-3 max-h-[55vh] overflow-y-auto pb-2">

        {/* Items in cart */}
        {cartItems.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No items in cart yet — tap + to add
          </div>
        )}

        {cartItems.map(item => {
          const c = cart[item.id]
          const isOOS  = c.status === 'oos'
          const isSub  = c.status === 'sub'
          const isDone = c.qty >= item.qty || isOOS || isSub

          return (
            <div key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border
                ${isOOS ? 'bg-red-50 border-red-100'
                : isSub ? 'bg-amber-50 border-amber-100'
                : isDone ? 'bg-emerald-50 border-emerald-100'
                : 'bg-[#fff8f0] border-amber-100'}`}>
              <div className="flex-shrink-0">
                {isOOS  ? <XCircle size={16} className="text-red-400" />
                : isSub ? <AlertTriangle size={16} className="text-amber-500" />
                : isDone? <CheckCircle2 size={16} className="text-emerald-500" />
                : <div className="w-4 h-4 rounded-full border-2 border-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold truncate ${isOOS ? 'line-through text-gray-400' : 'text-[#111827]'}`}>
                  {item.name}
                </p>
                <p className="text-[11px] text-gray-400">
                  {isOOS ? 'Out of Stock'
                  : isSub ? `Sub: ${c.subName}`
                  : `${c.qty} of ${item.qty} added`}
                </p>
              </div>
              <LocationBadge location={item.location} />
            </div>
          )
        })}

        {/* Pending items not yet in cart */}
        {pendingItems.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Still to pick ({pendingItems.length})
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            {pendingItems.map(item => (
              <div key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-500 truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-400">Need {item.qty}</p>
                </div>
                <button onClick={() => onAdd(item)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white active:scale-90"
                  style={{ backgroundColor: '#ee2c2c' }}>
                  <Plus size={13} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Finalise button */}
      <div className="pt-4 border-t border-gray-100 mt-3">
        <button onClick={allHandled ? onFinalise : undefined}
          className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-[16px] transition-all
            ${allHandled
              ? 'text-white shadow-lg active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          style={allHandled ? { backgroundColor: '#10b981', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' } : {}}>
          <PackageCheck size={20} />
          {allHandled ? 'Finalise & Pack Order' : `Pick ${pendingItems.length} more item${pendingItems.length !== 1 ? 's' : ''} to finalise`}
        </button>
        {!allHandled && (
          <p className="text-center text-[11px] text-gray-400 mt-2">
            All items must be picked, substituted, or marked out of stock
          </p>
        )}
      </div>
    </BottomSheet>
  )
}

/* ── Main Screen ── */
export default function PickingScreen({ order, onBack, onScanOpen }) {
  const [items]          = useState(order.items.map(i => ({ ...i, picked: 0 })))
  const [cart, setCart]  = useState({})          // { itemId: { qty, status, subName? } }
  const [cartOpen, setCartOpen]     = useState(false)
  const [exItem, setExItem]         = useState(null)  // item for exception sheet
  const [exSheet, setExSheet]       = useState(false)
  const [exTab, setExTab]           = useState('exception')
  const [packModal, setPackModal]   = useState(false)
  const [packDone, setPackDone]     = useState(false)
  const timer = useTimer()

  const headerRef      = useRef(null)
  const itemListRef    = useRef(null)
  const progressBarRef = useRef(null)
  const cardRefs       = useRef({})

  /* ── Derived ── */
  const handledCount = items.filter(i => {
    const c = cart[i.id]
    return c && (c.qty >= i.qty || c.status === 'oos' || c.status === 'sub')
  }).length
  const total   = items.length
  const pct     = total > 0 ? Math.round((handledCount / total) * 100) : 0
  const cartCount = Object.keys(cart).length
  const allHandled = handledCount === total

  /* ── Mount animations ── */
  useEffect(() => {
    headerEnter(headerRef.current)
    staggerCards(Array.from(itemListRef.current?.children || []), { delay: 0.2 })
    fillProgressBar(progressBarRef.current, pct, 0.4)
    return () => {
      gsap.killTweensOf(headerRef.current)
      gsap.killTweensOf(Array.from(itemListRef.current?.children || []))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Cart ops ── */
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev[item.id] || { qty: 0, status: 'cart' }
      const newQty = Math.min((existing.qty || 0) + 1, item.qty)
      const el = cardRefs.current[item.id]
      if (el) pickSuccess(el)
      return { ...prev, [item.id]: { ...existing, qty: newQty, status: 'cart' } }
    })
  }, [])

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => {
      const existing = prev[itemId]
      if (!existing) return prev
      // If OOS/sub or qty would reach 0, remove entirely
      if (existing.status === 'oos' || existing.status === 'sub' || existing.qty <= 1) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: { ...existing, qty: existing.qty - 1 } }
    })
  }, [])

  const markOOS = () => {
    if (!exItem) return
    setCart(prev => ({ ...prev, [exItem.id]: { qty: 0, status: 'oos' } }))
    setExSheet(false)
  }

  const applySub = (sub) => {
    if (!exItem) return
    setCart(prev => ({ ...prev, [exItem.id]: { qty: exItem.qty, status: 'sub', subName: sub.name } }))
    setExSheet(false)
  }

  const openException = (item) => {
    setExItem(item)
    setExTab('exception')
    setExSheet(true)
  }

  const handleFinalise = () => {
    setCartOpen(false)
    setTimeout(() => setPackModal(true), 300)
  }

  const handlePack = () => {
    setPackModal(false)
    setPackDone(true)
    setTimeout(onBack, 2200)
  }

  /* ── Pack done state ── */
  if (packDone) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white gap-5">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-200">
          <PackageCheck size={40} className="text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Packed!</h2>
          <p className="text-gray-400 text-sm">#{order.id} is ready for dispatch</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-200">
          <CheckCircle2 size={18} /> QR Code Generated
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative">

      {/* ── Dark Header ── */}
      <div ref={headerRef} className="flex-shrink-0 px-5 pt-12 pb-5 rounded-b-[20px] shadow-sm"
        style={{ backgroundColor: '#1b1a20' }}>
        {/* Back + title + timer */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#2e2e36' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.6px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}>Picking Order</p>
            <h1 className="text-[20px] font-bold text-[#fafafa] leading-7 tracking-[-0.44px]">
              #{order.id}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#9ca3af]">Timer</p>
            <p className="text-[14px] font-bold font-mono" style={{ color: '#ee2c2c' }}>{timer}</p>
          </div>
        </div>

        {/* Progress card */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#2e2e36' }}>
          <ProgressRing value={handledCount} max={total} size={52} stroke={5}
            color={handledCount === total ? '#10b981' : '#ee2c2c'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[14px] font-semibold text-[#fafafa] tracking-[-0.15px]">
                {handledCount} of {total} picked
              </span>
              <span className="text-[14px] font-bold tracking-[-0.15px]"
                style={{ color: handledCount === total ? '#10b981' : '#ee2c2c' }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-1.5"
              style={{ backgroundColor: 'rgba(215,215,215,0.25)' }}>
              <div ref={progressBarRef} className="h-full rounded-full transition-all duration-500"
                style={{ backgroundColor: handledCount === total ? '#10b981' : '#ee2c2c',
                  width: `${pct}%` }} />
            </div>
            <p className="text-[12px] font-medium" style={{ color: '#c4c4c4' }}>
              {order.customer} · {total - handledCount} remaining
            </p>
          </div>
        </div>
      </div>

      {/* ── Item List ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div ref={itemListRef} className="flex flex-col gap-2">
          {/* Pending items first */}
          {items.filter(i => {
            const c = cart[i.id]
            return !c || (c.qty < i.qty && c.status !== 'oos' && c.status !== 'sub')
          }).map(item => (
            <ItemCard key={item.id} item={item} cartEntry={cart[item.id]}
              onAdd={addToCart} onRemove={removeFromCart} onException={openException}
              cardRef={el => cardRefs.current[item.id] = el} />
          ))}

          {/* Divider */}
          {items.some(i => {
            const c = cart[i.id]
            return c && (c.qty >= i.qty || c.status === 'oos' || c.status === 'sub')
          }) && (
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">In Cart</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* In-cart / handled items */}
          {items.filter(i => {
            const c = cart[i.id]
            return c && (c.qty >= i.qty || c.status === 'oos' || c.status === 'sub')
          }).map(item => (
            <ItemCard key={item.id} item={item} cartEntry={cart[item.id]}
              onAdd={addToCart} onRemove={removeFromCart} onException={openException}
              cardRef={el => cardRefs.current[item.id] = el} />
          ))}
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 pt-3 pb-6
        shadow-[0px_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2">
          {/* Scan */}
          <button onClick={onScanOpen}
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#ededed] text-gray-500 hover:bg-gray-50 active:scale-95 transition-all">
            <ScanLine size={22} />
          </button>

          {/* Cart button */}
          <button onClick={() => setCartOpen(true)}
            className="flex-1 flex items-center justify-between h-14 rounded-xl px-4 text-white font-semibold active:scale-[0.98] transition-all relative"
            style={{ backgroundColor: allHandled ? '#10b981' : '#ee2c2c',
              boxShadow: allHandled ? '0 4px 14px rgba(16,185,129,0.35)' : '0 4px 14px rgba(238,44,44,0.3)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span className="text-[15px]">
                {allHandled ? 'Review & Finalise' : 'View Cart'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Cart badge */}
              <div className="bg-white/25 rounded-lg px-2 py-0.5 text-[13px] font-bold">
                {cartCount}/{total}
              </div>
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Cart Sheet ── */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onFinalise={handleFinalise}
      />

      {/* ── Exception Sheet ── */}
      <BottomSheet open={exSheet} onClose={() => setExSheet(false)}
        title={exItem?.name || 'Item Options'}>
        {exItem && (
          <div className="space-y-4">
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              {['exception', 'substitute'].map(t => (
                <button key={t} onClick={() => setExTab(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors
                    ${exTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                  {t === 'exception' ? '⚠️ Exception' : '🔄 Substitute'}
                </button>
              ))}
            </div>

            {exTab === 'exception' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">What happened with this item?</p>
                <button onClick={markOOS}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-colors">
                  <XCircle size={20} />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Mark Out of Stock</p>
                    <p className="text-xs text-red-400">Item not available on shelf</p>
                  </div>
                </button>
                <button onClick={() => setExTab('substitute')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 transition-colors">
                  <AlertTriangle size={20} />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Find Substitute</p>
                    <p className="text-xs text-amber-400">Choose a similar product</p>
                  </div>
                </button>
              </div>
            )}

            {exTab === 'substitute' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Substitute for <strong className="text-gray-900">{exItem.name}</strong>
                </p>
                {SUBS.map(sub => (
                  <button key={sub.id} onClick={() => applySub(sub)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-200 hover:bg-amber-50 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                      <p className="text-xs text-gray-400">£{sub.price.toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg
                      ${sub.diff < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {sub.diff > 0 ? '+' : ''}£{sub.diff.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* ── Pack Confirmation Modal ── */}
      <Modal
        open={packModal}
        onClose={() => setPackModal(false)}
        title="Finalise & Pack Order?"
        description={`All ${handledCount} items are ready for #${order.id}. This will generate a QR code for the bag.`}
        confirmLabel="Pack Order"
        confirmClass="bg-emerald-500 hover:bg-emerald-400"
        onConfirm={handlePack}
      />
    </div>
  )
}
