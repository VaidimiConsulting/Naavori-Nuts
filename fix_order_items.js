const fs = require('fs');
let content = fs.readFileSync('D:/NAAVORI-NUTS-complete-source/backend/src/repositories/orderRepository.js', 'utf8');
content = content.replace(
  'id, order_id, product_variant_id, product_name, weight_label, price, quantity, total',
  'id, order_id, variant_id, product_name, weight_label, price_per_unit, quantity, total_price'
);
fs.writeFileSync('D:/NAAVORI-NUTS-complete-source/backend/src/repositories/orderRepository.js', content, 'utf8');
