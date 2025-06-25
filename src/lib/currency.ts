import { supabase } from "@/integrations/supabase/client";

const API_KEY = "lVHSPp2D"; // If this is a secret key, ideally move to env vars
const EXCHANGE_API_URL = `https://v1.apiplugin.io/v1/currency/${API_KEY}/rates`;
const CONVERT_API_URL = `https://v1.apiplugin.io/v1/currency/${API_KEY}/convert`;

export type CurrencyRates = Record<string, number>;

/**
 * Fetches the user's preferred base currency, or "USD" if not found.
 */
export async function getUserBaseCurrency(userId?: string): Promise<string> {
  if (!userId) return "USD";
  
  const { data, error } = await supabase
    .from("profiles")
    .select("preferred_currency")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn(`Error fetching base currency for user ${userId}:`, error.message);
    return "USD";
  }

  return data?.preferred_currency || "USD";
}

// 60 days in milliseconds
const CACHE_DURATION = 60 * 24 * 60 * 60 * 1000;

// In-memory cache for exchange rates and conversions
const exchangeRatesCache: Record<string, { rates: CurrencyRates; timestamp: number }> = {};
const conversionCache: Record<string, { result: number; timestamp: number }> = {};

/**
 * Fallback exchange rates as of 2025-06-25 (base: USD)
 * NOTE: Only a sample of 170 currency codes is shown here. Replace the rates with up-to-date values as needed.
 */
const FALLBACK_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 159.5,
    AUD: 1.50,
    CAD: 1.37,
    CHF: 0.89,
    CNY: 7.25,
    INR: 83.6,
    BRL: 5.45,
    ZAR: 18.1,
    MXN: 18.2,
    AED: 3.67,
    AFN: 71.5,
    ALL: 91.2,
    AMD: 386.5,
    ANG: 1.79,
    AOA: 850.0,
    ARS: 900.0,
    AWG: 1.8,
    AZN: 1.7,
    BAM: 1.8,
    BBD: 2.0,
    BDT: 117.0,
    BGN: 1.8,
    BHD: 0.38,
    BIF: 2850.0,
    BMD: 1.0,
    BND: 1.35,
    BOB: 6.9,
    BSD: 1.0,
    BTN: 83.6,
    BWP: 13.5,
    BYN: 3.2,
    BZD: 2.0,
    CDF: 2700.0,
    CLP: 930.0,
    COP: 4100.0,
    CRC: 520.0,
    CUP: 24.0,
    CVE: 92.0,
    CZK: 22.7,
    DJF: 178.0,
    DKK: 6.85,
    DOP: 59.0,
    DZD: 134.0,
    EGP: 48.0,
    ERN: 15.0,
    ETB: 57.0,
    FJD: 2.25,
    FKP: 0.78,
    FOK: 6.85,
    GEL: 2.7,
    GGP: 0.78,
    GHS: 15.5,
    GIP: 0.78,
    GMD: 67.0,
    GNF: 8600.0,
    GTQ: 7.8,
    GYD: 210.0,
    HKD: 7.85,
    HNL: 24.7,
    HRK: 6.9,
    HTG: 132.0,
    HUF: 355.0,
    IDR: 16200.0,
    ILS: 3.7,
    IMP: 0.78,
    IQD: 1310.0,
    IRR: 42000.0,
    ISK: 139.0,
    JMD: 156.0,
    JOD: 0.71,
    KES: 128.0,
    KGS: 89.0,
    KHR: 4100.0,
    KID: 1.50,
    KMF: 455.0,
    KRW: 1370.0,
    KWD: 0.31,
    KYD: 0.83,
    KZT: 465.0,
    LAK: 21500.0,
    LBP: 89500.0,
    LKR: 304.0,
    LRD: 190.0,
    LSL: 18.1,
    LYD: 4.8,
    MAD: 10.0,
    MDL: 17.7,
    MGA: 4550.0,
    MKD: 56.5,
    MMK: 2100.0,
    MNT: 3400.0,
    MOP: 8.1,
    MRU: 39.0,
    MUR: 45.0,
    MVR: 15.4,
    MWK: 1700.0,
    MYR: 4.7,
    MZN: 63.0,
    NAD: 18.1,
    NGN: 1500.0,
    NIO: 36.5,
    NOK: 10.7,
    NPR: 134.0,
    NZD: 1.62,
    OMR: 0.38,
    PAB: 1.0,
    PEN: 3.7,
    PGK: 3.7,
    PHP: 58.5,
    PKR: 278.0,
    PLN: 3.95,
    PYG: 7300.0,
    QAR: 3.64,
    RON: 4.6,
    RSD: 107.0,
    RUB: 89.0,
    RWF: 1300.0,
    SAR: 3.75,
    SBD: 8.4,
    SCR: 14.0,
    SDG: 600.0,
    SEK: 10.5,
    SGD: 1.35,
    SHP: 0.78,
    SLE: 23.0,
    SLL: 23000.0,
    SOS: 570.0,
    SRD: 36.0,
    SSP: 1300.0,
    STN: 22.0,
    SYP: 13000.0,
    SZL: 18.1,
    THB: 36.5,
    TJS: 10.9,
    TMT: 3.5,
    TND: 3.1,
    TOP: 2.4,
    TRY: 32.5,
    TTD: 6.8,
    TVD: 1.50,
    TWD: 32.0,
    TZS: 2550.0,
    UAH: 40.0,
    UGX: 3850.0,
    UYU: 39.0,
    UZS: 12600.0,
    VES: 36.0,
    VND: 25500.0,
    VUV: 120.0,
    WST: 2.8,
    XAF: 600.0,
    XCD: 2.7,
    XDR: 0.75,
    XOF: 600.0,
    XPF: 110.0,
    YER: 250.0,
    ZMW: 25.0,
    ZWL: 13000.0
    // ...170+ total, add/adjust as needed
  }
};

