-- ============================================================
-- Seed Data — matches the existing mock data exactly
-- Run AFTER creating a user in Supabase Auth dashboard
-- Then replace the UUID below with that user's actual UUID
-- ============================================================

-- Products / Inventory
INSERT INTO public.products (name, sku, barcode, price, stock, low_stock_threshold, location, category, expiry_date) VALUES
('Organic Whole Milk 2L',       'MLK-001', '5901234123457', 3.49,  48, 10, 'A-04', 'Dairy',     NULL),
('Free Range Eggs 12pk',        'EGG-012', '5901234123458', 4.99,   6, 10, 'A-06', 'Dairy',     NULL),
('Sourdough Bread 800g',        'BRD-003', '5901234123459', 2.79,  12, 10, 'B-01', 'Bakery',    (NOW() + INTERVAL '2 days')::date),
('Braeburn Apples 6pk',         'APL-006', '5901234123460', 3.99,  24, 10, 'C-12', 'Produce',   NULL),
('Baby Spinach 200g',           'SPN-200', '5901234123461', 1.99,   3, 10, 'C-08', 'Produce',   (NOW() + INTERVAL '1 day')::date),
('Cheddar Cheese 400g',         'CHS-400', '5901234123462', 5.49,  18, 10, 'A-09', 'Dairy',     NULL),
('Greek Yogurt 500g',           'YGT-500', '5901234123463', 2.49,  30, 10, 'A-11', 'Dairy',     NULL),
('Chicken Breast 500g',         'CHK-500', '5901234123464', 6.99,   8, 10, 'D-02', 'Meat',      NULL),
('Brown Rice 1kg',              'RIC-001', '5901234123465', 2.19,  42, 10, 'E-07', 'Grains',    NULL),
('Olive Oil Extra Virgin 500ml','OIL-500', '5901234123466', 7.99,  15, 10, 'F-03', 'Condiments',NULL),
('Cherry Tomatoes 400g',        'TOM-400', '5901234123467', 2.29,   4, 10, 'C-05', 'Produce',   (NOW() + INTERVAL '2 days')::date),
('Butter Salted 250g',          'BTR-250', '5901234123468', 2.99,  22, 10, 'A-03', 'Dairy',     NULL),
('Almond Milk 1L',              'AMK-001', '5901234123469', 2.99,  19, 10, 'A-14', 'Dairy Alt', NULL),
('Oat Biscuits 300g',           'BSC-300', '5901234123471', 1.89,   2, 10, 'G-02', 'Snacks',    NULL),
('Coffee Beans 250g',           'CFE-250', '5901234123484', 8.99,  11, 10, 'I-01', 'Beverages', NULL),
('Avocados 4pk',                'AVO-004', '5901234123470', 4.49,  16, 10, 'C-15', 'Produce',   NULL),
('Orange Juice 1L',             'OJC-001', '5901234123472', 3.29,   0, 10, 'H-01', 'Beverages', NULL),
('Pasta Fusilli 500g',          'PST-500', '5901234123473', 1.49,  35, 10, 'E-04', 'Grains',    NULL),
('Tinned Tomatoes 400g',        'TNT-400', '5901234123474', 0.89,  50, 10, 'F-08', 'Canned',    NULL),
('Frozen Peas 750g',            'PEA-750', '5901234123475', 1.79,  20, 10, 'Z-03', 'Frozen',    NULL),
('Hummus Classic 200g',         'HUM-200', '5901234123476', 2.49,  14, 10, 'B-06', 'Deli',      NULL),
('Whole Milk 4 Pints',          'MLK-004', '5901234123477', 2.49,  32, 10, 'A-04', 'Dairy',     NULL),
('Crisps Variety 6pk',          'CRS-006', '5901234123478', 3.99,  28, 10, 'G-04', 'Snacks',    NULL),
('Sparkling Water 6pk',         'WTR-600', '5901234123479', 4.49,  40, 10, 'H-06', 'Beverages', NULL),
('Baguette Fresh',              'BRD-010', '5901234123480', 0.99,   8, 10, 'B-02', 'Bakery',    (NOW() + INTERVAL '1 day')::date),
('Smoked Salmon 150g',          'SLM-150', '5901234123481', 5.99,  12, 10, 'D-08', 'Fish',      NULL),
('Cream Cheese 200g',           'CRM-200', '5901234123482', 2.29,  25, 10, 'A-10', 'Dairy',     NULL),
('Lemon 4pk',                   'LMN-004', '5901234123483', 1.29,  30, 10, 'C-02', 'Produce',   NULL),
('Chocolate Dark 85% 100g',     'CHC-100', '5901234123485', 2.79,  45, 10, 'G-10', 'Confectionery',NULL),
('Red Wine 75cl',               'WNE-075', '5901234123486', 9.99,  18, 10, 'J-05', 'Alcohol',   NULL);

