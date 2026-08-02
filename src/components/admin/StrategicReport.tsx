import { useState, useEffect, useRef } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Chart from 'chart.js/auto';

export default function StrategicReport() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projections'>('overview');
  const [stats, setStats] = useState({ courses: 0, students: 0, messages: 0, news: 0 });
  const [studentCount, setStudentCount] = useState(500);

  const courseChartRef = useRef<HTMLCanvasElement>(null);
  const growthChartRef = useRef<HTMLCanvasElement>(null);
  const courseChartInstance = useRef<Chart | null>(null);
  const growthChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const c = await getCountFromServer(collection(db, "courses"));
        const s = await getCountFromServer(collection(db, "users"));
        const m = await getCountFromServer(collection(db, "contact_messages"));
        const n = await getCountFromServer(collection(db, "news_events"));
        setStats({
          courses: c.data().count,
          students: s.data().count,
          messages: m.data().count,
          news: n.data().count
        });
      } catch (e) { /* ignore */ }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      // Clean up previous charts if they exist
      if (courseChartInstance.current) courseChartInstance.current.destroy();
      if (growthChartInstance.current) growthChartInstance.current.destroy();

      if (courseChartRef.current) {
        courseChartInstance.current = new Chart(courseChartRef.current, {
          type: 'bar',
          data: {
              labels: ['សិស្ស', 'វគ្គសិក្សា', 'សារ', 'ព័ត៌មាន'],
              datasets: [{
                  label: 'ទិន្នន័យ',
                  data: [stats.students, stats.courses, stats.messages, stats.news],
                  backgroundColor: ['#1d4ed8', '#f59e0b', '#4f46e5', '#10b981'],
                  borderRadius: 8
              }]
          },
          options: {
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
          }
        });
      }

      if (growthChartRef.current) {
        growthChartInstance.current = new Chart(growthChartRef.current, {
          type: 'line',
          data: {
              labels: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា'],
              datasets: [{
                  label: 'កំណើនសិស្សសរុប',
                  data: [310, 340, 380, 370, 410, 450],
                  borderColor: '#1d4ed8',
                  backgroundColor: 'rgba(29, 78, 216, 0.1)',
                  fill: true,
                  tension: 0.4
              }]
          },
          options: {
              maintainAspectRatio: false,
              plugins: { tooltip: { mode: 'index', intersect: false } }
          }
        });
      }
    }

    return () => {
      if (courseChartInstance.current) courseChartInstance.current.destroy();
      if (growthChartInstance.current) growthChartInstance.current.destroy();
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 rounded-xl shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-blue-900 hidden sm:block">របាយការណ៍វិភាគយុទ្ធសាស្ត្រ ២០២៤</h1>
              </div>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('overview')} 
                    className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    ទិន្នន័យរួម
                  </button>
                  <button 
                    onClick={() => setActiveTab('projections')} 
                    className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'projections' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    ការព្យាករណ៍
                  </button>
              </div>
          </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">សេចក្តីសង្ខេបប្រតិបត្តិ</h2>
                <p className="text-gray-600 leading-relaxed">
                    ផ្នែកនេះបង្ហាញពីទិន្នន័យជាក់ស្តែងនៃប្រតិបត្តិការរបស់សាលា ភី អិល ស៊ី កុំព្យូទ័រ។ យើងផ្តោតលើការវាស់វែងប្រសិទ្ធភាពនៃវគ្គសិក្សានីមួយៗ និងអត្រាកំណើនសិស្ស ដើម្បីកំណត់ទិសដៅពង្រីកសាខានៅឆ្នាំក្រោយ។
                </p>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-bold mb-1">សិស្សសកម្មសរុប</p>
                    <div className="text-4xl font-bold text-blue-700">៤៥០ <span className="text-sm font-normal text-green-600">+១៥%</span></div>
                    <p className="text-xs text-gray-400 mt-2">គិតត្រឹមឆមាសទី១ ឆ្នាំ២០២៤</p>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-bold mb-1">វគ្គសិក្សាពេញនិយមបំផុត</p>
                    <div className="text-2xl font-bold text-orange-600">រដ្ឋបាលកុំព្យូទ័រ</div>
                    <p className="text-xs text-gray-400 mt-2">មានសិស្សចុះឈ្មោះច្រើនជាងគេ</p>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-bold mb-1">អត្រាការងារសិស្ស</p>
                    <div className="text-4xl font-bold text-indigo-700">៨៥%</div>
                    <p className="text-xs text-gray-400 mt-2">សិស្សទទួលបានការងារក្រោយរៀនចប់</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6">ប្រជាប្រិយភាពវគ្គសិក្សា (សិស្ស/វគ្គ)</h3>
                    <div className="relative w-full h-[300px]">
                        <canvas ref={courseChartRef}></canvas>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6">និន្នាការកំណើនសិស្សប្រចាំខែ</h3>
                    <div className="relative w-full h-[300px]">
                        <canvas ref={growthChartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'projections' && (
        <div className="space-y-8 animate-in fade-in duration-300">
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">ឧបករណ៍ព្យាករណ៍អាជីវកម្ម</h2>
                <p className="text-gray-600 mb-8">
                    សូមសាកល្បងកែសម្រួលចំនួនសិស្សប៉ាន់ស្មាន ដើម្បីមើលពីលទ្ធភាពនៃចំណូលប្រចាំខែ និងតម្រូវការគ្រូបង្រៀនបន្ថែម។
                </p>

                <div className="max-w-2xl mx-auto space-y-8 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                    <div>
                        <label className="flex justify-between font-bold mb-4">
                            <span>ចំនួនសិស្សគោលដៅ (នាក់)</span>
                            <span className="text-blue-700 text-2xl">{studentCount.toLocaleString('km-KH')}</span>
                        </label>
                        <input 
                          type="range" 
                          min="100" 
                          max="2000" 
                          step="50" 
                          value={studentCount} 
                          onChange={(e) => setStudentCount(Number(e.target.value))}
                          className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-700" 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-2 font-medium">ចំណូលប៉ាន់ស្មាន</p>
                            <div className="text-4xl font-bold text-green-600">${(studentCount * 15).toLocaleString('km-KH')}</div>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-2 font-medium">តម្រូវការគ្រូ (នាក់)</p>
                            <div className="text-4xl font-bold text-orange-600">{Math.ceil(studentCount / 50).toLocaleString('km-KH')}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <h3 className="text-2xl font-bold mb-6 relative z-10">អនុសាសន៍យុទ្ធសាស្ត្រ</h3>
                <ul className="space-y-4 text-blue-100 relative z-10 text-lg">
                    <li className="flex gap-4"><span className="w-2.5 h-2.5 mt-2 bg-orange-400 rounded-full shrink-0"></span> ផ្តោតលើការបន្ថែមវគ្គ &quot;អភិវឌ្ឍន៍វេបសាយ&quot; ព្រោះទីផ្សារកំពុងត្រូវការខ្លាំង។</li>
                    <li className="flex gap-4"><span className="w-2.5 h-2.5 mt-2 bg-orange-400 rounded-full shrink-0"></span> បង្កើនការធ្វើទីផ្សារតាមរយៈ SEO និង Facebook Ads ឱ្យចំគោលដៅសិស្សវិទ្យាល័យ។</li>
                    <li className="flex gap-4"><span className="w-2.5 h-2.5 mt-2 bg-orange-400 rounded-full shrink-0"></span> ពង្រីកកន្លែងរៀនបន្ថែម ប្រសិនបើចំនួនសិស្សកើនលើសពី ៨០០ នាក់។</li>
                </ul>
            </section>
        </div>
      )}
    </div>
  );
}
