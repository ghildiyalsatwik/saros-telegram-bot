/*
  Warnings:

  - A unique constraint covering the columns `[telegramId,name]` on the table `MintedToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MintedToken_telegramId_name_key" ON "MintedToken"("telegramId", "name");
