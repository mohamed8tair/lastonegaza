export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function transformObjectKeys(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformObjectKeys);
  if (typeof obj !== 'object') return obj;

  const transformed: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformObjectKeys(obj[key]);
    }
  }
  return transformed;
}

export function transformDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const date = new Date(dateStr);
  return date.toISOString();
}

export function transformOrganization(org: any) {
  return {
    id: org.id,
    name: org.name,
    type: org.type,
    location: org.location,
    contact_person: org.contactPerson,
    phone: org.phone,
    email: org.email,
    beneficiaries_count: org.beneficiariesCount || 0,
    packages_count: org.packagesCount || 0,
    completion_rate: org.completionRate || 0,
    status: org.status,
    created_at: transformDate(org.createdAt),
    packages_available: org.packagesAvailable || 0,
    templates_count: org.templatesCount || 0,
    is_popular: org.isPopular || false
  };
}

export function transformFamily(family: any) {
  return {
    id: family.id,
    name: family.name,
    head_of_family: family.headOfFamily,
    phone: family.phone,
    members_count: family.membersCount || 0,
    packages_distributed: family.packagesDistributed || 0,
    completion_rate: family.completionRate || 0,
    location: family.location,
    created_at: transformDate(family.createdAt)
  };
}

export function transformBeneficiary(beneficiary: any) {
  return {
    id: beneficiary.id,
    name: beneficiary.name,
    full_name: beneficiary.fullName,
    national_id: beneficiary.nationalId,
    date_of_birth: beneficiary.dateOfBirth,
    gender: beneficiary.gender,
    phone: beneficiary.phone,
    address: beneficiary.address,
    detailed_address: beneficiary.detailedAddress || {},
    location: beneficiary.location || { lat: 31.5, lng: 34.5 },
    organization_id: beneficiary.organizationId || null,
    family_id: beneficiary.familyId || null,
    relation_to_family: beneficiary.relationToFamily || null,
    profession: beneficiary.profession || '',
    marital_status: beneficiary.maritalStatus || 'single',
    economic_level: beneficiary.economicLevel || 'poor',
    members_count: beneficiary.membersCount || 1,
    additional_documents: beneficiary.additionalDocuments || [],
    identity_status: beneficiary.identityStatus || 'pending',
    identity_image_url: beneficiary.identityImageUrl || null,
    status: beneficiary.status || 'active',
    eligibility_status: beneficiary.eligibilityStatus || 'under_review',
    last_received: beneficiary.lastReceived || null,
    total_packages: beneficiary.totalPackages || 0,
    notes: beneficiary.notes || '',
    created_at: transformDate(beneficiary.createdAt),
    updated_at: transformDate(beneficiary.updatedAt),
    created_by: beneficiary.createdBy || null,
    updated_by: beneficiary.updatedBy || null
  };
}

export function transformPackage(pkg: any) {
  return {
    id: pkg.id,
    name: pkg.name,
    type: pkg.type,
    description: pkg.description || '',
    value: pkg.value || 0,
    funder: pkg.funder || '',
    organization_id: pkg.organizationId || null,
    family_id: pkg.familyId || null,
    beneficiary_id: pkg.beneficiaryId || null,
    status: pkg.status || 'pending',
    created_at: transformDate(pkg.createdAt),
    delivered_at: pkg.deliveredAt ? transformDate(pkg.deliveredAt) : null,
    expiry_date: pkg.expiryDate || null
  };
}

export function transformPackageTemplate(template: any) {
  return {
    id: template.id,
    name: template.name,
    type: template.type,
    organization_id: template.organization_id || null,
    description: template.description || '',
    contents: template.contents || [],
    status: template.status || 'active',
    created_at: transformDate(template.createdAt),
    usage_count: template.usageCount || 0,
    total_weight: template.totalWeight || 0,
    estimated_cost: template.estimatedCost || 0
  };
}

export function transformCourier(courier: any) {
  return {
    id: courier.id,
    name: courier.name,
    phone: courier.phone,
    email: courier.email,
    status: courier.status || 'active',
    rating: courier.rating || 0,
    completed_tasks: courier.completedTasks || 0,
    current_location: courier.currentLocation || { lat: 31.5, lng: 34.5 },
    is_humanitarian_approved: courier.isHumanitarianApproved || false,
    created_at: new Date().toISOString()
  };
}

export function transformTask(task: any) {
  return {
    id: task.id,
    package_id: task.packageId,
    beneficiary_id: task.beneficiaryId,
    courier_id: task.courierId || null,
    status: task.status || 'pending',
    created_at: transformDate(task.createdAt),
    scheduled_at: task.scheduledAt ? transformDate(task.scheduledAt) : null,
    delivered_at: task.deliveredAt ? transformDate(task.deliveredAt) : null,
    delivery_location: task.deliveryLocation || null,
    notes: task.notes || '',
    courier_notes: task.courierNotes || '',
    delivery_proof_image_url: task.deliveryProofImageUrl || null,
    digital_signature_image_url: task.digitalSignatureImageUrl || null,
    estimated_arrival_time: task.estimatedArrivalTime ? transformDate(task.estimatedArrivalTime) : null,
    remaining_distance: task.remainingDistance || null,
    photo_url: task.photoUrl || null,
    failure_reason: task.failureReason || null
  };
}

export function transformAlert(alert: any) {
  return {
    id: alert.id,
    type: alert.type,
    title: alert.title,
    message: alert.message,
    beneficiary_id: alert.beneficiaryId || null,
    priority: alert.priority || 'medium',
    status: alert.status || 'unread',
    created_at: transformDate(alert.createdAt),
    read_at: alert.readAt ? transformDate(alert.readAt) : null
  };
}

export function transformActivityLog(log: any) {
  return {
    id: log.id,
    action: log.action,
    user_name: log.user,
    user_role: log.role,
    details: log.details || '',
    timestamp: transformDate(log.timestamp)
  };
}

export function transformRole(role: any) {
  return {
    id: role.id,
    name: role.name,
    description: role.description || '',
    permissions: role.permissions || [],
    user_count: role.userCount || 0,
    is_active: role.isActive !== false,
    created_at: transformDate(role.createdAt || new Date().toISOString())
  };
}

export function transformSystemUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role_id: user.roleId,
    status: user.status || 'active',
    last_login: user.lastLogin ? transformDate(user.lastLogin) : null,
    created_at: transformDate(user.createdAt || new Date().toISOString())
  };
}

export function transformPermission(permission: any) {
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description || '',
    category: permission.category,
    created_at: transformDate(permission.createdAt || new Date().toISOString())
  };
}
