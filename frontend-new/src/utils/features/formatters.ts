// Utility funkce pro formatování dat

export function formatCurrency(amount: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('cs-CZ', options || defaultOptions);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('cs-CZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Dnes';
  if (diffDays === 1) return date > now ? 'Zítra' : 'Včera';
  if (diffDays <= 7) return date > now ? `Za ${diffDays} dní` : `Před ${diffDays} dny`;
  if (diffDays <= 30) return date > now ? `Za ${Math.ceil(diffDays / 7)} týdnů` : `Před ${Math.ceil(diffDays / 7)} týdny`;
  
  return formatDate(dateString);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(days: number): string {
  if (days < 1) return 'Méně než den';
  if (days === 1) return '1 den';
  if (days < 7) return `${days} dní`;
  if (days < 30) return `${Math.round(days / 7)} týdnů`;
  if (days < 365) return `${Math.round(days / 30)} měsíců`;
  
  return `${Math.round(days / 365)} let`;
}

export function formatProgress(current: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = (current / total) * 100;
  return formatPercentage(percentage, 0);
}