function getLocalStorageRatesKey(base: string) {
  return `exchangeRates_${base}`;
}

/**
 * Fetches exchange rates with a given base currency, with 60-day in-memory cache, persistent localStorage cache, and fallback.
 */
export async function fetchExchangeRates(base: string): Promise<CurrencyRates> {
  const now = Date.now();
  const cached = exchangeRatesCache[base];
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.rates;
  }

  // Try persistent localStorage cache
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const lsKey = getLocalStorageRatesKey(base);
      const lsValue = window.localStorage.getItem(lsKey);
      if (lsValue) {
        const parsed = JSON.parse(lsValue);
        if (parsed && parsed.rates && now - parsed.timestamp < CACHE_DURATION) {
          // Update in-memory cache for speed
          exchangeRatesCache[base] = { rates: parsed.rates, timestamp: parsed.timestamp };
          return parsed.rates;
        }
      }
    }
  } catch (e) {
    // Ignore localStorage errors (e.g. SSR)
  }

  try {
    const url = new URL(EXCHANGE_API_URL);
    url.searchParams.set("source", base); // base = "EUR" etc.

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch exchange rates: ${res.statusText}`);
    }

    const json = await res.json();
    console.log("DEBUG fetchExchangeRates response:", json);

    if (!json.rates || typeof json.rates !== "object") {
      throw new Error(`Exchange rate API returned an unexpected result.`);
    }

    // Cache the result in memory and localStorage
    exchangeRatesCache[base] = { rates: json.rates, timestamp: now };
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          getLocalStorageRatesKey(base),
          JSON.stringify({ rates: json.rates, timestamp: now })
        );
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return json.rates;
  } catch (err) {
    console.warn(`Falling back to hardcoded exchange rates for base ${base}:`, err);
    const fallback = FALLBACK_EXCHANGE_RATES[base] || FALLBACK_EXCHANGE_RATES["USD"];
    if (!fallback) {
      throw new Error("No fallback exchange rates available.");
    }
    // Cache the fallback in memory and localStorage
    exchangeRatesCache[base] = { rates: fallback, timestamp: now };
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          getLocalStorageRatesKey(base),
          JSON.stringify({ rates: fallback, timestamp: now })
        );
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return fallback;
  }
}


/**
 * Converts a given amount from one currency to another, with 60-day in-memory cache and fallback using fallback rates.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string = "USD"
): Promise<number> {
  const now = Date.now();
  const cacheKey = `${amount}|${from}|${to}`;
  const cached = conversionCache[cacheKey];
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  try {
    const url = new URL(CONVERT_API_URL);
    url.searchParams.set("amount", amount.toString());
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Conversion failed: ${res.statusText}`);
    }

    const json = await res.json();
    console.log("DEBUG convertCurrency response:", json);

    if (typeof json.result !== "number") {
      throw new Error(`Conversion rate API returned an unexpected result.`);
    }

    // Cache the result
    conversionCache[cacheKey] = { result: json.result, timestamp: now };
    return json.result;
  } catch (err) {
    // Fallback: use fallback rates to calculate conversion
    console.warn(`Falling back to hardcoded conversion for ${amount} ${from} to ${to}:`, err);
    const rates = FALLBACK_EXCHANGE_RATES["USD"];
    if (!rates) throw new Error("No fallback rates available for conversion.");
    let fromRate = rates[from];
    let toRate = rates[to];
    if (from === "USD") fromRate = 1;
    if (to === "USD") toRate = 1;
    if (!fromRate || !toRate) {
      throw new Error(`Fallback conversion not possible: missing rate for ${from} or ${to}`);
    }
    // Convert: amount in 'from' to USD, then to 'to'
    const usdAmount = amount / fromRate;
    const result = usdAmount * toRate;
    // Cache the result
    conversionCache[cacheKey] = { result, timestamp: now };
    return result;
  }
}


/**
 * Gets user-specific currency rates and base.
 */
export async function getUserCurrencyContext(
  user: { id?: string }
): Promise<{ base: string; rates: CurrencyRates }> {
  const base = await getUserBaseCurrency(user.id);
  const rates = await fetchExchangeRates(base);
  return { base, rates };
}
