create table attribute_definitions (
    attribute_id bigserial primary key,
    subcategory_id bigint references subcategories(subcategory_id),
    attribute_name varchar(255) not null,
    datatype varchar(50) not null
);
