/*
  # إنشاء جداول التنبيهات والإشعارات

  1. الجداول الجديدة
    - `alerts` - التنبيهات
    - `activity_log` - سجل النشاط
    - `notifications` - الإشعارات

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات الوصول المناسبة
*/

-- جدول التنبيهات
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('delayed', 'failed', 'expired', 'urgent')),
  title text NOT NULL,
  description text NOT NULL,
  related_id uuid,
  related_type text CHECK (related_type IN ('package', 'beneficiary', 'task')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_alerts" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_alerts" ON alerts FOR ALL TO authenticated USING (true);

-- جدول سجل النشاط
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_name text NOT NULL,
  role text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  type text NOT NULL CHECK (type IN ('create', 'verify', 'approve', 'update', 'deliver', 'review')),
  beneficiary_id uuid REFERENCES beneficiaries(id),
  details text
);

CREATE INDEX IF NOT EXISTS idx_activity_log_beneficiary ON activity_log(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_activity_log" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_insert_activity_log" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL CHECK (recipient_type IN ('user', 'beneficiary', 'courier', 'organization', 'all')),
  recipient_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'urgent')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  channel text DEFAULT 'app' CHECK (channel IN ('app', 'sms', 'email', 'push', 'whatsapp')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  template_id uuid,
  related_entity_type text,
  related_entity_id uuid,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL TO authenticated USING (true);