-- ============================================================
-- Seed Data — Run this in Supabase SQL Editor
-- Truncates existing data first so it's safe to re-run
-- ============================================================

-- Clean up existing seed data (safe re-run)
TRUNCATE public.stock_movements, public.po_items, public.purchase_orders,
         public.order_items, public.orders, public.suppliers, public.products
CASCADE;

-- ─── PRODUCTS ─────────────────────────────────────────────────
INSERT INTO public.products (name, sku, barcode, price, stock, low_stock_threshold, location, category, expiry_date) VALUES
-- Dairy
('Organic Whole Milk 2L',        'MLK-001', '5901234123457', 3.49,  48, 10, 'A-04', 'Dairy',          NULL),
('Whole Milk 4 Pints',           'MLK-004', '5901234123477', 2.49,  32, 10, 'A-04', 'Dairy',          NULL),
('Semi-Skimmed Milk 2L',         'MLK-002', '5901234100001', 2.99,  24, 10, 'A-05', 'Dairy',          NULL),
('Free Range Eggs 12pk',         'EGG-012', '5901234123458', 4.99,   6, 10, 'A-06', 'Dairy',          NULL),
('Free Range Eggs 6pk',          'EGG-006', '5901234100002', 2.79,  14, 10, 'A-07', 'Dairy',          NULL),
('Cheddar Cheese 400g',          'CHS-400', '5901234123462', 5.49,  18, 10, 'A-09', 'Dairy',          NULL),
('Mozzarella 125g',              'CHS-MOZ', '5901234100003', 1.99,  22, 10, 'A-10', 'Dairy',          (NOW() + INTERVAL '4 days')::date),
('Cream Cheese 200g',            'CRM-200', '5901234123482', 2.29,  25, 10, 'A-10', 'Dairy',          NULL),
('Greek Yogurt 500g',            'YGT-500', '5901234123463', 2.49,  30, 10, 'A-11', 'Dairy',          NULL),
('Butter Salted 250g',           'BTR-250', '5901234123468', 2.99,  22, 10, 'A-03', 'Dairy',          NULL),
('Double Cream 300ml',           'CRM-300', '5901234100004', 1.79,   9, 10, 'A-12', 'Dairy',          (NOW() + INTERVAL '3 days')::date),

-- Dairy Alt
('Almond Milk 1L',               'AMK-001', '5901234123469', 2.99,  19, 10, 'A-14', 'Dairy Alt',      NULL),
('Oat Milk 1L',                  'OAT-001', '5901234100005', 1.89,  27, 10, 'A-15', 'Dairy Alt',      NULL),
('Soy Milk 1L',                  'SOY-001', '5901234100006', 1.69,  11, 10, 'A-16', 'Dairy Alt',      NULL),

-- Produce
('Braeburn Apples 6pk',          'APL-006', '5901234123460', 3.99,  24, 10, 'C-12', 'Produce',        NULL),
('Baby Spinach 200g',            'SPN-200', '5901234123461', 1.99,   3, 10, 'C-08', 'Produce',        (NOW() + INTERVAL '1 day')::date),
('Cherry Tomatoes 400g',         'TOM-400', '5901234123467', 2.29,   4, 10, 'C-05', 'Produce',        (NOW() + INTERVAL '2 days')::date),
('Avocados 4pk',                 'AVO-004', '5901234123470', 4.49,  16, 10, 'C-15', 'Produce',        NULL),
('Lemon 4pk',                    'LMN-004', '5901234123483', 1.29,  30, 10, 'C-02', 'Produce',        NULL),
('Bananas 5pk',                  'BAN-005', '5901234100007', 0.89,  40, 15, 'C-01', 'Produce',        NULL),
('Broccoli Head',                'BRC-001', '5901234100008', 0.99,  18, 10, 'C-06', 'Produce',        (NOW() + INTERVAL '3 days')::date),
('Cucumber Each',                'CUC-001', '5901234100009', 0.79,  22, 10, 'C-07', 'Produce',        NULL),
('Red Pepper Each',              'PEP-RED', '5901234100010', 0.89,  15, 10, 'C-09', 'Produce',        NULL),
('Bag of Potatoes 2kg',          'POT-2KG', '5901234100011', 2.49,  35, 10, 'C-14', 'Produce',        NULL),

