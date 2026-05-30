create extension if not exists pgcrypto;

create type public.erp_role as enum ('owner','admin','manager','supervisor','cashier','seller','purchases','inventory','accounting','hr','auditor','readonly');
create type public.permission_action as enum ('view','create','update','delete','approve','authorize','export','print','void');
create type public.authorization_status as enum ('pending','approved','rejected','expired');
create type public.sale_status as enum ('draft','completed','voided','refunded');
create type public.payment_method as enum ('cash','card','transfer','credit','gift','mixed');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  name text not null,
  legal_name text,
  tax_id text,
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  active boolean not null default true
);

create table public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  printer_name text,
  active boolean not null default true
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  full_name text not null,
  role public.erp_role not null default 'readonly',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  action public.permission_action not null,
  description text not null
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  role public.erp_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  unique(company_id, role, permission_id)
);

create table public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete cascade,
  register_id uuid references public.cash_registers(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  expires_at timestamptz,
  granted_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  unique(company_id, user_id, permission_id, branch_id, warehouse_id, register_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'product',
  sku text not null,
  barcode text,
  qr_code text,
  category text,
  brand text,
  unit text not null default 'UND',
  price numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  tax_rate numeric(5,4) not null default 0,
  active boolean not null default true,
  requires_lot boolean not null default false,
  requires_serial boolean not null default false,
  requires_expiration boolean not null default false,
  pharmacy_data jsonb not null default '{}'::jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, sku)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null,
  size text,
  color text,
  attributes jsonb not null default '{}'::jsonb,
  price numeric(14,2),
  active boolean not null default true,
  unique(company_id, sku)
);

create table public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  lot_number text,
  serial_number text,
  expiration_date date,
  quantity numeric(14,4) not null default 0,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  lot_id uuid references public.inventory_lots(id),
  movement_type text not null,
  quantity numeric(14,4) not null,
  cost numeric(14,2),
  source_table text,
  source_id uuid,
  reason text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  tax_id text,
  phone text,
  email text,
  address text,
  credit_limit numeric(14,2) not null default 0,
  discount_rate numeric(5,4) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  tax_id text,
  phone text,
  email text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  register_id uuid references public.cash_registers(id),
  customer_id uuid references public.customers(id),
  sale_number text not null,
  status public.sale_status not null default 'draft',
  subtotal numeric(14,2) not null default 0,
  discount_total numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  paid_total numeric(14,2) not null default 0,
  balance numeric(14,2) not null default 0,
  notes text,
  created_by uuid references public.user_profiles(id),
  authorized_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  unique(company_id, sale_number)
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  lot_id uuid references public.inventory_lots(id),
  quantity numeric(14,4) not null,
  unit_price numeric(14,2) not null,
  discount numeric(14,2) not null default 0,
  tax_rate numeric(5,4) not null default 0,
  total numeric(14,2) not null,
  authorization_id uuid,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sale_id uuid references public.sales(id) on delete cascade,
  method public.payment_method not null,
  amount numeric(14,2) not null,
  reference text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id),
  supplier_id uuid references public.suppliers(id),
  number text not null,
  status text not null default 'draft',
  subtotal numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  unique(company_id, number)
);

create table public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  register_id uuid not null references public.cash_registers(id),
  opened_by uuid not null references public.user_profiles(id),
  closed_by uuid references public.user_profiles(id),
  opening_amount numeric(14,2) not null default 0,
  expected_amount numeric(14,2),
  counted_amount numeric(14,2),
  difference numeric(14,2),
  status text not null default 'open',
  authorization_id uuid,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  type text not null,
  parent_id uuid references public.chart_of_accounts(id),
  active boolean not null default true,
  unique(company_id, code)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  number text not null,
  entry_date date not null default current_date,
  description text not null,
  source_table text,
  source_id uuid,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  unique(company_id, number)
);

create table public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  account_id uuid not null references public.chart_of_accounts(id),
  debit numeric(14,2) not null default 0,
  credit numeric(14,2) not null default 0,
  memo text
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id),
  full_name text not null,
  document_id text,
  department text,
  position text,
  base_salary numeric(14,2) not null default 0,
  hire_date date,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft',
  total_gross numeric(14,2) not null default 0,
  total_deductions numeric(14,2) not null default 0,
  total_net numeric(14,2) not null default 0,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table public.workflow_areas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id),
  name text not null,
  type text not null default 'custom',
  printer_name text,
  active boolean not null default true
);

create table public.workflow_routes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  category text,
  area_id uuid not null references public.workflow_areas(id) on delete cascade,
  priority int not null default 10,
  active boolean not null default true
);

create table public.workflow_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id),
  sale_id uuid references public.sales(id),
  area_id uuid not null references public.workflow_areas(id),
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.authorization_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id),
  requested_by uuid not null references public.user_profiles(id),
  authorized_by uuid references public.user_profiles(id),
  reason text not null,
  module text not null,
  entity text,
  entity_id uuid,
  status public.authorization_status not null default 'pending',
  request_payload jsonb not null default '{}'::jsonb,
  response_note text,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table public.file_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  bucket text not null,
  object_key text not null,
  public_url text,
  mime_type text,
  size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table public.ticket_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  width text not null check (width in ('58mm','80mm')),
  template jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table public.label_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  template jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id),
  user_id uuid default auth.uid(),
  role public.erp_role,
  module text not null,
  action text not null,
  entity text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  reason text,
  authorizer_user_id uuid references public.user_profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_products_company on public.products(company_id);
create index idx_sales_company_branch on public.sales(company_id, branch_id);
create index idx_inventory_lots_product on public.inventory_lots(company_id, product_id, warehouse_id);
create index idx_audit_logs_company_created on public.audit_logs(company_id, created_at desc);
