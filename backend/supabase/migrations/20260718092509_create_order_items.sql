create table order_items (
    order_id bigint references orders(order_id),
    product_id bigint references products(product_id),
    quantity int not null,
    price_at_purchase bigint not null,
    address varchar,
    phoneno bigint,
    primary key (order_id, product_id)
);
