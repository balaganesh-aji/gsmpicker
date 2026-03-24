export const mockOrders = [
  {
    id: 'GRO-2847',
    customer: 'Sarah Mitchell',
    itemCount: 12,
    pickedCount: 0,
    createdAt: new Date(Date.now() - 8 * 60000),
    status: 'pending',
    priority: 'high',
    items: [
      { id: 1, name: 'Organic Whole Milk 2L', sku: 'MLK-001', barcode: '5901234123457', qty: 2, picked: 0, location: 'A-04', price: 3.49, status: 'pending', category: 'dairy' },
      { id: 2, name: 'Free Range Eggs 12pk', sku: 'EGG-012', barcode: '5901234123458', qty: 1, picked: 0, location: 'A-06', price: 4.99, status: 'pending', category: 'dairy' },
      { id: 3, name: 'Sourdough Bread 800g', sku: 'BRD-003', barcode: '5901234123459', qty: 2, picked: 0, location: 'B-01', price: 2.79, status: 'pending', category: 'bakery' },
      { id: 4, name: 'Braeburn Apples 6pk', sku: 'APL-006', barcode: '5901234123460', qty: 1, picked: 0, location: 'C-12', price: 3.99, status: 'pending', category: 'produce' },
      { id: 5, name: 'Baby Spinach 200g', sku: 'SPN-200', barcode: '5901234123461', qty: 2, picked: 0, location: 'C-08', price: 1.99, status: 'pending', category: 'produce' },
      { id: 6, name: 'Cheddar Cheese 400g', sku: 'CHS-400', barcode: '5901234123462', qty: 1, picked: 0, location: 'A-09', price: 5.49, status: 'pending', category: 'dairy' },
      { id: 7, name: 'Greek Yogurt 500g', sku: 'YGT-500', barcode: '5901234123463', qty: 3, picked: 0, location: 'A-11', price: 2.49, status: 'pending', category: 'dairy' },
      { id: 8, name: 'Chicken Breast 500g', sku: 'CHK-500', barcode: '5901234123464', qty: 2, picked: 0, location: 'D-02', price: 6.99, status: 'pending', category: 'meat' },
      { id: 9, name: 'Brown Rice 1kg', sku: 'RIC-001', barcode: '5901234123465', qty: 1, picked: 0, location: 'E-07', price: 2.19, status: 'pending', category: 'grains' },
      { id: 10, name: 'Olive Oil Extra Virgin 500ml', sku: 'OIL-500', barcode: '5901234123466', qty: 1, picked: 0, location: 'F-03', price: 7.99, status: 'pending', category: 'condiments' },
      { id: 11, name: 'Cherry Tomatoes 400g', sku: 'TOM-400', barcode: '5901234123467', qty: 2, picked: 0, location: 'C-05', price: 2.29, status: 'pending', category: 'produce' },
      { id: 12, name: 'Butter Salted 250g', sku: 'BTR-250', barcode: '5901234123468', qty: 2, picked: 0, location: 'A-03', price: 2.99, status: 'pending', category: 'dairy' },
    ]
  },
  {
    id: 'GRO-2846',
    customer: 'James Thornton',
    itemCount: 8,
    pickedCount: 5,
    createdAt: new Date(Date.now() - 22 * 60000),
    status: 'in-progress',
    priority: 'normal',
    items: [
      { id: 1, name: 'Almond Milk 1L', sku: 'AMK-001', barcode: '5901234123469', qty: 2, picked: 2, location: 'A-14', price: 2.99, status: 'picked', category: 'dairy-alt' },
      { id: 2, name: 'Avocados 4pk', sku: 'AVO-004', barcode: '5901234123470', qty: 1, picked: 1, location: 'C-15', price: 4.49, status: 'picked', category: 'produce' },
      { id: 3, name: 'Oat Biscuits 300g', sku: 'BSC-300', barcode: '5901234123471', qty: 2, picked: 2, location: 'G-02', price: 1.89, status: 'picked', category: 'snacks' },
      { id: 4, name: 'Orange Juice 1L', sku: 'OJC-001', barcode: '5901234123472', qty: 1, picked: 0, location: 'H-01', price: 3.29, status: 'out-of-stock', category: 'beverages' },
      { id: 5, name: 'Pasta Fusilli 500g', sku: 'PST-500', barcode: '5901234123473', qty: 3, picked: 3, location: 'E-04', price: 1.49, status: 'picked', category: 'grains' },
      { id: 6, name: 'Tinned Tomatoes 400g', sku: 'TNT-400', barcode: '5901234123474', qty: 2, picked: 0, location: 'F-08', price: 0.89, status: 'pending', category: 'canned' },
      { id: 7, name: 'Frozen Peas 750g', sku: 'PEA-750', barcode: '5901234123475', qty: 1, picked: 1, location: 'Z-03', price: 1.79, status: 'substituted', category: 'frozen', sub: 'Frozen Garden Peas 800g' },
      { id: 8, name: 'Hummus Classic 200g', sku: 'HUM-200', barcode: '5901234123476', qty: 1, picked: 0, location: 'B-06', price: 2.49, status: 'pending', category: 'deli' },
    ]
  },
  {
    id: 'GRO-2845',
    customer: 'Priya Patel',
    itemCount: 6,
    pickedCount: 6,
    createdAt: new Date(Date.now() - 45 * 60000),
    status: 'packed',
    priority: 'normal',
    items: []
  },
  {
    id: 'GRO-2844',
    customer: 'Oliver Webb',
    itemCount: 10,
    pickedCount: 0,
    createdAt: new Date(Date.now() - 3 * 60000),
    status: 'pending',
    priority: 'urgent',
    items: [
      { id: 1, name: 'Whole Milk 4 Pints', sku: 'MLK-004', barcode: '5901234123477', qty: 1, picked: 0, location: 'A-04', price: 2.49, status: 'pending', category: 'dairy' },
      { id: 2, name: 'Crisps Variety 6pk', sku: 'CRS-006', barcode: '5901234123478', qty: 2, picked: 0, location: 'G-04', price: 3.99, status: 'pending', category: 'snacks' },
      { id: 3, name: 'Sparkling Water 6pk', sku: 'WTR-600', barcode: '5901234123479', qty: 1, picked: 0, location: 'H-06', price: 4.49, status: 'pending', category: 'beverages' },
      { id: 4, name: 'Baguette Fresh', sku: 'BRD-010', barcode: '5901234123480', qty: 3, picked: 0, location: 'B-02', price: 0.99, status: 'pending', category: 'bakery' },
      { id: 5, name: 'Smoked Salmon 150g', sku: 'SLM-150', barcode: '5901234123481', qty: 2, picked: 0, location: 'D-08', price: 5.99, status: 'pending', category: 'fish' },
      { id: 6, name: 'Cream Cheese 200g', sku: 'CRM-200', barcode: '5901234123482', qty: 1, picked: 0, location: 'A-10', price: 2.29, status: 'pending', category: 'dairy' },
      { id: 7, name: 'Lemon 4pk', sku: 'LMN-004', barcode: '5901234123483', qty: 1, picked: 0, location: 'C-02', price: 1.29, status: 'pending', category: 'produce' },
      { id: 8, name: 'Coffee Beans 250g', sku: 'CFE-250', barcode: '5901234123484', qty: 1, picked: 0, location: 'I-01', price: 8.99, status: 'pending', category: 'beverages' },
      { id: 9, name: 'Chocolate Dark 85% 100g', sku: 'CHC-100', barcode: '5901234123485', qty: 4, picked: 0, location: 'G-10', price: 2.79, status: 'pending', category: 'confectionery' },
      { id: 10, name: 'Red Wine 75cl', sku: 'WNE-075', barcode: '5901234123486', qty: 1, picked: 0, location: 'J-05', price: 9.99, status: 'pending', category: 'alcohol' },
    ]
  },
  {
    id: 'GRO-2843',
    customer: 'Emma Clarke',
    itemCount: 15,
    pickedCount: 15,
    createdAt: new Date(Date.now() - 90 * 60000),
    status: 'packed',
    priority: 'normal',
    items: []
  },
]

