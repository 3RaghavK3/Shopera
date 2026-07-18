create table addresses (
    address_id bigserial primary key,
    user_id bigint references users(user_id),
    full_name varchar(255) not null,
    phone_number varchar(20) not null,
    address_line1 text not null,
    address_line2 text,
    city_id bigint references cities(city_id),
    state_id bigint references states(state_id),
    postal_code varchar(20),
    is_default boolean default false
);
