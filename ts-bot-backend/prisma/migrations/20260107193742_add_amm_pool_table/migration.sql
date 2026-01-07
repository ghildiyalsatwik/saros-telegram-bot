-- CreateTable
CREATE TABLE "CreatedAMMPool" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "pairAddress" TEXT NOT NULL,
    "lpTokenMint" TEXT NOT NULL,
    "tokenX" TEXT NOT NULL,
    "tokenXDecimals" INTEGER NOT NULL,
    "tokenY" TEXT NOT NULL,
    "tokenYDecimals" INTEGER NOT NULL,
    "feeAccount" TEXT NOT NULL,

    CONSTRAINT "CreatedAMMPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatedAMMPool_pairAddress_key" ON "CreatedAMMPool"("pairAddress");

-- AddForeignKey
ALTER TABLE "CreatedAMMPool" ADD CONSTRAINT "CreatedAMMPool_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
