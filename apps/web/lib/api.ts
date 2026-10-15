const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'omit',
  });

  const data = await response.json();

  if (!response.ok) {
    if (
      (response.status === 403 && data.error === 'ACCOUNT_BLOCKED') ||
      data.error === 'ACCOUNT_BLOCKED' ||
      (typeof data.message === 'string' && data.message.includes('blocked by Campunex'))
    ) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('campunex_account_blocked', {
            detail: { message: data.message || 'You have been blocked by Campunex. Please contact customer care.' },
          })
        );
      }
    }

    const err: any = new Error(data.message || data.error || 'An API error occurred');
    err.status = response.status;
    err.code = data.error;
    throw err;
  }

  return data as T;
}

