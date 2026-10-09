const fs = require('fs');
let content = fs.readFileSync('D:/NAAVORI-NUTS-complete-source/backend/src/controllers/orderController.js', 'utf8');
content = content.replace('if (!orderData.shipping_name', 'console.log(\"RECEIVED ORDER DATA:\", orderData);\n    if (!orderData.shipping_name');
fs.writeFileSync('D:/NAAVORI-NUTS-complete-source/backend/src/controllers/orderController.js', content, 'utf8');
