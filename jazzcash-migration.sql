-- JazzCash Payment Gateway - Database Schema Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Update orders table with payment fields
-- ============================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS jazzcash_txn_ref_no VARCHAR(255),
ADD COLUMN IF NOT EXISTS jazzcash_retrieval_ref_no VARCHAR(255),
ADD COLUMN IF NOT EXISTS jazzcash_auth_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS jazzcash_response_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS jazzcash_response_message TEXT,
ADD COLUMN IF NOT EXISTS jazzcash_full_response JSONB,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_jazzcash_txn_ref ON orders(jazzcash_txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- ============================================
-- 2. Create payment_transactions table
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL, -- 'card' or 'mwallet'
  txn_ref_no VARCHAR(255) NOT NULL UNIQUE,
  bill_reference VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PKR',
  
  -- Customer info (for MWallet)
  mobile_number VARCHAR(20),
  cnic_last_6 VARCHAR(6),
  
  -- Request data
  request_payload JSONB,
  request_hash VARCHAR(255),
  request_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Response data
  response_code VARCHAR(10),
  response_message TEXT,
  response_payload JSONB,
  response_hash VARCHAR(255),
  response_timestamp TIMESTAMP,
  
  -- JazzCash specific
  retrieval_ref_no VARCHAR(255),
  auth_code VARCHAR(255),
  settlement_date VARCHAR(50),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'initiated', -- initiated, completed, failed, pending
  ipn_received BOOLEAN DEFAULT FALSE,
  ipn_timestamp TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_txn_ref ON payment_transactions(txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payment_transactions(created_at);

-- ============================================
-- 3. Create ipn_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS ipn_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  txn_ref_no VARCHAR(255),
  ipn_payload JSONB NOT NULL,
  ipn_hash VARCHAR(255),
  hash_verified BOOLEAN,
  response_sent JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for ipn_logs
CREATE INDEX IF NOT EXISTS idx_ipn_txn_ref ON ipn_logs(txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_ipn_created_at ON ipn_logs(created_at);

-- ============================================
-- 4. Create function to update timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for payment_transactions
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Add RLS policies for payment_transactions
-- ============================================

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own payment transactions
CREATE POLICY "Users can view their own payment transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on payment_transactions"
ON payment_transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. Add RLS policies for ipn_logs
-- ============================================

ALTER TABLE ipn_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access IPN logs
CREATE POLICY "Service role can do everything on ipn_logs"
ON ipn_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. Grant permissions
-- ============================================

GRANT ALL ON payment_transactions TO authenticated;
GRANT ALL ON payment_transactions TO service_role;
GRANT ALL ON ipn_logs TO service_role;

-- ============================================
-- Migration Complete
-- ============================================

-- Verify tables were created
SELECT 
  'orders' as table_name,
  COUNT(*) FILTER (WHERE column_name = 'payment_status') as has_payment_fields
FROM information_schema.columns 
WHERE table_name = 'orders'
UNION ALL
SELECT 
  'payment_transactions' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'payment_transactions'
UNION ALL
SELECT 
  'ipn_logs' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'ipn_logs';
