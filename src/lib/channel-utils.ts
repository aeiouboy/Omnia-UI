/**
 * Channel Mapping Utilities
 *
 * Normalizes legacy channel values from external API to new three-channel standard:
 * - web: All delivery platforms (GrabMart, LINE MAN, FoodDelivery, etc.)
 * - lazada: All Lazada marketplace variants
 * - shopee: All Shopee marketplace variants
 */

/**
 * All legacy delivery platform channel values that map to "web"
 */
const LEGACY_WEB_CHANNELS = [
  'GrabMart',
  'LINE MAN',
  'FoodDelivery',
  'Tops Online',
  'ShopeeFood',
  'GOKOO',
  'GRAB',
  'LINEMAN',
  'grabmart',
  'line man',
  'fooddelivery',
  'tops online',
  'shopeefood',
  'gokoo',
  'grab',
  'lineman',
] as const;

/**
 * All Lazada marketplace variants that map to "lazada"
 */
const LEGACY_LAZADA_CHANNELS = [
  'Lazada',
  'LAZADA',
  'lazada',
] as const;

/**
 * All Shopee marketplace variants that map to "shopee"
 */
const LEGACY_SHOPEE_CHANNELS = [
  'Shopee',
  'SHOPEE',
  'shopee',
] as const;

/**
 * New standardized channel types
 */
export type StandardChannel = 'web' | 'lazada' | 'shopee';

/**
 * Maps legacy channel values from external API to new standard channel names.
 *
 * @param channel - The channel value from API (may be legacy or already normalized)
 * @returns The standardized channel name ('web', 'lazada', or 'shopee')
 *
 * @example
 * mapLegacyChannel('GrabMart') // returns 'web'
 * mapLegacyChannel('LINE MAN') // returns 'web'
 * mapLegacyChannel('Lazada')   // returns 'lazada'
 * mapLegacyChannel('web')      // returns 'web' (already normalized)
 */
export function mapLegacyChannel(channel: string | undefined | null): StandardChannel {
  if (!channel) {
    return 'web'; // Default fallback
  }

  const normalizedChannel = channel.toLowerCase().trim();

  // Check if already a standard channel
  if (normalizedChannel === 'web' || normalizedChannel === 'lazada' || normalizedChannel === 'shopee') {
    return normalizedChannel as StandardChannel;
  }

  // Map legacy web channels (delivery platforms)
  if (
    LEGACY_WEB_CHANNELS.some((legacy) => legacy.toLowerCase() === normalizedChannel) ||
    normalizedChannel.includes('grab') ||
    normalizedChannel.includes('line') ||
    normalizedChannel.includes('food') ||
    normalizedChannel.includes('tops') ||
    normalizedChannel.includes('gokoo')
  ) {
    return 'web';
  }

  // Map legacy Lazada channels
  if (
    LEGACY_LAZADA_CHANNELS.some((legacy) => legacy.toLowerCase() === normalizedChannel) ||
    normalizedChannel.includes('lazada')
  ) {
    return 'lazada';
  }

  // Map legacy Shopee channels
  if (
    LEGACY_SHOPEE_CHANNELS.some((legacy) => legacy.toLowerCase() === normalizedChannel) ||
    normalizedChannel.includes('shopee')
  ) {
    return 'shopee';
  }

  // Default to 'web' for any unknown legacy channels
  return 'web';
}

/**
 * Normalizes a channel value to ensure consistent casing and format.
 * This is a lighter version of mapLegacyChannel() for values that are already
 * expected to be in the standard format.
 *
 * @param channel - The channel value to normalize
 * @returns The normalized channel name in lowercase
 *
 * @example
 * normalizeChannel('WEB')    // returns 'web'
 * normalizeChannel('Lazada') // returns 'lazada'
 * normalizeChannel(undefined) // returns 'web'
 */
export function normalizeChannel(channel: string | undefined | null): StandardChannel {
  if (!channel) {
    return 'web'; // Default fallback
  }

  const normalized = channel.toLowerCase().trim();

  if (normalized === 'web' || normalized === 'lazada' || normalized === 'shopee') {
    return normalized as StandardChannel;
  }

  // If not a standard channel, attempt legacy mapping
  return mapLegacyChannel(channel);
}

/**
 * Checks if a channel value is a standard channel name.
 *
 * @param channel - The channel value to check
 * @returns true if the channel is already in standard format
 */
export function isStandardChannel(channel: string): channel is StandardChannel {
  return channel === 'web' || channel === 'lazada' || channel === 'shopee';
}
