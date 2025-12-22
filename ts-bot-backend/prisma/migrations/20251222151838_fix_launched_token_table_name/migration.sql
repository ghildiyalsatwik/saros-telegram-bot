/*
  Warnings:

  - You are about to drop the `MintedToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MintedToken" DROP CONSTRAINT "MintedToken_telegramId_fkey";

-- DropTable
DROP TABLE "MintedToken";

-- CreateTable
CREATE TABLE "LaunchedToken" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "tokenProgram" TEXT NOT NULL,

    CONSTRAINT "LaunchedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaunchedToken_mintAddress_key" ON "LaunchedToken"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchedToken_telegramId_name_key" ON "LaunchedToken"("telegramId", "name");

-- AddForeignKey
ALTER TABLE "LaunchedToken" ADD CONSTRAINT "LaunchedToken_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
