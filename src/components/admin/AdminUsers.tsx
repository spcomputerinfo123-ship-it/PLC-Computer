import React, { useState, useEffect, useMemo } from "react";
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, where, addDoc } from "firebase/firestore";
import { db, firebaseConfig } from "../../lib/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { 
  User, Users, GraduationCap, Briefcase, ShieldAlert, Edit, Trash2, X, 
  UserPlus, Eye, EyeOff, Search, Filter, Download, Lock, Unlock, CheckCircle2, 
  Clock, ShieldCheck, UserX, UserCheck, AlertCircle 
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function AdminUsers() {
  const { lang } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // For editing
  const [editingUser, setEditingUser] = useState<any>(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'pending', status: 'active' });
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetched.sort((a: any, b: any) => new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime()));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const adminCount = users.filter(u => u.role === 'admin' || u.role === 'management').length;
    const staffCount = users.filter(u => u.role === 'staff' || u.role === 'other_staff').length;
    const studentCount = users.filter(u => u.role === 'student').length;
    const pendingCount = users.filter(u => u.role === 'pending').length;
    const suspendedCount = users.filter(u => u.status === 'suspended').length;
    return { adminCount, staffCount, studentCount, pendingCount, suspendedCount, total: users.length };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                            (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const userStatus = user.status || 'active';
      const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rawInput = newUser.email.trim();
    let cleanEmail = rawInput.toLowerCase();
    if (cleanEmail && !cleanEmail.includes('@')) {
      cleanEmail += '@plc.edu.kh';
    } else if (cleanEmail && !cleanEmail.includes('.')) {
      cleanEmail += '.com';
    }

    if (!rawInput) {
      alert(lang === 'km' ? 'សូមបញ្ចូលអ៊ីមែល ឬឈ្មោះអ្នកប្រើប្រាស់។' : 'Please enter an email or username.');
      return;
    }

    if (newUser.password && newUser.password.length < 4) {
      alert(lang === 'km' ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៤ តួអក្សរ។' : 'Password must be at least 4 characters.');
      return;
    }

    setAddLoading(true);
    let secondaryApp: any = null;
    try {
      let uid = null;
      if (newUser.password) {
        try {
          secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
          const secondaryAuth = getAuth(secondaryApp);
          
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, newUser.password);
          await updateProfile(userCredential.user, { displayName: newUser.name });
          
          uid = userCredential.user.uid;
          await secondaryAuth.signOut();
        } catch {
          // Fallback to storing record in Firestore users collection
        }
      }

      const userRecordToSave: any = {
        name: newUser.name || rawInput,
        email: cleanEmail,
        username: rawInput,
        role: newUser.role,
        status: newUser.status || 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      if (newUser.password) {
        userRecordToSave.password = newUser.password;
      }

      if (uid) {
        await setDoc(doc(db, "users", uid), userRecordToSave);
      } else {
        const usersQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const usersSnapshot = await getDocs(usersQuery);
        if (!usersSnapshot.empty) {
          const existingDoc = usersSnapshot.docs[0];
          await updateDoc(doc(db, "users", existingDoc.id), userRecordToSave);
        } else {
          await addDoc(collection(db, 'users'), userRecordToSave);
        }
      }
      
      setIsAddingUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'pending', status: 'active' });
      fetchUsers();
      alert(lang === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ជោគជ័យ! គណនីនេះអាចចូលប្រើប្រាស់ប្រព័ន្ធបានភ្លាមៗ។' : 'User created successfully! The account can log in immediately.');
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert((lang === 'km' ? 'មានបញ្ហាក្នុងការបង្កើតគណនី: ' : 'Error creating user: ') + (error?.message || error));
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp).catch(console.error);
      }
      setAddLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setRole(user.role || 'student');
    setStatus(user.status || 'active');
    setEditPassword(user.password || '');
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const updates: any = { role, status };
      if (editPassword.trim()) {
        updates.password = editPassword.trim();
      }
      await updateDoc(doc(db, "users", editingUser.id), updates);
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
      setEditingUser(null);
      setEditPassword('');
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const currentStatus = user.status || 'active';
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(db, "users", user.id), { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      alert(lang === 'km' ? 'គ្មានទិន្នន័យសម្រាប់ទាញយកទេ' : 'No user data available to export');
      return;
    }

    const headers = [
      lang === 'km' ? 'ឈ្មោះ' : 'Name',
      lang === 'km' ? 'អ៊ីមែល' : 'Email',
      lang === 'km' ? 'តួនាទី' : 'Role',
      lang === 'km' ? 'ស្ថានភាព' : 'Status',
      lang === 'km' ? 'ចូលប្រើប្រាស់ចុងក្រោយ' : 'Last Login'
    ];

    const rows = filteredUsers.map(u => [
      `"${(u.name || 'N/A').replace(/"/g, '""')}"`,
      `"${(u.email || 'N/A').replace(/"/g, '""')}"`,
      `"${getRoleName(u.role)}"`,
      `"${(u.status === 'suspended') ? (lang === 'km' ? 'ផ្អាក' : 'Suspended') : (lang === 'km' ? 'សកម្ម' : 'Active')}"`,
      `"${formatDate(u.lastLogin)}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PLC_Users_List_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "users", itemToDelete));
        setUsers(users.filter(u => u.id !== itemToDelete));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'pending': return <User className="w-5 h-5 text-orange-500" />;
      case 'student': return <GraduationCap className="w-5 h-5 text-blue-500" />;
      case 'staff': return <Briefcase className="w-5 h-5 text-emerald-500" />;
      case 'management': return <ShieldCheck className="w-5 h-5 text-purple-500" />;
      case 'other_staff': return <Briefcase className="w-5 h-5 text-amber-500" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return lang === 'km' ? 'រដ្ឋបាល' : 'Admin';
      case 'pending': return lang === 'km' ? 'រង់ចាំអនុម័ត' : 'Pending';
      case 'student': return lang === 'km' ? 'សិស្ស' : 'Student';
      case 'staff': return lang === 'km' ? 'បុគ្គលិក/គ្រូ' : 'Staff/Teacher';
      case 'management': return lang === 'km' ? 'គ្រប់គ្រងរួម' : 'Management';
      case 'other_staff': return lang === 'km' ? 'ផ្សេងៗ' : 'Other';
      default: return role;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US');
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDelete}
        message={lang === 'km' ? "តើអ្នកពិតជាចង់លុបទិន្នន័យអ្នកប្រើប្រាស់នេះមែនទេ? (វាមិនលុបគណនី Google Auth របស់ពួកគេទេ)" : "Are you sure you want to delete this user record? (This doesn't delete their Google Auth account)"}
      />

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Admin Stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'km' ? 'រដ្ឋបាលសរុប' : 'Total Admins'}
            </p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.adminCount}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Staff / Teacher Stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'km' ? 'គ្រូបង្រៀន/បុគ្គលិក' : 'Staff / Teachers'}
            </p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.staffCount}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Student Stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'km' ? 'សិស្សសរុប' : 'Total Students'}
            </p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.studentCount}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Pending & Suspended Stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'km' ? 'រង់ចាំ / ផ្អាក' : 'Pending / Suspended'}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-800">{stats.pendingCount + stats.suspendedCount}</span>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-100">
                {stats.pendingCount} {lang === 'km' ? 'រង់ចាំ' : 'pending'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* HEADER BAR */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Users className="text-primary" />
            {lang === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់' : 'User Management'}
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {filteredUsers.length} {lang === 'km' ? 'នាក់' : 'users'}
            </span>
          </h2>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-52">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ/អ៊ីមែល...' : 'Search name/email...'} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              />
            </div>
            
            {/* Role Filter */}
            <div className="relative w-full sm:w-auto min-w-[130px]">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="all">{lang === 'km' ? 'គ្រប់តួនាទី' : 'All Roles'}</option>
                <option value="admin">{lang === 'km' ? 'រដ្ឋបាល' : 'Admin'}</option>
                <option value="management">{lang === 'km' ? 'គ្រប់គ្រងរួម' : 'Management'}</option>
                <option value="staff">{lang === 'km' ? 'បុគ្គលិក/គ្រូ' : 'Staff'}</option>
                <option value="student">{lang === 'km' ? 'សិស្ស' : 'Student'}</option>
                <option value="pending">{lang === 'km' ? 'រង់ចាំអនុម័ត' : 'Pending'}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-auto min-w-[130px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="all">{lang === 'km' ? 'គ្រប់ស្ថានភាព' : 'All Status'}</option>
                <option value="active">{lang === 'km' ? 'សកម្ម (Active)' : 'Active'}</option>
                <option value="suspended">{lang === 'km' ? 'ផ្អាក (Suspended)' : 'Suspended'}</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all text-sm font-medium whitespace-nowrap shadow-sm"
              title={lang === 'km' ? 'ទាញយកបញ្ជីជា CSV / Excel' : 'Export User List to CSV'}
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'km' ? 'Export' : 'Export'}</span>
            </button>

            {/* Add User Button */}
            <button 
              onClick={() => setIsAddingUser(true)}
              className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              {lang === 'km' ? 'បន្ថែមអ្នកប្រើ' : 'Add User'}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">{lang === 'km' ? 'ឈ្មោះ / អ៊ីមែល' : 'Name / Email'}</th>
                <th className="p-4 font-semibold">{lang === 'km' ? 'តួនាទី' : 'Role'}</th>
                <th className="p-4 font-semibold">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="p-4 font-semibold">{lang === 'km' ? 'ចូលប្រើប្រាស់ចុងក្រោយ' : 'Last Login'}</th>
                <th className="p-4 font-semibold text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                      ? (lang === 'km' ? 'រកមិនឃើញទិន្នន័យ។' : 'No matching users found.') 
                      : (lang === 'km' ? 'មិនមានអ្នកប្រើប្រាស់ទេ។' : 'No users found.')}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const isSuspended = user.status === 'suspended';
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isSuspended ? 'bg-amber-50/30' : ''}`}>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{user.name || 'No Name'}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="font-medium text-sm text-slate-700">{getRoleName(user.role)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Lock className="w-3 h-3" />
                            {lang === 'km' ? 'ផ្អាកដំណើរការ' : 'Suspended'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {lang === 'km' ? 'សកម្ម' : 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">{formatDate(user.lastLogin)}</div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {/* Toggle Active / Suspended Button */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition mr-1.5 ${
                            isSuspended 
                              ? 'text-emerald-600 hover:bg-emerald-50' 
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={
                            isSuspended 
                              ? (lang === 'km' ? 'បើកដំណើរការឡើងវិញ' : 'Activate User') 
                              : (lang === 'km' ? 'ផ្អាកដំណើរការគណនី' : 'Suspend User')
                          }
                        >
                          {isSuspended ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </button>

                        {/* Edit Role & Status */}
                        <button 
                          onClick={() => handleEdit(user)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mr-1.5"
                          title={lang === 'km' ? 'កែប្រែ' : 'Edit User'}
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {/* Delete User */}
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title={lang === 'km' ? 'លុប' : 'Delete User'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              {lang === 'km' ? 'បង្ហាញ' : 'Showing'} {((currentPage - 1) * itemsPerPage) + 1} {lang === 'km' ? 'ដល់' : 'to'} {Math.min(currentPage * itemsPerPage, filteredUsers.length)} {lang === 'km' ? 'នៃ' : 'of'} {filteredUsers.length} {lang === 'km' ? 'អ្នកប្រើប្រាស់' : 'users'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lang === 'km' ? 'ថយក្រោយ' : 'Previous'}
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center ${currentPage === i + 1 ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-100 text-slate-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lang === 'km' ? 'បន្ទាប់' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL ADD USER */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/20">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">{lang === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : 'Add New User'}</h3>
              <button onClick={() => setIsAddingUser(false)} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'ឈ្មោះ (Name)' : 'Name'}</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm text-sm" placeholder={lang === 'km' ? 'វាយបញ្ចូលឈ្មោះ' : 'Enter name'} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'អ៊ីមែល (Email)' : 'Email'}</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm text-sm" placeholder="name@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'ពាក្យសម្ងាត់ (មិនចាំបាច់)' : 'Password (Optional)'}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} minLength={6} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-12 shadow-sm text-sm" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'តួនាទី (Role)' : 'Role'}</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm cursor-pointer shadow-sm">
                    <option value="pending">{lang === 'km' ? 'រង់ចាំអនុម័ត' : 'Pending'}</option>
                    <option value="student">{lang === 'km' ? 'សិស្ស' : 'Student'}</option>
                    <option value="staff">{lang === 'km' ? 'បុគ្គលិក/គ្រូ' : 'Staff'}</option>
                    <option value="management">{lang === 'km' ? 'គ្រប់គ្រងរួម' : 'Management'}</option>
                    <option value="admin">{lang === 'km' ? 'រដ្ឋបាល' : 'Admin'}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'ស្ថានភាព (Status)' : 'Status'}</label>
                  <select value={newUser.status} onChange={(e) => setNewUser({...newUser, status: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm cursor-pointer shadow-sm">
                    <option value="active">{lang === 'km' ? 'សកម្ម' : 'Active'}</option>
                    <option value="suspended">{lang === 'km' ? 'ផ្អាកដំណើរការ' : 'Suspended'}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsAddingUser(false)} className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-bold transition-colors text-sm">
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" disabled={addLoading} className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 text-sm disabled:opacity-50">
                  {addLoading ? (lang === 'km' ? 'កំពុងបង្កើត...' : 'Creating...') : (lang === 'km' ? 'បង្កើតគណនី' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/20">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">{lang === 'km' ? 'កែប្រែគណនី' : 'Edit User Account'}</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <p className="font-bold text-slate-800 text-base">{editingUser.name || 'No Name'}</p>
                <p className="text-sm text-slate-500 font-medium truncate">{editingUser.email}</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'}</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'តួនាទី (Role)' : 'Role'}</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm cursor-pointer shadow-sm">
                  <option value="pending">{lang === 'km' ? 'រង់ចាំអនុម័ត (Pending)' : 'Pending'}</option>
                  <option value="student">{lang === 'km' ? 'សិស្ស (Student)' : 'Student'}</option>
                  <option value="staff">{lang === 'km' ? 'បុគ្គលិក/គ្រូ (Staff/Teacher)' : 'Staff'}</option>
                  <option value="management">{lang === 'km' ? 'គ្រប់គ្រងរួម (Management)' : 'Management'}</option>
                  <option value="admin">{lang === 'km' ? 'រដ្ឋបាល (Admin)' : 'Admin'}</option>
                  <option value="other_staff">{lang === 'km' ? 'ផ្សេងៗ (Other)' : 'Other'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">{lang === 'km' ? 'ស្ថានភាពគណនី (Status)' : 'Account Status'}</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm cursor-pointer shadow-sm">
                  <option value="active">{lang === 'km' ? 'សកម្ម (Active)' : 'Active'}</option>
                  <option value="suspended">{lang === 'km' ? 'ផ្អាកដំណើរការ (Suspended)' : 'Suspended'}</option>
                </select>
              </div>

              <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-100 mt-6">
                <button onClick={() => setEditingUser(null)} className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-bold transition-colors text-sm">
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 text-sm">
                  {lang === 'km' ? 'រក្សាទុក' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

