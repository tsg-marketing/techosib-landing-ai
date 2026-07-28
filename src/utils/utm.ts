export const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content'
];

export const saveUtmToCookies = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasUtm = UTM_PARAMS.some(param => urlParams.has(param));
  
  if (!hasUtm) return;

  UTM_PARAMS.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      document.cookie = `${param}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  });
};

export const getYaClientId = (): Promise<string> => {
  return new Promise((resolve) => {
    const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym;
    const fromCookie = (): string => {
      const m = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    };
    if (typeof ym !== 'function') return resolve(fromCookie());
    let done = false;
    const finish = (v: string) => {
      if (!done) {
        done = true;
        resolve(v || fromCookie());
      }
    };
    try {
      ym(106348259, 'getClientID', (id: unknown) => finish(String(id)));
    } catch {
      finish('');
    }
    setTimeout(() => finish(''), 600);
  });
};

export const getUtmFromCookies = (): Record<string, string> => {
  const cookies = document.cookie.split('; ');
  const utmData: Record<string, string> = {};
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.split('=');
    if (UTM_PARAMS.includes(name)) {
      utmData[name] = decodeURIComponent(value);
    }
  });
  
  return utmData;
};