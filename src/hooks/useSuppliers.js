import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_ACTIVE } from '../lib/supabase'
import { fetchSuppliers, fetchPurchaseOrders, createPurchaseOrder } from '../services/suppliers'
import { mockSuppliers, mockPurchaseOrders } from '../data/mockData'
import { useAuth } from '../context/AuthContext'



export function useSuppliers() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!SUPABASE_ACTIVE) {
      setSuppliers(mockSuppliers)
      setPurchaseOrders(mockPurchaseOrders)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const [s, pos] = await Promise.all([fetchSuppliers(), fetchPurchaseOrders()])
      setSuppliers(s)
      setPurchaseOrders(pos)
    } catch (e) {
      console.warn('useSuppliers: falling back to mock data', e)
      setSuppliers(mockSuppliers)
      setPurchaseOrders(mockPurchaseOrders)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createPO = useCallback(async (supplierId, items) => {
    if (!SUPABASE_ACTIVE) {
      const newPO = {
        id: `PO-${String(mockPurchaseOrders.length + 1).padStart(4,'0')}`,
        supplier: suppliers.find(s => s.id === supplierId)?.name || supplierId,
        items: items.length,
        total: 0,
        status: 'pending',
        date: new Date(),
      }
      setPurchaseOrders(prev => [newPO, ...prev])
      return newPO
    }
    await createPurchaseOrder({ supplierId, items, userId: user?.id })
    await load()
  }, [user, suppliers, load])

  return { suppliers, purchaseOrders, loading, createPO, reload: load }
}
