'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useRef } from 'react';

interface FilterOption {
  name: string;
  slug: string;
  count?: number;
}

interface FilterBarProps {
  categories?: FilterOption[];
  tags?: FilterOption[];
  authors?: { name: string; id: string; count?: number }[];
  sortOptions?: { label: string; value: string }[];
  className?: string;
  showActiveFilters?: boolean;
}

interface DropdownFilterProps {
  label: string;
  options: FilterOption[] | { name: string; id: string; count?: number }[];
  paramKey: string;
  currentValue?: string;
}

function DropdownFilter({ label, options, paramKey, currentValue }: DropdownFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value && value !== currentValue) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }
    
    // Reset to first page when filtering
    params.delete('page');
    
    const newUrl = `/blog${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
    setIsOpen(false);
  };

  const currentOption = options.find(option => 
    ('slug' in option ? option.slug : option.id) === currentValue
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${currentValue ? 'bg-teal-50 border-teal-300 text-teal-700' : ''}`}
      >
        <Filter className="h-4 w-4" />
        <span>{currentOption ? currentOption.name : label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-1 left-0 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            <div className="p-1">
              {/* Clear option */}
              {currentValue && (
                <>
                  <button
                    onClick={() => handleSelect('')}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span>All {label}</span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                </>
              )}

              {/* Options */}
              {options.map((option) => {
                const optionValue = 'slug' in option ? option.slug : option.id;
                const isSelected = optionValue === currentValue;
                
                return (
                  <button
                    key={optionValue}
                    onClick={() => handleSelect(optionValue)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="truncate">{option.name}</span>
                    <div className="flex items-center gap-2 ml-2">
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500">
                          ({option.count})
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-3 w-3 text-teal-600" />
                      )}
                    </div>
                  </button>
                );
              })}

              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No {label.toLowerCase()} available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortOptions = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Oldest First', value: 'oldest' },
  ];

  const handleSortChange = (sortBy: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (sortBy && sortBy !== 'recent') {
      params.set('sortBy', sortBy);
    } else {
      params.delete('sortBy');
    }
    
    params.delete('page');
    
    const newUrl = `/blog${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  const currentSortOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-1 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeFilters: { key: string; value: string; label: string }[] = [];
  
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const author = searchParams.get('author');
  
  if (query) activeFilters.push({ key: 'query', value: query, label: `Search: "${query}"` });
  if (category) activeFilters.push({ key: 'category', value: category, label: `Category: ${category}` });
  if (tag) activeFilters.push({ key: 'tag', value: tag, label: `Tag: ${tag}` });
  if (author) activeFilters.push({ key: 'author', value: author, label: `Author: ${author}` });

  if (activeFilters.length === 0) return null;

  const removeFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(filterKey);
    params.delete('page');
    
    const newUrl = `/blog${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  const clearAllFilters = () => {
    router.push('/blog');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Active filters:</span>
      
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full"
        >
          {filter.label}
          <button
            onClick={() => removeFilter(filter.key)}
            className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-gray-500 hover:text-gray-700 px-2 py-1 h-auto text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

export function FilterBar({
  categories = [],
  tags = [],
  authors = [],
  className = '',
  showActiveFilters = true,
}: FilterBarProps) {
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category');
  const currentTag = searchParams.get('tag');
  const currentAuthor = searchParams.get('author');
  const currentSort = searchParams.get('sortBy') || 'recent';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        {categories.length > 0 && (
          <DropdownFilter
            label="Categories"
            options={categories}
            paramKey="category"
            currentValue={currentCategory || undefined}
          />
        )}

        {/* Tag Filter */}
        {tags.length > 0 && (
          <DropdownFilter
            label="Tags"
            options={tags}
            paramKey="tag"
            currentValue={currentTag || undefined}
          />
        )}

        {/* Author Filter */}
        {authors.length > 0 && (
          <DropdownFilter
            label="Authors"
            options={authors}
            paramKey="author"
            currentValue={currentAuthor || undefined}
          />
        )}

        {/* Sort Control */}
        <div className="ml-auto">
          <SortSelect currentSort={currentSort} />
        </div>
      </div>

      {/* Active Filters */}
      {showActiveFilters && <ActiveFilters />}
    </div>
  );
}