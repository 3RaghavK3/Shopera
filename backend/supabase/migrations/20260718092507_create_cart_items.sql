create table cart_items (
    user_id bigint references users(user_id),
    product_id bigint references products(product_id),
    quantity int not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, product_id)
);
