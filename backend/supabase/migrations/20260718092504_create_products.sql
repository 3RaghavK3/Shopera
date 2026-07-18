create table products (
    product_id bigserial primary key,
    category_id bigint,
    subcategory_id bigint references subcategories(subcategory_id),
    name varchar(255) not null,
    product_url text,
    price bigint not null,
    rating decimal(2,1),
    total_ratings int default 0,
    image_url text,
    description text,
    stock int not null default 0
);
