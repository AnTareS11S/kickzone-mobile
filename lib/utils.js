export const formatRemainingTime = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffInDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const diffInHours = Math.ceil((end - now) / (1000 * 60 * 60));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  }
  return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
};
