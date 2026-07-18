create table user_subcategory_history (
    user_id bigint references users(user_id),
    subcategory_id bigint references subcategories(subcategory_id),
    clicks int default 0,
    view_time bigint default 0,
    add_to_cart_count int default 0,
    purchase_count int default 0,
    score float default 0.0,
    last_interaction_at timestamptz not null default now(),
    primary key (user_id, subcategory_id)
);
