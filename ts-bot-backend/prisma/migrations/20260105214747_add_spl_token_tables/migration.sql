-- CreateTable
CREATE TABLE "LaunchedSPLToken" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "tokenProgram" TEXT NOT NULL,

    CONSTRAINT "LaunchedSPLToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintedSPLToken" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "tokenProgram" TEXT NOT NULL,

    CONSTRAINT "MintedSPLToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaunchedSPLToken_mintAddress_key" ON "LaunchedSPLToken"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchedSPLToken_telegramId_name_key" ON "LaunchedSPLToken"("telegramId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "MintedSPLToken_mintAddress_key" ON "MintedSPLToken"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "MintedSPLToken_telegramId_name_key" ON "MintedSPLToken"("telegramId", "name");

-- AddForeignKey
ALTER TABLE "LaunchedSPLToken" ADD CONSTRAINT "LaunchedSPLToken_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintedSPLToken" ADD CONSTRAINT "MintedSPLToken_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
