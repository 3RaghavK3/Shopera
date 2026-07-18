create table payments (
    payment_id varchar(255) primary key,
    user_id bigint references users(user_id),
    order_id varchar(255),
    amount bigint not null,
    paid_at timestamptz not null default now(),
    status varchar(50) not null
);
