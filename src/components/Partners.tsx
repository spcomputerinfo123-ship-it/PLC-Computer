import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Partners() {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const q = query(collection(db, "partners"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const fetchedPartners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedPartners.length > 0) {
          setPartners(fetchedPartners);
        } else {
          // Default mock data if no partners in firestore
          setPartners([
            { id: "1", name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", link: "#" },
            { id: "2", name: "Cisco", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg", link: "#" },
            { id: "3", name: "AWS", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", link: "#" },
            { id: "4", name: "Google Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg", link: "#" },
            { id: "5", name: "CompTIA", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/CompTIA_Logo.svg", link: "#" },
            { id: "6", name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg", link: "#" }
          ]);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, []);

  return (
    <section className="py-16 bg-white border-y border-slate-100 overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
            {t('partners.title')}
          </p>
        </div>
        
        {/* Infinite Scroll Marquee */}
        <div className="relative flex overflow-x-hidden group">
          {/* Left/Right Fade Masks */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <div 
            className="flex items-center gap-16 md:gap-24 whitespace-nowrap min-w-full justify-around pr-16 md:pr-24 animate-marquee group-hover:[animation-play-state:paused]"
          >
            {partners.map((partner) => (
              <a key={partner.id} href={partner.link || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center shrink-0 w-40 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                <img src={partner.logo} alt={partner.name} className="max-h-12 max-w-full object-contain" />
              </a>
            ))}
            {/* Duplicate for seamless infinite scrolling */}
            {partners.map((partner) => (
              <a key={`dup-${partner.id}`} href={partner.link || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center shrink-0 w-40 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                <img src={partner.logo} alt={partner.name} className="max-h-12 max-w-full object-contain" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
