-- Function to get revenue by business unit
CREATE OR REPLACE FUNCTION get_revenue_by_business_unit()
RETURNS TABLE (
  business_unit TEXT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.business_unit,
    SUM(
      CASE 
        WHEN o.total ~ '^฿[0-9,.]+$' THEN 
          CAST(REPLACE(REPLACE(SUBSTRING(o.total FROM 2), ',', ''), ' ', '') AS NUMERIC)
        ELSE 0
      END
    ) AS total_revenue
  FROM 
    orders o
  GROUP BY 
    o.business_unit
  ORDER BY 
    total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get order count by channel
CREATE OR REPLACE FUNCTION get_order_count_by_channel()
RETURNS TABLE (
  channel TEXT,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.channel,
    COUNT(*) AS order_count
  FROM 
    orders o
  GROUP BY 
    o.channel
  ORDER BY 
    order_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get order count by status
CREATE OR REPLACE FUNCTION get_order_count_by_status()
RETURNS TABLE (
  status TEXT,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.status,
    COUNT(*) AS order_count
  FROM 
    orders o
  GROUP BY 
    o.status
  ORDER BY 
    order_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get fulfillment rate by branch (store)
CREATE OR REPLACE FUNCTION get_fulfillment_rate_by_branch()
RETURNS TABLE (
  branch TEXT,
  fulfillment_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH branch_stats AS (
    SELECT 
      o.store_name AS branch,
      COUNT(*) AS total_orders,
      COUNT(CASE WHEN o.status IN ('DELIVERED', 'FULFILLED') THEN 1 END) AS fulfilled_orders
    FROM 
      orders o
    WHERE 
      o.store_name IS NOT NULL AND o.store_name != ''
    GROUP BY 
      o.store_name
  )
  SELECT 
    branch,
    CASE 
      WHEN total_orders > 0 THEN (fulfilled_orders::NUMERIC / total_orders) * 100
      ELSE 0
    END AS fulfillment_rate
  FROM 
    branch_stats
  ORDER BY 
    fulfillment_rate DESC
  LIMIT 4;
END;
$$ LANGUAGE plpgsql;

-- Function to get fulfillment rate by channel
CREATE OR REPLACE FUNCTION get_fulfillment_rate_by_channel()
RETURNS TABLE (
  channel TEXT,
  fulfillment_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH channel_stats AS (
    SELECT 
      o.channel,
      COUNT(*) AS total_orders,
      COUNT(CASE WHEN o.status IN ('DELIVERED', 'FULFILLED') THEN 1 END) AS fulfilled_orders
    FROM 
      orders o
    GROUP BY 
      o.channel
  )
  SELECT 
    channel,
    CASE 
      WHEN total_orders > 0 THEN (fulfilled_orders::NUMERIC / total_orders) * 100
      ELSE 0
    END AS fulfillment_rate
  FROM 
    channel_stats
  ORDER BY 
    fulfillment_rate DESC
  LIMIT 4;
END;
$$ LANGUAGE plpgsql;
