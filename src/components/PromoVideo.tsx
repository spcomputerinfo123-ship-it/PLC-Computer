import { motion } from "motion/react";
import { Play } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function PromoVideo() {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "website_settings", "current");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.promoVideoUrl) {
            setVideoUrl(formatVideoEmbedUrl(data.promoVideoUrl));
          }
          if (data.promoVideoCover) {
            setCoverUrl(data.promoVideoCover);
          }
        }
      } catch (err) {
        console.error("Error fetching promo video settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const formatVideoEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl) return "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
    
    // Check if Facebook Video
    if (rawUrl.includes("facebook.com") || rawUrl.includes("fb.watch")) {
      if (rawUrl.includes("facebook.com/plugins/video.php")) {
        return rawUrl.includes("autoplay") ? rawUrl : `${rawUrl}&autoplay=true`;
      }
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&autoplay=true`;
    }

    // Check if YouTube embed URL
    if (rawUrl.includes("/embed/")) {
      return rawUrl.includes("?") ? `${rawUrl}&autoplay=1` : `${rawUrl}?autoplay=1`;
    }

    // Extract video ID from youtube.com/watch?v=ID or youtu.be/ID or shorts
    let videoId = "";
    if (rawUrl.includes("v=")) {
      videoId = rawUrl.split("v=")[1]?.split("&")[0] || "";
    } else if (rawUrl.includes("youtu.be/")) {
      videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (rawUrl.includes("/shorts/")) {
      videoId = rawUrl.split("/shorts/")[1]?.split("?")[0] || "";
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    return rawUrl;
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-slate-900 mb-6"
          >
            {t('video.title')}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="h-1.5 w-24 bg-primary/20 mx-auto rounded-full mb-8 relative"
          >
            <div className="absolute top-0 left-1/4 h-full w-1/2 bg-primary rounded-full"></div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto"
          >
            {t('video.desc')}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white relative aspect-video bg-slate-900"
        >
          {!isPlaying ? (
            <div className="absolute inset-0 group cursor-pointer" onClick={() => setIsPlaying(true)}>
              <img 
                src={coverUrl} 
                alt="Promo Cover" 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </div>
              </div>
            </div>
          ) : (
            <iframe 
              className="w-full h-full"
              src={videoUrl} 
              title="Promo Video" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          )}
        </motion.div>
      </div>
    </section>
  );
}
