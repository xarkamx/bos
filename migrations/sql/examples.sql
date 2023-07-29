-- group per month

SELECT
    products.id,
    sum(items.price),
    sum(quantity),
    name,
    items.created_at
FROM `items`
    left join products on product_id = products.id
where products.id = 1
GROUP BY
    MONTH(items.created_at),
    YEAR(items.created_at);

-- avg per month

with p as (
        SELECT id, name
        from products
    ), i as (
        SELECT
            price,
            sum(quantity) as qty,
            product_id,
            created_at
        from items
        group by
            product_id,
            MONTH(items.created_at),
            YEAR(items.created_at)
    )
SELECT
    p.id,
    p.name,
    i.price,
    i.qty / 4 as monthly,
    i.created_at
from p
    join i on p.id = i.product_id
GROUP by p.id;

with inv as (
        SELECT
            sum(quantity) as qty,
            external_id as product_id
        FROM `inventory`
        where type = 'product'
        group by
            external_id
    ),
    sold as (
        SELECT
            product_id,
            sum(quantity) as qty,
            sum(price) as amount
        FROM items
        group by product_id
    )
SELECT
    id,
    name,
    price as unitPrice,
    inv.qty as inStock,
    sold.qty as soldUnits,
    sold.amount as soldAmount
from products
    left join inv on inv.product_id = products.id
    left join sold on sold.product_id = products.id;