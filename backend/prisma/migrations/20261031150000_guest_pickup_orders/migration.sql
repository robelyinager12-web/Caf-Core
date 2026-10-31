ALTER TABLE "orders"
  ALTER COLUMN "created_by" DROP NOT NULL;

ALTER TABLE "orders"
  ADD COLUMN "guest_name" VARCHAR(150),
  ADD COLUMN "guest_phone" VARCHAR(30);

ALTER TABLE "orders"
  DROP CONSTRAINT "orders_created_by_fkey",
  ADD CONSTRAINT "orders_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
