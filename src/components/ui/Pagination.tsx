import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  baseUrl: string;
  searchParams?: URLSearchParams;
  className?: string;
  showInfo?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  baseUrl,
  searchParams,
  className = '',
  showInfo = true,
  maxVisiblePages = 7,
}: PaginationProps) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Helper function to build URL with search params
  const buildUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  // Calculate which page numbers to show
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const sidePages = Math.floor((maxVisiblePages - 3) / 2); // 3 accounts for first, last, and current

    // Always show first page
    pages.push(1);

    // Add ellipsis if there's a gap after first page
    if (currentPage - sidePages > 2) {
      pages.push('ellipsis');
    }

    // Add pages around current page
    const startPage = Math.max(2, currentPage - sidePages);
    const endPage = Math.min(totalPages - 1, currentPage + sidePages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis if there's a gap before last page
    if (currentPage + sidePages < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page (unless it's already included)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav 
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
      aria-label="Pagination navigation"
    >
      {/* Pagination Info */}
      {showInfo && (
        <div className="text-sm text-gray-700 order-2 sm:order-1">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          asChild={currentPage > 1}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3"
        >
          {currentPage > 1 ? (
            <Link href={buildUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </>
          )}
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            const isCurrentPage = page === currentPage;

            return (
              <Button
                key={page}
                variant={isCurrentPage ? "primary" : "outline"}
                size="sm"
                asChild={!isCurrentPage}
                className={`px-3 ${isCurrentPage ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {isCurrentPage ? (
                  <span>{page}</span>
                ) : (
                  <Link href={buildUrl(page)}>
                    {page}
                  </Link>
                )}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          asChild={currentPage < totalPages}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3"
        >
          {currentPage < totalPages ? (
            <Link href={buildUrl(currentPage + 1)}>
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </nav>
  );
}

// Simple pagination component for cases where you just need previous/next
interface SimplePaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  baseUrl: string;
  searchParams?: URLSearchParams;
  className?: string;
}

export function SimplePagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  baseUrl,
  searchParams,
  className = '',
}: SimplePaginationProps) {
  const buildUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        asChild={hasPreviousPage}
        disabled={!hasPreviousPage}
        className="flex items-center gap-2"
      >
        {hasPreviousPage ? (
          <Link href={buildUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </>
        )}
      </Button>

      <span className="text-sm text-gray-700">
        Page {currentPage}
      </span>

      <Button
        variant="outline"
        asChild={hasNextPage}
        disabled={!hasNextPage}
        className="flex items-center gap-2"
      >
        {hasNextPage ? (
          <Link href={buildUrl(currentPage + 1)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  );
}