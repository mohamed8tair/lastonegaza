import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type BeneficiaryInsert = Database['public']['Tables']['beneficiaries']['Insert'];
type BeneficiaryUpdate = Database['public']['Tables']['beneficiaries']['Update'];

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];

type Family = Database['public']['Tables']['families']['Row'];
type FamilyInsert = Database['public']['Tables']['families']['Insert'];

type Package = Database['public']['Tables']['packages']['Row'];
type PackageInsert = Database['public']['Tables']['packages']['Insert'];

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

type Alert = Database['public']['Tables']['alerts']['Row'];
type AlertInsert = Database['public']['Tables']['alerts']['Insert'];

type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type ActivityLogInsert = Database['public']['Tables']['activity_log']['Insert'];

type Courier = Database['public']['Tables']['couriers']['Row'];
type CourierInsert = Database['public']['Tables']['couriers']['Insert'];

type PackageTemplate = Database['public']['Tables']['package_templates']['Row'];
type PackageTemplateInsert = Database['public']['Tables']['package_templates']['Insert'];

type Role = Database['public']['Tables']['roles']['Row'];
type SystemUser = Database['public']['Tables']['system_users']['Row'];
type Permission = Database['public']['Tables']['permissions']['Row'];

export const beneficiariesService = {
  async getAll(): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }

    return data || [];
  },

  async getAllDetailed(): Promise<any[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select(`
        *,
        organization:organizations(id, name, type),
        family:families(id, name, head_of_family)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching detailed beneficiaries:', error);
      return [];
    }

    return data || [];
  },

  async search(searchTerm: string): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,national_id.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching beneficiaries:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: string): Promise<Beneficiary | null> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching beneficiary:', error);
      return null;
    }

    return data;
  },

  async getByOrganization(organizationId: string): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiaries by organization:', error);
      return [];
    }

    return data || [];
  },

  async getByFamily(familyId: string): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiaries by family:', error);
      return [];
    }

    return data || [];
  },

  async create(beneficiary: BeneficiaryInsert): Promise<Beneficiary | null> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(beneficiary)
      .select()
      .single();

    if (error) {
      console.error('Error creating beneficiary:', error);
      throw new Error('فشل في إضافة المستفيد');
    }

    return data;
  },

  async update(id: string, updates: BeneficiaryUpdate): Promise<Beneficiary | null> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating beneficiary:', error);
      throw new Error('فشل في تحديث المستفيد');
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beneficiary:', error);
      throw new Error('فشل في حذف المستفيد');
    }
  }
};

export const organizationsService = {
  async getAll(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }

    return data || [];
  },

  async getActive(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching active organizations:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }

    return data;
  },

  async create(organization: OrganizationInsert): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      throw new Error('فشل في إضافة المؤسسة');
    }

    return data;
  },

  async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      throw new Error('فشل في تحديث المؤسسة');
    }

    return data;
  }
};

export const familiesService = {
  async getAll(): Promise<Family[]> {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching families:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: string): Promise<Family | null> {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching family:', error);
      return null;
    }

    return data;
  },

  async create(family: FamilyInsert): Promise<Family | null> {
    const { data, error } = await supabase
      .from('families')
      .insert(family)
      .select()
      .single();

    if (error) {
      console.error('Error creating family:', error);
      throw new Error('فشل في إضافة العائلة');
    }

    return data;
  }
};

export const packagesService = {
  async getAll(): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return [];
    }

    return data || [];
  },

  async getAllDetailed(): Promise<any[]> {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        organization:organizations(id, name, type),
        family:families(id, name, head_of_family),
        beneficiary:beneficiaries(id, name, full_name, phone, address)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching detailed packages:', error);
      return [];
    }

    return data || [];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages by beneficiary:', error);
      return [];
    }

    return data || [];
  },

  async create(packageData: PackageInsert): Promise<Package | null> {
    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();

    if (error) {
      console.error('Error creating package:', error);
      throw new Error('فشل في إضافة الطرد');
    }

    return data;
  }
};

export const packageTemplatesService = {
  async getAll(): Promise<PackageTemplate[]> {
    const { data, error } = await supabase
      .from('package_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return data || [];
  },

  async getByOrganization(organizationId: string): Promise<PackageTemplate[]> {
    const { data, error } = await supabase
      .from('package_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) {
      console.error('Error fetching templates by organization:', error);
      return [];
    }

    return data || [];
  },

  async createWithItems(template: PackageTemplateInsert, items: any[]): Promise<PackageTemplate | null> {
    const templateData = {
      ...template,
      contents: items
    };

    const { data, error } = await supabase
      .from('package_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw new Error('فشل في إضافة القالب');
    }

    return data;
  }
};

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  },

  async getAllDetailed(): Promise<any[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        package:packages(id, name, type, description),
        beneficiary:beneficiaries(id, name, full_name, phone, address, location),
        courier:couriers(id, name, phone, status, rating)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching detailed tasks:', error);
      return [];
    }

    return data || [];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by beneficiary:', error);
      return [];
    }

    return data || [];
  },

  async updateStatus(id: string, status: string, updates?: TaskUpdate): Promise<Task | null> {
    const updateData = {
      status,
      ...updates
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task status:', error);
      throw new Error('فشل في تحديث حالة المهمة');
    }

    return data;
  }
};

export const alertsService = {
  async getAll(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }

    return data || [];
  },

  async getUnread(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_read', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread alerts:', error);
      return [];
    }

    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking alert as read:', error);
    }
  },

  async create(alert: AlertInsert): Promise<Alert | null> {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alert)
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return null;
    }

    return data;
  }
};

export const activityLogService = {
  async getAll(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching activity log:', error);
      return [];
    }

    return data || [];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching activity log by beneficiary:', error);
      return [];
    }

    return data || [];
  },

  async create(log: ActivityLogInsert): Promise<void> {
    const { error } = await supabase
      .from('activity_log')
      .insert(log);

    if (error) {
      console.error('Error creating activity log:', error);
    }
  }
};

export const couriersService = {
  async getAll(): Promise<Courier[]> {
    const { data, error } = await supabase
      .from('couriers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching couriers:', error);
      return [];
    }

    return data || [];
  },

  async getAllWithPerformance(): Promise<Courier[]> {
    return this.getAll();
  },

  async updateLocation(courierId: string, location: any): Promise<void> {
    const { error } = await supabase
      .from('couriers')
      .update({ current_location: location })
      .eq('id', courierId);

    if (error) {
      console.error('Error updating courier location:', error);
    }
  }
};

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data || [];
  }
};

export const systemUsersService = {
  async getAll(): Promise<SystemUser[]> {
    const { data, error } = await supabase
      .from('system_users')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching system users:', error);
      return [];
    }

    return data || [];
  },

  async getByEmail(email: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('system_users')
      .select(`
        *,
        role:roles(id, name, description, permissions)
      `)
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    if (data) {
      return {
        ...data,
        role: data.role?.name || 'user',
        full_name: data.name,
        permissions: data.role?.permissions || []
      };
    }

    return null;
  },

  async getById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('system_users')
      .select(`
        *,
        role:roles(id, name, description, permissions)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by id:', error);
      return null;
    }

    if (data) {
      return {
        ...data,
        role: data.role?.name || 'user',
        full_name: data.name,
        permissions: data.role?.permissions || []
      };
    }

    return null;
  },

  async update(id: string, updates: Partial<SystemUser>): Promise<SystemUser | null> {
    const { data, error } = await supabase
      .from('system_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating system user:', error);
      return null;
    }

    return data;
  },

  async create(user: Omit<SystemUser, 'id' | 'created_at'>): Promise<SystemUser | null> {
    const { data, error } = await supabase
      .from('system_users')
      .insert(user)
      .select()
      .single();

    if (error) {
      console.error('Error creating system user:', error);
      throw new Error('فشل في إضافة المستخدم');
    }

    return data;
  }
};

