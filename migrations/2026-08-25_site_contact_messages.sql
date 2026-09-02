-- ============================================================
--  رسائل الموقع (نموذج "تواصل معنا") — عيادات د. زياد
--  شغّل هذا الملف مرة واحدة في Supabase SQL Editor
-- ============================================================

create table if not exists public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text        not null,
  phone       text        not null,
  email       text,
  subject     text        not null default 'استفسار عام',
  message     text        not null,
  status      text        not null default 'new'
              check (status in ('new', 'read', 'replied', 'archived')),
  reply_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.contact_messages is 'رسائل زوار الموقع من نموذج تواصل معنا';

-- فهارس للأداء
create index if not exists idx_contact_messages_status
  on public.contact_messages (status, created_at desc);
create index if not exists idx_contact_messages_created
  on public.contact_messages (created_at desc);

-- تفعيل RLS
alter table public.contact_messages enable row level security;

-- الزوار: إدراج فقط عبر نموذج الموقع العام
drop policy if exists "public can submit contact messages" on public.contact_messages;
create policy "public can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- القراءة / التحديث / الحذف تتم حصراً عبر API الإدارة (service_role يتجاوز RLS)
-- لا نمنح أي صلاحيات select/update/delete لـ anon أو authenticated مباشرة.

-- تحديث تلقائي لعمود updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_contact_messages_touch on public.contact_messages;
create trigger trg_contact_messages_touch
  before update on public.contact_messages
  for each row execute function public.touch_updated_at();
