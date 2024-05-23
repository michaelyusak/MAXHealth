-- CREATE DATABASE max_health;

\c max_health 

DROP TABLE IF EXISTS 
roles,
accounts,
verification_codes,
reset_password_tokens,
refresh_tokens,
doctor_specializations,
doctors,
genders,
users,
pharmacy_managers,
provinces,
cities,
districts,
subdistricts,
chat_rooms,
chats,
user_addresses,
cart_items,
pharmacy_drugs,
pharmacy_operationals,
pharmacies,
pharmacy_couriers,
couriers,
drugs,
drug_classifications,
drug_categories,
drug_forms,
order_items,
orders,
order_pharmacies,
order_status,
stock_changes,
stock_mutation_requests,
prescriptions,
prescription_drugs,
stock_request_status;

CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

CREATE TABLE roles(
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE genders(
    gender_id BIGSERIAL PRIMARY KEY,
    gender_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE accounts(
    account_id BIGSERIAL PRIMARY KEY,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    role_id BIGINT NOT NULL,
    account_name VARCHAR NOT NULL,
    profile_picture TEXT DEFAULT 'https://res.cloudinary.com/dpdu3tidt/image/upload/v1713774687/profile_pictures/xdv5xzkz1yr0qwgkc6yk.avif' NOT NULL,
    verified_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE verification_codes(
    verification_code_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    code VARCHAR NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE reset_password_tokens(
    reset_password_token_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    reset_token VARCHAR NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE refresh_tokens(
    refresh_token_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    refresh_token VARCHAR NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE doctor_specializations(
    specialization_id BIGSERIAL PRIMARY KEY,
    specialization_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE doctors(
    doctor_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    certificate TEXT NOT NULL,
    fee_per_patient DECIMAL NOT NULL DEFAULT 0,
    is_online BOOLEAN NOT NULL,
    experience INT NOT NULL DEFAULT 0,
    specialization_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE users(
    user_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    gender_id BIGINT,
    date_of_birth DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE pharmacy_managers(
    pharmacy_manager_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE provinces(
    province_id BIGSERIAL PRIMARY KEY,
    province_code VARCHAR NOT NULL,
    province_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE cities(
    city_id BIGSERIAL PRIMARY KEY,
    city_code VARCHAR NOT NULL,
    province_code VARCHAR NOT NULL,
    city_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

ALTER TABLE cities ADD COLUMN raja_ongkir_id BIGINT;

CREATE TABLE districts(
    district_id BIGSERIAL PRIMARY KEY,
    district_code VARCHAR NOT NULL,
    city_code VARCHAR NOT NULL,
    district_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE subdistricts(
    subdistrict_id BIGSERIAL PRIMARY KEY,
    subdistrict_code VARCHAR NOT NULL,
    district_code VARCHAR NOT NULL,
    subdistrict_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE user_addresses(
    user_address_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    province_id BIGINT NOT NULL,
    city_id BIGINT NOT NULL,
    district_id BIGINT NOT NULL,
    subdistrict_id BIGINT NOT NULL,
    latitude VARCHAR NOT NULL,
    longitude VARCHAR NOT NULL,
    label VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_main BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

ALTER TABLE user_addresses ADD COLUMN geom geometry(Point, 4326);

CREATE TABLE cart_items(
    cart_item_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pharmacy_drug_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE pharmacy_drugs(
    pharmacy_drug_id BIGSERIAL PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    price DECIMAL NOT NULL,
    stock INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE pharmacy_operationals(
    pharmacy_operational_id BIGSERIAL PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    operational_day VARCHAR NOT NULL DEFAULT '',
    open_hour VARCHAR NOT NULL DEFAULT '',
    close_hour VARCHAR NOT NULL DEFAULT '',
    is_open BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE pharmacies(
    pharmacy_id BIGSERIAL PRIMARY KEY,
    pharmacy_manager_id BIGINT NOT NULL,
    pharmacy_name VARCHAR NOT NULL,
    pharmacist_name VARCHAR NOT NULL,
    pharmacist_license_number VARCHAR NOT NULL,
    pharmacist_phone_number VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    longitude VARCHAR NOT NULL,
    latitude VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

ALTER TABLE pharmacies ADD COLUMN geom geometry(Point, 4326);

CREATE TABLE pharmacy_couriers(
    pharmacy_courier_id BIGSERIAL PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    courier_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE couriers(
    courier_id BIGSERIAL PRIMARY KEY,
    courier_name VARCHAR NOT NULL,
    price DECIMAL NOT NULL,
    is_official BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE drug_categories(
    drug_category_id BIGSERIAL PRIMARY KEY,
    drug_category_url VARCHAR NOT NULL DEFAULT '',
    drug_category_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE drugs(
    drug_id BIGSERIAL PRIMARY KEY,
    drug_name VARCHAR NOT NULL,
    generic_name VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    manufacture VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    classification_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    unit_in_pack VARCHAR NOT NULL,
    selling_unit VARCHAR NOT NULL,
    weight DECIMAL NOT NULL,
    height DECIMAL NOT NULL,
    length DECIMAL NOT NULL,
    width DECIMAL NOT NULL,
    image TEXT NOT NULL,
    drug_category_id BIGINT NOT NULL,
    is_prescription_required BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE drug_classifications(
    classification_id BIGSERIAL PRIMARY KEY,
    classification_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE drug_forms(
    form_id BIGSERIAL PRIMARY KEY,
    form_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE order_items(
    order_item_id BIGSERIAL PRIMARY KEY,
    order_pharmacy_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    drug_name VARCHAR NOT NULL,
    pharmacy_drug_id BIGINT NOT NULL,
    drug_price DECIMAL NOT NULL,
    drug_unit VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE order_pharmacies(
    order_pharmacy_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_status_id BIGINT NOT NULL,
    pharmacy_courier_id BIGINT NOT NULL,
    subtotal_amount DECIMAL NOT NULL,
    delivery_fee DECIMAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE orders(
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address VARCHAR NOT NULL,
    payment_proof TEXT NOT NULL DEFAULT '',
    total_amount DECIMAL NOT NULL,
    expired_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 DAY', 
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE order_status(
    order_status_id BIGSERIAL PRIMARY KEY,
    status_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE stock_changes(
    stock_change_id BIGSERIAL PRIMARY KEY,
    pharmacy_drug_id BIGINT NOT NULL,
    final_stock INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    description VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE stock_mutation_requests(
    request_id BIGSERIAL PRIMARY KEY,
    pharmacy_requester_id BIGINT NOT NULL,
    pharmacy_target_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    stock INTEGER NOT NULL,
    status_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE stock_request_status(
    status_id BIGSERIAL PRIMARY KEY,
    status_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE chat_rooms(
    chat_room_id BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT NOT NULL,
    doctor_account_id BIGINT NOT NULL,
    expired_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL 
);

CREATE TABLE chats(
    chat_id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT NOT NULL,
    sender_account_id BIGINT NOT NULL,
    chat_message VARCHAR NOT NULL,
    attachment_format VARCHAR,
    attachment_url VARCHAR,
    prescription_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE prescriptions(
    prescription_id BIGSERIAL PRIMARY KEY,
    user_account_id BIGSERIAL NOT NULL,
    doctor_account_id BIGSERIAL NOT NULL,
    redeemed_at TIMESTAMP DEFAULT NULL,
    ordered_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE prescription_drugs(
    prescription_drug_id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,	
    note VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);