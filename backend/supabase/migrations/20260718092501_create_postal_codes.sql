create table postal_codes (
    postal_code varchar(20) primary key,
    city_id bigint references cities(city_id),
    state_id bigint references states(state_id)
);
