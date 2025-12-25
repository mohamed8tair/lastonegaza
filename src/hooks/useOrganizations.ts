import { useState, useEffect, useMemo } from 'react';
import { organizationsService } from '../services/supabaseService';
import { useErrorLogger } from '../utils/errorLogger';
import type { Database } from '../types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];

interface UseOrganizationsOptions {
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
}

export const useOrganizations = (options: UseOrganizationsOptions = {}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await organizationsService.getAll();
      setOrganizations(data);
      logInfo(`تم تحميل ${data.length} مؤسسة من Supabase`, 'useOrganizations');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المؤسسات';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useOrganizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const filteredOrganizations = useMemo(() => {
    let filtered = [...organizations];

    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filtered = filtered.filter(org =>
        org.name?.toLowerCase().includes(searchLower) ||
        org.type?.toLowerCase().includes(searchLower) ||
        org.location?.toLowerCase().includes(searchLower)
      );
    }

    if (options.statusFilter && options.statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === options.statusFilter);
    }

    if (options.typeFilter && options.typeFilter !== 'all') {
      filtered = filtered.filter(org => org.type?.includes(options.typeFilter!));
    }

    return filtered;
  }, [organizations, options.searchTerm, options.statusFilter, options.typeFilter]);

  const statistics = useMemo(() => {
    return {
      total: organizations.length,
      active: organizations.filter(org => org.status === 'active').length,
      pending: organizations.filter(org => org.status === 'pending').length,
      suspended: organizations.filter(org => org.status === 'suspended').length,
      totalBeneficiaries: organizations.reduce((sum, org) => sum + (org.beneficiaries_count || 0), 0),
      totalPackages: organizations.reduce((sum, org) => sum + (org.packages_count || 0), 0)
    };
  }, [organizations]);

  const addOrganization = async (orgData: OrganizationInsert) => {
    try {
      setLoading(true);
      const newOrganization = await organizationsService.create(orgData);

      if (newOrganization) {
        setOrganizations(prev => [newOrganization, ...prev]);
        logInfo(`تم إضافة مؤسسة جديدة: ${newOrganization.name}`, 'useOrganizations');
        return newOrganization;
      }

      throw new Error('فشل في إضافة المؤسسة');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة المؤسسة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useOrganizations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      setLoading(true);
      const updated = await organizationsService.update(id, updates);

      if (updated) {
        setOrganizations(prev =>
          prev.map(org => org.id === id ? updated : org)
        );
        logInfo(`تم تحديث المؤسسة: ${id}`, 'useOrganizations');
        return updated;
      }

      throw new Error('فشل في تحديث المؤسسة');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث المؤسسة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useOrganizations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchOrganizations();
  };

  return {
    organizations: filteredOrganizations,
    allOrganizations: organizations,
    loading,
    error,
    statistics,
    addOrganization,
    updateOrganization,
    refetch
  };
};

export const useOrganization = (id: string) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await organizationsService.getById(id);
          setOrganization(data);
          setError(data ? null : 'المؤسسة غير موجودة');
        } catch (err) {
          setError('خطأ في تحميل المؤسسة');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrganization();
  }, [id]);

  return { organization, loading, error };
};
