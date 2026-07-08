export function getNavVisibility(currentPage, totalPages) {
  const safeTotal = Math.max(totalPages, 0);
  const safeCurrent = Math.min(Math.max(currentPage, 0), Math.max(safeTotal - 1, 0));
  return {
    showPrev: safeCurrent > 0,
    showNext: safeCurrent < safeTotal - 1,
  };
}
