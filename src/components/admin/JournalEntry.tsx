'use client';

import { useState } from 'react';
import { Calendar, MapPin, Cloud, Tag, Edit, Trash2, Lock } from 'lucide-react';

interface JournalEntryProps {
  entry: {
    id: string;
    title: string;
    content: string;
    mood?: string;
    weather?: string;
    location?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function JournalEntry({ entry, onEdit, onDelete }: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodColor = (mood?: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy':
      case 'excited':
      case 'grateful':
        return 'bg-green-100 text-green-800';
      case 'sad':
      case 'disappointed':
      case 'frustrated':
        return 'bg-red-100 text-red-800';
      case 'anxious':
      case 'worried':
      case 'stressed':
        return 'bg-yellow-100 text-yellow-800';
      case 'calm':
      case 'peaceful':
      case 'relaxed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return '☀️';
      case 'cloudy':
      case 'overcast':
        return '☁️';
      case 'rainy':
      case 'rain':
        return '🌧️';
      case 'snowy':
      case 'snow':
        return '❄️';
      case 'windy':
        return '💨';
      default:
        return '🌤️';
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-card-foreground">{entry.title}</h3>
            <span title="Private entry">
              <Lock size={16} className="text-red-600" />
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(entry.createdAt)}</span>
            </div>
            
            {entry.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{entry.location}</span>
              </div>
            )}
            
            {entry.weather && (
              <div className="flex items-center gap-1">
                <span>{getWeatherIcon(entry.weather)}</span>
                <span className="capitalize">{entry.weather}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(entry.id)}
            className="p-2 text-muted-foreground hover:text-card-foreground rounded hover:bg-muted transition-colors"
            title="Edit entry"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition-colors"
            title="Delete entry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Mood and Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {entry.mood && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
            {entry.mood}
          </span>
        )}
        
        {entry.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            <Tag size={12} className="mr-1" />
            {tag}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="mb-4">
        <div 
          className="prose prose-sm max-w-none text-card-foreground"
          dangerouslySetInnerHTML={{ 
            __html: isExpanded ? entry.content : truncateContent(entry.content)
          }}
        />
        
        {entry.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-primary hover:text-primary-dark text-sm font-medium"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Footer */}
      {entry.updatedAt !== entry.createdAt && (
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Last updated: {formatDate(entry.updatedAt)}
        </div>
      )}
    </div>
  );
}