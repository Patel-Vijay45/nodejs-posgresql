CREATE TABLE quote (
    id SERIAL PRIMARY KEY,
    quote character varying(255) NOT NULL UNIQUE,
    author character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE banks(
    id SERIAL PRIMARY KEY,
    holder_name character varying(255),
    bank_name character varying(255),
    mobile character varying(255),
    customer_id character varying(50),
    account_no character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
)

CREATE TYPE transactionType AS ENUM ('C', 'D');
CREATE TABLE bankstatements(
    id SERIAL PRIMARY KEY,
    transaction_date date,
    particulars character varying(255),
    amount real,
    transaction_type transactionType,
    balance real,
    bank_id integer references banks(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
)