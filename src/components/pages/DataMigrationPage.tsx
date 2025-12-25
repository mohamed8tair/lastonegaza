import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { seedDatabase } from '../../scripts/seedDatabase';

export default function DataMigrationPage() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setRunning(true);
    setError(null);
    setLogs([]);
    setCompleted(false);

    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, '❌ ' + args.join(' ')]);
      originalError(...args);
    };

    try {
      const result = await seedDatabase();
      if (result.success) {
        setCompleted(true);
      } else {
        setError('فشل في نقل بعض البيانات');
      }
    } catch (err: any) {
      setError(err.message || 'فشل في نقل البيانات');
      console.error('Migration error:', err);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">نقل البيانات إلى Supabase</h1>
          <p className="text-slate-600">نقل جميع البيانات الوهمية إلى قاعدة البيانات الحقيقية</p>
        </div>

        <Card className="mb-6 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">معلومات مهمة</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>سيتم نقل جميع البيانات من ملف mockData.ts</li>
              <li>إذا كانت البيانات موجودة بالفعل، سيتم تخطيها</li>
              <li>ستتم معالجة البيانات بالترتيب الصحيح حسب التبعيات</li>
              <li>يمكنك تشغيل هذه العملية مرات متعددة بأمان</li>
            </ul>
          </div>

          <Button
            onClick={handleMigrate}
            disabled={running}
            className="w-full"
          >
            {running ? 'جاري النقل...' : 'بدء عملية النقل'}
          </Button>
        </Card>

        {running && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-slate-700">جاري نقل البيانات...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex items-start space-x-3 space-x-reverse">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">خطأ في النقل</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {logs.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">سجل النقل</h3>
            <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="font-mono text-sm space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('🌱') ? 'text-blue-400' :
                      'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {completed && (
          <div className="space-y-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-xl font-bold text-green-800">اكتملت عملية النقل بنجاح!</h3>
                  <p className="text-green-700">تم نقل جميع البيانات إلى قاعدة البيانات</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">الخطوة التالية</h3>
              <p className="text-blue-700 mb-4">
                الآن يمكنك العودة إلى الصفحة الرئيسية وستجد جميع البيانات محملة من قاعدة البيانات الحقيقية بدلاً من البيانات الوهمية.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                إعادة تحميل الصفحة
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
