import { useState, useEffect } from 'react';
import { 
  Users, Mail, MapPin, Search, Calendar, Eye, Edit2, Trash2, 
  X, Check, AlertCircle, ShoppingBag, Phone, UserCheck, 
  RotateCcw, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';

type Customer = {
  email: string;
  name: string;
  phone: string;
  city: string;
  last_order_date: string | null;
  member_since?: string | null;
  total_orders: number;
  total_spent: string | number;
  is_registered?: number;
};

type CustomerDetail = Customer & {
  orders?: Array<{
    id: string;
    order_number: string;
    order_status: string;
    payment_status: string;
    total: number | string;
    created_at: string;
    shipping_city?: string;
  }>;
  addresses?: Array<{
    id: string;
    address_line1: string;
    city: string;
    state: string;
    pin_code: string;
    is_default: boolean | number;
  }>;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'member' | 'guest'>('all');

  // Modals
  const [viewCustomer, setViewCustomer] = useState<CustomerDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    fetchCustomers();
  }, [startDate, endDate]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 150 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/admin/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load customer directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open View Modal & fetch full profile
  const handleOpenView = async (customer: Customer) => {
    setViewCustomer(customer);
    setViewLoading(true);
    try {
      const res = await api.get(`/admin/customers/${encodeURIComponent(customer.email)}`);
      if (res.data.success) {
        setViewCustomer(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setViewLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setEditName(customer.name || '');
    setEditPhone(customer.phone || '');
    setEditCity(customer.city || 'Varanasi');
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    setEditSaving(true);
    try {
      const res = await api.put(`/admin/customers/${encodeURIComponent(editCustomer.email)}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
        city: editCity.trim(),
      });
      if (res.data.success) {
        showToast('Patron details updated successfully');
        setEditCustomer(null);
        fetchCustomers();
      } else {
        showToast(res.data.message || 'Update failed', 'error');
      }
    } catch (err: any) {
      console.error('Edit error:', err);
      showToast(err.response?.data?.message || 'Error updating patron', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteCustomer) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/admin/customers/${encodeURIComponent(deleteCustomer.email)}`);
      if (res.data.success) {
        showToast(`Patron ${deleteCustomer.name || deleteCustomer.email} removed from directory`);
        setDeleteCustomer(null);
        fetchCustomers();
      } else {
        showToast(res.data.message || 'Deletion failed', 'error');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.response?.data?.message || 'Error deleting customer', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick Date Helpers
  const setQuickDate = (preset: 'today' | 'month' | 'last30' | 'all') => {
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];
    
    if (preset === 'today') {
      setStartDate(toStr);
      setEndDate(toStr);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(toStr);
    } else if (preset === 'last30') {
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(past30);
      setEndDate(toStr);
    }
  };

  // Client-side combined filtering
  const filtered = customers.filter(c => {
    // Name Search filter
    if (nameSearch.trim()) {
      const q = nameSearch.toLowerCase().trim();
      const matchName = c.name && c.name.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    // General Search filter (name, email, phone, city)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchGeneral = 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q));
      if (!matchGeneral) return false;
    }

    // Type filter
    if (typeFilter === 'member' && !c.is_registered) return false;
    if (typeFilter === 'guest' && c.is_registered) return false;

    // Client date filter fallback
    if (startDate) {
      const activeDate = c.last_order_date || c.member_since;
      if (!activeDate) return false;
      const d = activeDate.split('T')[0];
      if (d < startDate) return false;
    }
    if (endDate) {
      const activeDate = c.last_order_date || c.member_since;
      if (!activeDate) return false;
      const d = activeDate.split('T')[0];
      if (d > endDate) return false;
    }

    return true;
  });

  return (
    <div className="admin-customers" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          backgroundColor: toastMsg.type === 'success' ? '#2e7d32' : '#c62828',
          color: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {toastMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: '0 0 6px 0', fontWeight: 600 }}>Customer Directory</h1>
          <p style={{ color: '#666', margin: 0, fontFamily: 'DM Sans', fontSize: '14px' }}>
            <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#D4AF37' }} />
            {customers.length} total patron accounts & buyers · Showing {filtered.length} filtered
          </p>
        </div>

        {/* Universal Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="Search email, phone, city..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px 10px 36px', 
              borderRadius: '8px', 
              border: '1px solid #ddd', 
              fontFamily: 'DM Sans', 
              fontSize: '13.5px',
              backgroundColor: '#fff',
              outline: 'none'
            }} 
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar: Dedicated Search by Name + Calendar Date Range + Type Chips */}
      <div style={{ 
        background: '#fff', 
        padding: '16px 20px', 
        borderRadius: '10px', 
        border: '1px solid #EAEAEA', 
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Left Side: Search by Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
            <input 
              type="text" 
              placeholder="Search by customer name..." 
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '9px 12px 9px 34px', 
                borderRadius: '6px', 
                border: '1px solid #ccc', 
                fontFamily: 'DM Sans', 
                fontSize: '13px',
                backgroundColor: '#FAF9F6',
                outline: 'none'
              }} 
            />
            {nameSearch && (
              <button 
                onClick={() => setNameSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Member / Guest Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'member', 'guest'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: typeFilter === type ? '1px solid #38243F' : '1px solid #EAEAEA',
                  backgroundColor: typeFilter === type ? '#38243F' : '#fff',
                  color: typeFilter === type ? '#fff' : '#666',
                  transition: 'all 0.15s ease'
                }}
              >
                {type === 'all' ? 'All Patrons' : type === 'member' ? 'Members only' : 'Guests only'}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Calendar & Date Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', fontSize: '13px', fontFamily: 'DM Sans' }}>
            <Calendar size={16} color="#8c5825" />
            <span style={{ fontWeight: 500 }}>Date Filter:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input 
              type="date" 
              title="From Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: 'DM Sans',
                fontSize: '12.5px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            />
            <span style={{ color: '#888', fontSize: '12px' }}>to</span>
            <input 
              type="date" 
              title="To Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: 'DM Sans',
                fontSize: '12.5px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setQuickDate('today')}
              style={{ padding: '6px 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #ddd', background: '#f8f8f8', cursor: 'pointer', color: '#555' }}
            >
              Today
            </button>
            <button 
              onClick={() => setQuickDate('month')}
              style={{ padding: '6px 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #ddd', background: '#f8f8f8', cursor: 'pointer', color: '#555' }}
            >
              This Month
            </button>
            {(startDate || endDate) && (
              <button 
                onClick={() => setQuickDate('all')}
                title="Clear date filter"
                style={{ padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Customer Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#666', background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA' }}>
          <div style={{ fontSize: '16px', fontFamily: 'DM Sans' }}>Loading customer directory...</div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#F9F9F9', borderBottom: '1px solid #EAEAEA' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F' }}>Contact</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F' }}>Location</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F', textAlign: 'center' }}>Orders</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F' }}>Total Spent</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F' }}>Activity</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.email || i} style={{ borderBottom: '1px solid #EAEAEA', transition: 'background-color 0.15s ease' }}>
                  {/* Customer Name & Member Badge */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        backgroundColor: c.is_registered ? 'rgba(212, 175, 55, 0.15)' : '#f1f5f9', 
                        color: c.is_registered ? '#D4AF37' : '#64748b', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        fontSize: '15px'
                      }}>
                        {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <strong style={{ color: '#38243F', fontSize: '14.5px', display: 'block' }}>
                          {c.name || 'Patron'}
                        </strong>
                        {c.is_registered ? (
                          <span style={{ 
                            background: 'rgba(212, 175, 55, 0.15)', 
                            color: '#997316', 
                            fontSize: '10px', 
                            fontWeight: 600,
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            display: 'inline-block',
                            marginTop: '2px',
                            letterSpacing: '0.04em'
                          }}>
                            Member
                          </span>
                        ) : (
                          <span style={{ 
                            background: '#f1f5f9', 
                            color: '#64748b', 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            display: 'inline-block',
                            marginTop: '2px'
                          }}>
                            Guest
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td style={{ padding: '14px 20px', color: '#666' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Mail size={12} color="#888" /> {c.email}
                      </span>
                      {c.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
                          <Phone size={12} color="#888" /> {c.phone}
                        </span>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '12px' }}>No phone</span>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ padding: '14px 20px', color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <MapPin size={13} color="#888" /> {c.city || 'Varanasi'}
                    </span>
                  </td>

                  {/* Total Orders */}
                  <td style={{ padding: '14px 20px', color: '#38243F', fontWeight: 600, textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      minWidth: '26px', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: c.total_orders > 0 ? 'rgba(56, 36, 63, 0.08)' : '#f8f8f8',
                      fontSize: '13px' 
                    }}>
                      {c.total_orders}
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td style={{ padding: '14px 20px', color: '#38243F', fontWeight: 600 }}>
                    ₹{Number(c.total_spent || 0).toLocaleString('en-IN')}
                  </td>

                  {/* Activity / Date */}
                  <td style={{ padding: '14px 20px', color: '#666', fontSize: '13px' }}>
                    {c.last_order_date ? (
                      <div>
                        <span style={{ color: '#444' }}>Last order:</span> {new Date(c.last_order_date).toLocaleDateString('en-IN')}
                      </div>
                    ) : c.member_since ? (
                      <div style={{ color: '#888' }}>
                        Joined: {new Date(c.member_since).toLocaleDateString('en-IN')}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Actions Column (View, Edit, Delete) */}
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {/* View Button */}
                      <button
                        onClick={() => handleOpenView(c)}
                        title="View Patron Profile & Orders"
                        style={{
                          background: '#F9F9F9',
                          border: '1px solid #E0E0E0',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          color: '#38243F',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Eye size={14} color="#38243F" />
                        <span>View</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Customer Details"
                        style={{
                          background: '#F9F9F9',
                          border: '1px solid #E0E0E0',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          color: '#8c5825',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Edit2 size={13} color="#8c5825" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteCustomer(c)}
                        title="Delete Patron"
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Trash2 size={13} color="#DC2626" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#888' }}>
                    <div style={{ fontSize: '15px', marginBottom: '6px' }}>No matching patrons found.</div>
                    <div style={{ fontSize: '13px', color: '#aaa' }}>Try clearing filters or adjusting your date range.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- VIEW CUSTOMER MODAL ---------------- */}
      {viewCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold'
                }}>
                  {viewCustomer.name ? viewCustomer.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: 0, color: '#38243F' }}>
                    {viewCustomer.name || 'Patron Profile'}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>{viewCustomer.email}</span>
                    {viewCustomer.is_registered ? (
                      <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#997316', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                        Registered Member
                      </span>
                    ) : (
                      <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                        Guest Buyer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setViewCustomer(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '14px', background: '#FAF9F6', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '12px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Orders</span>
                <div style={{ fontSize: '22px', fontWeight: 600, color: '#38243F', marginTop: '4px' }}>
                  {viewCustomer.total_orders}
                </div>
              </div>
              <div style={{ padding: '14px', background: '#FAF9F6', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '12px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lifetime Spent</span>
                <div style={{ fontSize: '22px', fontWeight: 600, color: '#38243F', marginTop: '4px' }}>
                  ₹{Number(viewCustomer.total_spent || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: '14px', background: '#FAF9F6', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '12px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Location</span>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#38243F', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {viewCustomer.city || 'Varanasi'}
                </div>
              </div>
            </div>

            {/* Profile Contact Details */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#38243F', fontWeight: 600 }}>Contact & Coordinates</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><strong>Phone:</strong> {viewCustomer.phone || 'Not provided'}</div>
                <div><strong>Email:</strong> {viewCustomer.email}</div>
                <div><strong>Member Since:</strong> {viewCustomer.member_since ? new Date(viewCustomer.member_since).toLocaleDateString('en-IN') : '—'}</div>
                <div><strong>Last Order Date:</strong> {viewCustomer.last_order_date ? new Date(viewCustomer.last_order_date).toLocaleDateString('en-IN') : '—'}</div>
              </div>
            </div>

            {/* Order History */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#38243F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={16} color="#D4AF37" /> Order History ({viewCustomer.orders?.length || 0})
              </h4>

              {viewLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading orders...</div>
              ) : viewCustomer.orders && viewCustomer.orders.length > 0 ? (
                <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                      <tr>
                        <th style={{ padding: '10px 14px', color: '#555' }}>Order #</th>
                        <th style={{ padding: '10px 14px', color: '#555' }}>Date</th>
                        <th style={{ padding: '10px 14px', color: '#555' }}>Status</th>
                        <th style={{ padding: '10px 14px', color: '#555' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewCustomer.orders.map((ord) => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#38243F' }}>
                            {ord.order_number || ord.id.slice(0, 8)}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#666' }}>
                            {new Date(ord.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 500,
                              textTransform: 'capitalize',
                              backgroundColor: ord.order_status === 'delivered' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(183, 141, 82, 0.12)',
                              color: ord.order_status === 'delivered' ? '#2e7d32' : '#8c5825'
                            }}>
                              {ord.order_status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#38243F' }}>
                            ₹{Number(ord.total).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', background: '#fafafa', borderRadius: '6px', color: '#888', fontSize: '13px' }}>
                  No orders recorded for this customer yet.
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setViewCustomer(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#f8f8f8',
                  color: '#444',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT CUSTOMER MODAL ---------------- */}
      {editCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            padding: '26px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'DM Sans', fontSize: '22px', margin: 0, color: '#38243F' }}>
                Edit Patron Details
              </h3>
              <button 
                onClick={() => setEditCustomer(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                  Email Address (Identity)
                </label>
                <input 
                  type="text" 
                  disabled 
                  value={editCustomer.email} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', color: '#777', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                  Full Name *
                </label>
                <input 
                  required
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Kabir Verma"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  maxLength={12}
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                  City / Location
                </label>
                <input 
                  type="text" 
                  value={editCity} 
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Varanasi, Delhi"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#f8f8f8', color: '#555', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#38243F',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
      {deleteCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontFamily: 'DM Sans', fontSize: '22px', margin: '0 0 8px 0', color: '#111' }}>
              Remove Patron from Directory?
            </h3>

            <p style={{ fontSize: '13.5px', color: '#666', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Are you sure you want to delete <strong>{deleteCustomer.name || 'Patron'}</strong> ({deleteCustomer.email})? 
              This will remove their profile and member coordinates from the directory.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteCustomer(null)}
                style={{ padding: '9px 18px', borderRadius: '6px', border: '1px solid #ddd', background: '#f8f8f8', color: '#555', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                style={{
                  padding: '9px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