export const mockInventory = [
  { id: 1, name: 'Organic Whole Milk 2L', sku: 'MLK-001', barcode: '5901234123457', price: 3.49, stock: 48, location: 'A-04', category: 'Dairy', lowStock: false, expiring: false },
  { id: 2, name: 'Free Range Eggs 12pk', sku: 'EGG-012', barcode: '5901234123458', price: 4.99, stock: 6, location: 'A-06', category: 'Dairy', lowStock: true, expiring: false },
  { id: 3, name: 'Sourdough Bread 800g', sku: 'BRD-003', barcode: '5901234123459', price: 2.79, stock: 12, location: 'B-01', category: 'Bakery', lowStock: false, expiring: true },
  { id: 4, name: 'Braeburn Apples 6pk', sku: 'APL-006', barcode: '5901234123460', price: 3.99, stock: 24, location: 'C-12', category: 'Produce', lowStock: false, expiring: false },
  { id: 5, name: 'Baby Spinach 200g', sku: 'SPN-200', barcode: '5901234123461', price: 1.99, stock: 3, location: 'C-08', category: 'Produce', lowStock: true, expiring: true },
  { id: 6, name: 'Cheddar Cheese 400g', sku: 'CHS-400', barcode: '5901234123462', price: 5.49, stock: 18, location: 'A-09', category: 'Dairy', lowStock: false, expiring: false },
  { id: 7, name: 'Greek Yogurt 500g', sku: 'YGT-500', barcode: '5901234123463', price: 2.49, stock: 30, location: 'A-11', category: 'Dairy', lowStock: false, expiring: false },
  { id: 8, name: 'Chicken Breast 500g', sku: 'CHK-500', barcode: '5901234123464', price: 6.99, stock: 8, location: 'D-02', category: 'Meat', lowStock: true, expiring: false },
  { id: 9, name: 'Brown Rice 1kg', sku: 'RIC-001', barcode: '5901234123465', price: 2.19, stock: 42, location: 'E-07', category: 'Grains', lowStock: false, expiring: false },
  { id: 10, name: 'Olive Oil Extra Virgin 500ml', sku: 'OIL-500', barcode: '5901234123466', price: 7.99, stock: 15, location: 'F-03', category: 'Condiments', lowStock: false, expiring: false },
  { id: 11, name: 'Cherry Tomatoes 400g', sku: 'TOM-400', barcode: '5901234123467', price: 2.29, stock: 4, location: 'C-05', category: 'Produce', lowStock: true, expiring: true },
  { id: 12, name: 'Butter Salted 250g', sku: 'BTR-250', barcode: '5901234123468', price: 2.99, stock: 22, location: 'A-03', category: 'Dairy', lowStock: false, expiring: false },
  { id: 13, name: 'Almond Milk 1L', sku: 'AMK-001', barcode: '5901234123469', price: 2.99, stock: 19, location: 'A-14', category: 'Dairy Alt', lowStock: false, expiring: false },
  { id: 14, name: 'Oat Biscuits 300g', sku: 'BSC-300', barcode: '5901234123471', price: 1.89, stock: 2, location: 'G-02', category: 'Snacks', lowStock: true, expiring: false },
  { id: 15, name: 'Coffee Beans 250g', sku: 'CFE-250', barcode: '5901234123484', price: 8.99, stock: 11, location: 'I-01', category: 'Beverages', lowStock: false, expiring: false },
]

