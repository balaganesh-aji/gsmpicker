import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScanLine, Plus, Clock, Package, AlertTriangle } from 'lucide-react'
import { LocationBadge, BottomSheet } from '../components/shared'
import { staggerCards, headerEnter } from '../utils/animations'
import { useInventory } from '../hooks/useInventory'

const CATEGORIES = ['All', 'Dairy', 'Produce', 'Meat', 'Bakery', 'Snacks', 'Beverages', 'Grains']
const FILTERS    = ['all', 'low-stock', 'expiring']

function ProductCard({ product, onTap }) {
  const isLow      = product.lowStock || product.stock <= 6
  const isExpiring = product.expiring
  return (
    <div onClick={() => onTap(product)}
      className={`bg-white rounded-xl border transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm
        ${isLow ? 'border-amber-100' : isExpiring ? 'border-orange-100' : 'border-[#ededed]'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#111827] leading-tight truncate">{product.name}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5 font-mono">{product.sku}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <LocationBadge location={product.location} />
            {isExpiring && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-0.5">
                <Clock size={8} /> Expiring
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLow ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`text-sm font-bold ${isLow ? 'text-amber-600' : 'text-[#111827]'}`}>
              {product.stock} in stock
            </span>
            {isLow && (
              <span className="text-[10px] font-bold text-amber-500 px-1.5 py-0.5 bg-amber-50 rounded-md border border-amber-100">LOW</span>
            )}
          </div>
          <span className="text-sm font-semibold text-[#9ca3af]">£{Number(product.price).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

function AddProductForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', price: '', stock: '', location: '', category: 'Dairy' })
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fields = [
    { key: 'name',     label: 'Product Name',     placeholder: 'e.g. Organic Whole Milk 2L', type: 'text' },
    { key: 'sku',      label: 'SKU',               placeholder: 'e.g. MLK-001',              type: 'text' },
    { key: 'barcode',  label: 'Barcode / QR Code', placeholder: 'Scan or enter manually',     type: 'text' },
    { key: 'price',    label: 'Price (£)',          placeholder: '0.00',                       type: 'number' },
    { key: 'stock',    label: 'Stock Quantity',     placeholder: '0',                          type: 'number' },
    { key: 'location', label: 'Shelf Location',     placeholder: 'e.g. A-04',                  type: 'text' },
  ]
  const submit = async () => {
    setSaving(true)
    try {
      await onAdd({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-4">
      {fields.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
          <input type={type} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#ee2c2c] focus:bg-white text-gray-900 rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-gray-300" />
        </div>
      ))}
      <button onClick={submit} disabled={saving}
        className="w-full bg-[#ee2c2c] text-white py-4 rounded-2xl font-semibold mt-2 shadow-md shadow-red-200"
        style={{ opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Adding…' : 'Add Product'}
      </button>
    </div>
  )
}

function StockUpdateSheet({ product, onAdjust, onClose }) {
  const [qty,    setQty]    = useState(1)
  const [mode,   setMode]   = useState('add')
  const [saving, setSaving] = useState(false)
  if (!product) return null

  const submit = async () => {
    setSaving(true)
    try {
      const change = mode === 'add' ? qty : -qty
      await onAdjust(product.id, change, 'adjustment')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
          <LocationBadge location={product.location} />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-3">
          {product.stock} <span className="text-sm font-normal text-gray-400">current stock</span>
        </p>
      </div>

      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {['add', 'reduce'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-colors
              ${mode === m ? (m === 'add' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-[#ee2c2c] text-white shadow-sm') : 'text-gray-400'}`}>
            {m === 'add' ? '+ Add Stock' : '− Reduce Stock'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-3">Quantity</label>
        <div className="flex items-center gap-4 justify-center">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 text-xl font-bold">−</button>
          <span className="text-4xl font-bold text-gray-900 w-16 text-center">{qty}</span>
          <button onClick={() => setQty(q => q + 1)}
            className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 text-xl font-bold">+</button>
        </div>
        <p className="text-center text-sm text-gray-400 mt-3">
          New stock: <strong className="text-gray-900">
            {mode === 'add' ? product.stock + qty : Math.max(0, product.stock - qty)}
          </strong>
        </p>
      </div>

      <button onClick={submit} disabled={saving}
        className={`w-full py-4 rounded-2xl text-white font-semibold shadow-md
          ${mode === 'add' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-[#ee2c2c] shadow-red-200'}`}
        style={{ opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Updating…' : mode === 'add' ? `Add ${qty} units` : `Remove ${qty} units`}
      </button>
    </div>
  )
}

export default function InventoryScreen({ onScanOpen }) {
  const { products, loading, adjustStock, createProduct } = useInventory()
  const [search,          setSearch]          = useState('')
  const [filter,          setFilter]          = useState('all')
  const [category,        setCategory]        = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockSheet,      setStockSheet]      = useState(false)
  const [addSheet,        setAddSheet]        = useState(false)

  const headerRef = useRef(null)
  const cardsRef  = useRef(null)

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
  }, [filter, category])

  const total    = products.length
  const lowStock = products.filter(p => p.lowStock || p.stock <= 6).length
  const expiring = products.filter(p => p.expiring).length

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ||
      (filter === 'low-stock' && (p.lowStock || p.stock <= 6)) ||
      (filter === 'expiring' && p.expiring)
    const matchCat = category === 'All' || p.category.toLowerCase() === category.toLowerCase()
    return matchSearch && matchFilter && matchCat
  })

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
                style={{ color: 'rgba(255,255,255,0.4)' }}>Warehouse</p>
              <h1 className="text-[20px] font-bold text-[#fafafa] leading-tight">Inventory</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onScanOpen}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ee2c2c' }}>
              <ScanLine size={17} color="white" />
            </button>
            <button onClick={() => setAddSheet(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#2e2e36' }}>
              <Plus size={17} color="white" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#2e2e36' }}>
          {[
            { label: 'Products',  val: total,    color: 'white' },
            { label: 'Low Stock', val: lowStock,  color: '#f59e0b' },
            { label: 'Expiring',  val: expiring,  color: '#ee2c2c' },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex-1 flex">
              <div className="flex-1 py-3 text-center">
                <p className="text-2xl font-bold leading-7" style={{ color: s.color }}>{s.val}</p>
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
          <Package size={16} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search product or SKU…"
            className="flex-1 bg-transparent text-sm outline-none placeholder-[#9ca3af] text-white" />
        </div>
      </div>

      {/* White card container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-[10px] mt-3 mb-3 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-5 pb-4">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#363636' }}>All Products</h2>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 mb-3" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className="flex-shrink-0 h-[34px] px-4 rounded-lg text-xs font-semibold capitalize transition-all duration-150 border"
                  style={category === c
                    ? { backgroundColor: '#ee2c2c', borderColor: '#ee2c2c', color: 'white' }
                    : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 mb-4">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="flex-shrink-0 h-[34px] px-4 rounded-lg text-xs font-semibold transition-all duration-150 border flex items-center gap-1"
                  style={filter === f
                    ? { backgroundColor: '#fef3c7', borderColor: '#fcd34d', color: '#d97706' }
                    : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  {f === 'all' && 'All'}
                  {f === 'low-stock' && <><AlertTriangle size={11} /> Low Stock</>}
                  {f === 'expiring'  && <><Clock size={11} /> Expiring</>}
                </button>
              ))}
            </div>

            <p className="text-xs text-[#9ca3af] mb-3">{filtered.length} products</p>

            {/* Product cards */}
            <div ref={cardsRef} className="flex flex-col gap-2">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-[#ee2c2c] border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading inventory…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={40} className="mx-auto mb-3 opacity-30 text-gray-300" />
                  <p className="text-sm text-gray-400">No products found</p>
                </div>
              ) : (
                filtered.map(product => (
                  <ProductCard key={product.id} product={product}
                    onTap={p => { setSelectedProduct(p); setStockSheet(true) }} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomSheet open={stockSheet} onClose={() => setStockSheet(false)} title="Update Stock">
        <StockUpdateSheet product={selectedProduct} onAdjust={adjustStock} onClose={() => setStockSheet(false)} />
      </BottomSheet>
      <BottomSheet open={addSheet} onClose={() => setAddSheet(false)} title="Add New Product">
        <AddProductForm onAdd={createProduct} onClose={() => setAddSheet(false)} />
      </BottomSheet>
    </div>
  )
}
