/*
  # إنشاء الجداول الأساسية للنظام

  1. الجداول الجديدة
    - `roles` - أدوار المستخدمين
    - `system_users` - مستخدمي النظام
    - `organizations` - المؤسسات
    - `families` - العائلات
    - `permissions` - الصلاحيات

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات أساسية للوصول
*/

-- جدول الأدوار
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  permissions jsonb DEFAULT '[]'::jsonb,
  user_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- جدول مستخدمي النظام
CREATE TABLE IF NOT EXISTS system_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  role_id uuid REFERENCES roles(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- جدول المؤسسات
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  beneficiaries_count integer DEFAULT 0,
  packages_count integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at timestamptz DEFAULT now(),
  packages_available integer DEFAULT 0,
  templates_count integer DEFAULT 0,
  is_popular boolean DEFAULT false
);

-- جدول العائلات
CREATE TABLE IF NOT EXISTS families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  head_of_family text NOT NULL,
  phone text NOT NULL,
  members_count integer DEFAULT 0,
  packages_distributed integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('read', 'write', 'delete', 'approve', 'manage')),
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- سياسات أساسية مؤقتة للسماح بالقراءة للجميع (سنحسنها لاحقاً)
CREATE POLICY "allow_read_roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_system_users" ON system_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_organizations" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_families" ON families FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_permissions" ON permissions FOR SELECT TO authenticated USING (true);

-- سياسات الكتابة للمسؤولين (مبسطة)
CREATE POLICY "allow_all_roles" ON roles FOR ALL TO authenticated USING (true);
CREATE POLICY "allow_all_system_users" ON system_users FOR ALL TO authenticated USING (true);
CREATE POLICY "allow_all_organizations" ON organizations FOR ALL TO authenticated USING (true);
CREATE POLICY "allow_all_families" ON families FOR ALL TO authenticated USING (true);

-- إدراج الأدوار الأساسية
INSERT INTO roles (name, description, permissions, is_active)
VALUES 
  ('admin', 'مدير النظام - صلاحيات كاملة', '["all"]'::jsonb, true),
  ('organization', 'مؤسسة - إدارة المستفيدين والطرود', '["beneficiaries.read", "beneficiaries.create", "packages.manage"]'::jsonb, true),
  ('family', 'عائلة - عرض البيانات فقط', '["beneficiaries.read", "packages.read"]'::jsonb, true),
  ('courier', 'مندوب - إدارة التوصيل', '["tasks.read", "tasks.update", "packages.read"]'::jsonb, true)
ON CONFLICT (name) DO NOTHING;