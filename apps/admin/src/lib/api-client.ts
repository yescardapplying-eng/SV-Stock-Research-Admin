const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 1,
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
    const contentType = res.headers.get('content-type') || '';

    // Guard against non-JSON responses (e.g. Render Free Tier spin-up HTML 502/504)
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      const isColdStart =
        res.status >= 500 ||
        res.status === 404 ||
        text.includes('<!DOCTYPE') ||
        text.includes('<html') ||
        text.includes('Bad Gateway') ||
        text.includes('Gateway Timeout');

      if (retries > 0 && isColdStart) {
        await new Promise((resolve) => setTimeout(resolve, 3500));
        return apiClient<T>(endpoint, options, retries - 1);
      }

      if (isColdStart) {
        return {
          success: false,
          message: 'Backend server abhi wake-up ho raha hai (Render spin-up). Kripya 10-15 second baad dobara "Sign In" par click karein.',
          statusCode: res.status,
        };
      }

      return {
        success: false,
        message: `Server returned unexpected response (${res.status})`,
        statusCode: res.status,
      };
    }

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
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiClient<T>(endpoint, options, retries - 1);
    }
    return {
      success: false,
      message: err.message || 'Network error occurred',
    };
  }
}
