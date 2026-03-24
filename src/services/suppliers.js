import { supabase } from '../lib/supabase'

// ─── Mappers ──────────────────────────────────────────────────
function mapSupplier(row) {
  return {
    id:       row.id,
    name:     row.name,
    contact:  row.contact_email,
    phone:    row.contact_phone,
    category: row.category,
  }
}

function mapPO(row) {
  return {
    id:       row.id,
    supplier: row.suppliers?.name || row.supplier_id,
    items:    row.item_count,
    total:    Number(row.total),
    status:   row.status.replace('_', '-'),
    date:     new Date(row.created_at),
  }
}

// ─── Fetch Suppliers ──────────────────────────────────────────
export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data.map(mapSupplier)
}

// ─── Fetch Purchase Orders ────────────────────────────────────
export async function fetchPurchaseOrders() {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`*, suppliers(name)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapPO)
}

// ─── Create Purchase Order ────────────────────────────────────
export async function createPurchaseOrder({ supplierId, items, userId }) {
  // Generate PO ID
  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
  const poId = `PO-${String((count || 0) + 1).padStart(4, '0')}`

  const total      = items.reduce((s, i) => s + (i.unitCost * i.qty), 0)
  const itemCount  = items.length

  const { data: po, error: poErr } = await supabase
    .from('purchase_orders')
    .insert({
      id:          poId,
      supplier_id: supplierId,
      total,
      item_count:  itemCount,
      created_by:  userId,
    })
    .select()
    .single()
  if (poErr) throw poErr

  // Insert PO items
  const poItems = items.map(i => ({
    po_id:      poId,
    product_id: i.productId,
    name:       i.name,
    sku:        i.sku,
    qty_ordered: i.qty,
    unit_cost:  i.unitCost || 0,
  }))

  const { error: itemsErr } = await supabase.from('po_items').insert(poItems)
  if (itemsErr) throw itemsErr

  return po
}

// ─── Update PO Status ─────────────────────────────────────────
export async function updatePOStatus(poId, status) {
  const patch = { status }
  if (status === 'delivered') patch.delivered_at = new Date().toISOString()

  const { error } = await supabase
    .from('purchase_orders')
    .update(patch)
    .eq('id', poId)
  if (error) throw error
}
