-- CreateTable
CREATE TABLE "MintedToken" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" TEXT NOT NULL,
    "tokenProgram" TEXT NOT NULL,

    CONSTRAINT "MintedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MintedToken_mintAddress_key" ON "MintedToken"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "MintedToken_telegramId_name_key" ON "MintedToken"("telegramId", "name");

-- AddForeignKey
ALTER TABLE "MintedToken" ADD CONSTRAINT "MintedToken_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
