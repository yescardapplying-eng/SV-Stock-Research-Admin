const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; statusCode?: number }> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.message || 'Request failed',
        statusCode: res.status,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error',
    };
  }
}