-- Bakery
('Sourdough Bread 800g',         'BRD-003', '5901234123459', 2.79,  12, 10, 'B-01', 'Bakery',         (NOW() + INTERVAL '2 days')::date),
('Baguette Fresh',               'BRD-010', '5901234123480', 0.99,   8, 10, 'B-02', 'Bakery',         (NOW() + INTERVAL '1 day')::date),
('Wholemeal Sliced 800g',        'BRD-WHL', '5901234100012', 1.29,  20, 10, 'B-03', 'Bakery',         (NOW() + INTERVAL '4 days')::date),
('Croissants 4pk',               'CRS-004', '5901234100013', 2.49,   7,  8, 'B-04', 'Bakery',         (NOW() + INTERVAL '1 day')::date),

-- Meat
('Chicken Breast 500g',          'CHK-500', '5901234123464', 6.99,   8, 10, 'D-02', 'Meat',           NULL),
('Beef Mince 500g',              'BEF-500', '5901234100014', 4.99,  12, 10, 'D-04', 'Meat',           NULL),
('Smoked Salmon 150g',           'SLM-150', '5901234123481', 5.99,  12, 10, 'D-08', 'Fish',           NULL),
('Pork Sausages 400g',           'PRK-400', '5901234100015', 3.49,  16, 10, 'D-06', 'Meat',           NULL),

-- Grains
('Brown Rice 1kg',               'RIC-001', '5901234123465', 2.19,  42, 10, 'E-07', 'Grains',         NULL),
('Pasta Fusilli 500g',           'PST-500', '5901234123473', 1.49,  35, 10, 'E-04', 'Grains',         NULL),
('Rolled Oats 1kg',              'OAT-1KG', '5901234100016', 1.99,  28, 10, 'E-02', 'Grains',         NULL),
('Quinoa 500g',                  'QUI-500', '5901234100017', 3.99,  14, 10, 'E-09', 'Grains',         NULL),

-- Condiments
('Olive Oil Extra Virgin 500ml', 'OIL-500', '5901234123466', 7.99,  15, 10, 'F-03', 'Condiments',     NULL),
('Tinned Tomatoes 400g',         'TNT-400', '5901234123474', 0.89,  50, 20, 'F-08', 'Canned',         NULL),
('Soy Sauce 150ml',              'SOY-SAU', '5901234100018', 1.49,  33, 10, 'F-05', 'Condiments',     NULL),
('Honey Jar 340g',               'HNY-340', '5901234100019', 3.29,  20, 10, 'F-09', 'Condiments',     NULL),
('Tomato Ketchup 570g',          'KTC-570', '5901234100020', 2.49,  25, 10, 'F-10', 'Condiments',     NULL),

-- Snacks
('Oat Biscuits 300g',            'BSC-300', '5901234123471', 1.89,   2, 10, 'G-02', 'Snacks',         NULL),
('Crisps Variety 6pk',           'CRS-006', '5901234123478', 3.99,  28, 10, 'G-04', 'Snacks',         NULL),
('Dark Chocolate 85% 100g',      'CHC-100', '5901234123485', 2.79,  45, 10, 'G-10', 'Confectionery',  NULL),
('Granola Bar 5pk',              'GRN-5PK', '5901234100021', 3.49,  18, 10, 'G-06', 'Snacks',         NULL),
('Mixed Nuts 200g',              'NUT-200', '5901234100022', 4.99,  12, 10, 'G-08', 'Snacks',         NULL),

-- Beverages
('Orange Juice 1L',              'OJC-001', '5901234123472', 3.29,   0, 10, 'H-01', 'Beverages',      NULL),
('Sparkling Water 6pk',          'WTR-600', '5901234123479', 4.49,  40, 10, 'H-06', 'Beverages',      NULL),
('Coffee Beans 250g',            'CFE-250', '5901234123484', 8.99,  11, 10, 'I-01', 'Beverages',      NULL),
('Green Tea 40 bags',            'TEA-GRN', '5901234100023', 2.99,  22, 10, 'H-08', 'Beverages',      NULL),
('Coconut Water 330ml',          'CCW-330', '5901234100024', 1.49,  30, 10, 'H-09', 'Beverages',      NULL),

-- Frozen
('Frozen Peas 750g',             'PEA-750', '5901234123475', 1.79,  20, 10, 'Z-03', 'Frozen',         NULL),
('Frozen Fish Fingers 10pk',     'FSH-10P', '5901234100025', 3.49,  15, 10, 'Z-05', 'Frozen',         NULL),
('Ice Cream Vanilla 500ml',      'ICE-VAN', '5901234100026', 3.99,  18, 10, 'Z-08', 'Frozen',         NULL),

