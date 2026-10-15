import { useState, useEffect } from 'react';
import { Headphones, MessageSquare, CheckCircle, Clock, Send, User, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/support/admin/tickets', {
        params: { status: activeTab !== 'all' ? activeTab : undefined }
      });
      setTickets(data.data || []);
      if (data.data?.length > 0 && !selectedTicket) {
        loadTicketDetail(data.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const { data } = await api.get(`/support/admin/tickets/${id}`);
      setSelectedTicket(data.data);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSendingReply(true);
      await api.post(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim()
      });
      setReplyMessage('');
      // Reload ticket detail
      await loadTicketDetail(selectedTicket.id);
      fetchTickets();
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      await api.patch(`/support/admin/tickets/${selectedTicket.id}/status`, { status: newStatus });
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      fetchTickets();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#fff7e6', color: '#fa8c16', label: 'Open' };
      case 'in_progress': return { bg: '#e6f7ff', color: '#1890ff', label: 'In Progress' };
      case 'resolved': return { bg: '#f6ffed', color: '#52c41a', label: 'Resolved' };
      case 'closed': return { bg: '#f5f5f5', color: '#888', label: 'Closed' };
      default: return { bg: '#f5f5f5', color: '#666', label: status };
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans', fontSize: '32px', color: '#38243F', margin: 0 }}>Helpdesk & Support</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Manage customer inquiries, order questions, and issue resolutions</p>
        </div>
        <button 
          onClick={fetchTickets}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: 600, color: '#555' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'All Tickets' },
          { key: 'open', label: 'Open' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'closed', label: 'Closed' },
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{ 
              padding: '6px 14px', borderRadius: '20px', border: activeTab === tab.key ? '1px solid #38243F' : '1px solid #ddd',
              background: activeTab === tab.key ? '#38243F' : '#fff', color: activeTab === tab.key ? '#fff' : '#555',
              fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer', fontWeight: activeTab === tab.key ? 600 : 400
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two Pane Layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', minHeight: 0 }}>
        {/* Left Pane: Ticket List */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #EAEAEA', fontWeight: 600, fontFamily: 'DM Sans', color: '#38243F', fontSize: '14px' }}>
            Inquiries ({tickets.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans' }}>Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontFamily: 'DM Sans' }}>No tickets found in this tab.</div>
            ) : (
              tickets.map(t => {
                const badge = getStatusBadge(t.status);
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div 
                    key={t.id}
                    onClick={() => loadTicketDetail(t.id)}
                    style={{ 
                      padding: '16px 18px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                      backgroundColor: isSelected ? '#fbf8f5' : '#fff',
                      borderLeft: isSelected ? '4px solid #38243F' : '4px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <strong style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#38243F', lineHeight: '1.3' }}>{t.subject}</strong>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', fontFamily: 'DM Sans', marginBottom: '4px' }}>
                      {t.first_name ? `${t.first_name} ${t.last_name || ''}` : t.customer_email}
                      {t.order_number && <span style={{ marginLeft: '6px', color: '#d4af37' }}>#{t.order_number}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', fontFamily: 'DM Sans' }}>
                      <span>{new Date(t.updated_at).toLocaleDateString()}</span>
                      <span>{t.reply_count || 1} messages</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation & Reply */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedTicket ? (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#888', fontFamily: 'DM Sans' }}>
              Select a ticket on the left to read and reply.
            </div>
          ) : (
            <>
              {/* Ticket Topbar */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontFamily: 'DM Sans', fontSize: '22px', margin: '0 0 4px 0', color: '#38243F' }}>
                    {selectedTicket.subject}
                  </h3>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#666' }}>
                    From: <strong>{selectedTicket.first_name} {selectedTicket.last_name}</strong> ({selectedTicket.customer_email})
                    {selectedTicket.phone && ` · 📞 ${selectedTicket.phone}`}
                    {selectedTicket.order_number && ` · Order #${selectedTicket.order_number}`}
                  </div>
                </div>

                {/* Status action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedTicket.status !== 'resolved' && (
                    <button 
                      onClick={() => handleStatusChange('resolved')}
                      style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #52c41a', background: '#f6ffed', color: '#52c41a', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✓ Mark Resolved
                    </button>
                  )}
                  {selectedTicket.status !== 'closed' && (
                    <button 
                      onClick={() => handleStatusChange('closed')}
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', color: '#666', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Close Ticket
                    </button>
                  )}
                  {selectedTicket.status === 'closed' && (
                    <button 
                      onClick={() => handleStatusChange('open')}
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #38243F', background: '#fff', color: '#38243F', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fcfcfc' }}>
                {loadingDetail ? (
                  <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Loading conversation...</div>
                ) : (
                  selectedTicket.replies?.map((rep: any) => {
                    const isAdmin = rep.sender_role === 'owner' || rep.sender_role === 'staff' || rep.sender_role === 'manager';
                    return (
                      <div 
                        key={rep.id}
                        style={{ 
                          maxWidth: '75%',
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          backgroundColor: isAdmin ? '#38243F' : '#fff',
                          color: isAdmin ? '#fff' : '#333',
                          border: isAdmin ? 'none' : '1px solid #EAEAEA',
                          borderRadius: '8px',
                          padding: '14px 18px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: isAdmin ? '#D4AF37' : '#38243F' }}>
                            {isAdmin ? '🌿 Concierge / Support' : `${rep.first_name || 'Customer'}`}
                          </span>
                          <span style={{ fontSize: '10px', color: isAdmin ? 'rgba(255,255,255,0.6)' : '#999' }}>
                            {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', fontFamily: 'DM Sans' }}>
                          {rep.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} style={{ padding: '16px 20px', borderTop: '1px solid #EAEAEA', backgroundColor: '#fff', display: 'flex', gap: '12px' }}>
                <textarea 
                  required
                  rows={2}
                  placeholder="Type your response to the customer..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'DM Sans', fontSize: '13px', resize: 'none', boxSizing: 'border-box' }}
                />
                <button 
                  type="submit" 
                  disabled={sendingReply}
                  style={{ 
                    padding: '0 20px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '6px', 
                    cursor: sendingReply ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <Send size={15} />
                  <span>{sendingReply ? 'Sending...' : 'Reply'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
