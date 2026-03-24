import { useRef } from 'react'
import { ShoppingBag, ScanLine, Package, BarChart3, Truck } from 'lucide-react'
import { tabBounce, buttonPress } from '../utils/animations'

const tabs = [
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'batch',     label: 'Scan',      icon: ScanLine, primary: true },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'reports',   label: 'Reports',   icon: BarChart3 },
]

export default function BottomNav({ currentScreen, onNavigate }) {
  const iconRefs = useRef({})

  const handlePress = (id) => {
    const iconEl = iconRefs.current[id]
    if (iconEl) tabBounce(iconEl)
    onNavigate(id)
  }

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-100 px-2 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: Icon, primary }) => {
          const active = currentScreen === id
          if (primary) {
            return (
              <button key={id} onClick={() => handlePress(id)} className="flex flex-col items-center -mt-5">
                <div ref={el => iconRefs.current[id] = el}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200"
                  style={{ backgroundColor: active ? '#c91f1f' : '#ee2c2c', boxShadow: '0 4px 14px rgba(238,44,44,0.35)' }}>
                  <Icon size={24} color="white" strokeWidth={2} />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
              </button>
            )
          }
          return (
            <button key={id} onClick={() => handlePress(id)}
              className="flex flex-col items-center gap-1 py-3 px-3 min-w-[44px]">
              <div ref={el => iconRefs.current[id] = el}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? '#ee2c2c' : undefined }}
                  className={active ? '' : 'text-gray-400'} />
              </div>
              <span className={`text-[10px] font-medium ${active ? '' : 'text-gray-400'}`}
                style={active ? { color: '#ee2c2c' } : {}}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
