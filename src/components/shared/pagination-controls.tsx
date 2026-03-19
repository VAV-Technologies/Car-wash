'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void; // In real app, this would update query params
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center space-x-4 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Go to previous page"
        className="bg-brand-dark-gray text-white hover:bg-brand-orange hover:text-black border-none rounded-md"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-white">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Go to next page"
        className="bg-brand-dark-gray text-white hover:bg-brand-orange hover:text-black border-none rounded-md"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
