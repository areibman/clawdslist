-- Migration: Simplify OrderStatus enum
-- Old values: PENDING, PAYMENT_PENDING, PAID, FULFILLED, CANCELLED, REFUNDED, DISPUTED
-- New values: AWAITING_PAYMENT, PENDING, COMPLETED, CANCELLED, REFUNDED

-- Step 1: Drop the new enum type if it exists from a previous failed attempt
DROP TYPE IF EXISTS "OrderStatus_new";

-- Step 2: Create the new enum type
CREATE TYPE "OrderStatus_new" AS ENUM ('AWAITING_PAYMENT', 'PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- Step 3: Drop the default first (required before type change)
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

-- Step 4: Update the column to use the new enum with data migration
ALTER TABLE "Order" 
  ALTER COLUMN "status" TYPE "OrderStatus_new" 
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'AWAITING_PAYMENT'::text
      WHEN 'PAYMENT_PENDING' THEN 'AWAITING_PAYMENT'::text
      WHEN 'PAID' THEN 'PENDING'::text
      WHEN 'FULFILLED' THEN 'COMPLETED'::text
      WHEN 'CANCELLED' THEN 'CANCELLED'::text
      WHEN 'REFUNDED' THEN 'REFUNDED'::text
      WHEN 'DISPUTED' THEN 'PENDING'::text  -- Map disputed to pending for manual review
      ELSE 'AWAITING_PAYMENT'::text
    END
  )::"OrderStatus_new";

-- Step 5: Set the new default value
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'AWAITING_PAYMENT'::"OrderStatus_new";

-- Step 6: Drop the old enum type and rename the new one
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
