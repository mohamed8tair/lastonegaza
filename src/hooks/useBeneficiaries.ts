import { useState, useEffect, useMemo } from 'react';
import { beneficiariesService } from '../services/supabaseService';
import { useErrorLogger } from '../utils/errorLogger';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type BeneficiaryInsert = Database['public']['Tables']['beneficiaries']['Insert'];
type BeneficiaryUpdate = Database['public']['Tables']['beneficiaries']['Update'];

interface UseBeneficiariesOptions {
  organizationId?: string;
  familyId?: string;
  searchTerm?: string;
  statusFilter?: string;
  identityStatusFilter?: string;
  useDetailed?: boolean;
}

export const useBeneficiaries = (options: UseBeneficiariesOptions = {}) => {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: any[] = [];

      if (options.organizationId) {
        data = await beneficiariesService.getByOrganization(options.organizationId);
      } else if (options.familyId) {
        data = await beneficiariesService.getByFamily(options.familyId);
      } else if (options.useDetailed) {
        data = await beneficiariesService.getAllDetailed();
      } else {
        data = await beneficiariesService.getAll();
      }

      setBeneficiaries(data);
      logInfo(`تم تحميل ${data.length} مستفيد من Supabase`, 'useBeneficiaries');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المستفيدين';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [options.organizationId, options.familyId, options.useDetailed]);

  const filteredBeneficiaries = useMemo(() => {
    let filtered = [...beneficiaries];

    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.name?.toLowerCase().includes(searchLower) ||
        b.full_name?.toLowerCase().includes(searchLower) ||
        b.national_id?.includes(options.searchTerm!) ||
        b.phone?.includes(options.searchTerm!)
      );
    }

    if (options.statusFilter && options.statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === options.statusFilter);
    }

    if (options.identityStatusFilter && options.identityStatusFilter !== 'all') {
      filtered = filtered.filter(b => b.identity_status === options.identityStatusFilter);
    }

    return filtered;
  }, [beneficiaries, options.searchTerm, options.statusFilter, options.identityStatusFilter]);

  const statistics = useMemo(() => {
    return {
      total: beneficiaries.length,
      verified: beneficiaries.filter(b => b.identity_status === 'verified').length,
      pending: beneficiaries.filter(b => b.identity_status === 'pending').length,
      rejected: beneficiaries.filter(b => b.identity_status === 'rejected').length,
      active: beneficiaries.filter(b => b.status === 'active').length,
      suspended: beneficiaries.filter(b => b.status === 'suspended').length
    };
  }, [beneficiaries]);

  const addBeneficiary = async (beneficiaryData: BeneficiaryInsert) => {
    try {
      setLoading(true);
      const newBeneficiary = await beneficiariesService.create(beneficiaryData);

      if (newBeneficiary) {
        setBeneficiaries(prev => [newBeneficiary, ...prev]);
        logInfo(`تم إضافة مستفيد جديد: ${newBeneficiary.name}`, 'useBeneficiaries');
        return newBeneficiary;
      }

      throw new Error('فشل في إضافة المستفيد');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBeneficiary = async (id: string, updates: BeneficiaryUpdate) => {
    try {
      setLoading(true);
      const updated = await beneficiariesService.update(id, updates);

      if (updated) {
        setBeneficiaries(prev =>
          prev.map(b => b.id === id ? updated : b)
        );
        logInfo(`تم تحديث المستفيد: ${id}`, 'useBeneficiaries');
        return updated;
      }

      throw new Error('فشل في تحديث المستفيد');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBeneficiary = async (id: string) => {
    try {
      setLoading(true);
      await beneficiariesService.delete(id);
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      logInfo(`تم حذف المستفيد: ${id}`, 'useBeneficiaries');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchBeneficiaries();
  };

  return {
    beneficiaries: filteredBeneficiaries,
    allBeneficiaries: beneficiaries,
    loading,
    error,
    statistics,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    refetch
  };
};

export const useBeneficiary = (id: string) => {
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeneficiary = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await beneficiariesService.getById(id);
          setBeneficiary(data);
          setError(data ? null : 'المستفيد غير موجود');
        } catch (err) {
          setError('خطأ في تحميل المستفيد');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBeneficiary();
  }, [id]);

  return { beneficiary, loading, error };
};