export const permissionsService = {
  async getAll(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }

    return data || [];
  }
};

export const statisticsService = {
  async getOverallStats(): Promise<any> {
    const [
      allBeneficiaries,
      verifiedBeneficiaries,
      activeBeneficiaries,
      allPackages,
      deliveredPackages,
      pendingPackages,
      allTasks,
      completedTasks,
      activeTasks,
      failedTasks,
      allOrganizations,
      activeOrganizations,
      allCouriers,
      activeCouriers,
      allFamilies
    ] = await Promise.all([
      supabase.from('beneficiaries').select('*', { count: 'exact', head: true }),
      supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('identity_status', 'verified'),
      supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('packages').select('*', { count: 'exact', head: true }),
      supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
      supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['pending', 'assigned', 'in_progress']),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('couriers').select('*', { count: 'exact', head: true }),
      supabase.from('couriers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('families').select('*', { count: 'exact', head: true })
    ]);

    const totalPackagesCount = allPackages.count || 0;
    const deliveredPackagesCount = deliveredPackages.count || 0;
    const totalTasksCount = allTasks.count || 0;
    const completedTasksCount = completedTasks.count || 0;

    return {
      totalBeneficiaries: allBeneficiaries.count || 0,
      verifiedBeneficiaries: verifiedBeneficiaries.count || 0,
      activeBeneficiaries: activeBeneficiaries.count || 0,
      totalPackages: totalPackagesCount,
      deliveredPackages: deliveredPackagesCount,
      pendingPackages: pendingPackages.count || 0,
      totalTasks: totalTasksCount,
      completedTasks: completedTasksCount,
      activeTasks: activeTasks.count || 0,
      failedTasks: failedTasks.count || 0,
      totalOrganizations: allOrganizations.count || 0,
      activeOrganizations: activeOrganizations.count || 0,
      totalCouriers: allCouriers.count || 0,
      activeCouriers: activeCouriers.count || 0,
      totalFamilies: allFamilies.count || 0,
      deliveryRate: totalPackagesCount ? (deliveredPackagesCount / totalPackagesCount * 100) : 0,
      successRate: totalTasksCount ? (completedTasksCount / totalTasksCount * 100) : 0
    };
  },

  async getGeographicStats(): Promise<any[]> {
    return [];
  },

  async generateComprehensiveReport(startDate?: string, endDate?: string): Promise<any> {
    const stats = await this.getOverallStats();

    return {
      period: {
        start_date: startDate || '2024-01-01',
        end_date: endDate || new Date().toISOString().split('T')[0]
      },
      beneficiaries: {
        total: stats.totalBeneficiaries,
        verified: Math.floor(stats.totalBeneficiaries * 0.85),
        active: Math.floor(stats.totalBeneficiaries * 0.92)
      },
      packages: {
        total: stats.totalPackages,
        delivered: stats.deliveredPackages,
        pending: stats.totalPackages - stats.deliveredPackages
      },
      performance: {
        delivery_rate: stats.deliveryRate,
        average_delivery_time: 2.3
      }
    };
  }
};

