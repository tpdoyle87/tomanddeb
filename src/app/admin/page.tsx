'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { 
  FileText, 
  Users, 
  Eye, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  Image,
  BookOpen
} from 'lucide-react';

interface DashboardStats {
  posts: {
    total: number;
    published: number;
    drafts: number;
    thisMonth: number;
  };
  subscribers: {
    total: number;
    thisMonth: number;
  };
  views: {
    total: number;
    thisMonth: number;
  };
  comments: {
    total: number;
    pending: number;
  };
  journal: {
    total: number;
    thisMonth: number;
  };
  media: {
    total: number;
    storage: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your travel blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Posts"
          value={stats?.posts.total || 0}
          change={stats?.posts.thisMonth ? {
            value: stats.posts.thisMonth,
            type: 'increase'
          } : undefined}
          icon={FileText}
          description={`${stats?.posts.published || 0} published, ${stats?.posts.drafts || 0} drafts`}
          loading={loading}
        />
        
        <StatsCard
          title="Subscribers"
          value={stats?.subscribers.total || 0}
          change={stats?.subscribers.thisMonth ? {
            value: stats.subscribers.thisMonth,
            type: 'increase'
          } : undefined}
          icon={Users}
          description={`${stats?.subscribers.thisMonth || 0} new this month`}
          loading={loading}
        />
        
        <StatsCard
          title="Total Views"
          value={stats?.views.total || 0}
          change={stats?.views.thisMonth ? {
            value: Math.round((stats.views.thisMonth / stats.views.total) * 100),
            type: 'increase'
          } : undefined}
          icon={Eye}
          description={`${stats?.views.thisMonth || 0} this month`}
          loading={loading}
        />
        
        <StatsCard
          title="Comments"
          value={stats?.comments.total || 0}
          icon={MessageCircle}
          description={`${stats?.comments.pending || 0} pending approval`}
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Journal Entries"
          value={stats?.journal.total || 0}
          icon={BookOpen}
          description={`${stats?.journal.thisMonth || 0} new this month`}
          loading={loading}
        />
        
        <StatsCard
          title="Media Files"
          value={stats?.media.total || 0}
          icon={Image}
          description={`${stats?.media.storage || '0 MB'} total storage`}
          loading={loading}
        />
        
        <StatsCard
          title="Monthly Growth"
          value={`${stats?.posts.thisMonth || 0}%`}
          icon={TrendingUp}
          description="Content growth rate"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/posts/new"
            className="flex items-center space-x-3 p-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FileText size={20} />
            <span>New Post</span>
          </a>
          
          <a
            href="/admin/journal"
            className="flex items-center space-x-3 p-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <BookOpen size={20} />
            <span>Add Journal Entry</span>
          </a>
          
          <a
            href="/admin/media"
            className="flex items-center space-x-3 p-4 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Image size={20} />
            <span>Upload Media</span>
          </a>
          
          <a
            href="/admin/subscribers"
            className="flex items-center space-x-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users size={20} />
            <span>View Subscribers</span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">New post published</p>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">5 new subscribers</p>
              <p className="text-sm text-muted-foreground">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">3 comments awaiting approval</p>
              <p className="text-sm text-muted-foreground">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}