export const mockSuppliers = [
  { id: 1, name: 'FreshDirect Farms', contact: 'john@freshdirect.com', phone: '+44 7700 900123', category: 'Produce & Dairy' },
  { id: 2, name: 'Metro Wholesale', contact: 'orders@metro.co.uk', phone: '+44 7700 900456', category: 'General Grocery' },
  { id: 3, name: 'BreadCo Bakeries', contact: 'supply@breadco.com', phone: '+44 7700 900789', category: 'Bakery' },
  { id: 4, name: 'ColdChain Meats', contact: 'sales@coldchain.co.uk', phone: '+44 7700 900321', category: 'Meat & Fish' },
]

export const mockPurchaseOrders = [
  { id: 'PO-0041', supplier: 'FreshDirect Farms', items: 8, total: 342.50, status: 'pending', date: new Date(Date.now() - 2 * 86400000) },
  { id: 'PO-0040', supplier: 'Metro Wholesale', items: 14, total: 1240.00, status: 'delivered', date: new Date(Date.now() - 5 * 86400000) },
  { id: 'PO-0039', supplier: 'BreadCo Bakeries', items: 4, total: 180.00, status: 'in-transit', date: new Date(Date.now() - 1 * 86400000) },
  { id: 'PO-0038', supplier: 'ColdChain Meats', items: 6, total: 560.00, status: 'delivered', date: new Date(Date.now() - 7 * 86400000) },
]

export const mockPickerStats = [
  { name: 'Alex R.', orders: 24, accuracy: 98.5, avgTime: '8.2m' },
  { name: 'Jamie T.', orders: 21, accuracy: 97.1, avgTime: '9.1m' },
  { name: 'Sam K.', orders: 19, accuracy: 99.2, avgTime: '7.8m' },
  { name: 'Chris M.', orders: 18, accuracy: 96.4, avgTime: '10.3m' },
  { name: 'Priya L.', orders: 22, accuracy: 98.9, avgTime: '8.5m' },
]

export const mockDailyOrders = [42, 58, 51, 67, 73, 62, 78]
export const mockFulfillmentTime = [9.2, 8.8, 10.1, 7.9, 8.5, 9.0, 8.2]
export const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
