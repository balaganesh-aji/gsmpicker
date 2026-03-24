import { supabase } from '../lib/supabase'

// ─── Map DB row → app shape ───────────────────────────────────
function mapOrder(row) {
  return {
    id:          row.id,
    customer:    row.customer_name,
    status:      row.status.replace('_', '-'),   // in_progress → in-progress
    priority:    row.priority,
    itemCount:   row.item_count,
    pickedCount: row.picked_count,
    createdAt:   new Date(row.created_at),
    items:       (row.order_items || []).map(mapItem),
  }
}

function mapItem(row) {
  return {
    id:            row.id,
    name:          row.name,
    sku:           row.sku,
    barcode:       row.barcode,
    location:      row.location,
    price:         Number(row.price),
    category:      row.category,
    qty:           row.qty,
    picked:        row.picked_qty,
    status:        row.status.replace('_', '-'),
    sub:           row.substitute_name || undefined,
    substituteSku: row.substitute_sku  || undefined,
  }
}

// ─── Fetch All Orders ─────────────────────────────────────────
export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapOrder)
}

// ─── Fetch Single Order ───────────────────────────────────────
export async function fetchOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(* )`)
    .eq('id', orderId)
    .order('sort_order', { referencedTable: 'order_items', ascending: true })
    .single()
  if (error) throw error
  return mapOrder(data)
}

// ─── Start Picking (assign picker + set in_progress) ─────────
export async function startPicking(orderId, pickerId) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'in_progress', picker_id: pickerId })
    .eq('id', orderId)
  if (error) throw error
}

// ─── Update Item Pick Progress ────────────────────────────────
export async function updateOrderItem(itemId, { pickedQty, status, substituteName, substituteSku }) {
  const patch = {
    picked_qty: pickedQty,
    status,
    updated_at: new Date().toISOString(),
  }
  if (substituteName !== undefined) patch.substitute_name = substituteName
  if (substituteSku  !== undefined) patch.substitute_sku  = substituteSku

  const { error } = await supabase
    .from('order_items')
    .update(patch)
    .eq('id', itemId)
  if (error) throw error
}

// ─── Pack Order ───────────────────────────────────────────────
export async function packOrder(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'packed', packed_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw error
}

// ─── Real-time subscription ───────────────────────────────────
export function subscribeToOrders(callback) {
  return supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },   callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, callback)
    .subscribe()
}

export function unsubscribe(channel) {
  supabase.removeChannel(channel)
}
