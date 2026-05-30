create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_companies_updated_at before update on public.companies for each row execute function public.touch_updated_at();
create trigger touch_products_updated_at before update on public.products for each row execute function public.touch_updated_at();

create or replace function public.create_authorization_request(
  p_company_id uuid,
  p_branch_id uuid,
  p_reason text,
  p_module text,
  p_entity text,
  p_entity_id uuid,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_company_id <> public.current_company_id() then
    raise exception 'No autorizado para esta empresa';
  end if;

  insert into public.authorization_requests(company_id, branch_id, requested_by, reason, module, entity, entity_id, request_payload)
  values (p_company_id, p_branch_id, auth.uid(), p_reason, p_module, p_entity, p_entity_id, coalesce(p_payload, '{}'::jsonb))
  returning id into new_id;

  insert into public.audit_logs(company_id, branch_id, module, action, entity, entity_id, after_data, reason)
  values (p_company_id, p_branch_id, p_module, 'authorization_requested', p_entity, p_entity_id, p_payload, p_reason);

  return new_id;
end;
$$;

create or replace function public.respond_authorization_request(
  p_request_id uuid,
  p_approved boolean,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.authorization_requests%rowtype;
begin
  select * into req from public.authorization_requests where id = p_request_id for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  if req.company_id <> public.current_company_id() then raise exception 'No autorizado'; end if;
  if not public.has_permission(req.module, 'authorize') then raise exception 'No tiene permiso para autorizar'; end if;

  update public.authorization_requests
  set status = case when p_approved then 'approved'::public.authorization_status else 'rejected'::public.authorization_status end,
      authorized_by = auth.uid(),
      response_note = p_note,
      responded_at = now()
  where id = p_request_id;

  insert into public.audit_logs(company_id, branch_id, user_id, role, module, action, entity, entity_id, reason, authorizer_user_id)
  values (req.company_id, req.branch_id, auth.uid(), public.current_role(), req.module, case when p_approved then 'authorization_approved' else 'authorization_rejected' end, req.entity, req.entity_id, p_note, auth.uid());

  return true;
end;
$$;

create or replace function public.create_workflow_orders_for_sale(p_sale_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  created_count int := 0;
  sale_row public.sales%rowtype;
begin
  select * into sale_row from public.sales where id = p_sale_id;
  if not found then raise exception 'Venta no encontrada'; end if;

  insert into public.workflow_orders(company_id, branch_id, sale_id, area_id, payload)
  select distinct sale_row.company_id, sale_row.branch_id, sale_row.id, wr.area_id,
    jsonb_build_object('sale_id', sale_row.id, 'source', 'sale_completed')
  from public.sale_items si
  join public.products p on p.id = si.product_id
  join public.workflow_routes wr on wr.company_id = sale_row.company_id and wr.active = true and (wr.product_id = si.product_id or wr.category = p.category)
  where si.sale_id = p_sale_id;

  get diagnostics created_count = row_count;
  return created_count;
end;
$$;

insert into public.permissions(key, module, action, description)
select module || '.' || action, module, action::public.permission_action, 'Permite ' || action || ' en ' || module
from unnest(array['dashboard','pos','inventory','purchases','sales','customers','suppliers','receivables','payables','accounting','payroll','hr','cash','reports','audit','settings','labels','tickets','authorizations','workflow']) module
cross join unnest(array['view','create','update','delete','approve','authorize','export','print','void']) action
on conflict (key) do nothing;
