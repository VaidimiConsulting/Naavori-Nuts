import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Eye, Calendar, MapPin, IndianRupee, 
  Package, Truck, CheckCircle2, Clock, X, Filter,
  FileText, Download, RotateCcw, Building2, ChevronRight, AlertCircle
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { Link } from 'react-router-dom';

type OrderItem = {
  id: string;
  order_number: string;
  shipping_name: string;
  shipping_phone?: string;
  guest_email?: string;
  shipping_address_line1?: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_pin_code?: string;
  total: string | number;
  payment_method: string;
  payment_status?: string;
  order_status: string;
  created_at: string;
};

type LocationStat = {
  city: string;
  state: string;
  order_count: number;
  total_amount: string | number;
};

type OrderSummary = {
  total_orders: number;
  total_revenue: number;
  location_breakdown: LocationStat[];
  status_breakdown: Record<string, number>;
};

type DatePreset = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom_date' | 'custom_month' | 'custom_range';

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [customMonth, setCustomMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Helper date generators
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getCurrentMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const getLastMonthStr = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const getThisWeekStartStr = () => {
    const d = new Date();
    const day = d.getDay() || 7; // Monday = 1
    d.setDate(d.getDate() - day + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 100
      };

      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      if (selectedCity) params.city = selectedCity;

      // Date logic
      if (datePreset === 'today') {
        params.date = getTodayStr();
      } else if (datePreset === 'yesterday') {
        params.date = getYesterdayStr();
      } else if (datePreset === 'this_week') {
        params.startDate = getThisWeekStartStr();
        params.endDate = getTodayStr();
      } else if (datePreset === 'this_month') {
        params.month = getCurrentMonthStr();
      } else if (datePreset === 'last_month') {
        params.month = getLastMonthStr();
      } else if (datePreset === 'custom_date' && customDate) {
        params.date = customDate;
      } else if (datePreset === 'custom_month' && customMonth) {
        params.month = customMonth;
      } else if (datePreset === 'custom_range') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.data || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search, datePreset, customDate, customMonth, startDate, endDate, selectedCity]);

  const money = (val: number | string) => `₹${Math.round(Number(val) || 0).toLocaleString('en-IN')}`;

  const statusTabs = [
    { label: 'All Orders', value: '' },
    { label: 'New (Placed)', value: 'placed' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Packing', value: 'packed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const getStatusBadge = (status: string) => {
    const s = (status || 'placed').toLowerCase();
    let bg = '#f0f0f0';
    let text = '#555';
    let border = '#ddd';

    if (s === 'placed') {
      bg = '#e6f7ff'; text = '#096dd9'; border = '#91d5ff';
    } else if (s === 'confirmed') {
      bg = '#f9f0ff'; text = '#531dab'; border = '#d3adf7';
    } else if (s === 'packed') {
      bg = '#fff7e6'; text = '#d46b08'; border = '#ffd591';
    } else if (s === 'shipped' || s === 'out_for_delivery') {
      bg = '#e6fffb'; text = '#08979c'; border = '#87e8de';
    } else if (s === 'delivered') {
      bg = '#f6ffed'; text = '#389e0d'; border = '#b7eb8f';
    } else if (s === 'cancelled' || s === 'returned') {
      bg = '#fff1f0'; text = '#cf1322'; border = '#ffa39e';
    }

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11.5px',
        fontWeight: 600,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        {s.replace(/_/g, ' ')}
      </span>
    );
  };

  const getActiveFilterLabel = () => {
    if (datePreset === 'today') return `Today (${getTodayStr()})`;
    if (datePreset === 'yesterday') return `Yesterday (${getYesterdayStr()})`;
    if (datePreset === 'this_week') return `This Week (from ${getThisWeekStartStr()})`;
    if (datePreset === 'this_month') return `This Month (${getCurrentMonthStr()})`;
    if (datePreset === 'last_month') return `Last Month (${getLastMonthStr()})`;
    if (datePreset === 'custom_date') return customDate ? `Date: ${customDate}` : 'Select Date';
    if (datePreset === 'custom_month') return customMonth ? `Month: ${customMonth}` : 'Select Month';
    if (datePreset === 'custom_range') return `${startDate || 'Start'} to ${endDate || 'End'}`;
    return 'All Time';
  };

  return (
    <div style={{ color: '#30211D' }}>
      
      {/* ─── PAGE HEADER & TITLE ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Management & Fulfillment Center
            </span>
          </div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '34px', color: '#38243F', margin: '4px 0 0 0', fontWeight: 600 }}>
            Order Reports & Dispatch Pipeline
          </h1>
          <p style={{ fontFamily: 'DM Sans', color: '#6a554c', margin: '4px 0 0 0', fontSize: '14px' }}>
            Date-wise, month-wise, and destination-wise tracking of customer orders and revenue
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              backgroundColor: '#fff', color: '#38243F', border: '1px solid #c9b08f',
              borderRadius: '6px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}
          >
            <Download size={14} /> Print / Export Report
          </button>
        </div>
      </div>

      {/* ─── DATE & MONTH FILTER BAR (PRIMARY CONTROLLER) ─── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #EAEAEA',
        padding: '18px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(56,36,63,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#8c5825" />
            <strong style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F' }}>
              Filter Orders by Date / Month:
            </strong>
            <span style={{ fontSize: '12.5px', color: '#8c5825', fontWeight: 600, backgroundColor: '#fdf7f0', padding: '3px 10px', borderRadius: '12px', border: '1px solid #e9ddcf' }}>
              Showing: {getActiveFilterLabel()}
            </span>
          </div>

          {(datePreset !== 'all' || selectedCity || search || statusFilter) && (
            <button
              onClick={() => {
                setDatePreset('all');
                setCustomDate('');
                setCustomMonth('');
                setStartDate('');
                setEndDate('');
                setSelectedCity('');
                setSearch('');
                setStatusFilter('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#cf1322',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={13} /> Reset All Filters
            </button>
          )}
        </div>

        {/* Quick Date Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all' as DatePreset, label: '🌟 All Time' },
            { id: 'today' as DatePreset, label: '⚡ Today (आज)' },
            { id: 'yesterday' as DatePreset, label: '⏪ Yesterday (कल)' },
            { id: 'this_week' as DatePreset, label: '🗓️ This Week' },
            { id: 'this_month' as DatePreset, label: '📆 This Month (इस महीने)' },
            { id: 'last_month' as DatePreset, label: '📅 Last Month' },
            { id: 'custom_date' as DatePreset, label: '🎯 Exact Date' },
            { id: 'custom_month' as DatePreset, label: '🗓️ Select Month' },
            { id: 'custom_range' as DatePreset, label: '↔️ Date Range' },
          ].map((preset) => {
            const isSelected = datePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #38243F' : '1px solid #EAEAEA',
                  backgroundColor: isSelected ? '#38243F' : '#fafafa',
                  color: isSelected ? '#FDFBF7' : '#555',
                  fontFamily: 'DM Sans',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Inputs for Custom Date / Month / Range */}
        {datePreset === 'custom_date' && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#38243F' }}>Pick Specific Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #c9b08f',
                fontFamily: 'DM Sans',
                fontSize: '13px',
                color: '#38243F',
                backgroundColor: '#fff'
              }}
            />
            {customDate && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                Showing orders placed on <strong>{customDate}</strong>
              </span>
            )}
          </div>
        )}

        {datePreset === 'custom_month' && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#38243F' }}>Select Year & Month:</span>
            <input
              type="month"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #c9b08f',
                fontFamily: 'DM Sans',
                fontSize: '13px',
                color: '#38243F',
                backgroundColor: '#fff'
              }}
            />
            {customMonth && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                Showing orders for month <strong>{customMonth}</strong>
              </span>
            )}
          </div>
        )}

        {datePreset === 'custom_range' && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#38243F' }}>From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #c9b08f',
                  fontFamily: 'DM Sans',
                  fontSize: '13px',
                  color: '#38243F',
                  backgroundColor: '#fff'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#38243F' }}>To Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #c9b08f',
                  fontFamily: 'DM Sans',
                  fontSize: '13px',
                  color: '#38243F',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── LIVE SUMMARY KPI METRICS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        
        {/* Total Orders Metric */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #EAEAEA', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(56,36,63,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={17} color="#38243F" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#38243F', marginTop: '6px', fontFamily: 'DM Sans' }}>
            {summary?.total_orders ?? orders.length}
          </div>
          <small style={{ color: '#888', fontSize: '11.5px' }}>
            {getActiveFilterLabel()}
          </small>
        </div>

        {/* Total Revenue Metric */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #EAEAEA', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Period Revenue</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(212,175,55,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={17} color="#8c5825" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#8c5825', marginTop: '6px', fontFamily: 'DM Sans' }}>
            {money(summary?.total_revenue ?? orders.reduce((sum, o) => sum + Number(o.total || 0), 0))}
          </div>
          <small style={{ color: '#888', fontSize: '11.5px' }}>
            Live sum of selected orders
          </small>
        </div>

        {/* Unique Destinations / Cities */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #EAEAEA', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Destinations Reached</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(46,125,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={17} color="#2e7d32" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#2e7d32', marginTop: '6px', fontFamily: 'DM Sans' }}>
            {summary?.location_breakdown?.length || (new Set(orders.map(o => o.shipping_city)).size)}
          </div>
          <small style={{ color: '#888', fontSize: '11.5px' }}>
            Cities receiving shipments
          </small>
        </div>

        {/* Fulfillment Pipeline */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #EAEAEA', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Live Status</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(25,118,210,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={17} color="#1976d2" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#096dd9', background: '#e6f7ff', padding: '2px 8px', borderRadius: '10px' }}>
              Placed: {summary?.status_breakdown?.placed || orders.filter(o => o.order_status === 'placed').length}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#389e0d', background: '#f6ffed', padding: '2px 8px', borderRadius: '10px' }}>
              Delivered: {summary?.status_breakdown?.delivered || orders.filter(o => o.order_status === 'delivered').length}
            </span>
          </div>
        </div>

      </div>

      {/* ─── "AUR KHA KHA SE ORDERS AAYE" (LOCATION BREAKDOWN SECTION) ─── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #EAEAEA',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 10px rgba(56,36,63,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#b78d52" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16.5px', color: '#38243F', fontWeight: 600, fontFamily: 'DM Sans' }}>
                Orders by Location (कहाँ-कहाँ से ऑर्डर्स हैं):
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#6a554c' }}>
                Click on any city below to filter the order list specifically to that location.
              </p>
            </div>
          </div>

          {selectedCity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#38243F', backgroundColor: '#fcf2e3', padding: '4px 10px', borderRadius: '12px', border: '1px solid #e5cda9' }}>
                Filtered by City: <strong>{selectedCity}</strong>
              </span>
              <button
                onClick={() => setSelectedCity('')}
                style={{
                  background: 'none', border: '1px solid #ddd', borderRadius: '50%', width: '22px', height: '22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666'
                }}
                title="Clear City Filter"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {summary?.location_breakdown && summary.location_breakdown.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
            {summary.location_breakdown.map((loc, idx) => {
              const isLocSelected = selectedCity.toLowerCase() === loc.city.toLowerCase();
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCity(isLocSelected ? '' : loc.city)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isLocSelected ? '1.5px solid #38243F' : '1px solid #e9ddcf',
                    backgroundColor: isLocSelected ? '#38243F' : '#fffbf7',
                    color: isLocSelected ? '#FDFBF7' : '#38243F',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', fontWeight: 600 }}>
                      📍 {loc.city}
                    </strong>
                    <span style={{ fontSize: '11px', color: isLocSelected ? '#dfd6c9' : '#888' }}>
                      {loc.state} · {money(loc.total_amount)}
                    </span>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: isLocSelected ? 'rgba(212,175,55,0.3)' : 'rgba(56,36,63,0.08)',
                    color: isLocSelected ? '#D4AF37' : '#38243F',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {loc.order_count} {loc.order_count === 1 ? 'order' : 'orders'}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
            No location data for this selection.
          </div>
        )}
      </div>

      {/* ─── MAIN ORDERS DATA TABLE CONTAINER ─── */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #EAEAEA', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        
        {/* Table Toolbar: Status Filter Tabs & Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {statusTabs.map(tab => (
              <button 
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                style={{ 
                  padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 500,
                  backgroundColor: statusFilter === tab.value ? '#38243F' : '#f2f2f2',
                  color: statusFilter === tab.value ? '#FDFBF7' : '#555',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search order no, customer, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 38px', borderRadius: '6px',
                border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '13px',
                color: '#38243F', backgroundColor: '#fff'
              }} 
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '13.5px' }}>
            <thead style={{ backgroundColor: '#FAF7F2', color: '#4a3832', borderBottom: '1px solid #EAEAEA' }}>
              <tr>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer Details</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Destination (कहाँ)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Date & Time</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Amount (₹)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
                    Loading orders for {getActiveFilterLabel()}...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#888' }}>
                    <div style={{ maxWidth: '340px', margin: '0 auto' }}>
                      <AlertCircle size={32} color="#aaa" style={{ margin: '0 auto 10px' }} />
                      <strong style={{ display: 'block', fontSize: '16px', color: '#38243F' }}>
                        No orders found
                      </strong>
                      <p style={{ margin: '4px 0 16px', fontSize: '13px' }}>
                        No orders recorded matching the current filter: <strong>{getActiveFilterLabel()}</strong>
                        {selectedCity ? ` in ${selectedCity}` : ''}.
                      </p>
                      <button
                        onClick={() => { setDatePreset('all'); setSelectedCity(''); setStatusFilter(''); setSearch(''); }}
                        style={{
                          padding: '7px 16px', backgroundColor: '#38243F', color: '#fff',
                          border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const dateObj = new Date(order.created_at);
                  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #EAEAEA', transition: 'background 0.15s ease' }}>
                      
                      {/* Order Number */}
                      <td style={{ padding: '14px 18px' }}>
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          style={{ color: '#38243F', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}
                        >
                          #{order.order_number}
                        </Link>
                        <span style={{ display: 'block', fontSize: '11px', color: '#888' }}>
                          Ref: {order.id.slice(0, 8)}...
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#38243F', fontSize: '14px' }}>
                          {order.shipping_name}
                        </strong>
                        {order.shipping_phone && (
                          <div style={{ fontSize: '12px', color: '#6a554c', marginTop: '2px' }}>
                            📞 +91 {order.shipping_phone}
                          </div>
                        )}
                        {order.guest_email && (
                          <div style={{ fontSize: '11.5px', color: '#888' }}>
                            ✉️ {order.guest_email}
                          </div>
                        )}
                      </td>

                      {/* Destination / Location */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '5px',
                            backgroundColor: '#fff7e6',
                            color: '#d46b08',
                            border: '1px solid #ffd591',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            📍 {order.shipping_city || 'Varanasi'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#888', marginTop: '3px' }}>
                          {order.shipping_state || 'Uttar Pradesh'} {order.shipping_pin_code ? `(${order.shipping_pin_code})` : ''}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ display: 'block', color: '#38243F', fontSize: '13px' }}>
                          {dateFormatted}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: '#888' }}>
                          {timeFormatted}
                        </span>
                      </td>

                      {/* Total Amount & Payment Mode */}
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#8c5825', fontSize: '15px' }}>
                          {money(order.total)}
                        </strong>
                        <div style={{ fontSize: '11.5px', color: '#888', marginTop: '2px', textTransform: 'uppercase' }}>
                          {order.payment_method} · {order.payment_status || 'paid'}
                        </div>
                      </td>

                      {/* Order Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {getStatusBadge(order.order_status)}
                      </td>

                      {/* Action Links */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Link 
                            to={`/admin/orders/${order.id}`} 
                            style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '5px 10px', borderRadius: '5px',
                              backgroundColor: '#fff', border: '1px solid #ddd',
                              color: '#38243F', fontSize: '12px', fontWeight: 600, textDecoration: 'none'
                            }}
                            title="View order details"
                          >
                            <Eye size={13} /> View
                          </Link>
                          <a
                            href={`${API_BASE_URL}/admin/orders/${order.id}/invoice`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '5px 8px', borderRadius: '5px',
                              backgroundColor: '#fdfbf7', border: '1px solid #c9b08f',
                              color: '#8c5825', fontSize: '12px', textDecoration: 'none', fontWeight: 600
                            }}
                            title="Tax Invoice"
                          >
                            <FileText size={13} />
                          </a>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary Note */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #EAEAEA', backgroundColor: '#FAF7F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: '#6a554c' }}>
          <span>
            Displaying <strong>{orders.length}</strong> orders for <strong>{getActiveFilterLabel()}</strong>
            {selectedCity ? ` in ${selectedCity}` : ''}
          </span>
          <span>
            Total Value: <strong style={{ color: '#8c5825' }}>{money(orders.reduce((sum, o) => sum + Number(o.total || 0), 0))}</strong>
          </span>
        </div>

      </div>

    </div>
  );
}
