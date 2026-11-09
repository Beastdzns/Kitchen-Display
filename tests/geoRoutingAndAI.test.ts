import { describe, it, expect } from "vitest";
import { calculateDistanceKm, routeToNearestOutlet, findOutletByLocality } from "../src/lib/geo/router";
import { generateReorderSuggestions } from "../src/lib/ai/reorderEngine";

describe("Geo-Routing & AI Reorder Engine", () => {
  it("should calculate Haversine distance accurately", () => {
    // Kondapur (17.4699, 78.3578) to Gachibowli (17.4401, 78.3489) ~ 3.4 km
    const dist = calculateDistanceKm(17.4699, 78.3578, 17.4401, 78.3489);
    expect(dist).toBeGreaterThan(3.0);
    expect(dist).toBeLessThan(4.0);
  });

  it("should route customer at Whitefields, Kondapur to Kondapur Hub", () => {
    // Whitefields coordinates
    const userLat = 17.469;
    const userLng = 78.358;

    const route = routeToNearestOutlet(userLat, userLng);
    expect(route).not.toBeNull();
    expect(route?.outlet.id).toBe("kondapur");
    expect(route?.isDeliverable).toBe(true);
  });

  it("should match locality queries correctly", () => {
    const outlet = findOutletByLocality("Kukatpally");
    expect(outlet?.id).toBe("kukatpally");

    const cloudKitchen = findOutletByLocality("Gachibowli");
    expect(cloudKitchen?.id).toBe("gachibowli-cloud");
  });

  it("should generate reorder recommendations based on order history", () => {
    const mockPastOrders = [
      {
        placedAt: "2026-11-01T20:14:00",
        items: [
          { menuItemId: "chk-dum-biryani-family", itemName: "Chicken Dum Biryani (Family Pack)", quantity: 2 },
          { menuItemId: "double-ka-meetha", itemName: "Shahi Double Ka Meetha", quantity: 2 },
        ],
      },
      {
        placedAt: "2026-11-04T20:30:00",
        items: [
          { menuItemId: "chk-dum-biryani-family", itemName: "Chicken Dum Biryani (Family Pack)", quantity: 1 },
        ],
      },
    ];

    const dinnerTime = new Date("2026-11-06T20:00:00");
    const suggestions = generateReorderSuggestions(mockPastOrders, dinnerTime);

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].menuItemId).toBe("chk-dum-biryani-family");
    expect(suggestions[0].confidenceScore).toBeGreaterThan(0.7);
  });

  it("should provide cold start bestsellers if no previous order history exists", () => {
    const suggestions = generateReorderSuggestions([]);
    expect(suggestions.length).toBe(3);
    expect(suggestions[0].badgeText).toBe("Bestseller");
  });
});

