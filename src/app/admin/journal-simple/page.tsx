'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/components/admin/JournalEntry';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  X, 
  Save,
  Calendar,
  MapPin,
  Cloud,
  Tag,
  Lock
} from 'lucide-react';

interface JournalEntryData {
  id: string;
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function SimpleJournalPage() {
  const [entries, setEntries] = useState<JournalEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('ALL');

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    weather: '',
    location: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [searchTerm, moodFilter]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (moodFilter !== 'ALL') params.append('mood', moodFilter);

      const response = await fetch(`/api/admin/journal?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        console.error('Failed to fetch entries:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const url = editingEntry 
        ? `/api/admin/journal/${editingEntry.id}`
        : '/api/admin/journal';
      
      const method = editingEntry ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        setNewEntry({
          title: '',
          content: '',
          mood: '',
          weather: '',
          location: '',
          tags: [],
        });
        setShowNewEntry(false);
        setEditingEntry(null);
        fetchEntries();
      } else {
        const errorText = await response.text();
        console.error('Failed to save entry:', response.status, errorText);
        throw new Error('Failed to save entry');
      }
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleEditEntry = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setEditingEntry(entry);
      setNewEntry({
        title: entry.title,
        content: entry.content,
        mood: entry.mood || '',
        weather: entry.weather || '',
        location: entry.location || '',
        tags: entry.tags || [],
      });
      setShowNewEntry(true);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/journal/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEntries();
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newEntry.tags.includes(newTag.trim())) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const moods = [
    'happy', 'excited', 'grateful', 'calm', 'peaceful', 'relaxed',
    'sad', 'disappointed', 'frustrated', 'anxious', 'worried', 'stressed'
  ];

  const weathers = [
    'sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'overcast', 'clear'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Journal (Simple)</h1>
          <p className="text-muted-foreground">Your private travel thoughts and experiences</p>
        </div>
        <button
          onClick={() => {
            setShowNewEntry(!showNewEntry);
            if (showNewEntry) {
              setEditingEntry(null);
              setNewEntry({
                title: '',
                content: '',
                mood: '',
                weather: '',
                location: '',
                tags: [],
              });
            }
          }}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {showNewEntry ? (
            <>
              <X size={20} className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus size={20} className="mr-2" />
              New Entry
            </>
          )}
        </button>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newEntry.title}
                onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's on your mind today?"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <Cloud size={16} className="inline mr-1" />
                  Weather
                </label>
                <select
                  value={newEntry.weather}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, weather: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select weather</option>
                  {weathers.map(weather => (
                    <option key={weather} value={weather}>
                      {weather.charAt(0).toUpperCase() + weather.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Mood
                </label>
                <select
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, mood: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select mood</option>
                  {moods.map(mood => (
                    <option key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={newEntry.location}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where are you?"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                <Tag size={16} className="inline mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newEntry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary hover:text-primary-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-1 bg-secondary text-white text-sm rounded hover:bg-secondary/90 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
              <Lock size={16} className="text-red-600" />
              <span className="text-sm text-card-foreground">
                All journal entries are private and encrypted for your security
              </span>
            </div>

            {/* Simple Content Editor */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Content *
              </label>
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your journal entry here..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[300px]"
                rows={10}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewEntry(false);
                  setEditingEntry(null);
                  setNewEntry({
                    title: '',
                    content: '',
                    mood: '',
                    weather: '',
                    location: '',
                    tags: [],
                  });
                }}
                className="px-4 py-2 text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Save size={16} className="mr-2" />
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-muted-foreground" />
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Moods</option>
                {moods.map(mood => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting your travel experiences and thoughts
            </p>
            <button
              onClick={() => setShowNewEntry(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Write First Entry
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))
        )}
      </div>
    </div>
  );
}