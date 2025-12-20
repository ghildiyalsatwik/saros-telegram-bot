-- CreateTable
CREATE TABLE "CreatedPool" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "pairAddress" TEXT NOT NULL,
    "tokenX" TEXT NOT NULL,
    "tokenY" TEXT NOT NULL,
    "activeBin" INTEGER NOT NULL,
    "binStep" INTEGER NOT NULL,
    "binArrayLower" TEXT NOT NULL,
    "binArrayUpper" TEXT NOT NULL,
    "hooksConfig" TEXT NOT NULL,
    "ratePrice" INTEGER,

    CONSTRAINT "CreatedPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatedPool_pairAddress_key" ON "CreatedPool"("pairAddress");

-- AddForeignKey
ALTER TABLE "CreatedPool" ADD CONSTRAINT "CreatedPool_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
