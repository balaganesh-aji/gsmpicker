import { supabase } from '../lib/supabase'

// ─── Map DB row → app shape ───────────────────────────────────
function mapProduct(row) {
  return {
    id:       row.id,
    name:     row.name,
    sku:      row.sku,
    barcode:  row.barcode,
    price:    Number(row.price),
    stock:    row.stock,
    location: row.location,
    category: row.category,
    lowStock: row.low_stock  ?? row.stock <= row.low_stock_threshold,
    expiring: row.expiring   ?? (row.expiry_date != null),
    expiryDate: row.expiry_date,
  }
}

// ─── Fetch All Products ───────────────────────────────────────
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products_with_flags')
    .select('*')
    .order('location')
  if (error) throw error
  return data.map(mapProduct)
}

// ─── Fetch Single Product by SKU / Barcode ────────────────────
export async function fetchProductByBarcode(barcode) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
    .single()
  if (error) throw error
  return mapProduct(data)
}

// ─── Add Product ──────────────────────────────────────────────
export async function addProduct({ name, sku, barcode, price, stock, location, category }) {
  const { data, error } = await supabase
    .from('products')
    .insert({ name, sku, barcode, price, stock, location, category })
    .select()
    .single()
  if (error) throw error
  return mapProduct(data)
}

// ─── Update Stock ─────────────────────────────────────────────
export async function updateStock(productId, qtyChange, type, referenceId, userId) {
  // Fetch current stock
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()
  if (fetchErr) throw fetchErr

  const qtyBefore = product.stock
  const qtyAfter  = Math.max(0, qtyBefore + qtyChange)

  // Update product stock
  const { error: updateErr } = await supabase
    .from('products')
    .update({ stock: qtyAfter })
    .eq('id', productId)
  if (updateErr) throw updateErr

  // Record movement
  const { error: movErr } = await supabase
    .from('stock_movements')
    .insert({
      product_id:   productId,
      type,
      qty_change:   qtyChange,
      qty_before:   qtyBefore,
      qty_after:    qtyAfter,
      reference_id: referenceId,
      performed_by: userId,
    })
  if (movErr) throw movErr

  return qtyAfter
}

// ─── Real-time ────────────────────────────────────────────────
export function subscribeToInventory(callback) {
  return supabase
    .channel('inventory-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
    .subscribe()
}

export function unsubscribe(channel) {
  supabase.removeChannel(channel)
}
