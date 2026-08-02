import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
  const { lang } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all border border-white/20">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-2">
            {title || (lang === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete')}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {message || (lang === 'km' ? 'តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។' : 'Are you sure you want to delete this? This action cannot be undone.')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              {lang === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30"
            >
              {lang === 'km' ? 'លុប' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
