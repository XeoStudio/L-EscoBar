-- Add orderCode column to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "orderCode" TEXT;

-- Update existing orders with random codes
UPDATE "orders" SET "orderCode" = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id) FROM 1 FOR 6)) WHERE "orderCode" IS NULL;

-- Create unique index for orderCode
CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderCode_key" ON "orders"("orderCode");

-- Create regular index for faster lookups
CREATE INDEX IF NOT EXISTS "orders_orderCode_idx" ON "orders"("orderCode");
