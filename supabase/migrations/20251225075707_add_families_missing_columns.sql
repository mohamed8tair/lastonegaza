/*
  # إضافة الأعمدة الناقصة في جدول العائلات

  1. التعديلات على جدول families
    - إضافة `head_of_family_id` - معرف رب الأسرة (مرجع للمستفيد)
    - إضافة `family_members` - قائمة معرفات أفراد العائلة (jsonb)
    - إضافة `total_children` - عدد الأطفال (أقل من 18 سنة)
    - إضافة `total_medical_cases` - عدد الحالات الطبية في العائلة
    - إضافة `average_age` - متوسط عمر أفراد العائلة

  2. ملاحظات
    - head_of_family_id يشير إلى beneficiaries(id)
    - جميع الأعمدة اختيارية (nullable) لتجنب مشاكل العلاقات الدائرية
    - يمكن تعبئة البيانات بعد نقل المستفيدين
*/

-- إضافة عمود head_of_family_id مع مرجع للمستفيدين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'families' AND column_name = 'head_of_family_id'
  ) THEN
    ALTER TABLE families ADD COLUMN head_of_family_id uuid;
    
    -- إضافة Foreign Key بعد التأكد من وجود العمود
    -- نستخدم ON DELETE SET NULL لتجنب المشاكل عند حذف المستفيد
    ALTER TABLE families 
      ADD CONSTRAINT fk_families_head_of_family 
      FOREIGN KEY (head_of_family_id) 
      REFERENCES beneficiaries(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- إضافة عمود family_members (قائمة معرفات أفراد العائلة)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'families' AND column_name = 'family_members'
  ) THEN
    ALTER TABLE families ADD COLUMN family_members jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- إضافة عمود total_children (عدد الأطفال)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'families' AND column_name = 'total_children'
  ) THEN
    ALTER TABLE families ADD COLUMN total_children integer DEFAULT 0;
  END IF;
END $$;

-- إضافة عمود total_medical_cases (عدد الحالات الطبية)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'families' AND column_name = 'total_medical_cases'
  ) THEN
    ALTER TABLE families ADD COLUMN total_medical_cases integer DEFAULT 0;
  END IF;
END $$;

-- إضافة عمود average_age (متوسط العمر)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'families' AND column_name = 'average_age'
  ) THEN
    ALTER TABLE families ADD COLUMN average_age numeric DEFAULT 0;
  END IF;
END $$;

-- إضافة فهرس على head_of_family_id لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_families_head_of_family ON families(head_of_family_id);

-- إضافة تعليقات توضيحية على الأعمدة
COMMENT ON COLUMN families.head_of_family_id IS 'معرف رب الأسرة - مرجع لجدول المستفيدين';
COMMENT ON COLUMN families.family_members IS 'قائمة معرفات جميع أفراد العائلة (JSON array of UUIDs)';
COMMENT ON COLUMN families.total_children IS 'عدد الأطفال في العائلة (أقل من 18 سنة)';
COMMENT ON COLUMN families.total_medical_cases IS 'عدد الحالات الطبية لدى أفراد العائلة';
COMMENT ON COLUMN families.average_age IS 'متوسط عمر أفراد العائلة بالسنوات';