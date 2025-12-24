import { useState, useEffect } from 'react';

interface PriceData {
  price: string;
  price_raw: number;
  offer_id: string;
  name: string;
}

interface PricesResponse {
  success: boolean;
  prices: Record<string, PriceData>;
  min_price: string;
  min_price_raw: number;
  updated_at: string;
  models_found: number;
}

const CACHE_KEY = 'prices_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [minPrice, setMinPrice] = useState<string>('300 000');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const now = Date.now();

        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (now - timestamp < CACHE_DURATION) {
            console.log('Using cached prices:', data.prices);
            console.log('Cached min price:', data.min_price);
            setPrices(data.prices);
            setMinPrice(data.min_price);
            setLoading(false);
            return;
          }
        }

        const response = await fetch('https://functions.poehali.dev/c5dcf94d-754c-4745-b50e-37b437be727a');
        
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }

        const result: PricesResponse = await response.json();

        if (result.success) {
          const pricesMap: Record<string, string> = {};
          Object.entries(result.prices).forEach(([model, data]) => {
            pricesMap[model] = data.price;
          });

          console.log('Loaded prices from API:', pricesMap);
          console.log('Min price:', result.min_price);

          setPrices(pricesMap);
          setMinPrice(result.min_price);

          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: { prices: pricesMap, min_price: result.min_price },
            timestamp: now
          }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { prices, minPrice, loading, error };
}