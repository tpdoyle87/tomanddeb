'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  placeholder = "Search articles...",
  className = '',
  autoFocus = false,
  showClearButton = true,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [isSearching, setIsSearching] = useState(false);

  // Update local state when URL search params change
  useEffect(() => {
    const currentQuery = searchParams.get('query') || '';
    setQuery(currentQuery);
  }, [searchParams]);

  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (onSearch) {
      // Custom search handler
      setIsSearching(true);
      try {
        await onSearch(trimmedQuery);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Default: navigate to blog page with search
      const params = new URLSearchParams(searchParams);
      
      if (trimmedQuery) {
        params.set('query', trimmedQuery);
      } else {
        params.delete('query');
      }
      
      // Reset to first page when searching
      params.delete('page');
      
      const newUrl = `/blog${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(newUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    handleSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          disabled={isSearching}
          className={`pl-10 ${showClearButton && query ? 'pr-20' : 'pr-4'}`}
        />

        {/* Clear button */}
        {showClearButton && query && (
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={isSearching}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="h-4 w-px bg-gray-300" />
            
            <Button
              type="submit"
              size="sm"
              disabled={isSearching || !query.trim()}
              className="px-3 py-1 text-xs"
            >
              Search
            </Button>
          </div>
        )}

        {/* Search button for when there's no clear button */}
        {!showClearButton && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button
              type="submit"
              size="sm"
              disabled={isSearching || !query.trim()}
              className="px-3 py-1 text-xs"
            >
              Search
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}

// Compact search bar variant for mobile or smaller spaces
export function CompactSearchBar({
  placeholder = "Search...",
  className = '',
  onSearch,
}: Omit<SearchBarProps, 'showClearButton' | 'autoFocus'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (onSearch) {
      setIsSearching(true);
      try {
        await onSearch(trimmedQuery);
      } finally {
        setIsSearching(false);
      }
    } else {
      const params = new URLSearchParams(searchParams);
      
      if (trimmedQuery) {
        params.set('query', trimmedQuery);
      } else {
        params.delete('query');
      }
      
      params.delete('page');
      
      const newUrl = `/blog${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(newUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleToggle = () => {
    if (isExpanded && query) {
      handleSearch(query);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              disabled={isSearching}
              className="pr-4"
            />
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={isSearching || !query.trim()}
            className="px-3"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setQuery('');
            }}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <Button
          onClick={handleToggle}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      )}
    </div>
  );
}