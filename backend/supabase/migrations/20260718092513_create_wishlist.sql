create table wishlist (
    user_id bigint references users(user_id),
    product_id bigint references products(product_id),
    created_at timestamptz not null default now(),
    primary key (user_id, product_id)
);
