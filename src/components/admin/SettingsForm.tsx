'use client';

import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

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

interface SettingsFormProps {
  settings: Setting[];
  onSave: (key: string, value: any) => Promise<void>;
  onReset: (key: string) => Promise<void>;
  loading?: boolean;
  categories?: string[];
}

export function SettingsForm({ 
  settings, 
  onSave, 
  onReset, 
  loading = false,
  categories = []
}: SettingsFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    settings.forEach(setting => {
      initial[setting.key] = setting.value;
    });
    return initial;
  });

  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'general');

  const handleSave = async (key: string) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await onSave(key, formData[key]);
    } catch (error) {
      console.error('Failed to save setting:', error);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleReset = async (key: string) => {
    try {
      await onReset(key);
      // Reset form data to original value
      const setting = settings.find(s => s.key === key);
      if (setting) {
        setFormData(prev => ({ ...prev, [key]: setting.value }));
      }
    } catch (error) {
      console.error('Failed to reset setting:', error);
    }
  };

  const renderInput = (setting: Setting) => {
    const value = formData[setting.key];
    const isChanged = value !== setting.value;

    if (!setting.isEditable) {
      return (
        <div className="px-3 py-2 bg-gray-50 text-gray-500 rounded-lg">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </div>
      );
    }

    switch (setting.type) {
      case 'BOOLEAN':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [setting.key]: e.target.checked 
              }))}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-card-foreground">
              {Boolean(value) ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [setting.key]: Number(e.target.value) || 0
            }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              isChanged ? 'border-yellow-400 bg-yellow-50' : 'border-border'
            }`}
          />
        );

      case 'TEXT':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [setting.key]: e.target.value 
            }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              isChanged ? 'border-yellow-400 bg-yellow-50' : 'border-border'
            }`}
          />
        );

      case 'JSON':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, [setting.key]: parsed }));
              } catch {
                // Keep as string until valid JSON
                setFormData(prev => ({ ...prev, [setting.key]: e.target.value }));
              }
            }}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm ${
              isChanged ? 'border-yellow-400 bg-yellow-50' : 'border-border'
            }`}
            placeholder='{"key": "value"}'
          />
        );

      default: // STRING
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [setting.key]: e.target.value 
            }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              isChanged ? 'border-yellow-400 bg-yellow-50' : 'border-border'
            }`}
          />
        );
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>);

  const settingsInCategory = groupedSettings[activeCategory] || [];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-card rounded-lg p-6 border border-border">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeCategory === category
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground hover:border-gray-300'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-4">
        {settingsInCategory.map((setting) => {
          const isChanged = formData[setting.key] !== setting.value;
          
          return (
            <div key={setting.key} className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium text-card-foreground">
                      {setting.key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h3>
                    {setting.isPublic && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Public
                      </span>
                    )}
                    {isChanged && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Modified
                      </span>
                    )}
                  </div>
                  
                  {setting.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {setting.description}
                    </p>
                  )}
                  
                  <div className="mb-4">
                    {renderInput(setting)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Type: {setting.type} • Key: {setting.key}
                  </div>
                </div>

                {setting.isEditable && (
                  <div className="flex items-center space-x-2">
                    {isChanged && (
                      <>
                        <button
                          onClick={() => handleSave(setting.key)}
                          disabled={saving[setting.key]}
                          className="flex items-center px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                          {saving[setting.key] ? (
                            <RefreshCw className="animate-spin mr-1" size={16} />
                          ) : (
                            <Save className="mr-1" size={16} />
                          )}
                          Save
                        </button>
                        <button
                          onClick={() => handleReset(setting.key)}
                          className="px-3 py-2 text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
                        >
                          Reset
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {settingsInCategory.length === 0 && (
        <div className="text-center py-8 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-medium text-card-foreground mb-2">No settings found</h3>
          <p className="text-muted-foreground">
            There are no settings in the "{activeCategory}" category.
          </p>
        </div>
      )}
    </div>
  );
}