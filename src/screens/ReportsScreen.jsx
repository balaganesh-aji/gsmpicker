import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { TrendingUp, Clock, Package, Users, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { MiniBarChart } from '../components/shared'
import { staggerChildren, headerEnter } from '../utils/animations'
import { useReports } from '../hooks/useReports'

const TABS = ['Overview', 'Pickers', 'Stock', 'Movers']

function MetricCard({ title, value, sub, trend, trendUp, icon: Icon, bg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#111827]">{value}</p>
      <p className="text-xs text-[#9ca3af] mt-0.5">{title}</p>
      {sub && <p className="text-xs text-[#d1d5db] mt-0.5">{sub}</p>}
    </div>
  )
}

function PickerRow({ picker, rank }) {
  const medals = ['text-amber-500', 'text-gray-400', 'text-amber-700', 'text-gray-300', 'text-gray-300']
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className={`text-sm font-bold w-5 text-center ${medals[rank]}`}>#{rank + 1}</span>
      <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
        <span className="text-xs font-bold text-[#ee2c2c]">{picker.name.split(' ')[0][0]}{picker.name.split(' ')[1][0]}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#111827]">{picker.name}</p>
        <p className="text-xs text-[#9ca3af]">{picker.orders} orders · {picker.avgTime} avg</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${picker.accuracy >= 99 ? 'text-emerald-600' : picker.accuracy >= 97 ? 'text-[#111827]' : 'text-amber-600'}`}>
          {picker.accuracy}%
        </p>
        <p className="text-[10px] text-[#d1d5db]">accuracy</p>
      </div>
    </div>
  )
}

function LowStockAlerts() {
  const alerts = [
    { name: 'Baby Spinach 200g',    stock: 3, location: 'C-08', color: 'text-red-500' },
    { name: 'Free Range Eggs 12pk', stock: 6, location: 'A-06', color: 'text-amber-600' },
    { name: 'Oat Biscuits 300g',    stock: 2, location: 'G-02', color: 'text-red-500' },
    { name: 'Cherry Tomatoes 400g', stock: 4, location: 'C-05', color: 'text-amber-600' },
  ]
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
          <div>
            <p className="text-sm font-medium text-[#111827]">{a.name}</p>
            <p className="text-xs text-[#9ca3af] font-mono">{a.location}</p>
          </div>
          <span className={`text-sm font-bold ${a.color}`}>{a.stock} left</span>
        </div>
      ))}
    </div>
  )
}

function FastMovers() {
  const items = [
    { name: 'Organic Whole Milk 2L',  sold: 148, trend: '+12%' },
    { name: 'Free Range Eggs 12pk',   sold: 121, trend: '+8%' },
    { name: 'Sourdough Bread 800g',   sold: 98,  trend: '+5%' },
    { name: 'Greek Yogurt 500g',      sold: 87,  trend: '-3%' },
    { name: 'Cherry Tomatoes 400g',   sold: 76,  trend: '+15%' },
  ]
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500">{i + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111827] truncate">{item.name}</p>
            <p className="text-xs text-[#9ca3af]">{item.sold} units this week</p>
          </div>
          <span className={`text-xs font-semibold ${item.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
            {item.trend}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsScreen() {
  const { kpis, pickerStats, dailyOrders, fulfillmentTime, days } = useReports()
  const [tab, setTab] = useState('Overview')

  const totalOrders = dailyOrders.reduce((a, b) => a + b, 0)
  const todayOrders = kpis?.todayOrders ?? dailyOrders[6]
  const avgFulfill  = kpis?.avgFulfill  ?? (fulfillmentTime.reduce((a,b)=>a+b,0)/fulfillmentTime.length).toFixed(1)
  const accuracyRate = kpis?.accuracyRate ?? '98.2'

  const headerRef  = useRef(null)
  const kpiGridRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    headerEnter(headerRef.current)
    return () => { gsap.killTweensOf(headerRef.current) }
  }, [])

  useEffect(() => {
    if (kpiGridRef.current) staggerChildren(kpiGridRef.current, { delay: 0.05, stagger: 0.07 })
    if (contentRef.current) staggerChildren(contentRef.current, { delay: 0.1, stagger: 0.08, y: 16 })
    return () => {
      if (kpiGridRef.current) gsap.killTweensOf(Array.from(kpiGridRef.current.children))
      if (contentRef.current) gsap.killTweensOf(Array.from(contentRef.current.children))
    }
  }, [tab])

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
                style={{ color: 'rgba(255,255,255,0.4)' }}>Analytics</p>
              <h1 className="text-[20px] font-bold text-[#fafafa] leading-tight">Reports</h1>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold border"
            style={{ backgroundColor: '#2e2e36', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            <Download size={14} /> Export
          </button>
        </div>

        {/* Stats row */}
        <div className="flex rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#2e2e36' }}>
          {[
            { label: "Today's Orders", val: todayOrders,       color: 'white' },
            { label: 'Avg Fulfil.',    val: `${avgFulfill}m`,  color: '#34d399' },
            { label: 'Accuracy',       val: `${accuracyRate}%`, color: '#60a5fa' },
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

        {/* Tab pills */}
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-shrink-0 h-[34px] px-4 rounded-lg text-xs font-semibold transition-all duration-150 border"
              style={tab === t
                ? { backgroundColor: '#ee2c2c', borderColor: '#ee2c2c', color: 'white' }
                : { backgroundColor: '#2e2e36', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* White card container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-[10px] mt-3 mb-3 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-5 pb-4">

            {tab === 'Overview' && (
              <div ref={contentRef} className="space-y-4">
                <div ref={kpiGridRef} className="grid grid-cols-2 gap-3">
                  <MetricCard title="Today's Orders"  value={todayOrders}      trend="+14%"  trendUp icon={TrendingUp} bg="bg-red-50"    iconColor="text-[#ee2c2c]" />
                  <MetricCard title="Avg Fulfillment" value={`${avgFulfill}m`} trend="-0.8m" trendUp icon={Clock}      bg="bg-emerald-50" iconColor="text-emerald-600" />
                  <MetricCard title="Weekly Orders"   value={totalOrders}      sub="Last 7 days" icon={Package} bg="bg-blue-50"   iconColor="text-blue-600" />
                  <MetricCard title="Accuracy Rate"   value="98.2%"            trend="+0.4%" trendUp icon={Users}      bg="bg-violet-50"  iconColor="text-violet-600" />
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-[#111827]">Orders This Week</p>
                    <span className="text-xs text-[#9ca3af]">Last 7 days</span>
                  </div>
                  <MiniBarChart data={dailyOrders} labels={days} color="#ee2c2c" height={100} animated />
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-[#111827]">Fulfillment Time (min)</p>
                    <span className="text-xs text-emerald-600 font-medium">Trending ↓ better</span>
                  </div>
                  <MiniBarChart data={fulfillmentTime} labels={days} color="#10b981" height={100} animated />
                </div>
              </div>
            )}

            {tab === 'Pickers' && (
              <div ref={contentRef} className="space-y-4">
                <div ref={kpiGridRef} className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-[#ededed] text-center shadow-sm">
                    <p className="text-xl font-bold text-[#111827]">5</p>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5">Active Pickers</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                    <p className="text-xl font-bold text-emerald-600">98.2%</p>
                    <p className="text-[10px] text-emerald-500 mt-0.5">Avg Accuracy</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
                    <p className="text-xl font-bold text-[#ee2c2c]">8.8m</p>
                    <p className="text-[10px] text-[#ee2c2c] mt-0.5">Avg Time</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#111827] mb-4">Performance Leaderboard</p>
                  {pickerStats.map((p, i) => <PickerRow key={i} picker={p} rank={i} />)}
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#111827] mb-4">Orders Completed Today</p>
                  <MiniBarChart data={pickerStats.map(p => p.orders)} labels={pickerStats.map(p => p.name.split(' ')[0])} color="#ee2c2c" height={100} animated />
                </div>
              </div>
            )}

            {tab === 'Stock' && (
              <div ref={contentRef} className="space-y-4">
                <div ref={kpiGridRef} className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-2xl font-bold text-amber-600">4</p>
                    <p className="text-xs text-amber-500 mt-0.5">Low Stock Alerts</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-2xl font-bold text-red-500">3</p>
                    <p className="text-xs text-red-400 mt-0.5">Expiring Soon</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#111827] mb-4">⚠ Low Stock Alerts</p>
                  <LowStockAlerts />
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#111827] mb-3">Stock by Category</p>
                  <MiniBarChart data={[48, 24, 8, 12, 42, 15, 30]} labels={['Dairy', 'Produce', 'Meat', 'Bakery', 'Grains', 'Cond.', 'Snacks']} color="#3b82f6" height={100} animated />
                </div>
              </div>
            )}

            {tab === 'Movers' && (
              <div ref={contentRef} className="space-y-4">
                <div ref={kpiGridRef} className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-[#ededed] shadow-sm">
                    <p className="text-2xl font-bold text-[#111827]">530</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Units sold this week</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-600">+9.2%</p>
                    <p className="text-xs text-emerald-500 mt-0.5">vs last week</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#111827] mb-4">Top 5 Fast-Moving Items</p>
                  <FastMovers />
                </div>
                <div className="bg-white rounded-xl border border-[#ededed] p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#111827] mb-4">Weekly Volume</p>
                  <MiniBarChart data={[148, 121, 98, 87, 76]} labels={['Milk', 'Eggs', 'Bread', 'Yogurt', 'Tomato']} color="#10b981" height={100} animated />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
