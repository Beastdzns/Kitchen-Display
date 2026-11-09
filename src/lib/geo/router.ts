import { HYDERABAD_OUTLETS, HyderabadOutletSeed } from "../constants";

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export interface RouteMatchResult {
  outlet: HyderabadOutletSeed;
  distanceKm: number;
  isDeliverable: boolean;
  message: string;
}

/**
 * Auto-routes customer to the nearest operating outlet or cloud kitchen
 * within the permitted delivery radius.
 */
export function routeToNearestOutlet(
  userLat: number,
  userLng: number,
  outletList: HyderabadOutletSeed[] = HYDERABAD_OUTLETS
): RouteMatchResult | null {
  if (!outletList || outletList.length === 0) return null;

  const matches = outletList.map((outlet) => {
    const distanceKm = calculateDistanceKm(userLat, userLng, outlet.lat, outlet.lng);
    const isDeliverable = distanceKm <= outlet.deliveryRadiusKm;
    return {
      outlet,
      distanceKm,
      isDeliverable,
      message: isDeliverable
        ? `Delivering from ${outlet.name} (${distanceKm} km away)`
        : `Outside delivery radius (${distanceKm} km > ${outlet.deliveryRadiusKm} km max)`,
    };
  });

  // Sort by distance ascending
  matches.sort((a, b) => a.distanceKm - b.distanceKm);

  // Return the closest outlet (deliverable or nearest for pickup)
  return matches[0];
}

/**
 * Quick search / resolution by Hyderabad locality keyword
 * e.g., "Kondapur", "Gachibowli", "Hitec City", "Kukatpally", "Banjara Hills"
 */
export function findOutletByLocality(
  keyword: string,
  outletList: HyderabadOutletSeed[] = HYDERABAD_OUTLETS
): HyderabadOutletSeed | null {
  const query = keyword.toLowerCase().trim();
  const directMatch = outletList.find(
    (o) =>
      o.locality.toLowerCase().includes(query) ||
      o.name.toLowerCase().includes(query) ||
      o.address.toLowerCase().includes(query)
  );
  return directMatch || outletList[0]; // Fallback to primary Kondapur Hub if not found
}
