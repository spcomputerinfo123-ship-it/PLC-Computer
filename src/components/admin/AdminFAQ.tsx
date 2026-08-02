import { useState, useEffect, FormEvent, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, HelpCircle, Plus, Edit2, X, Search, Sparkles } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import RichTextEditor from "../RichTextEditor";
import { useToast } from "../../context/ToastContext";
import { faqData } from "../../data";

export default function AdminFAQ() {
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [question, setQuestion] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerEn, setAnswerEn] = useState("");

  useEffect(() => {
    fetchFaqs();
  }, []);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDefaultFaqs = async () => {
    setIsSeeding(true);
    try {
      for (const faq of faqData) {
        await addDoc(collection(db, "faqs"), {
          question: faq.question,
          question_en: faq.question_en,
          answer: faq.answer,
          answer_en: faq.answer_en,
          createdAt: serverTimestamp()
        });
      }
      showToast("បានបង្កើតសំណួរចម្លើយគំរូដើមជោគជ័យ!", "success");
      await fetchFaqs();
    } catch (error) {
      console.error("Error seeding default FAQs:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "faqs"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFaqs(items);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const sampleFaqs = [
        {
          question: "តើសាលាមានការផ្តល់វិញ្ញាបនបត្របន្ទាប់ពីបញ្ចប់វគ្គសិក្សាទេ?",
          question_en: "Does the school provide a certificate after completing the course?",
          answer: "បាទ/ចាស យើងមានការផ្តល់វិញ្ញាបនបត្របញ្ជាក់ការសិក្សាជូនដល់សិស្សានុសិស្សដែលបានបញ្ចប់វគ្គសិក្សាដោយជោគជ័យ។",
          answer_en: "Yes, we provide a certificate of completion to students who successfully finish the course.",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          question: "តើសាលាមានកម្មវិធីបញ្ចុះតម្លៃដែរឬទេ?",
          question_en: "Does the school have any discount programs?",
          answer: "យើងមានការបញ្ចុះតម្លៃពិសេសសម្រាប់សិស្ស-និស្សិត និងមានអាហារូបករណ៍សម្រាប់សិស្សឆ្នើមផងដែរ។",
          answer_en: "We offer special discounts for students and scholarships for top performers.",
          status: "published",
          createdAt: serverTimestamp()
        }
      ];

      for (const faq of sampleFaqs) {
        await addDoc(collection(db, "faqs"), faq);
      }
      
      showToast("បានបង្កើតទិន្នន័យគំរូជោគជ័យ!", "success");
      fetchFaqs();
    } catch (error) {
      console.error("Error seeding faqs:", error);
      showToast("មានបញ្ហាក្នុងការបង្កើតទិន្នន័យគំរូ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddOrEdit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "faqs", editingId), {
          question,
          question_en: questionEn,
          answer,
          answer_en: answerEn
        });
        showToast("បានធ្វើបច្ចុប្បន្នភាពសំណួរចម្លើយជោគជ័យ!", "success");
      } else {
        await addDoc(collection(db, "faqs"), {
          question,
          question_en: questionEn,
          answer,
          answer_en: answerEn,
          createdAt: serverTimestamp()
        });
        showToast("បានបន្ថែមសំណួរចម្លើយថ្មីជោគជ័យ!", "success");
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showToast("មានបញ្ហាក្នុងការរក្សាទុក", "error");
    }
  };

  const resetForm = () => {
    setQuestion("");
    setQuestionEn("");
    setAnswer("");
    setAnswerEn("");
  };

  const handleEdit = (faq: any) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setQuestionEn(faq.question_en);
    setAnswer(faq.answer);
    setAnswerEn(faq.answer_en);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "faqs", itemToDelete));
        showToast("បានលុបសំណួរចម្លើយរួចរាល់!", "success");
        fetchFaqs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        showToast("មិនអាចលុបទិន្នន័យបានទេ", "error");
      }
    }
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter(item => {
      const searchStr = searchQuery.toLowerCase();
      return (
        (item.question?.toLowerCase() || '').includes(searchStr) ||
        (item.question_en?.toLowerCase() || '').includes(searchStr) ||
        (item.answer?.toLowerCase() || '').includes(searchStr) ||
        (item.answer_en?.toLowerCase() || '').includes(searchStr)
      );
    });
  }, [faqs, searchQuery]);

  const paginatedFaqs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFaqs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFaqs, currentPage]);

  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete} 
      />
      <div className="bg-blue-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-slate-900 flex items-center">
          <HelpCircle className="w-5 h-5 text-primary mr-2" /> 
          គ្រប់គ្រងសំណួរចម្លើយ (FAQ Manager)
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកសំណួរចម្លើយ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all bg-white"
            />
          </div>
          
          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-sm transition border border-amber-200 flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
          >
            {seeding ? (
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4 text-amber-600" />
            )}
            <span>Seed Demo</span>
          </button>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (editingId) {
                setEditingId(null);
                resetForm();
              }
            }} 
            className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-sm whitespace-nowrap"
          >
            {isAdding && !editingId ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />} 
            {isAdding && !editingId ? 'បិទ' : 'បន្ថែមថ្មី'}
          </button>
        </div>
      </div>
      
      {isAdding && (
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleAddOrEdit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">សំណួរ (Khmer)</label>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required maxLength={500} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question (English)</label>
              <input type="text" value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} required maxLength={500} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">ចម្លើយ (Khmer)</label>
              <div className="bg-white">
                <RichTextEditor value={answer} onChange={setAnswer} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Answer (English)</label>
              <div className="bg-white">
                <RichTextEditor value={answerEn} onChange={setAnswerEn} />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-8">
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">បោះបង់</button>
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">រក្សាទុក</button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <p className="text-slate-500">កំពុងទាញយក...</p>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <HelpCircle className="w-10 h-10 text-slate-300" />
            <p className="text-slate-600 font-semibold">
              {searchQuery ? 'រកមិនឃើញសំណួរចម្លើយដែលត្រូវនឹងការស្វែងរកទេ។' : 'គ្មានទិន្នន័យសំណួរចម្លើយនៅក្នុង Firestore ទេ'}
            </p>
            {!searchQuery && (
              <button 
                onClick={handleSeedDefaultFaqs}
                disabled={isSeeding}
                className="px-4 py-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-blue-200"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                {isSeeding ? 'កំពុងបង្កើតទិន្នន័យគំរូ...' : 'បង្កើតទិន្នន័យដើមគំរូ (Seed Default FAQs)'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedFaqs.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">Q: {item.question}</h4>
                  <div className="text-sm text-slate-600 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
                <div className="shrink-0 flex items-start gap-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              បង្ហាញ {((currentPage - 1) * itemsPerPage) + 1} ដល់ {Math.min(currentPage * itemsPerPage, filteredFaqs.length)} នៃ {filteredFaqs.length} សំណួរចម្លើយ
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ថយក្រោយ
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded flex items-center justify-center ${currentPage === i + 1 ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                បន្ទាប់
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