-- Deli / Other
('Hummus Classic 200g',          'HUM-200', '5901234123476', 2.49,  14, 10, 'B-06', 'Deli',           NULL),
('Red Wine 75cl',                'WNE-075', '5901234123486', 9.99,  18, 10, 'J-05', 'Alcohol',        NULL),
('Coffee Beans 250g Decaf',      'CFE-DEC', '5901234100027', 8.49,   8, 10, 'I-02', 'Beverages',      NULL);

-- ─── SUPPLIERS ────────────────────────────────────────────────
INSERT INTO public.suppliers (id, name, contact_email, contact_phone, category) VALUES
('11111111-1111-1111-1111-111111111111', 'FreshDirect Farms',  'john@freshdirect.com',   '+44 7700 900123', 'Produce & Dairy'),
('22222222-2222-2222-2222-222222222222', 'Metro Wholesale',    'orders@metro.co.uk',      '+44 7700 900456', 'General Grocery'),
('33333333-3333-3333-3333-333333333333', 'BreadCo Bakeries',   'supply@breadco.com',      '+44 7700 900789', 'Bakery'),
('44444444-4444-4444-4444-444444444444', 'ColdChain Meats',    'sales@coldchain.co.uk',   '+44 7700 900321', 'Meat & Fish'),
('55555555-5555-5555-5555-555555555555', 'Drinkwise Ltd',      'trade@drinkwise.co.uk',   '+44 7700 900654', 'Beverages');

-- ─── PURCHASE ORDERS ──────────────────────────────────────────
INSERT INTO public.purchase_orders (id, supplier_id, status, total, item_count, created_at) VALUES
('PO-0041', '11111111-1111-1111-1111-111111111111', 'pending',    342.50,  8, NOW() - INTERVAL '2 days'),
('PO-0040', '22222222-2222-2222-2222-222222222222', 'delivered', 1240.00, 14, NOW() - INTERVAL '5 days'),
('PO-0039', '33333333-3333-3333-3333-333333333333', 'in_transit', 180.00,  4, NOW() - INTERVAL '1 day'),
('PO-0038', '44444444-4444-4444-4444-444444444444', 'delivered',  560.00,  6, NOW() - INTERVAL '7 days'),
('PO-0037', '55555555-5555-5555-5555-555555555555', 'pending',    420.00,  5, NOW() - INTERVAL '3 hours'),
('PO-0036', '11111111-1111-1111-1111-111111111111', 'delivered',  890.00, 12, NOW() - INTERVAL '10 days');

-- ─── ORDERS ───────────────────────────────────────────────────
INSERT INTO public.orders (id, customer_name, status, priority, item_count, picked_count, created_at, packed_at) VALUES
-- Active orders
('GRO-2847', 'Sarah Mitchell',  'pending',     'high',   12, 0,  NOW() - INTERVAL '8 minutes',  NULL),
('GRO-2846', 'James Thornton',  'in_progress', 'normal',  8, 5,  NOW() - INTERVAL '22 minutes', NULL),
('GRO-2844', 'Oliver Webb',     'pending',     'urgent', 10, 0,  NOW() - INTERVAL '3 minutes',  NULL),
('GRO-2842', 'Liam Foster',     'pending',     'normal',  7, 0,  NOW() - INTERVAL '35 minutes', NULL),
('GRO-2841', 'Aisha Rahman',    'in_progress', 'high',    9, 3,  NOW() - INTERVAL '18 minutes', NULL),
('GRO-2840', 'Tom Bradley',     'pending',     'normal',  5, 0,  NOW() - INTERVAL '1 hour',     NULL),
('GRO-2839', 'Nina Patel',      'in_progress', 'urgent',  6, 2,  NOW() - INTERVAL '12 minutes', NULL),
-- Packed orders
('GRO-2845', 'Priya Patel',     'packed',      'normal',  6, 6,  NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '10 minutes'),
('GRO-2843', 'Emma Clarke',     'packed',      'normal', 15,15,  NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '30 minutes'),
('GRO-2838', 'George Mason',    'packed',      'high',    8, 8,  NOW() - INTERVAL '2 hours',    NOW() - INTERVAL '80 minutes'),
('GRO-2837', 'Fatima Al-Hassan','packed',      'normal', 11,11,  NOW() - INTERVAL '3 hours',    NOW() - INTERVAL '2 hours'),
('GRO-2836', 'Jack Williams',   'packed',      'normal',  4, 4,  NOW() - INTERVAL '3.5 hours',  NOW() - INTERVAL '3 hours');

