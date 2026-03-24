-- ============================================================
-- GrocerPick – Full Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Custom ENUMs ────────────────────────────────────────────
CREATE TYPE user_role           AS ENUM ('picker', 'manager', 'admin');
CREATE TYPE order_status        AS ENUM ('pending', 'in_progress', 'packed', 'dispatched', 'cancelled');
CREATE TYPE order_priority      AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE item_status         AS ENUM ('pending', 'picked', 'out_of_stock', 'substituted', 'partial');
CREATE TYPE po_status           AS ENUM ('draft', 'pending', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE stock_movement_type AS ENUM ('grn', 'pick', 'adjustment', 'expiry_write_off', 'transfer');
CREATE TYPE batch_status        AS ENUM ('in_progress', 'completed', 'cancelled');

-- ─── PROFILES (extends auth.users) ───────────────────────────
CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT        NOT NULL,
  display_name  TEXT,
  role          user_role   NOT NULL DEFAULT 'picker',
  warehouse_id  UUID,
  avatar_url    TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS (inventory master) ─────────────────────────────
CREATE TABLE public.products (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  sku           TEXT        NOT NULL UNIQUE,
  barcode       TEXT        UNIQUE,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  category      TEXT        NOT NULL DEFAULT 'general',
  location      TEXT        NOT NULL DEFAULT 'A-01',
  stock         INTEGER     NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  expiry_date   DATE,
  image_url     TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku      ON public.products(sku);
CREATE INDEX idx_products_barcode  ON public.products(barcode);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_location ON public.products(location);
CREATE INDEX idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);

-- Computed columns via views
CREATE OR REPLACE VIEW public.products_with_flags AS
SELECT *,
  stock <= low_stock_threshold AS low_stock,
  expiry_date IS NOT NULL AND expiry_date <= (NOW() + INTERVAL '3 days') AS expiring
FROM public.products
WHERE is_active = TRUE;

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE public.orders (
  id            TEXT        PRIMARY KEY,   -- e.g. GRO-2847
  customer_name TEXT        NOT NULL,
  customer_ref  TEXT,
  status        order_status NOT NULL DEFAULT 'pending',
  priority      order_priority NOT NULL DEFAULT 'normal',
  picker_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  item_count    INTEGER     NOT NULL DEFAULT 0,
  picked_count  INTEGER     NOT NULL DEFAULT 0,
  notes         TEXT,
  packed_at     TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status    ON public.orders(status);
CREATE INDEX idx_orders_priority  ON public.orders(priority);
CREATE INDEX idx_orders_picker    ON public.orders(picker_id);
CREATE INDEX idx_orders_created   ON public.orders(created_at DESC);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE public.order_items (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        TEXT        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  -- snapshot fields (preserve even if product changes)
  name            TEXT        NOT NULL,
  sku             TEXT        NOT NULL,
  barcode         TEXT,
  location        TEXT        NOT NULL,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  category        TEXT,
  qty             INTEGER     NOT NULL DEFAULT 1,
  picked_qty      INTEGER     NOT NULL DEFAULT 0,
  status          item_status NOT NULL DEFAULT 'pending',
  substitute_name TEXT,        -- name of substitute product if status = substituted
  substitute_sku  TEXT,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);
CREATE INDEX idx_order_items_sku     ON public.order_items(sku);

-- ─── BATCH PICKS ─────────────────────────────────────────────
CREATE TABLE public.batch_picks (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  picker_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     batch_status NOT NULL DEFAULT 'in_progress',
  order_ids  TEXT[]      NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUPPLIERS ───────────────────────────────────────────────
CREATE TABLE public.suppliers (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  category      TEXT,
  address       TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PURCHASE ORDERS ─────────────────────────────────────────
CREATE TABLE public.purchase_orders (
  id           TEXT        PRIMARY KEY,   -- e.g. PO-0041
  supplier_id  UUID        NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  status       po_status   NOT NULL DEFAULT 'pending',
  total        NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_count   INTEGER     NOT NULL DEFAULT 0,
  notes        TEXT,
  expected_at  DATE,
  delivered_at TIMESTAMPTZ,
  created_by   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pos_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_pos_status   ON public.purchase_orders(status);

-- ─── PURCHASE ORDER ITEMS ────────────────────────────────────
CREATE TABLE public.po_items (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id         TEXT        NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id    UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  name          TEXT        NOT NULL,
  sku           TEXT        NOT NULL,
  qty_ordered   INTEGER     NOT NULL DEFAULT 1,
  qty_received  INTEGER     NOT NULL DEFAULT 0,
  unit_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_items_po      ON public.po_items(po_id);
CREATE INDEX idx_po_items_product ON public.po_items(product_id);

-- ─── STOCK MOVEMENTS (audit trail) ──────────────────────────
CREATE TABLE public.stock_movements (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type         stock_movement_type NOT NULL,
  qty_change   INTEGER     NOT NULL,   -- positive = stock in, negative = stock out
  qty_before   INTEGER     NOT NULL,
  qty_after    INTEGER     NOT NULL,
  reference_id TEXT,                   -- order_id, po_id, etc.
  notes        TEXT,
  performed_by UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_movements_type    ON public.stock_movements(type);
CREATE INDEX idx_movements_date    ON public.stock_movements(created_at DESC);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at       BEFORE UPDATE ON public.profiles       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_products_updated_at       BEFORE UPDATE ON public.products       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_orders_updated_at         BEFORE UPDATE ON public.orders         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_order_items_updated_at    BEFORE UPDATE ON public.order_items    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_suppliers_updated_at      BEFORE UPDATE ON public.suppliers      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGN UP ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'picker')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ORDER PICKED_COUNT SYNC TRIGGER ────────────────────────
CREATE OR REPLACE FUNCTION public.sync_order_picked_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_picked  INTEGER;
  v_total   INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE status IN ('picked','out_of_stock','substituted','partial')),
    COUNT(*)
  INTO v_picked, v_total
  FROM public.order_items
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

  UPDATE public.orders
  SET picked_count = v_picked,
      item_count   = v_total
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_order_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_order_picked_count();
