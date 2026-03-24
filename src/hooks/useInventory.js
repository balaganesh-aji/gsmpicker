import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_ACTIVE } from '../lib/supabase'
import { fetchProducts, updateStock, addProduct, subscribeToInventory, unsubscribe } from '../services/inventory'
import { mockInventory } from '../data/mockData'
import { useAuth } from '../context/AuthContext'



export function useInventory() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const load = useCallback(async () => {
    if (!SUPABASE_ACTIVE) {
      setProducts(mockInventory)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
      setError(null)
    } catch (e) {
      console.warn('useInventory: falling back to mock data', e)
      setProducts(mockInventory)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (!SUPABASE_ACTIVE) return
    const channel = subscribeToInventory(() => load())
    return () => unsubscribe(channel)
  }, [load])

  const adjustStock = useCallback(async (productId, qtyChange, type = 'adjustment', ref = null) => {
    if (!SUPABASE_ACTIVE) {
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + qtyChange) } : p
      ))
      return
    }
    await updateStock(productId, qtyChange, type, ref, user?.id)
    await load()
  }, [user, load])

  const createProduct = useCallback(async (form) => {
    if (!SUPABASE_ACTIVE) {
      const newProduct = { ...form, id: Date.now(), lowStock: false, expiring: false }
      setProducts(prev => [...prev, newProduct])
      return newProduct
    }
    const product = await addProduct(form)
    await load()
    return product
  }, [load])

  return { products, loading, error, adjustStock, createProduct, reload: load }
}
