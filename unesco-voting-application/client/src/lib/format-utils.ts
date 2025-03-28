/**
 * Format a timestamp into a relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  // If more than 30 days, just return the date
  return date.toLocaleDateString();
}

/**
 * Get the appropriate CSS class for a ranking change
 */
export function getRankChangeClass(change: number): string {
  if (change > 0) {
    return "text-green-600";
  } else if (change < 0) {
    return "text-red-600";
  } else {
    return "text-neutral-500";
  }
}

/**
 * Get the icon name for a ranking change
 */
export function getRankChangeIcon(change: number): string {
  if (change > 0) {
    return "arrow-up";
  } else if (change < 0) {
    return "arrow-down";
  } else {
    return "minus";
  }
}

/**
 * Get the icon and class for a heritage site category
 */
export function getCategoryInfo(category: string): {
  icon: string;
  className: string;
} {
  const normalizedCategory = category.toUpperCase();
  
  if (normalizedCategory === "CULTURAL") {
    return {
      icon: "landmark",
      className: "text-primary-dark"
    };
  } else if (normalizedCategory === "NATURAL") {
    return {
      icon: "leaf",
      className: "text-green-700"
    };
  } else if (normalizedCategory === "MIXED") {
    return {
      icon: "mountain-sun",
      className: "text-amber-700"
    };
  }
  
  // Default
  return {
    icon: "landmark",
    className: "text-primary-dark"
  };
}
