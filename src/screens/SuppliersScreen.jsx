import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Plus, Truck, Package, ScanLine, CheckCircle2 } from 'lucide-react'
import { StatusBadge, BottomSheet, timeAgo } from '../components/shared'
import { mockInventory } from '../data/mockData'
import { staggerCards, headerEnter } from '../utils/animations'
import { useSuppliers } from '../hooks/useSuppliers'

function POCard({ po }) {
  const borderMap = { pending: 'border-amber-100', delivered: 'border-emerald-100', 'in-transit': 'border-blue-100' }
  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm transition-all duration-150 active:scale-[0.98] ${borderMap[po.status] || 'border-[#ededed]'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-[#111827]">{po.id}</p>
          <p className="text-xs text-[#9ca3af] mt-0.5">{po.supplier}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9ca3af]">{po.items} items</span>
          <div className="w-px h-3 bg-gray-200" />
          <span className="text-xs font-semibold text-[#6b7280]">£{po.total.toFixed(2)}</span>
        </div>
        <span className="text-xs text-[#d1d5db]">{timeAgo(po.date)}</span>
      </div>
    </div>
  )
}

function CreatePOForm({ onClose }) {
  const [supplier, setSupplier] = useState('')
  const [items, setItems] = useState([{ product: '', qty: 1 }])
  const addItem = () => setItems(prev => [...prev, { product: '', qty: 1 }])
  const updateItem = (i, key, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it))

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Supplier</label>
        <select value={supplier} onChange={e => setSupplier(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 focus:border-[#ee2c2c] text-gray-900 rounded-xl px-4 py-3 text-sm outline-none transition-colors">
          <option value="">Select supplier…</option>
          {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500">Items</label>
          <button onClick={addItem} className="text-xs text-[#ee2c2c] flex items-center gap-1">
            <Plus size={12} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-3 text-xs outline-none focus:border-[#ee2c2c] transition-colors">
                <option value="">Select product…</option>
                {mockInventory.slice(0, 8).map(p => <option key={p.id} value={p.sku}>{p.name}</option>)}
              </select>
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => updateItem(i, 'qty', Math.max(1, item.qty - 1))} className="px-3 py-3 text-gray-500">−</button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                <button onClick={() => updateItem(i, 'qty', item.qty + 1)} className="px-3 py-3 text-gray-500">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={addItem}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold">
          <ScanLine size={16} /> Scan to Add
        </button>
        <button onClick={onClose}
          className="flex-1 py-3 rounded-2xl bg-[#ee2c2c] text-white text-sm font-semibold shadow-md shadow-red-200">
          Create PO
        </button>
      </div>
    </div>
  )
}

function GRNSheet({ onClose }) {
  const scannedItems = [
    { name: 'Organic Whole Milk 2L', sku: 'MLK-001', expected: 24, received: 24, ok: true },
    { name: 'Free Range Eggs 12pk',  sku: 'EGG-012', expected: 12, received: 10, ok: false },
    { name: 'Sourdough Bread 800g',  sku: 'BRD-003', expected: 20, received: 20, ok: true },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-red-50 rounded-2xl p-3 border border-red-100">
        <div className="w-10 h-10 rounded-xl bg-[#ee2c2c] flex items-center justify-center shadow-md shadow-red-200">
          <ScanLine size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">PO-0039 · BreadCo Bakeries</p>
          <p className="text-xs text-gray-400">Scan incoming items to verify</p>
        </div>
      </div>
      <div className="space-y-2">
        {scannedItems.map((item, i) => (
          <div key={i} className={`rounded-2xl border p-3 ${item.ok ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${item.received === item.expected ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.received}/{item.expected}
                </p>
                <p className="text-xs text-gray-400">received</p>
              </div>
            </div>
            {!item.ok && <p className="text-xs text-amber-600 mt-1.5">⚠ {item.expected - item.received} units short</p>}
          </div>
        ))}
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
        <ScanLine size={18} /> Scan Next Item
      </button>
      <button onClick={onClose}
        className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-100">
        <CheckCircle2 size={18} /> Confirm GRN & Update Inventory
      </button>
    </div>
  )
}

export default function SuppliersScreen() {
  const { suppliers, purchaseOrders, loading, createPO: submitPO } = useSuppliers()
  const [tab, setTab]           = useState('po')
  const [createPO, setCreatePO] = useState(false)
  const [grnSheet, setGrnSheet] = useState(false)

  const headerRef = useRef(null)
  const listRef   = useRef(null)
  const suppRef   = useRef(null)

  useEffect(() => {
    headerEnter(headerRef.current)
    return () => { gsap.killTweensOf(headerRef.current) }
  }, [])

  useEffect(() => {
    if (listRef.current) staggerCards(Array.from(listRef.current.children), { delay: 0.1 })
    if (suppRef.current) staggerCards(Array.from(suppRef.current.children), { delay: 0.05 })
    return () => {
      if (listRef.current) gsap.killTweensOf(Array.from(listRef.current.children))
      if (suppRef.current) gsap.killTweensOf(Array.from(suppRef.current.children))
    }
  }, [tab])

  const totalPOs  = purchaseOrders.length
  const inTransit = purchaseOrders.filter(p => p.status === 'in-transit').length
  const delivered = purchaseOrders.filter(p => p.status === 'delivered').length

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>

      {/* Dark Header */}
      <div ref={headerRef} className="flex-shrink-0 px-5 pt-12 pb-5 rounded-b-[16px] shadow-sm" style={{ backgroundColor: '#1b1a20' }}>

        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/Target_Bullseye-Logo_Red.jpg" alt="Logo" className="w-[81%] h-[81%] object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.6px]"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Supply Chain</p>
              <h1 className="text-[20px] font-bold text-[#fafafa] leading-tight">Suppliers</h1>
            </div>
          </div>
          <button onClick={() => setCreatePO(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#ee2c2c', color: 'white' }}>
            <Plus size={15} /> New PO
          </button>
        </div>

        {/* Stats row */}
        <div className="flex rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#2e2e36' }}>
          {[
            { label: 'Total POs',   val: totalPOs,  color: 'white' },
            { label: 'In Transit',  val: inTransit,  color: '#60a5fa' },
            { label: 'Delivered',   val: delivered,  color: '#34d399' },
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

        {/* Tab switcher */}
        <div className="flex gap-2">
          {[['po', 'Purchase Orders'], ['grn', 'Goods Receipt']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 h-[34px] rounded-lg text-xs font-semibold transition-all duration-150 border"
              style={tab === id
                ? { backgroundColor: '#ee2c2c', borderColor: '#ee2c2c', color: 'white' }
                : { backgroundColor: '#2e2e36', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* White card container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-[10px] mt-3 mb-3 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-5 pb-4">

            {tab === 'po' && (
              <>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#363636' }}>Active Suppliers</h2>

                {/* Supplier grid */}
                <div ref={suppRef} className="grid grid-cols-2 gap-3 mb-6">
                  {suppliers.map(s => (
                    <div key={s.id} className="bg-white rounded-xl border border-[#ededed] p-3 shadow-sm">
                      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center mb-2 border border-red-100">
                        <Truck size={14} style={{ color: '#ee2c2c' }} />
                      </div>
                      <p className="text-xs font-semibold text-[#111827] leading-tight">{s.name}</p>
                      <p className="text-[10px] text-[#9ca3af] mt-0.5">{s.category}</p>
                    </div>
                  ))}
                </div>

                <h2 className="text-base font-bold mb-3" style={{ color: '#363636' }}>Purchase Orders</h2>
                <div ref={listRef} className="flex flex-col gap-2">
                  {purchaseOrders.map(po => <POCard key={po.id} po={po} />)}
                </div>
              </>
            )}

            {tab === 'grn' && (
              <>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#363636' }}>Goods Receipt</h2>

                {/* Start GRN card */}
                <div className="bg-[#fff5f5] rounded-xl border border-red-100 p-5 text-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3 border border-red-100">
                    <Package size={26} style={{ color: '#ee2c2c' }} />
                  </div>
                  <p className="text-sm font-bold text-[#111827] mb-1">Receive New Delivery</p>
                  <p className="text-xs text-[#9ca3af] mb-4 leading-relaxed">
                    Scan items from a delivery to auto-update inventory and validate quantities
                  </p>
                  <button onClick={() => setGrnSheet(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md shadow-red-200"
                    style={{ backgroundColor: '#ee2c2c' }}>
                    <ScanLine size={18} /> Start GRN Process
                  </button>
                </div>

                {/* Recent deliveries */}
                <h2 className="text-base font-bold mb-3" style={{ color: '#363636' }}>Recent Deliveries</h2>
                <div className="flex flex-col gap-2">
                  {purchaseOrders.filter(p => p.status === 'delivered').map(po => (
                    <div key={po.id} className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-[#111827]">{po.id}</p>
                          <p className="text-xs text-[#9ca3af]">{po.supplier}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 size={14} />
                          <span className="text-xs font-semibold">Received</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9ca3af]">{po.items} items</span>
                        <div className="w-px h-3 bg-gray-200" />
                        <span className="text-xs font-semibold text-[#6b7280]">£{po.total.toFixed(2)}</span>
                        <div className="w-px h-3 bg-gray-200" />
                        <span className="text-xs text-[#d1d5db]">{timeAgo(po.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <BottomSheet open={createPO} onClose={() => setCreatePO(false)} title="Create Purchase Order">
        <CreatePOForm onClose={() => setCreatePO(false)} />
      </BottomSheet>
      <BottomSheet open={grnSheet} onClose={() => setGrnSheet(false)} title="Goods Receipt Note">
        <GRNSheet onClose={() => setGrnSheet(false)} />
      </BottomSheet>
    </div>
  )
}
