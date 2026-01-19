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
