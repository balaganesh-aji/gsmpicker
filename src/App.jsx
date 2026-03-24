import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import InstallPrompt from './components/InstallPrompt'
import LoginScreen    from './screens/LoginScreen'
import OrdersScreen   from './screens/OrdersScreen'
import PickingScreen  from './screens/PickingScreen'
import BatchScreen    from './screens/BatchScreen'
import ScannerScreen  from './screens/ScannerScreen'
import InventoryScreen  from './screens/InventoryScreen'
import SuppliersScreen  from './screens/SuppliersScreen'
import ReportsScreen    from './screens/ReportsScreen'
import BottomNav      from './components/BottomNav'
import { useOrders, startPicking as dbStartPicking } from './hooks/useOrders'

function AppShell() {
  const { isAuthenticated } = useAuth()
  const { orders, reload: reloadOrders } = useOrders()

  // loggedIn tracks whether the user has passed the login screen this session
  // It's true if Supabase auth is active OR if demo PIN was accepted
  const [loggedIn,    setLoggedIn]    = useState(isAuthenticated)
  const [screen,      setScreen]      = useState(isAuthenticated ? 'orders' : 'login')
  const [prevScreen,  setPrevScreen]  = useState(null)
  const [activeOrder, setActiveOrder] = useState(null)

  const navigate = (to) => {
    setPrevScreen(screen)
    setScreen(to)
  }

  const handleLogin = () => {
    setLoggedIn(true)
    navigate('orders')
  }

  const startPicking = async (order) => {
    // Optimistically open the picking screen; update DB in background
    setActiveOrder({ ...order, items: (order.items || []).map(i => ({ ...i })) })
    navigate('picking')
    try {
      // Only call DB if Supabase is configured
      const url = import.meta.env.VITE_SUPABASE_URL
      if (url && !url.includes('placeholder')) {
        // We'd need user id here — this is resolved in a real-auth flow
        await dbStartPicking(order.id, null)
        reloadOrders()
      }
    } catch (e) {
      console.warn('startPicking DB error (non-fatal):', e)
    }
  }

  const openScannerFrom = (from) => {
    setPrevScreen(from)
    setScreen('scanner')
  }

  const backFromPicking = () => {
    setActiveOrder(null)
    setScreen('orders')
    reloadOrders()
  }

  const backFromScanner = () => setScreen(prevScreen || 'orders')

  const hideNav = ['scanner', 'picking', 'login', 'batch'].includes(screen)

  // If not logged in, always show login
  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {screen === 'login' && (
          <LoginScreen onLogin={handleLogin} />
        )}
        {screen === 'orders' && (
          <OrdersScreen onStartPicking={startPicking} />
        )}
        {screen === 'picking' && activeOrder && (
          <PickingScreen order={activeOrder} onBack={backFromPicking} onScanOpen={() => openScannerFrom('picking')} />
        )}
        {screen === 'batch' && (
          <BatchScreen
            orders={orders.filter(o => o.status !== 'packed')}
            onBack={() => navigate('orders')}
            onComplete={() => { reloadOrders(); navigate('orders') }}
          />
        )}
        {screen === 'scanner' && (
          <ScannerScreen onBack={backFromScanner} onItemScanned={(item) => console.log('Scanned:', item)} />
        )}
        {screen === 'inventory' && (
          <InventoryScreen onScanOpen={() => openScannerFrom('inventory')} />
        )}
        {screen === 'suppliers' && <SuppliersScreen />}
        {screen === 'reports'   && <ReportsScreen />}
      </div>
      {!hideNav && <BottomNav currentScreen={screen} onNavigate={navigate} />}
    </div>
  )
}

function UpdateToast() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div className="fixed top-4 left-3 right-3 z-50 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl"
      style={{ backgroundColor: '#1b1a20', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-sm text-white font-medium">New version available</p>
      <button onClick={() => updateServiceWorker(true)}
        className="text-xs font-bold px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: '#ee2c2c', color: 'white' }}>
        Update
      </button>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
      <InstallPrompt />
      <UpdateToast />
    </AuthProvider>
  )
}
