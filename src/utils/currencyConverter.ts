
// Currency conversion utility
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export interface ExchangeRates {
  [currency: string]: number;
}

let cachedRates: ExchangeRates | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  const now = Date.now();
  
  // Return cached rates if they're still fresh
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    cachedRates = data.rates;
    lastFetchTime = now;
    
    return cachedRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5,
      BRL: 5.2,
      ZAR: 14.8,
      NGN: 411,
      KES: 110,
      GHS: 6.1,
      EGP: 15.7,
      MAD: 9.0,
      TND: 2.8,
      AED: 3.67,
      SAR: 3.75,
      QAR: 3.64,
      MWK: 820
    };
  }
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'USD'
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await fetchExchangeRates();
  
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
  const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

export const formatCurrency = (amount: number, currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    ZAR: 'R',
    NGN: '₦',
    KES: 'KSh',
    GHS: '₵',
    EGP: 'E£',
    MAD: 'MAD',
    TND: 'TND',
    AED: 'د.إ',
    SAR: 'SR',
    QAR: 'QR',
    MWK: 'MK'
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount.toLocaleString()}`;
};
