import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, MessageSquare, Search, RefreshCw, Download, Phone, Calendar } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";

export default function AdminMessages() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      showToast("មានបញ្ហាក្នុងការទាញយកសារទំនាក់ទំនង", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "contact_messages", itemToDelete));
        setItemToDelete(null);
        showToast("បានលុបសារទំនាក់ទំនងរួចរាល់!", "success");
        fetchMessages();
      } catch (error) {
        console.error("Error deleting message:", error);
        showToast("មិនអាចលុបសារទំនាក់ទំនងបានទេ", "error");
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredMessages.length === 0) {
      showToast("គ្មានសារដើម្បី Export ទេ", "info");
      return;
    }

    const headers = ["ID", "ឈ្មោះពេញ (Name)", "លេខទូរស័ព្ទ (Phone)", "វគ្គសិក្សាដែលចាប់អារម្មណ៍ (Course)", "ខ្លឹមសារសារ (Message)", "កាលបរិច្ឆេទ (Date)"];
    const rows = filteredMessages.map(m => {
      const dateStr = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString('km-KH') : 'N/A';
      return [
        `"${m.id}"`,
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${(m.phone || '').replace(/"/g, '""')}"`,
        `"${(m.course || '').replace(/"/g, '""')}"`,
        `"${(m.message || '').replace(/"/g, '""')}"`,
        `"${dateStr}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Contact_Messages_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("បានទាញយករបាយការណ៍សារទំនាក់ទំនងជា CSV!", "success");
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const searchStr = searchQuery.toLowerCase();
      return (
        (msg.name?.toLowerCase() || '').includes(searchStr) ||
        (msg.phone?.toLowerCase() || '').includes(searchStr) ||
        (msg.course?.toLowerCase() || '').includes(searchStr) ||
        (msg.message?.toLowerCase() || '').includes(searchStr)
      );
    });
  }, [messages, searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete} 
      />
      <div className="bg-blue-50/60 p-6 border-b border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center">
            <MessageSquare className="w-6 h-6 text-primary mr-2.5" /> 
            សារទំនាក់ទំនង (Contact Messages)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ទស្សនានិងគ្រប់គ្រងសារទំនាក់ទំនងដែលផ្ញើចេញពីទម្រង់ទំនាក់ទំនង (Contact Form)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកតាមឈ្មោះ, លេខទូរស័ព្ទ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs transition-all bg-white"
            />
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={filteredMessages.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={fetchMessages} 
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ធ្វើបច្ចុប្បន្នភាព</span>
          </button>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-medium">កំពុងទាញយកសារទំនាក់ទំនង...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">
              {searchQuery ? 'រកមិនឃើញសារដែលត្រូវនឹងការស្វែងរកទេ។' : 'មិនទាន់មានសារទំនាក់ទំនងថ្មីទេ'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4 font-bold">ឈ្មោះ</th>
                <th className="py-3 px-4 font-bold">លេខទូរស័ព្ទ</th>
                <th className="py-3 px-4 font-bold">វគ្គសិក្សា</th>
                <th className="py-3 px-4 font-bold">សារ</th>
                <th className="py-3 px-4 font-bold">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-4 text-right font-bold">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-slate-900 font-bold whitespace-nowrap">{msg.name}</td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                    <a href={`tel:${msg.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {msg.phone}
                    </a>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {msg.course ? (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                        {msg.course}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm leading-relaxed">{msg.message}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('km-KH') : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={() => handleDelete(msg.id)} 
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                      title="លុបសារ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

