-- สร้างฟังก์ชันสำหรับดึงข้อมูลรายได้ตาม business unit
CREATE OR REPLACE FUNCTION get_revenue_by_business_unit()
RETURNS TABLE(business_unit text, total_revenue numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.business_unit,
    SUM(CAST(REGEXP_REPLACE(o.total, '[^0-9.]', '', 'g') AS numeric)) as total_revenue
  FROM orders o
  WHERE o.business_unit IS NOT NULL
  GROUP BY o.business_unit
  ORDER BY total_revenue DESC;
END;
$$;

-- สร้างฟังก์ชันสำหรับนับจำนวน order ตาม channel
CREATE OR REPLACE FUNCTION get_order_count_by_channel()
RETURNS TABLE(channel text, order_count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.channel,
    COUNT(*) as order_count
  FROM orders o
  WHERE o.channel IS NOT NULL
  GROUP BY o.channel
  ORDER BY order_count DESC;
END;
$$;

-- สร้างฟังก์ชันสำหรับนับจำนวน order ตาม status
CREATE OR REPLACE FUNCTION get_order_count_by_status()
RETURNS TABLE(status text, order_count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.status,
    COUNT(*) as order_count
  FROM orders o
  WHERE o.status IS NOT NULL
  GROUP BY o.status
  ORDER BY order_count DESC;
END;
$$;

-- สร้างฟังก์ชันสำหรับคำนวณ fulfillment rate ตาม branch
CREATE OR REPLACE FUNCTION get_fulfillment_rate_by_branch()
RETURNS TABLE(branch text, fulfillment_rate numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.store_name as branch,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN o.status IN ('DELIVERED', 'FULFILLED') THEN 1 END)::numeric / COUNT(*)::numeric) * 100
      ELSE 0
    END as fulfillment_rate
  FROM orders o
  WHERE o.store_name IS NOT NULL AND o.store_name != ''
  GROUP BY o.store_name
  ORDER BY fulfillment_rate DESC
  LIMIT 4;
END;
$$;

-- สร้างฟังก์ชันสำหรับคำนวณ fulfillment rate ตาม channel
CREATE OR REPLACE FUNCTION get_fulfillment_rate_by_channel()
RETURNS TABLE(channel text, fulfillment_rate numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.channel,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN o.status IN ('DELIVERED', 'FULFILLED') THEN 1 END)::numeric / COUNT(*)::numeric) * 100
      ELSE 0
    END as fulfillment_rate
  FROM orders o
  WHERE o.channel IS NOT NULL
  GROUP BY o.channel
  ORDER BY fulfillment_rate DESC
  LIMIT 4;
END;
$$;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION get_revenue_by_business_unit() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_order_count_by_channel() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_order_count_by_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fulfillment_rate_by_branch() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fulfillment_rate_by_channel() TO anon, authenticated;
