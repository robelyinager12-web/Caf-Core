-- Reference-only SQL mirror of prisma/seed.ts for teams that prefer raw SQL seeding
-- or need to seed a database without running the Node seed script.
-- Run migrations first (prisma migrate deploy) before executing this file.

INSERT INTO categories (id, name, display_order, created_at)
VALUES
  (gen_random_uuid(), 'Breakfast', 0, now()),
  (gen_random_uuid(), 'Lunch', 1, now()),
  (gen_random_uuid(), 'Beverages', 2, now()),
  (gen_random_uuid(), 'Snacks', 3, now()),
  (gen_random_uuid(), 'Desserts', 4, now())
ON CONFLICT (name) DO NOTHING;