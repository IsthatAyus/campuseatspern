INSERT INTO users (full_name, email, role)
VALUES
  ('Aarav Sharma', 'aarav@example.com', 'student'),
  ('Maya Patel', 'maya@example.com', 'student'),
  ('Admin User', 'admin@campuseats.local', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO restaurants (name, cuisine, location, is_open)
VALUES
  ('Campus Bites', 'Indian', 'Main Block', TRUE),
  ('North Plate', 'Continental', 'North Wing', TRUE),
  ('Green Bowl', 'Healthy', 'Student Center', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO menu_items (restaurant_id, name, description, price, is_available)
SELECT r.id, v.name, v.description, v.price, v.is_available
FROM restaurants r
JOIN (
  VALUES
    ('Campus Bites', 'Veg Thali', 'Rice, dal, sabzi, roti, and salad', 120.00, TRUE),
    ('Campus Bites', 'Paneer Wrap', 'Grilled paneer wrap with chutney', 90.00, TRUE),
    ('North Plate', 'Pasta Alfredo', 'Creamy white sauce pasta', 150.00, TRUE),
    ('Green Bowl', 'Protein Salad', 'Fresh greens with chickpeas and seeds', 110.00, TRUE)
) AS v(restaurant_name, name, description, price, is_available)
  ON r.name = v.restaurant_name
ON CONFLICT (restaurant_id, name) DO NOTHING;

INSERT INTO orders (user_id, restaurant_id, status, total_amount)
SELECT u.id, r.id, 'confirmed', 210.00
FROM users u
JOIN restaurants r ON r.name = 'Campus Bites'
WHERE u.email = 'aarav@example.com'
ON CONFLICT DO NOTHING;

WITH target_order AS (
  SELECT o.id AS order_id, o.restaurant_id
  FROM orders o
  JOIN users u ON u.id = o.user_id
  JOIN restaurants r ON r.id = o.restaurant_id
  WHERE u.email = 'aarav@example.com'
    AND r.name = 'Campus Bites'
), order_item_data AS (
  SELECT *
  FROM (
    VALUES
      ('Veg Thali', 1, 120.00),
      ('Paneer Wrap', 1, 90.00)
  ) AS v(menu_item_name, quantity, unit_price)
)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
SELECT target_order.order_id, m.id, order_item_data.quantity, order_item_data.unit_price
FROM target_order
JOIN order_item_data ON TRUE
JOIN menu_items m ON m.restaurant_id = target_order.restaurant_id AND m.name = order_item_data.menu_item_name
ON CONFLICT (order_id, menu_item_id) DO NOTHING;