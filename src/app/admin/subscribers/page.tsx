'use client';

import { useState, useEffect } from 'react';
import { SubscribersList } from '@/components/admin/SubscribersList';
import { StatsCard } from '@/components/admin/StatsCard';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Search, 
  Filter, 
  Download,
  Plus,
  Send,
  BarChart3
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED' | 'BOUNCED';
  source?: string;
  preferences?: {
    categories?: string[];
    frequency?: string;
  };
  confirmedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriberStats {
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
  bounced: number;
  thisMonth: number;
  growthRate: number;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNewSubscriberForm, setShowNewSubscriberForm] = useState(false);
  const [showNewsletterComposer, setShowNewsletterComposer] = useState(false);

  // New subscriber form
  const [newSubscriber, setNewSubscriber] = useState<{
    email: string;
    name: string;
    status: 'CONFIRMED' | 'PENDING';
    source: string;
  }>({
    email: '',
    name: '',
    status: 'CONFIRMED',
    source: 'manual',
  });

  // Newsletter composer
  const [newsletter, setNewsletter] = useState({
    subject: '',
    content: '',
    recipients: 'CONFIRMED' as 'ALL' | 'CONFIRMED' | 'PENDING',
  });

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, sourceFilter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(sourceFilter !== 'ALL' && { source: sourceFilter }),
      });

      const response = await fetch(`/api/admin/subscribers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/subscribers/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscriber stats:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSubscribers();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update subscriber status:', error);
      alert('Failed to update subscriber. Please try again.');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubscribers();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      alert('Failed to delete subscriber. Please try again.');
    }
  };

  const handleExportSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export subscribers:', error);
      alert('Failed to export subscribers. Please try again.');
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      const response = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubscriber),
      });

      if (response.ok) {
        setNewSubscriber({ email: '', name: '', status: 'CONFIRMED', source: 'manual' });
        setShowNewSubscriberForm(false);
        fetchSubscribers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add subscriber');
      }
    } catch (error) {
      console.error('Failed to add subscriber:', error);
      alert('Failed to add subscriber. Please try again.');
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletter.subject.trim() || !newsletter.content.trim()) {
      alert('Please fill in both subject and content');
      return;
    }

    try {
      const response = await fetch('/api/admin/newsletters/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsletter),
      });

      if (response.ok) {
        setNewsletter({ subject: '', content: '', recipients: 'CONFIRMED' });
        setShowNewsletterComposer(false);
        alert('Newsletter sent successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send newsletter');
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      alert('Failed to send newsletter. Please try again.');
    }
  };

  const sources = [
    'newsletter_form', 
    'blog_post', 
    'social_media', 
    'manual', 
    'import'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">Manage your email subscribers and send newsletters</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewSubscriberForm(true)}
            className="inline-flex items-center px-4 py-2 text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Subscriber
          </button>
          <button
            onClick={() => setShowNewsletterComposer(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Send size={20} className="mr-2" />
            Send Newsletter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Subscribers"
          value={stats?.total || 0}
          change={stats?.growthRate ? {
            value: Math.round(stats.growthRate),
            type: stats.growthRate > 0 ? 'increase' : 'decrease'
          } : undefined}
          icon={Users}
          description={`${stats?.thisMonth || 0} new this month`}
          loading={!stats}
        />
        
        <StatsCard
          title="Confirmed"
          value={stats?.confirmed || 0}
          icon={UserCheck}
          description="Active subscribers"
          loading={!stats}
        />
        
        <StatsCard
          title="Pending"
          value={stats?.pending || 0}
          icon={Mail}
          description="Awaiting confirmation"
          loading={!stats}
        />
        
        <StatsCard
          title="Unsubscribed"
          value={stats?.unsubscribed || 0}
          icon={UserX}
          description="Opted out"
          loading={!stats}
        />
        
        <StatsCard
          title="Bounced"
          value={stats?.bounced || 0}
          icon={BarChart3}
          description="Invalid emails"
          loading={!stats}
        />
      </div>

      {/* New Subscriber Form */}
      {showNewSubscriberForm && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">Add New Subscriber</h2>
            <button
              onClick={() => setShowNewSubscriberForm(false)}
              className="text-muted-foreground hover:text-card-foreground"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                value={newSubscriber.email}
                onChange={(e) => setNewSubscriber(prev => ({ ...prev, email: e.target.value }))}
                placeholder="subscriber@example.com"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                value={newSubscriber.name}
                onChange={(e) => setNewSubscriber(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Status
              </label>
              <select
                value={newSubscriber.status}
                onChange={(e) => setNewSubscriber(prev => ({ 
                  ...prev, 
                  status: e.target.value as 'CONFIRMED' | 'PENDING' 
                }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Source
              </label>
              <select
                value={newSubscriber.source}
                onChange={(e) => setNewSubscriber(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowNewSubscriberForm(false)}
              className="px-4 py-2 text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubscriber}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Add Subscriber
            </button>
          </div>
        </div>
      )}

      {/* Newsletter Composer */}
      {showNewsletterComposer && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">Send Newsletter</h2>
            <button
              onClick={() => setShowNewsletterComposer(false)}
              className="text-muted-foreground hover:text-card-foreground"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newsletter.subject}
                  onChange={(e) => setNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Newsletter subject line"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Recipients
                </label>
                <select
                  value={newsletter.recipients}
                  onChange={(e) => setNewsletter(prev => ({ 
                    ...prev, 
                    recipients: e.target.value as 'ALL' | 'CONFIRMED' | 'PENDING'
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="CONFIRMED">Confirmed ({stats?.confirmed || 0})</option>
                  <option value="PENDING">Pending ({stats?.pending || 0})</option>
                  <option value="ALL">All ({stats?.total || 0})</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Content *
              </label>
              <textarea
                value={newsletter.content}
                onChange={(e) => setNewsletter(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your newsletter content here..."
                rows={8}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowNewsletterComposer(false)}
              className="px-4 py-2 text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendNewsletter}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Send Newsletter
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
                <option value="BOUNCED">Bounced</option>
              </select>
            </div>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>
                  {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleExportSubscribers}
              className="flex items-center px-4 py-2 text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <SubscribersList
        subscribers={subscribers}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteSubscriber}
        onExport={handleExportSubscribers}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}