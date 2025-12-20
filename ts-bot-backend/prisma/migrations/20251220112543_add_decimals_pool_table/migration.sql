/*
  Warnings:

  - Added the required column `tokenXDecimals` to the `CreatedPool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenYDecimals` to the `CreatedPool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreatedPool" ADD COLUMN     "tokenXDecimals" INTEGER NOT NULL,
ADD COLUMN     "tokenYDecimals" INTEGER NOT NULL;
