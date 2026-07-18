create table product_attributes (
    product_id bigint references products(product_id),
    attribute_id bigint references attribute_definitions(attribute_id),
    attribute_value varchar(255) not null,
    primary key (product_id, attribute_id)
);
