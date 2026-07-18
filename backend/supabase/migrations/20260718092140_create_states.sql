create table states (
    state_id bigserial primary key,
    state_name varchar(255) not null,
    country_id bigint
);