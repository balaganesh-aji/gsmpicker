import { useState, useEffect } from 'react'
import { SUPABASE_ACTIVE } from '../lib/supabase'
import { fetchPickerStats, fetchStockSummary, fetchKPIs } from '../services/reports'
import { mockPickerStats, mockDailyOrders, mockFulfillmentTime, mockDays } from '../data/mockData'



export function useReports() {
  const [kpis,         setKpis]         = useState(null)
  const [pickerStats,  setPickerStats]  = useState(mockPickerStats)
  const [stockSummary, setStockSummary] = useState(null)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    async function load() {
      if (!SUPABASE_ACTIVE) {
        setKpis({ todayOrders: mockDailyOrders[6], avgFulfill: '8.2', accuracyRate: '98.2' })
        setPickerStats(mockPickerStats)
        setLoading(false)
        return
      }
      try {
        const [k, ps, ss] = await Promise.all([
          fetchKPIs(),
          fetchPickerStats(),
          fetchStockSummary(),
        ])
        setKpis(k)
        setPickerStats(ps.length > 0 ? ps : mockPickerStats)
        setStockSummary(ss)
      } catch (e) {
        console.warn('useReports: falling back to mock data', e)
        setKpis({ todayOrders: mockDailyOrders[6], avgFulfill: '8.2', accuracyRate: '98.2' })
        setPickerStats(mockPickerStats)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return {
    kpis,
    pickerStats,
    stockSummary,
    loading,
    // Keep mock chart data until we have an analytics RPC
    dailyOrders: mockDailyOrders,
    fulfillmentTime: mockFulfillmentTime,
    days: mockDays,
  }
}
