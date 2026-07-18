create table cities (
    city_id bigserial primary key,
    city_name varchar(255) not null,
    state_id bigint references states(state_id)
);