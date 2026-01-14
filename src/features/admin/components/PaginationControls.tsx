/**
 * PaginationControls Component
 * Pagination controls for list views
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <View key={`ellipsis-${index}`} style={styles.ellipsis}>
          <Text style={styles.ellipsisText}>...</Text>
        </View>
      );
    }

    const isActive = page === currentPage;

    return (
      <TouchableOpacity
        key={page}
        style={[styles.pageButton, isActive && styles.pageButtonActive]}
        onPress={() => onPageChange(page as number)}
        activeOpacity={0.7}
        disabled={isActive}
      >
        <Text style={[styles.pageButtonText, isActive && styles.pageButtonTextActive]}>
          {page}
        </Text>
      </TouchableOpacity>
    );
  };

  const getResultsText = (): string => {
    if (!totalItems || !itemsPerPage) return '';

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return `Showing ${startItem}-${endItem} of ${totalItems}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      {totalItems && itemsPerPage && (
        <Text style={styles.resultsText}>{getResultsText()}</Text>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
          onPress={() => onPageChange(currentPage - 1)}
          activeOpacity={0.7}
          disabled={!canGoPrevious}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={canGoPrevious ? '#007aff' : '#c7c7cc'}
          />
          <Text
            style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pagesContainer}>{getPageNumbers().map(renderPageButton)}</View>

        <TouchableOpacity
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          onPress={() => onPageChange(currentPage + 1)}
          activeOpacity={0.7}
          disabled={!canGoNext}
        >
          <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={canGoNext ? '#007aff' : '#c7c7cc'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  resultsText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    minWidth: 90,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#c7c7cc',
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  pageButtonActive: {
    backgroundColor: '#007aff',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  pageButtonTextActive: {
    color: '#fff',
  },
  ellipsis: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsisText: {
    fontSize: 14,
    color: '#8e8e93',
  },
});
