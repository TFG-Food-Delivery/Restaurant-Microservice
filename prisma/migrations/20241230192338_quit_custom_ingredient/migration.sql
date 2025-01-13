/*
  Warnings:

  - You are about to drop the `CustomIngredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomIngredient" DROP CONSTRAINT "CustomIngredient_dishId_fkey";

-- DropTable
DROP TABLE "CustomIngredient";
