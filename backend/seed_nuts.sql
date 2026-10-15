SET @cat_nuts = 'c0c2eae4-181c-499b-ac87-1b30696785f5';

-- Check if they already exist, delete old ones if necessary to avoid duplicates (optional, we can just insert)
-- Actually let's just delete by slug first to be safe
DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE slug IN ('dry-coconut', 'fox-nuts-makhana', 'jumbo-cashews', 'mamra-almonds', 'pistachios', 'raisins', 'snow-walnuts'));
DELETE FROM products WHERE slug IN ('dry-coconut', 'fox-nuts-makhana', 'jumbo-cashews', 'mamra-almonds', 'pistachios', 'raisins', 'snow-walnuts');

INSERT INTO products (id, category_id, name, slug, origin, description, is_active) VALUES
(UUID(), @cat_nuts, 'Dry Coconut', 'dry-coconut', 'Kerala', 'Fragrant, premium dry coconut from the coast.', 1),
(UUID(), @cat_nuts, 'Fox Nuts (Makhana)', 'fox-nuts-makhana', 'Bihar', 'Airy, light, and perfectly toasted.', 1),
(UUID(), @cat_nuts, 'Jumbo Cashews', 'jumbo-cashews', 'Goa', 'Buttery, sun-warmed harvests from the West coast.', 1),
(UUID(), @cat_nuts, 'Mamra Almonds', 'mamra-almonds', 'Kashmir', 'Crisp, premium almonds from cool valleys.', 1),
(UUID(), @cat_nuts, 'Pistachios', 'pistachios', 'Bihar', 'Sweet and lightly salted premium pistachios.', 1),
(UUID(), @cat_nuts, 'Premium Raisins', 'raisins', 'Maharashtra', 'Honeyed, sun-dried raisins.', 1),
(UUID(), @cat_nuts, 'Snow Walnuts', 'snow-walnuts', 'Kashmir', 'Rich, earthy walnuts from the high mountains.', 1);

INSERT INTO product_variants (id, product_id, sku, weight_label, price, stock)
SELECT UUID(), id, CONCAT(slug, '-250g'), '250g', 
  CASE slug
    WHEN 'dry-coconut' THEN 400
    WHEN 'fox-nuts-makhana' THEN 340
    WHEN 'jumbo-cashews' THEN 326
    WHEN 'mamra-almonds' THEN 399
    WHEN 'pistachios' THEN 572
    WHEN 'raisins' THEN 450
    WHEN 'snow-walnuts' THEN 1100
  END, 100
FROM products WHERE slug IN ('dry-coconut', 'fox-nuts-makhana', 'jumbo-cashews', 'mamra-almonds', 'pistachios', 'raisins', 'snow-walnuts');
