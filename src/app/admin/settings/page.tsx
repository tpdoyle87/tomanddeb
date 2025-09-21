'use client';

import { useState, useEffect } from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Settings, Plus, Save, RefreshCw } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface Setting {
  id: string;
  key: string;
  value: any;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT';
  category: string;
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [showNewSetting, setShowNewSetting] = useState(false);

  // New setting form
  const [newSetting, setNewSetting] = useState<{
    key: string;
    value: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT';
    category: string;
    description: string;
    isPublic: boolean;
    isEditable: boolean;
  }>({
    key: '',
    value: '',
    type: 'STRING',
    category: 'general',
    description: '',
    isPublic: false,
    isEditable: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.settings.map((s: Setting) => s.category))] as string[];
        setCategories(uniqueCategories.sort());
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: any) => {
    try {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        const updatedSetting = await response.json();
        setSettings(prev => prev.map(s => 
          s.key === key ? { ...s, value: updatedSetting.value } : s
        ));
        alert('Setting saved successfully!');
      } else {
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      alert('Failed to save setting. Please try again.');
      throw error;
    }
  };

  const handleResetSetting = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/settings/${key}/reset`, {
        method: 'POST',
      });

      if (response.ok) {
        const resetSetting = await response.json();
        setSettings(prev => prev.map(s => 
          s.key === key ? { ...s, value: resetSetting.value } : s
        ));
        alert('Setting reset successfully!');
      } else {
        throw new Error('Failed to reset setting');
      }
    } catch (error) {
      console.error('Failed to reset setting:', error);
      alert('Failed to reset setting. Please try again.');
      throw error;
    }
  };

  const handleCreateSetting = async () => {
    if (!newSetting.key.trim()) {
      alert('Please enter a setting key');
      return;
    }

    // Convert value based on type
    let processedValue: any = newSetting.value;
    if (newSetting.type === 'NUMBER') {
      processedValue = Number(newSetting.value) || 0;
    } else if (newSetting.type === 'BOOLEAN') {
      processedValue = newSetting.value === 'true';
    } else if (newSetting.type === 'JSON') {
      try {
        processedValue = JSON.parse(newSetting.value);
      } catch (error) {
        alert('Invalid JSON format');
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSetting,
          value: processedValue,
        }),
      });

      if (response.ok) {
        const createdSetting = await response.json();
        setSettings(prev => [...prev, createdSetting]);
        
        // Update categories if new one was added
        if (!categories.includes(newSetting.category)) {
          setCategories(prev => [...prev, newSetting.category].sort());
        }
        
        // Reset form
        setNewSetting({
          key: '',
          value: '',
          type: 'STRING',
          category: 'general',
          description: '',
          isPublic: false,
          isEditable: true,
        });
        setShowNewSetting(false);
        
        alert('Setting created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create setting');
      }
    } catch (error) {
      console.error('Failed to create setting:', error);
      alert('Failed to create setting. Please try again.');
    }
  };

  const handleBulkSave = async () => {
    try {
      const response = await fetch('/api/admin/settings/bulk-save', {
        method: 'POST',
      });

      if (response.ok) {
        alert('All modified settings saved successfully!');
        fetchSettings(); // Refresh to show saved state
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const getDefaultSettings = () => [
    {
      key: 'site_name',
      value: siteConfig.name,
      type: 'STRING',
      category: 'general',
      description: 'The name of your website displayed in the header and page titles',
      isPublic: true,
      isEditable: true,
    },
    {
      key: 'site_description',
      value: 'A travel blog sharing adventures from around the world',
      type: 'TEXT',
      category: 'general',
      description: 'Brief description of your site for SEO and social sharing',
      isPublic: true,
      isEditable: true,
    },
    {
      key: 'current_location',
      value: siteConfig.footer.currentLocation,
      type: 'STRING',
      category: 'general',
      description: 'Your current location displayed in the footer',
      isPublic: true,
      isEditable: true,
    },
    {
      key: 'posts_per_page',
      value: 10,
      type: 'NUMBER',
      category: 'content',
      description: 'Number of posts to display per page on the blog listing',
      isPublic: false,
      isEditable: true,
    },
    {
      key: 'allow_comments',
      value: true,
      type: 'BOOLEAN',
      category: 'content',
      description: 'Enable comments on blog posts',
      isPublic: false,
      isEditable: true,
    },
    {
      key: 'social_links',
      value: {
        instagram: '',
        twitter: '',
        facebook: '',
        youtube: ''
      },
      type: 'JSON',
      category: 'social',
      description: 'Social media profile links displayed in the footer',
      isPublic: true,
      isEditable: true,
    },
  ];

  const initializeDefaultSettings = async () => {
    const defaultSettings = getDefaultSettings();
    
    try {
      const response = await fetch('/api/admin/settings/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: defaultSettings }),
      });

      if (response.ok) {
        fetchSettings();
        alert('Default settings initialized successfully!');
      } else {
        throw new Error('Failed to initialize settings');
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      alert('Failed to initialize settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Site Settings</h1>
          <p className="text-muted-foreground">Configure your travel blog settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {settings.length === 0 && !loading && (
            <button
              onClick={initializeDefaultSettings}
              className="inline-flex items-center px-4 py-2 text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
            >
              <RefreshCw size={20} className="mr-2" />
              Initialize Defaults
            </button>
          )}
          <button
            onClick={() => setShowNewSetting(true)}
            className="inline-flex items-center px-4 py-2 text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Setting
          </button>
          <button
            onClick={handleBulkSave}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Save size={20} className="mr-2" />
            Save All
          </button>
        </div>
      </div>

      {/* New Setting Form */}
      {showNewSetting && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">Add New Setting</h2>
            <button
              onClick={() => setShowNewSetting(false)}
              className="text-muted-foreground hover:text-card-foreground"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Key *
              </label>
              <input
                type="text"
                value={newSetting.key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="setting_key"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Type
              </label>
              <select
                value={newSetting.type}
                onChange={(e) => setNewSetting(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'TEXT'
                }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="STRING">String</option>
                <option value="NUMBER">Number</option>
                <option value="BOOLEAN">Boolean</option>
                <option value="TEXT">Text</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Category
              </label>
              <input
                type="text"
                value={newSetting.category}
                onChange={(e) => setNewSetting(prev => ({ ...prev, category: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="general"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Value *
              </label>
              {newSetting.type === 'BOOLEAN' ? (
                <select
                  value={String(newSetting.value)}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : newSetting.type === 'TEXT' || newSetting.type === 'JSON' ? (
                <textarea
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={newSetting.type === 'JSON' ? '{"key": "value"}' : 'Setting value...'}
                />
              ) : (
                <input
                  type={newSetting.type === 'NUMBER' ? 'number' : 'text'}
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Setting value..."
                />
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Description
            </label>
            <textarea
              value={newSetting.description}
              onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional description of what this setting does..."
            />
          </div>
          
          <div className="flex items-center space-x-6 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newSetting.isPublic}
                onChange={(e) => setNewSetting(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-card-foreground">Public (accessible in frontend)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newSetting.isEditable}
                onChange={(e) => setNewSetting(prev => ({ ...prev, isEditable: e.target.checked }))}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-card-foreground">Editable</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNewSetting(false)}
              className="px-4 py-2 text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSetting}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Create Setting
            </button>
          </div>
        </div>
      )}

      {/* Settings Form */}
      {settings.length === 0 && !loading ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Settings className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">No settings configured</h3>
          <p className="text-muted-foreground mb-4">
            Set up your site settings to customize your travel blog
          </p>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={initializeDefaultSettings}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <RefreshCw size={20} className="mr-2" />
              Initialize Default Settings
            </button>
            <button
              onClick={() => setShowNewSetting(true)}
              className="inline-flex items-center px-4 py-2 text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Custom Setting
            </button>
          </div>
        </div>
      ) : (
        <SettingsForm
          settings={settings}
          categories={categories}
          onSave={handleSaveSetting}
          onReset={handleResetSetting}
          loading={loading}
        />
      )}
    </div>
  );
}