-- Suppliers
INSERT INTO public.suppliers (id, name, contact_email, contact_phone, category) VALUES
('11111111-1111-1111-1111-111111111111', 'FreshDirect Farms',  'john@freshdirect.com',     '+44 7700 900123', 'Produce & Dairy'),
('22222222-2222-2222-2222-222222222222', 'Metro Wholesale',    'orders@metro.co.uk',        '+44 7700 900456', 'General Grocery'),
('33333333-3333-3333-3333-333333333333', 'BreadCo Bakeries',   'supply@breadco.com',        '+44 7700 900789', 'Bakery'),
('44444444-4444-4444-4444-444444444444', 'ColdChain Meats',    'sales@coldchain.co.uk',     '+44 7700 900321', 'Meat & Fish');

-- Purchase Orders
INSERT INTO public.purchase_orders (id, supplier_id, status, total, item_count, created_at) VALUES
('PO-0041', '11111111-1111-1111-1111-111111111111', 'pending',    342.50,  8, NOW() - INTERVAL '2 days'),
('PO-0040', '22222222-2222-2222-2222-222222222222', 'delivered', 1240.00, 14, NOW() - INTERVAL '5 days'),
('PO-0039', '33333333-3333-3333-3333-333333333333', 'in_transit', 180.00,  4, NOW() - INTERVAL '1 day'),
('PO-0038', '44444444-4444-4444-4444-444444444444', 'delivered',  560.00,  6, NOW() - INTERVAL '7 days');

-- Orders
INSERT INTO public.orders (id, customer_name, status, priority, item_count, picked_count, created_at) VALUES
('GRO-2847', 'Sarah Mitchell', 'pending',     'high',   12, 0,  NOW() - INTERVAL '8 minutes'),
('GRO-2846', 'James Thornton', 'in_progress', 'normal',  8, 5,  NOW() - INTERVAL '22 minutes'),
('GRO-2845', 'Priya Patel',    'packed',      'normal',  6, 6,  NOW() - INTERVAL '45 minutes'),
('GRO-2844', 'Oliver Webb',    'pending',     'urgent', 10, 0,  NOW() - INTERVAL '3 minutes'),
('GRO-2843', 'Emma Clarke',    'packed',      'normal', 15, 15, NOW() - INTERVAL '90 minutes');

-- Order Items for GRO-2847
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2847', name, sku, barcode, location, price, category, qty_arr.qty, 0, 'pending', row_number() OVER () - 1
FROM public.products
JOIN (VALUES
  ('MLK-001',2),('EGG-012',1),('BRD-003',2),('APL-006',1),('SPN-200',2),
  ('CHS-400',1),('YGT-500',3),('CHK-500',2),('RIC-001',1),('OIL-500',1),
  ('TOM-400',2),('BTR-250',2)
) AS qty_arr(sku_ref, qty) ON products.sku = qty_arr.sku_ref;

-- Order Items for GRO-2844
INSERT INTO public.order_items (order_id, name, sku, barcode, location, price, category, qty, picked_qty, status, sort_order)
SELECT 'GRO-2844', name, sku, barcode, location, price, category, qty_arr.qty, 0, 'pending', row_number() OVER () - 1
FROM public.products
JOIN (VALUES
  ('MLK-004',1),('CRS-006',2),('WTR-600',1),('BRD-010',3),('SLM-150',2),
  ('CRM-200',1),('LMN-004',1),('CFE-250',1),('CHC-100',4),('WNE-075',1)
) AS qty_arr(sku_ref, qty) ON products.sku = qty_arr.sku_ref;
