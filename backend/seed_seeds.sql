SET @cat_seeds = '114011c5-3582-4a7f-9f8c-0308ada97dfb';

-- Delete all products in Seeds category (to prevent duplicates)
DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE category_id = @cat_seeds);
DELETE FROM products WHERE category_id = @cat_seeds;

INSERT INTO products (id, category_id, name, slug, origin, description, is_active) VALUES
(UUID(), @cat_seeds, 'Andhra Pradesh Cumin Seeds', 'andhra-pradesh-cumin-seeds', 'Andhra Pradesh', 'Earthy, robust cumin seeds.', 1),
(UUID(), @cat_seeds, 'Bihar Melon Seeds', 'bihar-melon-seeds', 'Bihar', 'Creamy, delicate melon seeds.', 1),
(UUID(), @cat_seeds, 'Gujarat Flax Seeds', 'gujarat-flax-seeds', 'Gujarat', 'Toasty, nutrient-dense flax seeds.', 1),
(UUID(), @cat_seeds, 'Himachal Hemp Hearts', 'himachal-hemp-hearts', 'Himachal Pradesh', 'Soft, nutty hemp hearts from the mountains.', 1),
(UUID(), @cat_seeds, 'Himalayan Chia Seeds', 'himalayan-chia-seeds', 'Uttarakhand', 'Mineral-rich, tiny chia seeds.', 1),
(UUID(), @cat_seeds, 'Karnataka Hemp Seeds', 'karnataka-hemp-seeds', 'Karnataka', 'Earthy, crunchy whole hemp seeds.', 1),
(UUID(), @cat_seeds, 'Kerala Basil Seeds', 'kerala-basil-seeds', 'Kerala', 'Cooling, mucilaginous basil seeds (sabja).', 1),
(UUID(), @cat_seeds, 'Madhya Pradesh Sunflower Seeds', 'madhya-pradesh-sunflower-seeds', 'Madhya Pradesh', 'Crisp, mild sunflower seeds.', 1),
(UUID(), @cat_seeds, 'Maharashtra Watermelon Seeds', 'maharashtra-watermelon-seeds', 'Maharashtra', 'Delicate, sweet watermelon seeds.', 1),
(UUID(), @cat_seeds, 'Rajasthan Pumpkin Seeds', 'rajasthan-pumpkin-seeds', 'Rajasthan', 'Buttery, rich pumpkin seeds.', 1),
(UUID(), @cat_seeds, 'Tamil Nadu Sesame Seeds', 'tamil-nadu-sesame-seeds', 'Tamil Nadu', 'Nutty, oil-rich sesame seeds.', 1),
(UUID(), @cat_seeds, 'Uttar Pradesh Fennel Seeds', 'uttar-pradesh-fennel-seeds', 'Uttar Pradesh', 'Sweet, aromatic fennel seeds.', 1);

INSERT INTO product_variants (id, product_id, sku, weight_label, price, stock)
SELECT UUID(), id, CONCAT(slug, '-250g'), '250g', 
  CASE slug
    WHEN 'andhra-pradesh-cumin-seeds' THEN 200
    WHEN 'bihar-melon-seeds' THEN 250
    WHEN 'gujarat-flax-seeds' THEN 150
    WHEN 'himachal-hemp-hearts' THEN 450
    WHEN 'himalayan-chia-seeds' THEN 350
    WHEN 'karnataka-hemp-seeds' THEN 300
    WHEN 'kerala-basil-seeds' THEN 180
    WHEN 'madhya-pradesh-sunflower-seeds' THEN 220
    WHEN 'maharashtra-watermelon-seeds' THEN 260
    WHEN 'rajasthan-pumpkin-seeds' THEN 280
    WHEN 'tamil-nadu-sesame-seeds' THEN 160
    WHEN 'uttar-pradesh-fennel-seeds' THEN 190
  END, 100
FROM products WHERE category_id = @cat_seeds;
