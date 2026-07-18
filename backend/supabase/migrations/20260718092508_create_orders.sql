create table orders (
    order_id bigserial primary key,
    user_id bigint references users(user_id),
    razorpay_order_id varchar(255) unique,
    delivery_full_name varchar(255) not null,
    delivery_phone varchar(20) not null,
    delivery_address1 text not null,
    delivery_address2 text,
    delivery_city varchar(255) not null,
    delivery_state varchar(255) not null,
    delivery_postal_code varchar(20) not null,
    created_at timestamptz not null default now()
);
