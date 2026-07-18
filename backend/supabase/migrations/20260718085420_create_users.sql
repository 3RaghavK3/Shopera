create table users(
    user_id bigserial primary key,
    email varchar(255) unique ,
    password_hash text,
    auth_provider varchar(50),
    provider_user_id varchar(255) unique,
    name varchar(255),
    created_at timestamp
)