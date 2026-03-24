-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_picks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── PROFILES ────────────────────────────────────────────────
-- Users can read their own profile; managers/admins can read all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.current_user_role() IN ('manager','admin'));

-- Users can update only their own profile
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Only admins can insert/delete profiles (creation handled by trigger)
CREATE POLICY "profiles_admin" ON public.profiles FOR ALL
  USING (public.current_user_role() = 'admin');

-- ─── PRODUCTS ────────────────────────────────────────────────
-- All authenticated users can read products
CREATE POLICY "products_select" ON public.products FOR SELECT
  TO authenticated USING (TRUE);

-- Only managers and admins can insert/update/delete products
CREATE POLICY "products_write" ON public.products FOR ALL
  USING (public.current_user_role() IN ('manager','admin'));

-- ─── ORDERS ──────────────────────────────────────────────────
-- All authenticated users can view orders
CREATE POLICY "orders_select" ON public.orders FOR SELECT
  TO authenticated USING (TRUE);

-- Pickers can update orders assigned to them; managers can update any
CREATE POLICY "orders_update" ON public.orders FOR UPDATE
  USING (picker_id = auth.uid() OR public.current_user_role() IN ('manager','admin'));

-- Only managers/admins can create orders
CREATE POLICY "orders_insert" ON public.orders FOR INSERT
  WITH CHECK (public.current_user_role() IN ('manager','admin'));

-- Only admins can delete orders
CREATE POLICY "orders_delete" ON public.orders FOR DELETE
  USING (public.current_user_role() = 'admin');

-- ─── ORDER ITEMS ─────────────────────────────────────────────
-- All authenticated users can view order items
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT
  TO authenticated USING (TRUE);

-- Pickers can update items (to record picking progress)
CREATE POLICY "order_items_update" ON public.order_items FOR UPDATE
  TO authenticated USING (TRUE);

-- Only managers/admins can insert/delete order items
CREATE POLICY "order_items_insert_delete" ON public.order_items FOR INSERT
  WITH CHECK (public.current_user_role() IN ('manager','admin'));

-- ─── BATCH PICKS ────────────────────────────────────────────
-- Users see only their own batch picks; managers see all
CREATE POLICY "batch_picks_select" ON public.batch_picks FOR SELECT
  USING (picker_id = auth.uid() OR public.current_user_role() IN ('manager','admin'));

CREATE POLICY "batch_picks_insert" ON public.batch_picks FOR INSERT
  TO authenticated WITH CHECK (picker_id = auth.uid());

CREATE POLICY "batch_picks_update" ON public.batch_picks FOR UPDATE
  USING (picker_id = auth.uid() OR public.current_user_role() IN ('manager','admin'));

-- ─── SUPPLIERS ───────────────────────────────────────────────
CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "suppliers_write" ON public.suppliers FOR ALL
  USING (public.current_user_role() IN ('manager','admin'));

-- ─── PURCHASE ORDERS ────────────────────────────────────────
CREATE POLICY "pos_select" ON public.purchase_orders FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "pos_write" ON public.purchase_orders FOR ALL
  USING (public.current_user_role() IN ('manager','admin'));

-- ─── PO ITEMS ────────────────────────────────────────────────
CREATE POLICY "po_items_select" ON public.po_items FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "po_items_write" ON public.po_items FOR ALL
  USING (public.current_user_role() IN ('manager','admin'));

-- ─── STOCK MOVEMENTS ────────────────────────────────────────
CREATE POLICY "movements_select" ON public.stock_movements FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "movements_insert" ON public.stock_movements FOR INSERT
  TO authenticated WITH CHECK (performed_by = auth.uid());
