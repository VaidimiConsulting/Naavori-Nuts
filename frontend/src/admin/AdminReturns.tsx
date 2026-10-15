import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Clock, DollarSign, MessageSquare, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<'original_payment' | 'store_credit'>('original_payment');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/returns', {
        params: { status: activeTab !== 'all' ? activeTab : undefined }
      });
      setReturns(data.data || []);
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [activeTab]);

  const handleStatusUpdate = async (id: string, status: string, admin_comment?: string) => {
    try {
      await api.patch(`/admin/returns/${id}/status`, { status, admin_comment });
      fetchReturns();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn || !refundAmount) return;

    try {
      setSubmitting(true);
      await api.post(`/admin/returns/${selectedReturn.id}/refund`, {
        order_id: selectedReturn.order_id,
        amount: refundAmount,
        method: refundMethod,
        transaction_id: transactionId
      });
      setShowRefundModal(false);
      setSelectedReturn(null);
      fetchReturns();
    } catch (err) {
      console.error('Error processing refund:', err);
      alert('Failed to process refund');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fff7e6', color: '#fa8c16', label: 'Pending Review' };
      case 'approved': return { bg: '#e6f7ff', color: '#1890ff', label: 'Approved (Awaiting Pickup)' };
      case 'received': return { bg: '#f9f0ff', color: '#722ed1', label: 'Received at Facility' };
      case 'refunded': return { bg: '#f6ffed', color: '#52c41a', label: 'Refunded' };
      case 'rejected': return { bg: '#fff1f0', color: '#cf1322', label: 'Rejected' };
      default: return { bg: '#f5f5f5', color: '#595959', label: status };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>Returns & Refunds</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Review customer return requests, inspect quality, and issue refunds</p>
        </div>
        <button 
          onClick={fetchReturns}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600, color: '#555' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'approved', label: 'Approved' },
          { key: 'received', label: 'Received' },
          { key: 'refunded', label: 'Refunded' },
          { key: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: activeTab === tab.key ? '1px solid #38243F' : '1px solid #ddd',
              background: activeTab === tab.key ? '#38243F' : '#fff', color: activeTab === tab.key ? '#fff' : '#555',
              fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer', fontWeight: activeTab === tab.key ? 600 : 400
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Loader2 size={20} className="spin" /> Loading return requests...
          </div>
        ) : returns.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans' }}>
            No return requests found in this category.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f9f9f9', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Order & Customer</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Return Reason</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Order Amount</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Requested Date</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(ret => {
                  const badge = getStatusBadge(ret.status);
                  return (
                    <tr key={ret.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ display: 'block', color: '#38243F' }}>#{ret.order_number}</strong>
                        <span style={{ fontSize: '13px', color: '#555' }}>{ret.shipping_name || ret.guest_email}</span>
                        <div style={{ fontSize: '12px', color: '#888' }}>{ret.shipping_phone}</div>
                      </td>
                      <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                        <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: '1.4' }}>{ret.reason}</p>
                        {ret.admin_comment && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                            Admin note: {ret.admin_comment}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: badge.bg, color: badge.color, textTransform: 'uppercase'
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: '#38243F' }}>
                        ₹{Number(ret.order_total).toLocaleString('en-IN')}
                        {ret.refund_amount && (
                          <div style={{ fontSize: '11px', color: '#52c41a', fontWeight: 500 }}>
                            Refunded: ₹{Number(ret.refund_amount).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#666', fontSize: '13px' }}>
                        {new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {ret.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(ret.id, 'approved', 'Approved by admin')}
                                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #1890ff', background: '#e6f7ff', color: '#1890ff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(ret.id, 'rejected', 'Items not eligible for return')}
                                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ffccc7', background: '#fff1f0', color: '#cf1322', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {ret.status === 'approved' && (
                            <button 
                              onClick={() => handleStatusUpdate(ret.id, 'received', 'Package received and verified')}
                              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #d3adf7', background: '#f9f0ff', color: '#722ed1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Mark Received
                            </button>
                          )}

                          {(ret.status === 'received' || ret.status === 'approved') && !ret.refund_amount && (
                            <button 
                              onClick={() => {
                                setSelectedReturn(ret);
                                setRefundAmount(Number(ret.order_total));
                                setShowRefundModal(true);
                              }}
                              style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#38243F', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Issue Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Refund Modal */}
      {showRefundModal && selectedReturn && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '440px', width: '100%', padding: '28px' }}>
            <h2 style={{ fontFamily: 'DM Sans', fontSize: '24px', margin: '0 0 8px 0', color: '#38243F' }}>
              Issue Refund for #{selectedReturn.order_number}
            </h2>
            <p style={{ fontFamily: 'DM Sans', color: '#666', fontSize: '13px', margin: '0 0 20px 0' }}>
              Customer: {selectedReturn.shipping_name} ({selectedReturn.guest_email})
            </p>

            <form onSubmit={handleProcessRefund} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Refund Amount (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  max={Number(selectedReturn.order_total)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Refund Destination Method</label>
                <select 
                  value={refundMethod}
                  onChange={(e: any) => setRefundMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                >
                  <option value="original_payment">Original Payment Method (Bank Transfer / Cash Refund)</option>
                  <option value="store_credit">Store Credit / Coupon Voucher</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#38243F', marginBottom: '6px' }}>Transaction / Reference ID</label>
                <input 
                  type="text"
                  placeholder="e.g. RZP_REF_892348"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRefundModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#38243F', color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans' }}
                >
                  {submitting ? 'Processing...' : 'Confirm & Issue Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
