import { motion, useInView } from "motion/react";
import { Users, Award, BookOpen } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useRef, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

function Counter({ from = 0, to, duration = 2, suffix = "" }: { from?: number, to: number, duration?: number, suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (isInView) {
      let startTimestamp = null as number | null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, from, to, duration]);

  return <span ref={nodeRef}>{count.toLocaleString()}{suffix}</span>;
}

export default function Stats() {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const docRef = doc(db, "website_settings", "stats");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStatsData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching stats data:", error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      icon: Users, 
      value: statsData?.studentsValue || 5000, 
      suffix: statsData?.studentsSuffix || "+", 
      labelKey: "stats.students", 
      color: "text-blue-500", 
      bg: "bg-blue-100" 
    },
    { 
      icon: Award, 
      value: statsData?.experienceValue || 10, 
      suffix: statsData?.experienceSuffix || "+", 
      labelKey: "stats.experience", 
      color: "text-amber-500", 
      bg: "bg-amber-100" 
    },
    { 
      icon: BookOpen, 
      value: statsData?.coursesValue || 50, 
      suffix: statsData?.coursesSuffix || "+", 
      labelKey: "stats.courses", 
      color: "text-emerald-500", 
      bg: "bg-emerald-100" 
    }
  ];

  return (
    <section className="py-20 bg-white relative z-20 -mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-20 h-20 mx-auto ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="w-10 h-10" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-lg text-slate-400 font-medium">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
