import { supabase } from '../lib/supabaseClient';
import {
  mockOrganizations,
  mockFamilies,
  mockBeneficiaries,
  mockPackages,
  mockPackageTemplates,
  mockCouriers,
  mockTasks,
  mockAlerts,
  mockActivityLog,
  mockRoles,
  mockSystemUsers,
  mockPermissions
} from '../data/mockData';
import {
  transformOrganization,
  transformFamily,
  transformBeneficiary,
  transformPackage,
  transformPackageTemplate,
  transformCourier,
  transformTask,
  transformAlert,
  transformActivityLog,
  transformRole,
  transformSystemUser,
  transformPermission
} from '../utils/dataTransformers';

interface MigrationResult {
  success: boolean;
  table: string;
  count: number;
  errors: any[];
}

export class DataMigration {
  private results: MigrationResult[] = [];

  async migrateAll(): Promise<{ success: boolean; results: MigrationResult[] }> {
    console.log('🚀 Starting data migration...');

    try {
      // المرحلة 1: الأساسيات (لا توجد علاقات)
      await this.migratePermissions();
      await this.migrateRoles();
      await this.migrateOrganizations();

      // المرحلة 2: العائلات (بدون head_of_family_id لتجنب العلاقات الدائرية)
      await this.migrateFamilies();

      // المرحلة 3: المستفيدون (يعتمدون على Organizations و Families)
      await this.migrateBeneficiaries();

      // المرحلة 4: تحديث head_of_family_id في العائلات
      await this.updateFamiliesHeadOfFamily();

      // المرحلة 5: باقي البيانات
      await this.migrateSystemUsers();
      await this.migratePackageTemplates();
      await this.migrateCouriers();
      await this.migratePackages();
      await this.migrateTasks();
      await this.migrateAlerts();
      await this.migrateActivityLog();

      const allSuccess = this.results.every(r => r.success);

      console.log('✅ Migration completed!');
      this.printSummary();

      return {
        success: allSuccess,
        results: this.results
      };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private async migrateRoles(): Promise<void> {
    console.log('📋 Migrating Roles...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('roles').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Roles - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'roles', count: existing.length, errors: [] });
      return;
    }

    for (const role of mockRoles) {
      try {
        const transformed = transformRole(role);
        const { error } = await supabase.from('roles').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting role ${role.name}:`, error);
        errors.push({ data: role, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'roles',
      count: successCount,
      errors
    });
    console.log(`✓ Roles: ${successCount}/${mockRoles.length} migrated`);
  }

  private async migratePermissions(): Promise<void> {
    console.log('🔐 Migrating Permissions...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('permissions').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Permissions - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'permissions', count: existing.length, errors: [] });
      return;
    }

    for (const permission of mockPermissions) {
      try {
        const transformed = transformPermission(permission);
        const { error } = await supabase.from('permissions').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting permission ${permission.name}:`, error);
        errors.push({ data: permission, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'permissions',
      count: successCount,
      errors
    });
    console.log(`✓ Permissions: ${successCount}/${mockPermissions.length} migrated`);
  }

  private async migrateSystemUsers(): Promise<void> {
    console.log('👥 Migrating System Users...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('system_users').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping System Users - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'system_users', count: existing.length, errors: [] });
      return;
    }

    for (const user of mockSystemUsers) {
      try {
        const transformed = transformSystemUser(user);
        const { error } = await supabase.from('system_users').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting user ${user.name}:`, error);
        errors.push({ data: user, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'system_users',
      count: successCount,
      errors
    });
    console.log(`✓ System Users: ${successCount}/${mockSystemUsers.length} migrated`);
  }

  private async migrateOrganizations(): Promise<void> {
    console.log('🏢 Migrating Organizations...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('organizations').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Organizations - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'organizations', count: existing.length, errors: [] });
      return;
    }

    for (const org of mockOrganizations) {
      try {
        const transformed = transformOrganization(org);
        const { error } = await supabase.from('organizations').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting organization ${org.name}:`, error);
        errors.push({ data: org, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'organizations',
      count: successCount,
      errors
    });
    console.log(`✓ Organizations: ${successCount}/${mockOrganizations.length} migrated`);
  }

  private async migrateFamilies(): Promise<void> {
    console.log('👨‍👩‍👧‍👦 Migrating Families...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('families').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Families - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'families', count: existing.length, errors: [] });
      return;
    }

    for (const family of mockFamilies) {
      try {
        const transformed = transformFamily(family);
        const { error } = await supabase.from('families').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting family ${family.name}:`, error);
        errors.push({ data: family, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'families',
      count: successCount,
      errors
    });
    console.log(`✓ Families: ${successCount}/${mockFamilies.length} migrated`);
  }

  private async migrateBeneficiaries(): Promise<void> {
    console.log('👤 Migrating Beneficiaries...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('beneficiaries').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Beneficiaries - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'beneficiaries', count: existing.length, errors: [] });
      return;
    }

    for (const beneficiary of mockBeneficiaries) {
      try {
        const transformed = transformBeneficiary(beneficiary);
        const { error } = await supabase.from('beneficiaries').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting beneficiary ${beneficiary.name}:`, error);
        errors.push({ data: beneficiary, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'beneficiaries',
      count: successCount,
      errors
    });
    console.log(`✓ Beneficiaries: ${successCount}/${mockBeneficiaries.length} migrated`);
  }

  private async updateFamiliesHeadOfFamily(): Promise<void> {
    console.log('🔗 Updating families head_of_family_id...');
    const errors: any[] = [];
    let successCount = 0;

    for (const family of mockFamilies) {
      if (!family.headOfFamilyId) continue;

      try {
        const { error } = await supabase
          .from('families')
          .update({ head_of_family_id: family.headOfFamilyId })
          .eq('id', family.id);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error updating family ${family.name}:`, error);
        errors.push({ data: family, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'families (update head)',
      count: successCount,
      errors
    });
    console.log(`✓ Families head_of_family_id: ${successCount}/${mockFamilies.length} updated`);
  }

  private async migratePackageTemplates(): Promise<void> {
    console.log('📦 Migrating Package Templates...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('package_templates').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Package Templates - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'package_templates', count: existing.length, errors: [] });
      return;
    }

    for (const template of mockPackageTemplates) {
      try {
        const transformed = transformPackageTemplate(template);
        const { error } = await supabase.from('package_templates').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting template ${template.name}:`, error);
        errors.push({ data: template, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'package_templates',
      count: successCount,
      errors
    });
    console.log(`✓ Package Templates: ${successCount}/${mockPackageTemplates.length} migrated`);
  }

  private async migrateCouriers(): Promise<void> {
    console.log('🚚 Migrating Couriers...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('couriers').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Couriers - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'couriers', count: existing.length, errors: [] });
      return;
    }

    for (const courier of mockCouriers) {
      try {
        const transformed = transformCourier(courier);
        const { error } = await supabase.from('couriers').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting courier ${courier.name}:`, error);
        errors.push({ data: courier, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'couriers',
      count: successCount,
      errors
    });
    console.log(`✓ Couriers: ${successCount}/${mockCouriers.length} migrated`);
  }

  private async migratePackages(): Promise<void> {
    console.log('📦 Migrating Packages...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('packages').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Packages - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'packages', count: existing.length, errors: [] });
      return;
    }

    for (const pkg of mockPackages) {
      try {
        const transformed = transformPackage(pkg);
        const { error } = await supabase.from('packages').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting package ${pkg.name}:`, error);
        errors.push({ data: pkg, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'packages',
      count: successCount,
      errors
    });
    console.log(`✓ Packages: ${successCount}/${mockPackages.length} migrated`);
  }

  private async migrateTasks(): Promise<void> {
    console.log('✓ Migrating Tasks...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('tasks').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Tasks - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'tasks', count: existing.length, errors: [] });
      return;
    }

    for (const task of mockTasks) {
      try {
        const transformed = transformTask(task);
        const { error } = await supabase.from('tasks').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting task ${task.id}:`, error);
        errors.push({ data: task, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'tasks',
      count: successCount,
      errors
    });
    console.log(`✓ Tasks: ${successCount}/${mockTasks.length} migrated`);
  }

  private async migrateAlerts(): Promise<void> {
    console.log('🔔 Migrating Alerts...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('alerts').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Alerts - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'alerts', count: existing.length, errors: [] });
      return;
    }

    for (const alert of mockAlerts) {
      try {
        const transformed = transformAlert(alert);
        const { error } = await supabase.from('alerts').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting alert ${alert.id}:`, error);
        errors.push({ data: alert, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'alerts',
      count: successCount,
      errors
    });
    console.log(`✓ Alerts: ${successCount}/${mockAlerts.length} migrated`);
  }

  private async migrateActivityLog(): Promise<void> {
    console.log('📝 Migrating Activity Log...');
    const errors: any[] = [];
    let successCount = 0;

    const { data: existing } = await supabase.from('activity_log').select('id');
    if (existing && existing.length > 0) {
      console.log(`⚠️  Skipping Activity Log - ${existing.length} records already exist`);
      this.results.push({ success: true, table: 'activity_log', count: existing.length, errors: [] });
      return;
    }

    for (const log of mockActivityLog) {
      try {
        const transformed = transformActivityLog(log);
        const { error } = await supabase.from('activity_log').insert(transformed);
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error inserting activity log ${log.id}:`, error);
        errors.push({ data: log, error });
      }
    }

    this.results.push({
      success: errors.length === 0,
      table: 'activity_log',
      count: successCount,
      errors
    });
    console.log(`✓ Activity Log: ${successCount}/${mockActivityLog.length} migrated`);
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));

    let totalRecords = 0;
    let totalErrors = 0;

    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const errorMsg = result.errors.length > 0 ? ` (${result.errors.length} errors)` : '';
      console.log(`${status} ${result.table.padEnd(25)} ${result.count} records${errorMsg}`);
      totalRecords += result.count;
      totalErrors += result.errors.length;
    });

    console.log('='.repeat(60));
    console.log(`Total Records Migrated: ${totalRecords}`);
    console.log(`Total Errors: ${totalErrors}`);
    console.log('='.repeat(60) + '\n');
  }
}

export async function runMigration() {
  const migration = new DataMigration();
  const result = await migration.migrateAll();
  return result;
}