-- ─── ORDER ITEMS for GRO-2847 (Sarah Mitchell – pending, high priority) ──
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2847', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, 0, 'pending', v.sort
FROM public.products p
JOIN (VALUES
  ('MLK-001',2,1),('EGG-012',1,2),('BRD-003',2,3),('APL-006',1,4),
  ('SPN-200',2,5),('CHS-400',1,6),('YGT-500',3,7),('CHK-500',2,8),
  ('RIC-001',1,9),('OIL-500',1,10),('TOM-400',2,11),('BTR-250',2,12)
) AS v(sku,qty,sort) ON p.sku = v.sku;

-- ─── ORDER ITEMS for GRO-2846 (James Thornton – in-progress, 5/8 done) ──
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2846', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, v.picked, v.st::item_status, v.sort
FROM public.products p
JOIN (VALUES
  ('AMK-001',2,2,'picked',1),
  ('AVO-004',1,1,'picked',2),
  ('BSC-300',2,2,'picked',3),
  ('OJC-001',1,0,'out_of_stock',4),
  ('PST-500',3,3,'picked',5),
  ('TNT-400',2,0,'pending',6),
  ('PEA-750',1,1,'substituted',7),
  ('HUM-200',1,0,'pending',8)
) AS v(sku,qty,picked,st,sort) ON p.sku = v.sku;

-- ─── ORDER ITEMS for GRO-2844 (Oliver Webb – urgent) ──────────
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2844', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, 0, 'pending', v.sort
FROM public.products p
JOIN (VALUES
  ('MLK-004',1,1),('CRS-006',2,2),('WTR-600',1,3),('BRD-010',3,4),
  ('SLM-150',2,5),('CRM-200',1,6),('LMN-004',1,7),('CFE-250',1,8),
  ('CHC-100',4,9),('WNE-075',1,10)
) AS v(sku,qty,sort) ON p.sku = v.sku;

-- ─── ORDER ITEMS for GRO-2842 (Liam Foster – pending) ─────────
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2842', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, 0, 'pending', v.sort
FROM public.products p
JOIN (VALUES
  ('BAN-005',2,1),('YGT-500',2,2),('OAT-1KG',1,3),
  ('GRN-5PK',3,4),('CCW-330',4,5),('BRC-001',1,6),('CUC-001',2,7)
) AS v(sku,qty,sort) ON p.sku = v.sku;

-- ─── ORDER ITEMS for GRO-2841 (Aisha Rahman – in-progress, 3/9) ─
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2841', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, v.picked, v.st::item_status, v.sort
FROM public.products p
JOIN (VALUES
  ('POT-2KG',1,1,'picked',1),
  ('BEF-500',2,2,'picked',2),
  ('TNT-400',3,3,'picked',3),
  ('PST-500',2,0,'pending',4),
  ('KTC-570',1,0,'pending',5),
  ('CHC-100',2,0,'pending',6),
  ('OAT-1KG',1,0,'pending',7),
  ('HNY-340',1,0,'pending',8),
  ('TEA-GRN',1,0,'pending',9)
) AS v(sku,qty,picked,st,sort) ON p.sku = v.sku;

-- ─── ORDER ITEMS for GRO-2840 (Tom Bradley – pending) ─────────
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2840', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, 0, 'pending', v.sort
FROM public.products p
JOIN (VALUES
  ('ICE-VAN',2,1),('CCW-330',6,2),('CHC-100',3,3),
  ('NUT-200',1,4),('WNE-075',2,5)
) AS v(sku,qty,sort) ON p.sku = v.sku;

-- ─── ORDER ITEMS for GRO-2839 (Nina Patel – urgent, in-progress 2/6) ─
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2839', p.name, p.sku, p.barcode, p.location, p.price, p.category, v.qty, v.picked, v.st::item_status, v.sort
FROM public.products p
JOIN (VALUES
  ('SLM-150',1,1,'picked',1),
  ('CRM-200',1,1,'picked',2),
  ('BRD-010',2,0,'pending',3),
  ('LMN-004',1,0,'pending',4),
  ('CHS-MOZ',2,0,'pending',5),
  ('AVO-004',2,0,'pending',6)
) AS v(sku,qty,picked,st,sort) ON p.sku = v.sku;
