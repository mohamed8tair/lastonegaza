/*
  # إنشاء جداول الطرود والمهام والمندوبين

  1. الجداول الجديدة
    - `packages` - الطرود
    - `tasks` - مهام التوصيل
    - `couriers` - المندوبون
    - `package_templates` - قوالب الطرود

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات الوصول المناسبة
*/

-- جدول الطرود
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text DEFAULT '',
  value numeric DEFAULT 0,
  funder text DEFAULT '',
  organization_id uuid REFERENCES organizations(id),
  family_id uuid REFERENCES families(id),
  beneficiary_id uuid REFERENCES beneficiaries(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_delivery', 'delivered', 'failed')),
  created_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  expiry_date date
);

CREATE INDEX IF NOT EXISTS idx_packages_beneficiary ON packages(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_packages_organization ON packages(organization_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_packages" ON packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_packages" ON packages FOR ALL TO authenticated USING (true);

-- جدول المندوبين
CREATE TABLE IF NOT EXISTS couriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'busy', 'offline')),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_tasks integer DEFAULT 0,
  current_location jsonb DEFAULT '{"lat": 31.5, "lng": 34.5}'::jsonb,
  is_humanitarian_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_couriers_status ON couriers(status);

ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_couriers" ON couriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_couriers" ON couriers FOR ALL TO authenticated USING (true);

-- جدول المهام
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
  beneficiary_id uuid REFERENCES beneficiaries(id),
  courier_id uuid REFERENCES couriers(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'delivered', 'failed', 'rescheduled')),
  created_at timestamptz DEFAULT now(),
  scheduled_at timestamptz,
  delivered_at timestamptz,
  delivery_location jsonb,
  notes text DEFAULT '',
  courier_notes text DEFAULT '',
  delivery_proof_image_url text,
  digital_signature_image_url text,
  estimated_arrival_time timestamptz,
  remaining_distance numeric,
  photo_url text,
  failure_reason text
);

CREATE INDEX IF NOT EXISTS idx_tasks_beneficiary ON tasks(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_tasks_courier ON tasks(courier_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_package ON tasks(package_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_tasks" ON tasks FOR ALL TO authenticated USING (true);

-- جدول قوالب الطرود
CREATE TABLE IF NOT EXISTS package_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('food', 'medical', 'clothing', 'hygiene', 'emergency')),
  organization_id uuid REFERENCES organizations(id),
  description text DEFAULT '',
  contents jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'inactive')),
  created_at timestamptz DEFAULT now(),
  usage_count integer DEFAULT 0,
  total_weight numeric DEFAULT 0,
  estimated_cost numeric DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_package_templates_org ON package_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_package_templates_type ON package_templates(type);

ALTER TABLE package_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_templates" ON package_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_templates" ON package_templates FOR ALL TO authenticated USING (true);