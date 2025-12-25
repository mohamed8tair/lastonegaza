/*
  # إضافة عمود role وبيانات المستخدمين التجريبيين

  1. التعديلات على جدول system_users
    - إضافة عمود `role` (text) لتخزين اسم الدور مباشرة
    - إضافة عمود `full_name` (text) للاسم الكامل
    
  2. البيانات الجديدة
    - إضافة مستخدمين تجريبيين للنظام:
      - admin@humanitarian.ps (مدير النظام)
      - supervisor@redcrescent-gaza.org (مشرف مؤسسة)
      - supervisor@crs-gaza.org (مشرف مؤسسة)
      - family@abuamer.ps (مشرف عائلة)
      
  3. الأمان
    - لا تغييرات على سياسات RLS
*/

-- إضافة عمود role إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE system_users ADD COLUMN role text DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE system_users ADD COLUMN full_name text;
  END IF;
END $$;

-- التأكد من وجود الأدوار الأساسية
INSERT INTO roles (name, description, permissions, is_active)
VALUES 
  ('admin', 'مدير النظام - صلاحيات كاملة', '["all"]'::jsonb, true),
  ('organization', 'مشرف مؤسسة - إدارة المستفيدين والطرود', '["beneficiaries.read", "beneficiaries.create", "packages.manage"]'::jsonb, true),
  ('family', 'مشرف عائلة - عرض البيانات', '["beneficiaries.read", "packages.read"]'::jsonb, true),
  ('courier', 'مندوب - إدارة التوصيل', '["tasks.read", "tasks.update", "packages.read"]'::jsonb, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active;

-- إضافة المؤسسات الأساسية إذا لم تكن موجودة
INSERT INTO organizations (id, name, type, location, contact_person, phone, email, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'جمعية الهلال الأحمر الفلسطيني', 'humanitarian', 'غزة - الرمال', 'فاطمة أحمد', '0599123456', 'contact@redcrescent-gaza.org', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Catholic Relief Services - CRS', 'humanitarian', 'غزة - تل الهوا', 'جون سميث', '0599234567', 'contact@crs-gaza.org', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- إضافة العائلات الأساسية إذا لم تكن موجودة
INSERT INTO families (id, name, head_of_family, phone, location, members_count)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'عائلة أبو عامر', 'محمد أبو عامر', '0599345678', 'غزة - الشجاعية', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- حذف المستخدمين التجريبيين القدامى إذا كانوا موجودين
DELETE FROM system_users WHERE email IN (
  'admin@humanitarian.ps',
  'supervisor@redcrescent-gaza.org', 
  'supervisor@crs-gaza.org',
  'family@abuamer.ps'
);

-- إضافة المستخدمين التجريبيين
INSERT INTO system_users (id, name, full_name, email, phone, role_id, role, associated_id, associated_type, status, last_login, created_at)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'أحمد محمد الإدمن',
    'أحمد محمد الإدمن',
    'admin@humanitarian.ps',
    '0501234567',
    (SELECT id FROM roles WHERE name = 'admin' LIMIT 1),
    'admin',
    NULL,
    NULL,
    'active',
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'فاطمة أحمد - الهلال الأحمر',
    'فاطمة أحمد المشرفة',
    'supervisor@redcrescent-gaza.org',
    '0559876543',
    (SELECT id FROM roles WHERE name = 'organization' LIMIT 1),
    'organization',
    '11111111-1111-1111-1111-111111111111',
    'organization',
    'active',
    now(),
    now()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'جون سميث - CRS',
    'جون سميث',
    'supervisor@crs-gaza.org',
    '0591234567',
    (SELECT id FROM roles WHERE name = 'organization' LIMIT 1),
    'organization',
    '22222222-2222-2222-2222-222222222222',
    'organization',
    'active',
    now(),
    now()
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'محمد أبو عامر',
    'محمد أبو عامر - رب الأسرة',
    'family@abuamer.ps',
    '0591234567',
    (SELECT id FROM roles WHERE name = 'family' LIMIT 1),
    'family',
    '33333333-3333-3333-3333-333333333333',
    'family',
    'active',
    now(),
    now()
  );
