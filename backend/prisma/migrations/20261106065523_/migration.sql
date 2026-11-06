/*
  Warnings:

  - You are about to drop the column `guest_name` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `guest_phone` on the `orders` table. All the data in the column will be lost.
  - Made the column `created_by` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "guest_name",
DROP COLUMN "guest_phone",
ALTER COLUMN "created_by" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
