-- CreateTable
CREATE TABLE "CreatedPosition" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "pairAddress" TEXT NOT NULL,
    "positionMint" TEXT NOT NULL,
    "lowerBin" INTEGER NOT NULL,
    "upperBin" INTEGER NOT NULL,

    CONSTRAINT "CreatedPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatedPosition_positionMint_key" ON "CreatedPosition"("positionMint");

-- CreateIndex
CREATE INDEX "CreatedPosition_telegramId_idx" ON "CreatedPosition"("telegramId");

-- CreateIndex
CREATE INDEX "CreatedPosition_pairAddress_idx" ON "CreatedPosition"("pairAddress");

-- AddForeignKey
ALTER TABLE "CreatedPosition" ADD CONSTRAINT "CreatedPosition_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatedPosition" ADD CONSTRAINT "CreatedPosition_pairAddress_fkey" FOREIGN KEY ("pairAddress") REFERENCES "CreatedPool"("pairAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
