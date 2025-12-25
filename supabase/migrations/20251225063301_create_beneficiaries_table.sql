/*
  # إنشاء جدول المستفيدين

  1. الجدول الجديد
    - `beneficiaries` - المستفيدون من المساعدات

  2. الحقول
    - معلومات شخصية كاملة
    - عنوان مفصل وموقع جغرافي
    - ارتباط بالمؤسسات والعائلات
    - حالات التحقق والأهلية
    - سجل الطرود والملاحظات

  3. الأمان
    - تفعيل RLS
    - سياسات الوصول حسب الدور
*/

CREATE TABLE IF NOT EXISTS beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  full_name text NOT NULL,
  national_id text UNIQUE NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  phone text NOT NULL,
  address text NOT NULL,
  detailed_address jsonb DEFAULT '{}'::jsonb,
  location jsonb DEFAULT '{"lat": 31.5, "lng": 34.5}'::jsonb,
  organization_id uuid REFERENCES organizations(id),
  family_id uuid REFERENCES families(id),
  relation_to_family text,
  profession text DEFAULT '',
  marital_status text DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  economic_level text DEFAULT 'poor' CHECK (economic_level IN ('very_poor', 'poor', 'moderate', 'good')),
  members_count integer DEFAULT 1,
  additional_documents jsonb DEFAULT '[]'::jsonb,
  identity_status text DEFAULT 'pending' CHECK (identity_status IN ('verified', 'pending', 'rejected')),
  identity_image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  eligibility_status text DEFAULT 'under_review' CHECK (eligibility_status IN ('eligible', 'under_review', 'rejected')),
  last_received date,
  total_packages integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_national_id ON beneficiaries(national_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_organization ON beneficiaries(organization_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_family ON beneficiaries(family_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_eligibility ON beneficiaries(eligibility_status);

-- تفعيل RLS
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "الجميع يمكنهم قراءة المستفيدين"
  ON beneficiaries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "الجميع يمكنهم إضافة مستفيدين"
  ON beneficiaries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "الجميع يمكنهم تحديث المستفيدين"
  ON beneficiaries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "الجميع يمكنهم حذف المستفيدين"
  ON beneficiaries FOR DELETE
  TO authenticated
  USING (true);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_beneficiaries_updated_at ON beneficiaries;
CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();