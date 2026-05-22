export function getVisiblePageNumbers(
  totalPages: number,
  activePage: number
): number[] {
  return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    if (totalPages <= 5) {
      return index + 1;
    }

    if (activePage <= 3) {
      return index + 1;
    }

    if (activePage >= totalPages - 2) {
      return totalPages - 4 + index;
    }

    return activePage - 2 + index;
  });
}
