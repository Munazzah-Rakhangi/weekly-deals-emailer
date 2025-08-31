-- Retailers
create table if not exists retailers (
  id bigserial primary key,
  name text unique not null
);

-- Products
create table if not exists products (
  id bigserial primary key,
  name text not null,
  size text,
  category text
);

-- Deals
create table if not exists deals (
  id bigserial primary key,
  retailer_id bigint references retailers(id) on delete cascade not null,
  product_id bigint references products(id) on delete cascade not null,
  price numeric(10,2) not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  unique (retailer_id, product_id, start_date)
);

-- Optional users (for preferences)
create table if not exists users (
  id bigserial primary key,
  email text unique not null,
  name text,
  preferred_retailers text[] default '{}'
);
