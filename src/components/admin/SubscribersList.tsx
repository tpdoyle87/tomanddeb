'use client';

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

interface SubscribersListProps {
  subscribers: Subscriber[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  loading?: boolean;
}

export function SubscribersList({ 
  subscribers, 
  onStatusChange, 
  onDelete, 
  onExport,
  loading = false 
}: SubscribersListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNSUBSCRIBED':
        return 'bg-gray-100 text-gray-800';
      case 'BOUNCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'newsletter_form':
        return '📧';
      case 'blog_post':
        return '📝';
      case 'social_media':
        return '📱';
      case 'manual':
        return '👤';
      default:
        return '🌐';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (subscribers.length === 0) {
    return (
      <div className="text-center py-8 bg-card rounded-lg border border-border">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-medium text-card-foreground mb-2">No subscribers yet</h3>
        <p className="text-muted-foreground">
          Subscribers will appear here once people sign up for your newsletter
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Subscriber
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Subscribed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Confirmed
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {subscriber.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subscriber.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={subscriber.status}
                    onChange={(e) => onStatusChange(subscriber.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-none ${getStatusColor(subscriber.status)}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="UNSUBSCRIBED">Unsubscribed</option>
                    <option value="BOUNCED">Bounced</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{getSourceIcon(subscriber.source)}</span>
                    <span className="capitalize">
                      {subscriber.source?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {formatDate(subscriber.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {formatDate(subscriber.confirmedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {subscriber.preferences && (
                      <button
                        title="View preferences"
                        className="text-primary hover:text-primary-dark"
                      >
                        ⚙️
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const mailto = `mailto:${subscriber.email}${subscriber.name ? `?subject=Hello ${subscriber.name}` : ''}`;
                        window.open(mailto);
                      }}
                      title="Send email"
                      className="text-secondary hover:text-secondary/90"
                    >
                      📧
                    </button>
                    <button
                      onClick={() => onDelete(subscriber.id)}
                      title="Delete subscriber"
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Export button */}
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <button
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          📥 Export List
        </button>
      </div>
    </div>
  );
}