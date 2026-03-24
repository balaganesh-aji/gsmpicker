import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_ACTIVE } from '../lib/supabase'
import {
  fetchOrders,
  fetchOrder,
  startPicking,
  updateOrderItem,
  packOrder,
  subscribeToOrders,
  unsubscribe,
} from '../services/orders'
import { mockOrders } from '../data/mockData'



export function useOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!SUPABASE_ACTIVE) {
      setOrders(mockOrders)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await fetchOrders()
      setOrders(data)
      setError(null)
    } catch (e) {
      console.warn('useOrders: falling back to mock data', e)
      setOrders(mockOrders)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    if (!SUPABASE_ACTIVE) return

    const channel = subscribeToOrders(() => load())
    return () => unsubscribe(channel)
  }, [load])

  return { orders, loading, error, reload: load }
}

export function useOrder(orderId) {
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    if (!SUPABASE_ACTIVE) {
      const found = mockOrders.find(o => o.id === orderId)
      setOrder(found ? { ...found, items: found.items.map(i => ({ ...i })) } : null)
      setLoading(false)
      return
    }
    fetchOrder(orderId)
      .then(data => { setOrder(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [orderId])

  const pickItem = useCallback(async (itemId, pickedQty, status, sub) => {
    if (!SUPABASE_ACTIVE) {
      setOrder(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === itemId
          ? { ...i, picked: pickedQty, status, sub: sub || i.sub } : i),
      }))
      return
    }
    await updateOrderItem(itemId, {
      pickedQty,
      status: status.replace('-', '_'),
      substituteName: sub,
    })
    const updated = await fetchOrder(orderId)
    setOrder(updated)
  }, [orderId])

  const finalisePack = useCallback(async () => {
    if (!SUPABASE_ACTIVE) {
      setOrder(prev => ({ ...prev, status: 'packed' }))
      return
    }
    await packOrder(orderId)
    const updated = await fetchOrder(orderId)
    setOrder(updated)
  }, [orderId])

  return { order, loading, pickItem, finalisePack }
}

export { startPicking }
