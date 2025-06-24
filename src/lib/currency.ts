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

/**
 * Fetches exchange rates with a given base currency.
 */
export async function fetchExchangeRates(base: string): Promise<CurrencyRates> {
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

  return json.rates;
}


/**
 * Converts a given amount from one currency to another.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string = "USD"
): Promise<number> {
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

  return json.result;
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
