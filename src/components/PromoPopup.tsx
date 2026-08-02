import { X, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { PromoContent, PromoItem } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface PromoPopupProps {
  content: PromoContent;
  disabled?: boolean;
  onOpenRegistration?: (courseTitle?: string) => void;
}

export default function PromoPopup({ content, disabled, onOpenRegistration }: PromoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { lang, t } = useLanguage();

  const popups: PromoItem[] = useMemo(() => {
    if (content?.popups && content.popups.length > 0) {
      const activeItems = content.popups.filter(p => p.active !== false);
      if (activeItems.length > 0) return activeItems;
    }

    // Fallback to single promo object if popups array is missing or empty
    if (content?.title || content?.image) {
      return [{
        id: 'legacy-1',
        title: content.title || 'អាហារូបករណ៍ CSR',
        title_en: content.title_en || 'CSR Scholarship',
        text: content.text || 'ទទួលបានអាហារូបករណ៍រហូតដល់ ៥០% សម្រាប់សិស្សឆ្នើម!',
        text_en: content.text_en || 'Get up to 50% scholarship for outstanding students!',
        image: content.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        active: true
      }];
    }

    // Default fallback
    return [
      {
        id: 'default-1',
        title: 'អាហារូបករណ៍ CSR',
        title_en: 'CSR Scholarship',
        text: 'ទទួលបានអាហារូបករណ៍រហូតដល់ ៥០% សម្រាប់សិស្សឆ្នើម!',
        text_en: 'Get up to 50% scholarship for outstanding students!',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        active: true
      }
    ];
  }, [content]);

  useEffect(() => {
    if (disabled || popups.length === 0) return;
    
    // Check if the user has already seen the popup in this session
    const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');
    if (hasSeenPromo === 'true') return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('hasSeenPromo', 'true');
      setTimeout(() => setShow(true), 10);
    }, 200);
    return () => clearTimeout(timer);
  }, [disabled, popups]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleRegister = () => {
    handleClose();
    const popupTitle = currentPopup ? (lang === 'km' ? currentPopup.title : currentPopup.title_en) : 'អាហារូបករណ៍ CSR';
    if (onOpenRegistration) {
      onOpenRegistration(popupTitle);
    } else {
      const contactElem = document.getElementById('contact');
      if (contactElem) {
        contactElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % popups.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + popups.length) % popups.length);
  };

  if (!isOpen || disabled || popups.length === 0) return null;

  const currentPopup = popups[currentIndex] || popups[0];

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden transform transition-transform duration-300 ${show ? 'scale-100' : 'scale-95'}`}>
        
        {/* Top Badges & Close Button */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          {popups.length > 1 ? (
            <span className="bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
              {lang === 'km' ? `ផ្ទាំងទី ${currentIndex + 1} នៃ ${popups.length}` : `Popup ${currentIndex + 1} of ${popups.length}`}
            </span>
          ) : <div />}

          <button 
            onClick={handleClose} 
            className="w-9 h-9 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition shadow-lg focus:outline-none"
            title="បិទ (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Image with Navigation Overlay */}
        <div className="relative h-56 bg-slate-100">
          <img 
            src={currentPopup.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'} 
            alt="Promotion" 
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Carousel Arrows if multiple popups */}
          {popups.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition focus:outline-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition focus:outline-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 text-center">
          <span className="bg-rose-100/90 text-rose-600 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 inline-flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('promo.title')}</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 leading-snug">
            {lang === 'km' ? currentPopup.title : currentPopup.title_en}
          </h3>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-sm mx-auto line-clamp-3">
            {lang === 'km' ? currentPopup.text : currentPopup.text_en}
          </p>

          {/* Pagination Dots */}
          {popups.length > 1 && (
            <div className="flex justify-center gap-1.5 mb-5">
              {popups.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={popups.length > 1 && currentIndex < popups.length - 1 ? handleNext : handleClose} 
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition text-sm"
            >
              {popups.length > 1 && currentIndex < popups.length - 1 
                ? (lang === 'km' ? 'ផ្ទាំងបន្ទាប់ ➔' : 'Next ➔') 
                : t('promo.skip')}
            </button>
            <button 
              onClick={handleRegister} 
              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-1"
            >
              <span>{lang === 'km' ? 'ចុះឈ្មោះវគ្គនេះ' : t('promo.register')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
