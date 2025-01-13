/*
  Warnings:

  - You are about to drop the column `menuId` on the `Dish` table. All the data in the column will be lost.
  - You are about to drop the `Menu` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `restaurantId` to the `Dish` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dish" DROP CONSTRAINT "Dish_menuId_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_restaurantId_fkey";

-- DropIndex
DROP INDEX "Dish_menuId_name_key";

-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "menuId",
ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Menu";

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" INTEGER,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_restaurantId_key" ON "Address"("restaurantId");

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
