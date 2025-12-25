import { useState, useEffect } from 'react';
import { packagesService, packageTemplatesService } from '../services/supabaseService';
import { useErrorLogger } from '../utils/errorLogger';
import type { Database } from '../types/database';

type Package = Database['public']['Tables']['packages']['Row'];
type PackageInsert = Database['public']['Tables']['packages']['Insert'];
type PackageUpdate = Database['public']['Tables']['packages']['Update'];

type PackageTemplate = Database['public']['Tables']['package_templates']['Row'];

interface UsePackagesOptions {
  organizationId?: string;
  beneficiaryId?: string;
  status?: string;
}

export const usePackages = (options: UsePackagesOptions = {}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await packagesService.getAll();
      let filtered = data;

      if (options.organizationId) {
        filtered = filtered.filter(p => p.organization_id === options.organizationId);
      }

      if (options.beneficiaryId) {
        filtered = filtered.filter(p => p.beneficiary_id === options.beneficiaryId);
      }

      if (options.status) {
        filtered = filtered.filter(p => p.status === options.status);
      }

      setPackages(filtered);
      logInfo(`تم تحميل ${filtered.length} حزمة من Supabase`, 'usePackages');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل الحزم';
      setError(errorMessage);
      logError(new Error(errorMessage), 'usePackages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [options.organizationId, options.beneficiaryId, options.status]);

  const addPackage = async (packageData: PackageInsert) => {
    try {
      setLoading(true);
      const newPackage = await packagesService.create(packageData);

      if (newPackage) {
        setPackages(prev => [newPackage, ...prev]);
        logInfo(`تم إضافة حزمة جديدة`, 'usePackages');
        return newPackage;
      }

      throw new Error('فشل في إضافة الحزمة');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة الحزمة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'usePackages');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (id: string, updates: PackageUpdate) => {
    try {
      setLoading(true);
      const updated = await packagesService.update(id, updates);

      if (updated) {
        setPackages(prev => prev.map(p => p.id === id ? updated : p));
        logInfo(`تم تحديث الحزمة: ${id}`, 'usePackages');
        return updated;
      }

      throw new Error('فشل في تحديث الحزمة');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث الحزمة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'usePackages');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      setLoading(true);
      await packagesService.delete(id);
      setPackages(prev => prev.filter(p => p.id !== id));
      logInfo(`تم حذف الحزمة: ${id}`, 'usePackages');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف الحزمة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'usePackages');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPackages();
  };

  return {
    packages,
    loading,
    error,
    addPackage,
    updatePackage,
    deletePackage,
    refetch
  };
};

export const usePackageTemplates = () => {
  const [templates, setTemplates] = useState<PackageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await packageTemplatesService.getAll();
      setTemplates(data);
      logInfo(`تم تحميل ${data.length} قالب حزمة من Supabase`, 'usePackageTemplates');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل قوالب الحزم';
      setError(errorMessage);
      logError(new Error(errorMessage), 'usePackageTemplates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const refetch = () => {
    fetchTemplates();
  };

  return {
    templates,
    loading,
    error,
    refetch
  };
};
