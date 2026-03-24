-- ============================================================
-- Allow anonymous (unauthenticated) reads on all core tables
-- This lets the app show data even before a Supabase session
-- is fully established (e.g. demo / biometric login path).
-- Write operations still require authentication.
-- ============================================================

-- ORDERS
DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT USING (TRUE);

-- ORDER ITEMS
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (TRUE);

-- PRODUCTS
DROP POLICY IF EXISTS "products_select" ON public.products;
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (TRUE);

-- SUPPLIERS
DROP POLICY IF EXISTS "suppliers_select" ON public.suppliers;
CREATE POLICY "suppliers_select" ON public.suppliers
  FOR SELECT USING (TRUE);

-- PURCHASE ORDERS
DROP POLICY IF EXISTS "pos_select" ON public.purchase_orders;
CREATE POLICY "pos_select" ON public.purchase_orders
  FOR SELECT USING (TRUE);

-- PO ITEMS
DROP POLICY IF EXISTS "po_items_select" ON public.po_items;
CREATE POLICY "po_items_select" ON public.po_items
  FOR SELECT USING (TRUE);

-- STOCK MOVEMENTS
DROP POLICY IF EXISTS "movements_select" ON public.stock_movements;
CREATE POLICY "movements_select" ON public.stock_movements
  FOR SELECT USING (TRUE);
