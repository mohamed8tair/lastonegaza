/*
  # إضافة الأعمدة الناقصة للعلاقات العائلية

  1. التعديلات
    - إضافة أعمدة العلاقات العائلية في جدول beneficiaries
      - `is_head_of_family` (boolean)
      - `spouse_id` (uuid)
      - `parent_id` (uuid)
      - `children_ids` (jsonb)
      - `medical_conditions` (jsonb)
    
    - إضافة أعمدة إضافية في جدول system_users
      - `associated_id` (uuid)
      - `associated_type` (text)
*/

-- إضافة أعمدة العلاقات العائلية في beneficiaries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'is_head_of_family'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN is_head_of_family boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'spouse_id'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN spouse_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN parent_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'children_ids'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN children_ids jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'medical_conditions'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN medical_conditions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- إضافة أعمدة الارتباطات في system_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'associated_id'
  ) THEN
    ALTER TABLE system_users ADD COLUMN associated_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'associated_type'
  ) THEN
    ALTER TABLE system_users ADD COLUMN associated_type text CHECK (associated_type IN ('organization', 'family'));
  END IF;
END $$;
