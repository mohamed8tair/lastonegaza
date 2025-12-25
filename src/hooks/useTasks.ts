import { useState, useEffect } from 'react';
import { tasksService } from '../services/supabaseService';
import { useErrorLogger } from '../utils/errorLogger';
import type { Database } from '../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

interface UseTasksOptions {
  courierId?: string;
  beneficiaryId?: string;
  status?: string;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await tasksService.getAll();
      let filtered = data;

      if (options.courierId) {
        filtered = filtered.filter(t => t.courier_id === options.courierId);
      }

      if (options.beneficiaryId) {
        filtered = filtered.filter(t => t.beneficiary_id === options.beneficiaryId);
      }

      if (options.status) {
        filtered = filtered.filter(t => t.status === options.status);
      }

      setTasks(filtered);
      logInfo(`تم تحميل ${filtered.length} مهمة من Supabase`, 'useTasks');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المهام';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useTasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [options.courierId, options.beneficiaryId, options.status]);

  const addTask = async (taskData: TaskInsert) => {
    try {
      setLoading(true);
      const newTask = await tasksService.create(taskData);

      if (newTask) {
        setTasks(prev => [newTask, ...prev]);
        logInfo(`تم إضافة مهمة جديدة`, 'useTasks');
        return newTask;
      }

      throw new Error('فشل في إضافة المهمة');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة المهمة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useTasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      setLoading(true);
      const updated = await tasksService.update(id, updates);

      if (updated) {
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        logInfo(`تم تحديث المهمة: ${id}`, 'useTasks');
        return updated;
      }

      throw new Error('فشل في تحديث المهمة');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث المهمة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useTasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      await tasksService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      logInfo(`تم حذف المهمة: ${id}`, 'useTasks');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف المهمة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useTasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refetch
  };
};
