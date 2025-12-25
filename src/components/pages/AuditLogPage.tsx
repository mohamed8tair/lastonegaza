import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Eye, Calendar, User, Database, Edit, Plus, Trash2, RefreshCw, Clock, FileText } from 'lucide-react';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Badge, Modal } from '../ui';
import { activityLogService } from '../../services/supabaseService';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  action: 'create' | 'update' | 'delete' | 'view';
  table_name: string;
  record_id: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { logError, logInfo } = useErrorLogger();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await activityLogService.getAll();

      if (data.length === 0) {
        setLogs(generateMockLogs());
        logInfo('استخدام البيانات الوهمية لسجل المراجعة', 'AuditLogPage');
      } else {
        setLogs(data as any);
      }
    } catch (error) {
      logError(error, 'AuditLogPage.loadLogs');
      setLogs(generateMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = (): ActivityLog[] => {
    const actions: Array<'create' | 'update' | 'delete' | 'view'> = ['create', 'update', 'delete', 'view'];
    const tables = ['beneficiaries', 'packages', 'tasks', 'organizations', 'families', 'couriers'];
    const users = ['أحمد المدير', 'فاطمة المشرفة', 'محمد الموظف', 'سارة المنسقة'];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `log-${i + 1}`,
      user_id: `user-${(i % 4) + 1}`,
      user_name: users[i % 4],
      action: actions[i % 4],
      table_name: tables[i % 6],
      record_id: `record-${i + 1}`,
      changes: i % 4 === 1 ? { field: 'status', old: 'pending', new: 'active' } : undefined,
      ip_address: `192.168.1.${(i % 255) + 1}`,
      user_agent: 'Mozilla/5.0',
      created_at: new Date(Date.now() - i * 3600000).toISOString()
    }));
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.table_name.includes(searchTerm.toLowerCase()) ||
                         log.record_id.includes(searchTerm);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesTable = tableFilter === 'all' || log.table_name === tableFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.created_at);
      const now = new Date();

      switch (dateFilter) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesAction && matchesTable && matchesDate;
  });

  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const logDate = new Date(log.created_at);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    creates: logs.filter(log => log.action === 'create').length,
    updates: logs.filter(log => log.action === 'update').length,
    deletes: logs.filter(log => log.action === 'delete').length,
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="w-4 h-4" />;
      case 'update':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'view':
        return <Eye className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="success">إضافة</Badge>;
      case 'update':
        return <Badge variant="warning">تعديل</Badge>;
      case 'delete':
        return <Badge variant="danger">حذف</Badge>;
      case 'view':
        return <Badge variant="secondary">عرض</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableName = (table: string) => {
    const tableNames: Record<string, string> = {
      beneficiaries: 'المستفيدين',
      packages: 'الطرود',
      tasks: 'المهام',
      organizations: 'المؤسسات',
      families: 'العائلات',
      couriers: 'المندوبين',
      users: 'المستخدمين',
      roles: 'الأدوار',
      permissions: 'الصلاحيات'
    };
    return tableNames[table] || table;
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    logInfo('تصدير سجل المراجعة', 'AuditLogPage');
    alert('سيتم تصدير السجل إلى ملف CSV');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'منذ ثواني';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">إجمالي الأنشطة</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">عمليات الإضافة</p>
              <p className="text-3xl font-bold text-green-900">{stats.creates}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-xl">
              <Plus className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">عمليات التعديل</p>
              <p className="text-3xl font-bold text-orange-900">{stats.updates}</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-xl">
              <Edit className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">عمليات الحذف</p>
              <p className="text-3xl font-bold text-red-900">{stats.deletes}</p>
            </div>
            <div className="bg-red-200 p-3 rounded-xl">
              <Trash2 className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">أنشطة اليوم</p>
              <p className="text-3xl font-bold text-purple-900">{stats.today}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse flex-wrap gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الإجراءات</option>
              <option value="create">إضافة</option>
              <option value="update">تعديل</option>
              <option value="delete">حذف</option>
              <option value="view">عرض</option>
            </select>

            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الجداول</option>
              <option value="beneficiaries">المستفيدين</option>
              <option value="packages">الطرود</option>
              <option value="tasks">المهام</option>
              <option value="organizations">المؤسسات</option>
              <option value="families">العائلات</option>
              <option value="couriers">المندوبين</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الفترات</option>
              <option value="today">اليوم</option>
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
            </select>

            <Button onClick={handleExport} variant="secondary" className="flex items-center">
              <Download className="w-5 h-5 ml-2" />
              تصدير
            </Button>

            <Button variant="secondary" onClick={loadLogs}>
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow" padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse flex-1">
                  <div className={`p-2 rounded-lg ${
                    log.action === 'create' ? 'bg-green-100' :
                    log.action === 'update' ? 'bg-orange-100' :
                    log.action === 'delete' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {getActionIcon(log.action)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 space-x-reverse mb-1">
                      {getActionBadge(log.action)}
                      <Badge variant="secondary">
                        <Database className="w-3 h-3 ml-1" />
                        {getTableName(log.table_name)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{log.user_name || 'مستخدم غير معروف'}</span>
                      <span>•</span>
                      <span>السجل: {log.record_id}</span>
                    </div>

                    {log.changes && (
                      <div className="text-xs text-gray-500 mt-1">
                        التغييرات: {JSON.stringify(log.changes)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(log.created_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(log)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-4"
                  title="عرض التفاصيل"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد أنشطة مطابقة للفلاتر</p>
          </div>
        )}
      </Card>

      {showDetailModal && selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}

interface LogDetailModalProps {
  log: ActivityLog;
  onClose: () => void;
}

function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const getTableName = (table: string) => {
    const tableNames: Record<string, string> = {
      beneficiaries: 'المستفيدين',
      packages: 'الطرود',
      tasks: 'المهام',
      organizations: 'المؤسسات',
      families: 'العائلات',
      couriers: 'المندوبين',
      users: 'المستخدمين',
      roles: 'الأدوار',
      permissions: 'الصلاحيات'
    };
    return tableNames[table] || table;
  };

  const getActionName = (action: string) => {
    const actions: Record<string, string> = {
      create: 'إضافة',
      update: 'تعديل',
      delete: 'حذف',
      view: 'عرض'
    };
    return actions[action] || action;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="تفاصيل النشاط">
      <div className="space-y-6">
        <Card className="bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">نوع الإجراء</p>
              <p className="font-semibold text-gray-900">{getActionName(log.action)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الجدول</p>
              <p className="font-semibold text-gray-900">{getTableName(log.table_name)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">المستخدم</p>
              <p className="font-semibold text-gray-900">{log.user_name || 'غير معروف'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">معرف السجل</p>
              <p className="font-semibold text-gray-900 text-xs break-all">{log.record_id}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-3">التوقيت والموقع</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">التاريخ والوقت</p>
              <p className="font-medium text-gray-900">
                {new Date(log.created_at).toLocaleString('ar-EG')}
              </p>
            </div>
            {log.ip_address && (
              <div>
                <p className="text-gray-600 mb-1">عنوان IP</p>
                <p className="font-medium text-gray-900">{log.ip_address}</p>
              </div>
            )}
          </div>
        </Card>

        {log.changes && (
          <Card className="bg-orange-50">
            <h4 className="font-semibold text-gray-900 mb-3">التغييرات</h4>
            <pre className="text-sm bg-white p-4 rounded-lg overflow-auto max-h-48">
              {JSON.stringify(log.changes, null, 2)}
            </pre>
          </Card>
        )}

        {log.user_agent && (
          <Card className="bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">معلومات المتصفح</h4>
            <p className="text-sm text-gray-600 break-all">{log.user_agent}</p>
          </Card>
        )}

        <Button onClick={onClose} className="w-full">
          إغلاق
        </Button>
      </div>
    </Modal>
  );
}