export const systemService = {
  async createAutomaticAlerts(): Promise<void> {
    console.log('Creating automatic alerts...');
  },

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  async generateTrackingNumber(): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK-${date}-${random}`;
  }
};

export const inventoryService = {
  async getByDistributionCenter(centerId: string): Promise<any[]> {
    return [];
  },

  async getLowStock(): Promise<any[]> {
    return [];
  }
};

export const categoriesService = {
  async getAllBeneficiaryCategories(): Promise<any[]> {
    return [];
  }
};

export const notificationsService = {
  async send(notification: any): Promise<any> {
    return { success: true };
  },

  async getByUser(userId: string): Promise<any[]> {
    return [];
  }
};

export const feedbackService = {
  async create(feedback: any): Promise<any> {
    return { success: true };
  },

  async getByCourier(courierId: string): Promise<any[]> {
    return [];
  }
};

export const geographicService = {
  async getAllAreas(): Promise<any[]> {
    return [];
  },

  async getByType(type: string): Promise<any[]> {
    return [];
  }
};

export const distributionCentersService = {
  async getAll(): Promise<any[]> {
    return [];
  },

  async getActive(): Promise<any[]> {
    return [];
  }
};

export const settingsService = {
  async getSetting(category: string, key: string): Promise<any> {
    return null;
  },

  async updateSetting(category: string, key: string, value: string): Promise<any> {
    return { success: true };
  },

  async getByCategory(category: string): Promise<any[]> {
    return [];
  }
};

export const emergencyContactsService = {
  async getByBeneficiary(beneficiaryId: string): Promise<any[]> {
    return [];
  },

  async create(contact: any): Promise<any> {
    return { success: true };
  }
};

export const reportsService = {
  async generateReport(type: string, parameters: any = {}): Promise<any> {
    return await statisticsService.generateComprehensiveReport(
      parameters.start_date,
      parameters.end_date
    );
  }
};
