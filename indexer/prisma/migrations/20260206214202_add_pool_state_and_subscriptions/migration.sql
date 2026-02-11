-- CreateTable
CREATE TABLE "Subscription" (
    "id" BIGSERIAL NOT NULL,
    "telegram_user_id" BIGINT NOT NULL,
    "pool_pubkey" VARCHAR(44) NOT NULL,
    "last_active_bin" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolState" (
    "pool_pubkey" VARCHAR(44) NOT NULL,
    "active_bin" INTEGER NOT NULL,
    "last_slot" BIGINT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoolState_pkey" PRIMARY KEY ("pool_pubkey")
);

-- CreateIndex
CREATE INDEX "Subscription_pool_pubkey_idx" ON "Subscription"("pool_pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_telegram_user_id_pool_pubkey_key" ON "Subscription"("telegram_user_id", "pool_pubkey");
