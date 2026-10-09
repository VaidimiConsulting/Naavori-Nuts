const fs = require('fs');
const path = require('path');

const destDir = 'd:\\NAAVORI-NUTS-complete-source\\frontend\\public\\assets\\compositions';

const files = {
  'diwali-gift.jpg': 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\5aacabb2-4502-4b62-9bf1-9836ca21be85\\diwali_gift_1791457307294.jpg',
  'wedding-gift.jpg': 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\5aacabb2-4502-4b62-9bf1-9836ca21be85\\wedding_gift_1791457327441.jpg',
  'corporate-gift.jpg': 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\5aacabb2-4502-4b62-9bf1-9836ca21be85\\corporate_gift_1791457359067.jpg'
};

for (const [newName, srcPath] of Object.entries(files)) {
  fs.copyFileSync(srcPath, path.join(destDir, newName));
  console.log('Copied', newName);
}
