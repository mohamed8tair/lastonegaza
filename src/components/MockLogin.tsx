import React, { useState, useEffect } from 'react';
import { Shield, Building2, Users, LogIn, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface MockLoginProps {
  onLogin: (email: string) => Promise<void>;
}

export default function MockLogin({ onLogin }: MockLoginProps) {
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, orgsRes, familiesRes] = await Promise.all([
        supabase.from('system_users').select('*'),
        supabase.from('organizations').select('*'),
        supabase.from('families').select('*')
      ]);

      if (usersRes.data) setSystemUsers(usersRes.data);
      if (orgsRes.data) setOrganizations(orgsRes.data);
      if (familiesRes.data) setFamilies(familiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // حسابات تجريبية سريعة
  const quickAccounts = [
    {
      email: 'admin@humanitarian.ps',
      name: 'أحمد محمد الإدمن',
      role: 'مدير النظام',
      type: 'admin',
      icon: Shield,
      color: 'bg-blue-600'
    },
    {
      email: 'supervisor@redcrescent-gaza.org',
      name: 'فاطمة أحمد - الهلال الأحمر',
      role: 'مشرف المؤسسة',
      type: 'organization',
      icon: Building2,
      color: 'bg-green-600'
    },
    {
      email: 'supervisor@crs-gaza.org',
      name: 'جون سميث - CRS',
      role: 'مشرف المؤسسة',
      type: 'organization',
      icon: Building2,
      color: 'bg-teal-600'
    },
    {
      email: 'family@abuamer.ps',
      name: 'محمد أبو عامر',
      role: 'مشرف العائلة',
      type: 'family',
      icon: Users,
      color: 'bg-orange-600'
    }
  ];

  const handleLogin = async (loginEmail?: string) => {
    const emailToUse = loginEmail || email;

    if (!emailToUse.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(emailToUse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const getAssociatedEntityName = (user: any) => {
    if (user.associated_type === 'organization' && user.associated_id) {
      const org = organizations.find(o => o.id === user.associated_id);
      return org ? ` - ${org.name}` : '';
    }
    if (user.associated_type === 'family' && user.associated_id) {
      const family = families.find(f => f.id === user.associated_id);
      return family ? ` - ${family.name || family.family_name}` : '';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-4xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Login Form */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">تسجيل الدخول</h1>
              <p className="text-gray-600">منصة المساعدات الإنسانية - غزة</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل البريد الإلكتروني"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    defaultValue="123456"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">كلمة المرور الافتراضية: 123456</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>

            {/* Demo Note */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-medium text-sm">نظام تجريبي</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                هذا نظام تجريبي يستخدم بيانات وهمية. كلمة المرور لجميع الحسابات: 123456
              </p>
            </div>
          </div>

          {/* Right Side - Quick Login Options */}
          <div className="bg-gray-50 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">حسابات تجريبية سريعة</h2>
            <p className="text-gray-600 mb-8">اختر حساب للدخول السريع وتجربة النظام</p>

            <div className="space-y-4">
              {quickAccounts.map((account) => {
                const IconComponent = account.icon;
                return (
                  <button
                    key={account.email}
                    onClick={() => handleLogin(account.email)}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-lg text-right group disabled:opacity-50 disabled:cursor-not-allowed ${account.color} hover:opacity-90 transition-colors`}
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-white">
                        <p className="font-semibold">{account.name}</p>
                        <p className="text-sm opacity-90">{account.role}</p>
                        <p className="text-xs opacity-75 mt-1">{account.email}</p>
                      </div>
                      <LogIn className="w-4 h-4 text-white opacity-75" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Available Users Info */}
            <div className="mt-6 bg-white/60 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 text-sm">المستخدمين المتاحين:</h3>
              <div className="space-y-2 text-sm">
                {systemUsers.map((user) => {
                  const associatedName = getAssociatedEntityName(user);
                  return (
                    <div key={user.id} className="flex justify-between items-center">
                      <span className="text-gray-700 text-xs">{user.email}</span>
                      <span className="text-gray-500 text-xs">
                        {(user.full_name || user.name || '').split(' - ')[0]}{associatedName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}