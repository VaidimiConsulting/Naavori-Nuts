SET @cat_spices = '4f6994cd-5725-4584-8bc8-130ff8333a99';

DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE slug IN ('byadgi-chilli', 'ceylon-cinnamon', 'golden-cumin', 'himalayan-bay-leaf', 'idukki-green-cardamom', 'kashmir-saffron', 'lakadong-turmeric', 'lucknow-fennel', 'malabar-nutmeg', 'rajasthan-coriander', 'royal-garam-masala', 'tellicherry-black-pepper', 'zanzibar-cloves'));
DELETE FROM products WHERE slug IN ('byadgi-chilli', 'ceylon-cinnamon', 'golden-cumin', 'himalayan-bay-leaf', 'idukki-green-cardamom', 'kashmir-saffron', 'lakadong-turmeric', 'lucknow-fennel', 'malabar-nutmeg', 'rajasthan-coriander', 'royal-garam-masala', 'tellicherry-black-pepper', 'zanzibar-cloves');

INSERT INTO products (id, category_id, name, slug, origin, description, is_active) VALUES
(UUID(), @cat_spices, 'Byadgi Chilli', 'byadgi-chilli', 'Karnataka', 'Deep red, mild, and wonderfully flavourful.', 1),
(UUID(), @cat_spices, 'Ceylon Cinnamon', 'ceylon-cinnamon', 'Sri Lanka', 'Light, delicate, and sweet true cinnamon.', 1),
(UUID(), @cat_spices, 'Golden Cumin', 'golden-cumin', 'Gujarat', 'Toasted, earthy, and essential.', 1),
(UUID(), @cat_spices, 'Himalayan Bay Leaf', 'himalayan-bay-leaf', 'Uttarakhand', 'Aromatic bay leaves from the foothills.', 1),
(UUID(), @cat_spices, 'Idukki Green Cardamom', 'idukki-green-cardamom', 'Kerala', 'Floral, highly aromatic green pods.', 1),
(UUID(), @cat_spices, 'Kashmir Saffron', 'kashmir-saffron', 'Kashmir', 'The world’s finest saffron, pure and potent.', 1),
(UUID(), @cat_spices, 'Lakadong Turmeric', 'lakadong-turmeric', 'Meghalaya', 'High-curcumin turmeric with deep colour.', 1),
(UUID(), @cat_spices, 'Lucknow Fennel', 'lucknow-fennel', 'Uttar Pradesh', 'Sweet, small, and highly fragrant fennel seeds.', 1),
(UUID(), @cat_spices, 'Malabar Nutmeg', 'malabar-nutmeg', 'Kerala', 'Resinous, warming, and freshly grated.', 1),
(UUID(), @cat_spices, 'Rajasthan Coriander', 'rajasthan-coriander', 'Rajasthan', 'Bright, citrusy whole coriander seeds.', 1),
(UUID(), @cat_spices, 'Royal Garam Masala', 'royal-garam-masala', 'North India', 'A layered, complex blend of warming spices.', 1),
(UUID(), @cat_spices, 'Tellicherry Black Pepper', 'tellicherry-black-pepper', 'Malabar', 'Bold, large peppercorns with a complex bite.', 1),
(UUID(), @cat_spices, 'Zanzibar Cloves', 'zanzibar-cloves', 'Zanzibar', 'Warm, pungent, and deeply fragrant cloves.', 1);

INSERT INTO product_variants (id, product_id, sku, weight_label, price, stock)
SELECT UUID(), id, CONCAT(slug, '-250g'), '250g', 
  CASE slug
    WHEN 'byadgi-chilli' THEN 350
    WHEN 'ceylon-cinnamon' THEN 650
    WHEN 'golden-cumin' THEN 102
    WHEN 'himalayan-bay-leaf' THEN 150
    WHEN 'idukki-green-cardamom' THEN 2500
    WHEN 'kashmir-saffron' THEN 4500
    WHEN 'lakadong-turmeric' THEN 300
    WHEN 'lucknow-fennel' THEN 280
    WHEN 'malabar-nutmeg' THEN 800
    WHEN 'rajasthan-coriander' THEN 180
    WHEN 'royal-garam-masala' THEN 500
    WHEN 'tellicherry-black-pepper' THEN 289
    WHEN 'zanzibar-cloves' THEN 368
  END, 100
FROM products WHERE slug IN ('byadgi-chilli', 'ceylon-cinnamon', 'golden-cumin', 'himalayan-bay-leaf', 'idukki-green-cardamom', 'kashmir-saffron', 'lakadong-turmeric', 'lucknow-fennel', 'malabar-nutmeg', 'rajasthan-coriander', 'royal-garam-masala', 'tellicherry-black-pepper', 'zanzibar-cloves');
