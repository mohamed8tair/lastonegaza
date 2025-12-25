/*
  # إضافة سياسات RLS مؤقتة للسماح بنقل البيانات

  1. السياسات الجديدة
    - سياسات تسمح بجميع العمليات (INSERT, UPDATE, DELETE, SELECT)
    - هذه السياسات مؤقتة لتسهيل نقل البيانات
    - يمكن تعديلها لاحقاً لتكون أكثر تقييداً
*/

-- إزالة جميع السياسات الحالية المتعارضة

-- سياسات permissions
DROP POLICY IF EXISTS "Enable all operations for permissions" ON permissions;
CREATE POLICY "Enable all operations for permissions"
  ON permissions FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات roles  
DROP POLICY IF EXISTS "Enable all operations for roles" ON roles;
CREATE POLICY "Enable all operations for roles"
  ON roles FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات organizations
DROP POLICY IF EXISTS "Enable all operations for organizations" ON organizations;
CREATE POLICY "Enable all operations for organizations"
  ON organizations FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات families
DROP POLICY IF EXISTS "Enable all operations for families" ON families;
CREATE POLICY "Enable all operations for families"
  ON families FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات beneficiaries
DROP POLICY IF EXISTS "Enable all operations for beneficiaries" ON beneficiaries;
CREATE POLICY "Enable all operations for beneficiaries"
  ON beneficiaries FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات package_templates
DROP POLICY IF EXISTS "Enable all operations for package_templates" ON package_templates;
CREATE POLICY "Enable all operations for package_templates"
  ON package_templates FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات packages
DROP POLICY IF EXISTS "Enable all operations for packages" ON packages;
CREATE POLICY "Enable all operations for packages"
  ON packages FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات couriers
DROP POLICY IF EXISTS "Enable all operations for couriers" ON couriers;
CREATE POLICY "Enable all operations for couriers"
  ON couriers FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات tasks
DROP POLICY IF EXISTS "Enable all operations for tasks" ON tasks;
CREATE POLICY "Enable all operations for tasks"
  ON tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات alerts
DROP POLICY IF EXISTS "Enable all operations for alerts" ON alerts;
CREATE POLICY "Enable all operations for alerts"
  ON alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات activity_log
DROP POLICY IF EXISTS "Enable all operations for activity_log" ON activity_log;
CREATE POLICY "Enable all operations for activity_log"
  ON activity_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات system_users
DROP POLICY IF EXISTS "Enable all operations for system_users" ON system_users;
CREATE POLICY "Enable all operations for system_users"
  ON system_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- سياسات notifications
DROP POLICY IF EXISTS "Enable all operations for notifications" ON notifications;
CREATE POLICY "Enable all operations for notifications"
  ON notifications FOR ALL
  USING (true)
  WITH CHECK (true);
