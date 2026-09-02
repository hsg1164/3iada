-- ============================================================================
--  TENANT ISOLATION & FULL DATA RESET
--  Dr. Ziyad Clinics — multi-tenant hardening
--
--  Run ONCE in the Supabase SQL Editor (as service role / owner).
--
--  What it does:
--   1. Guarantees a clinic_id column on every business table.
--   2. Links every clinic_id to clinics(id) with an FK (delete => cascade).
--   3. Creates an index on clinic_id everywhere (fast scoped queries).
--   4. WIPES ALL OPERATIONAL DATA across every clinic.
--      KEPT:    clinics, system_users (logins), roles.
--      WIPED:   patients, visits, appointments, payments, session add-ons,
--               injection/laser logs, services & groups, inventory (+moves),
--               supplier debts, vaults (+transactions), expenses (all kinds),
--               tasks, templates, staff details, branches, holidays,
--               working days, referral providers, tax & system settings.
--   5. Makes patient codes unique PER CLINIC: UNIQUE (clinic_id, local_code).
--
--  ⚠ Irreversible: export a backup first if in doubt
--    (Supabase → Database → Backups, or pg_dump).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) clinic_id column on every business table (add if missing, backfill 1)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'patients','visits','appointments','payments','session_addons',
    'injection_logs','laser_logs','services','service_groups',
    'inventory_items','inventory_transactions','supplier_debts',
    'vaults','vault_transactions','expenses','routine_expenses',
    'expense_categories','tasks','prescription_templates',
    'investigation_templates','staff_details','branches','holidays',
    'working_days','referral_providers','tax_settings','system_settings'
  ];
begin
  foreach t in array tables loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'clinic_id'
    ) then
      execute format('alter table public.%I add column clinic_id integer not null default 1', t);
    else
      -- heal legacy nulls, then enforce not null
      execute format('update public.%I set clinic_id = 1 where clinic_id is null', t);
      execute format('alter table public.%I alter column clinic_id set not null', t);
      execute format('alter table public.%I alter column clinic_id set default 1', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Foreign keys -> clinics(id), ON DELETE CASCADE
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  cname text;
  tables text[] := array[
    'patients','visits','appointments','payments','session_addons',
    'injection_logs','laser_logs','services','service_groups',
    'inventory_items','inventory_transactions','supplier_debts',
    'vaults','vault_transactions','expenses','routine_expenses',
    'expense_categories','tasks','prescription_templates',
    'investigation_templates','staff_details','branches','holidays',
    'working_days','referral_providers','tax_settings','system_settings'
  ];
begin
  foreach t in array tables loop
    cname := t || '_clinic_fk';
    if not exists (
      select 1 from pg_constraint
      where conname = cname and conrelid = format('public.%I', t)::regclass
    ) then
      execute format(
        'alter table public.%I add constraint %I foreign key (clinic_id) references public.clinics(id) on delete cascade',
        t, cname
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Indexes on clinic_id (scoped queries stay fast)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  iname text;
  tables text[] := array[
    'patients','visits','appointments','payments','session_addons',
    'injection_logs','laser_logs','services','service_groups',
    'inventory_items','inventory_transactions','supplier_debts',
    'vaults','vault_transactions','expenses','routine_expenses',
    'expense_categories','tasks','prescription_templates',
    'investigation_templates','staff_details','branches','holidays',
    'working_days','referral_providers','tax_settings','system_settings'
  ];
begin
  foreach t in array tables loop
    iname := 'idx_' || t || '_clinic_id';
    if not exists (select 1 from pg_indexes where schemaname='public' and indexname = iname) then
      execute format('create index %I on public.%I (clinic_id)', iname, t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4) THE RESET — wipe all operational data (keeps clinics/users/roles)
-- ---------------------------------------------------------------------------
truncate table
  public.session_addons,
  public.injection_logs,
  public.laser_logs,
  public.visits,
  public.payments,
  public.appointments,
  public.expenses,
  public.routine_expenses,
  public.expense_categories,
  public.vault_transactions,
  public.supplier_debts,
  public.inventory_transactions,
  public.inventory_items,
  public.tasks,
  public.prescription_templates,
  public.investigation_templates,
  public.staff_details,
  public.working_days,
  public.holidays,
  public.referral_providers,
  public.tax_settings,
  public.system_settings,
  public.services,
  public.service_groups,
  public.branches,
  public.vaults,
  public.patients
restart identity cascade;

-- orphan/global roles belong to clinic #1
update public.roles set clinic_id = 1 where clinic_id is null;

-- ---------------------------------------------------------------------------
-- 5) Patient codes unique PER CLINIC instead of globally
-- ---------------------------------------------------------------------------
do $$
declare c record;
begin
  -- drop any previous global unique constraint/index on patients.local_code
  for c in
    select conname from pg_constraint
    where conrelid = 'public.patients'::regclass
      and contype in ('u','p')
      and conkey = array(
        select attnum::smallint from pg_attribute
        where attrelid = 'public.patients'::regclass and attname = 'local_code'
      )
      and array_length(conkey,1) = 1
  loop
    execute format('alter table public.patients drop constraint %I', c.conname);
  end loop;

  for c in
    select indexname from pg_indexes
    where schemaname = 'public' and tablename = 'patients'
      and indexdef ilike '%unique%' and indexdef ilike '%(local_code)%'
      and indexdef not ilike '%clinic_id%'
  loop
    execute format('drop index if exists public.%I', c.indexname);
  end loop;
end $$;

create unique index if not exists patients_clinic_local_code_uq
  on public.patients (clinic_id, local_code);

-- Done. Each clinic now starts with a clean slate:
--   • its own patients (codes restarting at 9000 per clinic)
--   • its own services, prices, inventory, vaults, expenses…
--   • logins preserved; platform superadmin intact.
