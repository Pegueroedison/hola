alter table public.companies enable row level security;
alter table public.branches enable row level security;
alter table public.warehouses enable row level security;
alter table public.cash_registers enable row level security;
alter table public.user_profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permissions enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_lots enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.chart_of_accounts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;
alter table public.employees enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.workflow_areas enable row level security;
alter table public.workflow_routes enable row level security;
alter table public.workflow_orders enable row level security;
alter table public.authorization_requests enable row level security;
alter table public.file_assets enable row level security;
alter table public.ticket_templates enable row level security;
alter table public.label_templates enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.user_profiles where id = auth.uid() and active = true limit 1;
$$;

create or replace function public.current_role()
returns public.erp_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid() and active = true limit 1;
$$;

create or replace function public.has_permission(p_module text, p_action public.permission_action)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'owner', false)
  or exists (
    select 1
    from public.user_profiles up
    join public.role_permissions rp on rp.company_id = up.company_id and rp.role = up.role
    join public.permissions p on p.id = rp.permission_id
    where up.id = auth.uid()
      and up.active = true
      and p.module = p_module
      and p.action = p_action
  )
  or exists (
    select 1
    from public.user_permissions usp
    join public.permissions p on p.id = usp.permission_id
    where usp.user_id = auth.uid()
      and usp.company_id = public.current_company_id()
      and (usp.expires_at is null or usp.expires_at > now())
      and p.module = p_module
      and p.action = p_action
  );
$$;

create or replace function public.same_company(row_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select row_company_id = public.current_company_id();
$$;

create policy companies_select on public.companies for select using (id = public.current_company_id() or owner_user_id = auth.uid());
create policy companies_update on public.companies for update using (public.has_permission('settings','update')) with check (public.has_permission('settings','update'));

create policy user_profiles_select_same_company on public.user_profiles for select using (company_id = public.current_company_id() or id = auth.uid());
create policy user_profiles_update_self_or_admin on public.user_profiles for update using (id = auth.uid() or public.has_permission('settings','update')) with check (id = auth.uid() or public.has_permission('settings','update'));

create policy permissions_select_authenticated on public.permissions for select to authenticated using (true);

-- Políticas multiempresa genéricas. Cada tabla queda aislada por company_id y acción.
create policy branches_all on public.branches for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy warehouses_all on public.warehouses for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy cash_registers_all on public.cash_registers for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy role_permissions_admin on public.role_permissions for all using (public.same_company(company_id) and public.has_permission('settings','update')) with check (public.same_company(company_id) and public.has_permission('settings','update'));
create policy user_permissions_admin on public.user_permissions for all using (public.same_company(company_id) and public.has_permission('settings','update')) with check (public.same_company(company_id) and public.has_permission('settings','update'));

create policy products_select on public.products for select using (public.same_company(company_id) and public.has_permission('inventory','view'));
create policy products_insert on public.products for insert with check (public.same_company(company_id) and public.has_permission('inventory','create'));
create policy products_update on public.products for update using (public.same_company(company_id) and public.has_permission('inventory','update')) with check (public.same_company(company_id) and public.has_permission('inventory','update'));
create policy products_delete on public.products for delete using (public.same_company(company_id) and public.has_permission('inventory','delete'));

create policy product_variants_all on public.product_variants for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy inventory_lots_all on public.inventory_lots for all using (public.same_company(company_id) and public.has_permission('inventory','view')) with check (public.same_company(company_id) and public.has_permission('inventory','update'));
create policy inventory_movements_all on public.inventory_movements for all using (public.same_company(company_id) and public.has_permission('inventory','view')) with check (public.same_company(company_id) and public.has_permission('inventory','update'));

create policy customers_all on public.customers for all using (public.same_company(company_id) and public.has_permission('customers','view')) with check (public.same_company(company_id));
create policy suppliers_all on public.suppliers for all using (public.same_company(company_id) and public.has_permission('suppliers','view')) with check (public.same_company(company_id));

create policy sales_select on public.sales for select using (public.same_company(company_id) and public.has_permission('sales','view'));
create policy sales_insert on public.sales for insert with check (public.same_company(company_id) and (public.has_permission('sales','create') or public.has_permission('pos','create')));
create policy sales_update on public.sales for update using (public.same_company(company_id) and public.has_permission('sales','update')) with check (public.same_company(company_id));

create policy sale_items_all on public.sale_items for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy payments_all on public.payments for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy purchase_orders_all on public.purchase_orders for all using (public.same_company(company_id) and public.has_permission('purchases','view')) with check (public.same_company(company_id));
create policy cash_sessions_all on public.cash_sessions for all using (public.same_company(company_id) and public.has_permission('cash','view')) with check (public.same_company(company_id));
create policy accounting_all on public.chart_of_accounts for all using (public.same_company(company_id) and public.has_permission('accounting','view')) with check (public.same_company(company_id));
create policy journal_entries_all on public.journal_entries for all using (public.same_company(company_id) and public.has_permission('accounting','view')) with check (public.same_company(company_id));
create policy journal_lines_all on public.journal_lines for all using (public.same_company(company_id) and public.has_permission('accounting','view')) with check (public.same_company(company_id));
create policy employees_all on public.employees for all using (public.same_company(company_id) and public.has_permission('hr','view')) with check (public.same_company(company_id));
create policy payroll_runs_all on public.payroll_runs for all using (public.same_company(company_id) and public.has_permission('payroll','view')) with check (public.same_company(company_id));
create policy workflow_areas_all on public.workflow_areas for all using (public.same_company(company_id) and public.has_permission('workflow','view')) with check (public.same_company(company_id));
create policy workflow_routes_all on public.workflow_routes for all using (public.same_company(company_id) and public.has_permission('workflow','view')) with check (public.same_company(company_id));
create policy workflow_orders_all on public.workflow_orders for all using (public.same_company(company_id) and public.has_permission('workflow','view')) with check (public.same_company(company_id));
create policy authorization_requests_all on public.authorization_requests for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy file_assets_all on public.file_assets for all using (public.same_company(company_id)) with check (public.same_company(company_id));
create policy ticket_templates_all on public.ticket_templates for all using (public.same_company(company_id) and public.has_permission('tickets','view')) with check (public.same_company(company_id));
create policy label_templates_all on public.label_templates for all using (public.same_company(company_id) and public.has_permission('labels','view')) with check (public.same_company(company_id));
create policy audit_logs_select on public.audit_logs for select using (public.same_company(company_id) and public.has_permission('audit','view'));
create policy audit_logs_insert on public.audit_logs for insert with check (public.same_company(company_id));
