import { supabase } from '../lib/supabaseClient';
import {
  mockOrganizations,
  mockFamilies,
  mockBeneficiaries,
  mockPackageTemplates,
  mockPackages,
  mockCouriers,
  mockTasks,
  mockAlerts,
  mockActivityLog,
  mockRoles,
  mockSystemUsers,
  mockPermissions
} from '../data/mockData';

export async function seedDatabase() {
  console.log('🌱 بدء نقل البيانات إلى Supabase...');

  try {
    console.log('📋 نقل الصلاحيات...');
    for (const permission of mockPermissions) {
      const { error } = await supabase
        .from('permissions')
        .upsert({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          category: permission.category
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل الصلاحية ${permission.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل الصلاحيات');

    console.log('👥 نقل الأدوار...');
    for (const role of mockRoles) {
      const { error } = await supabase
        .from('roles')
        .upsert({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          is_active: role.isActive,
          created_at: role.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل الدور ${role.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل الأدوار');

    console.log('🏢 نقل المؤسسات...');
    for (const org of mockOrganizations) {
      const { error } = await supabase
        .from('organizations')
        .upsert({
          id: org.id,
          name: org.name,
          type: org.type,
          location: org.location,
          contact_person: org.contactPerson,
          phone: org.phone,
          email: org.email,
          status: org.status,
          created_at: org.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل المؤسسة ${org.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل المؤسسات');

    console.log('👨‍👩‍👧‍👦 نقل العائلات...');
    for (const family of mockFamilies) {
      const { error } = await supabase
        .from('families')
        .upsert({
          id: family.id,
          family_name: family.name,
          head_of_family_name: family.headOfFamily,
          phone: family.phone,
          members_count: family.membersCount,
          location: family.location,
          created_at: family.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل العائلة ${family.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل العائلات');

    console.log('👤 نقل المستفيدين...');
    for (const beneficiary of mockBeneficiaries) {
      const { error } = await supabase
        .from('beneficiaries')
        .upsert({
          id: beneficiary.id,
          name: beneficiary.name,
          full_name: beneficiary.fullName,
          national_id: beneficiary.nationalId,
          date_of_birth: beneficiary.dateOfBirth,
          gender: beneficiary.gender,
          phone: beneficiary.phone,
          address: beneficiary.address,
          detailed_address: beneficiary.detailedAddress,
          location: beneficiary.location,
          organization_id: beneficiary.organizationId,
          family_id: beneficiary.familyId,
          relation_to_family: beneficiary.relationToFamily,
          is_head_of_family: beneficiary.isHeadOfFamily,
          spouse_id: beneficiary.spouseId,
          parent_id: beneficiary.parentId,
          medical_conditions: beneficiary.medicalConditions,
          profession: beneficiary.profession,
          marital_status: beneficiary.maritalStatus,
          economic_level: beneficiary.economicLevel,
          members_count: beneficiary.membersCount,
          additional_documents: beneficiary.additionalDocuments,
          identity_status: beneficiary.identityStatus,
          identity_image_url: beneficiary.identityImageUrl,
          status: beneficiary.status,
          eligibility_status: beneficiary.eligibilityStatus,
          last_received: beneficiary.lastReceived,
          total_packages: beneficiary.totalPackages,
          notes: beneficiary.notes,
          created_at: beneficiary.createdAt,
          updated_at: beneficiary.updatedAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل المستفيد ${beneficiary.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل المستفيدين');

    console.log('📦 نقل قوالب الطرود...');
    for (const template of mockPackageTemplates) {
      const { error } = await supabase
        .from('package_templates')
        .upsert({
          id: template.id,
          name: template.name,
          type: template.type,
          organization_id: template.organization_id,
          description: template.description,
          contents: template.contents,
          status: template.status,
          created_at: template.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل قالب الطرد ${template.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل قوالب الطرود');

    console.log('📦 نقل الطرود...');
    for (const pkg of mockPackages) {
      const { error } = await supabase
        .from('packages')
        .upsert({
          id: pkg.id,
          name: pkg.name,
          type: pkg.type,
          description: pkg.description,
          value: pkg.value,
          funder: pkg.funder,
          organization_id: pkg.organizationId,
          family_id: pkg.familyId,
          beneficiary_id: pkg.beneficiaryId,
          status: pkg.status,
          created_at: pkg.createdAt,
          delivered_at: pkg.deliveredAt,
          expiry_date: pkg.expiryDate
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل الطرد ${pkg.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل الطرود');

    console.log('🚚 نقل المندوبين...');
    for (const courier of mockCouriers) {
      const { error } = await supabase
        .from('couriers')
        .upsert({
          id: courier.id,
          name: courier.name,
          phone: courier.phone,
          email: courier.email,
          status: courier.status,
          rating: courier.rating,
          completed_tasks: courier.completedTasks,
          current_location: courier.currentLocation,
          is_humanitarian_approved: courier.isHumanitarianApproved
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل المندوب ${courier.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل المندوبين');

    console.log('📋 نقل المهام...');
    for (const task of mockTasks) {
      const { error } = await supabase
        .from('tasks')
        .upsert({
          id: task.id,
          package_id: task.packageId,
          beneficiary_id: task.beneficiaryId,
          courier_id: task.courierId,
          status: task.status,
          created_at: task.createdAt,
          scheduled_at: task.scheduledAt,
          delivered_at: task.deliveredAt,
          delivery_location: task.deliveryLocation,
          notes: task.notes,
          courier_notes: task.courierNotes,
          delivery_proof_image_url: task.deliveryProofImageUrl,
          digital_signature_image_url: task.digitalSignatureImageUrl,
          estimated_arrival_time: task.estimatedArrivalTime,
          remaining_distance: task.remainingDistance,
          failure_reason: task.failureReason
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل المهمة ${task.id}:`, error.message);
      }
    }
    console.log('✅ تم نقل المهام');

    console.log('🔔 نقل التنبيهات...');
    for (const alert of mockAlerts) {
      const { error } = await supabase
        .from('alerts')
        .upsert({
          id: alert.id,
          type: alert.type,
          title: alert.title,
          description: alert.description,
          related_id: alert.relatedId,
          related_type: alert.relatedType,
          priority: alert.priority,
          is_read: alert.isRead,
          created_at: alert.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل التنبيه ${alert.title}:`, error.message);
      }
    }
    console.log('✅ تم نقل التنبيهات');

    console.log('📝 نقل سجل النشاط...');
    for (const activity of mockActivityLog) {
      const { error } = await supabase
        .from('activity_log')
        .upsert({
          id: activity.id,
          action: activity.action,
          user_name: activity.user,
          user_role: activity.role,
          timestamp: activity.timestamp,
          action_type: activity.type,
          beneficiary_id: activity.beneficiaryId,
          details: activity.details
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل سجل النشاط ${activity.id}:`, error.message);
      }
    }
    console.log('✅ تم نقل سجل النشاط');

    console.log('👨‍💼 نقل مستخدمي النظام...');
    for (const user of mockSystemUsers) {
      const { error } = await supabase
        .from('system_users')
        .upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role_id: user.roleId,
          associated_id: user.associatedId,
          associated_type: user.associatedType,
          status: user.status,
          last_login: user.lastLogin,
          created_at: user.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ فشل نقل المستخدم ${user.name}:`, error.message);
      }
    }
    console.log('✅ تم نقل مستخدمي النظام');

    console.log('✅ تم نقل جميع البيانات بنجاح!');
    return { success: true };

  } catch (error) {
    console.error('❌ حدث خطأ أثناء نقل البيانات:', error);
    return { success: false, error };
  }
}
