import { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Star } from 'lucide-react';
import api from '../services/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews?all=true');
      setReviews(data.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(current => current.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete review', error);
      alert('Failed to delete review');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: '#38243F', margin: 0 }}>Customer Reviews</h1>
          <p style={{ fontFamily: 'DM Sans', color: '#666', margin: '4px 0 0 0' }}>Moderate user feedback</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #EAEAEA', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f9f9f9', color: '#666', borderBottom: '1px solid #EAEAEA' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Customer</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Rating</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Review Text</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}><MessageSquare size={24} style={{ marginBottom: '8px', opacity: 0.5 }}/><br/>No reviews found.</td></tr>
            ) : (
              reviews.map(review => (
                <tr key={review.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <strong style={{ color: '#38243F' }}>{review.customer_name}</strong><br/>
                    <small style={{ color: '#888' }}>{review.role}</small>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#D4AF37' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} strokeWidth={i < review.rating ? 0 : 1} />
                    ))}
                  </td>
                  <td style={{ padding: '16px 20px', maxWidth: '400px' }}>
                    <span style={{ fontStyle: 'italic', color: '#555' }}>"{review.review_text}"</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{new Date(review.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button onClick={() => deleteReview(review.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans', fontWeight: 500 }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
