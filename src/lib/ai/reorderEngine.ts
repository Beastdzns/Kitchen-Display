export interface PastOrderItem {
  menuItemId: string;
  itemName: string;
  category: string;
  orderCount: number;
  lastOrderedDate: string;
}

export interface ReorderSuggestion {
  menuItemId: string;
  itemName: string;
  reason: string;
  confidenceScore: number;
  badgeText: string;
}

/**
 * AI Customer Reorder Engine
 * Analyzes previous order patterns, dish frequencies, meal-time affinities,
 * and seasonal Hyderabadi preferences.
 *
 * GUARDRAIL: Suggestions NEVER auto-add items to the cart.
 * They are presented in an "Order Again" carousel for explicit user addition.
 */
export function generateReorderSuggestions(
  pastOrders: { placedAt: string; items: { menuItemId: string; itemName: string; quantity: number }[] }[],
  currentDate: Date = new Date()
): ReorderSuggestion[] {
  if (!pastOrders || pastOrders.length === 0) {
    // Cold start recommendations for new customers
    return [
      {
        menuItemId: "chk-dum-biryani-family",
        itemName: "Chicken Dum Biryani (Family Pack)",
        reason: "Most popular direct-order choice in Hyderabad today.",
        confidenceScore: 0.95,
        badgeText: "Bestseller",
      },
      {
        menuItemId: "double-ka-meetha",
        itemName: "Shahi Double Ka Meetha",
        reason: "Traditional pairing with Hyderabadi Dum Biryani.",
        confidenceScore: 0.88,
        badgeText: "Perfect Pairing",
      },
      {
        menuItemId: "mutton-haleem",
        itemName: "Authentic Hyderabadi Mutton Haleem",
        reason: "Nizami heritage slow-cooked specialty.",
        confidenceScore: 0.85,
        badgeText: "Chef Special",
      },
    ];
  }

  // 1. Frequency and recency map
  const itemMap = new Map<string, { itemName: string; count: number; lastDate: Date }>();

  for (const order of pastOrders) {
    const orderDate = new Date(order.placedAt);
    for (const item of order.items) {
      const existing = itemMap.get(item.menuItemId);
      if (existing) {
        existing.count += item.quantity;
        if (orderDate > existing.lastDate) {
          existing.lastDate = orderDate;
        }
      } else {
        itemMap.set(item.menuItemId, {
          itemName: item.itemName,
          count: item.quantity,
          lastDate: orderDate,
        });
      }
    }
  }

  // 2. Score items based on frequency and time affinity
  const currentHour = currentDate.getHours();
  const suggestions: ReorderSuggestion[] = [];

  for (const [menuItemId, data] of itemMap.entries()) {
    let score = Math.min(1.0, data.count * 0.2); // Frequency score
    let reason = `Ordered ${data.count} times in your recent history.`;
    let badge = "Frequent Favorite";

    // Time of day affinity
    if (currentHour >= 12 && currentHour <= 15) {
      if (menuItemId.includes("biryani")) {
        score += 0.2;
        reason = `Your usual lunchtime indulgence. Ordered ${data.count} times.`;
        badge = "Lunch Favorite";
      }
    } else if (currentHour >= 19 && currentHour <= 23) {
      if (menuItemId.includes("biryani") || menuItemId.includes("haleem")) {
        score += 0.2;
        reason = `Hot dinner dum recommendation based on past orders.`;
        badge = "Dinner Classic";
      }
    } else if (currentHour >= 16 && currentHour <= 18) {
      if (menuItemId.includes("chai") || menuItemId.includes("meetha")) {
        score += 0.25;
        reason = `Evening tea & dessert pairing from your history.`;
        badge = "Evening Tea";
      }
    }

    suggestions.push({
      menuItemId,
      itemName: data.itemName,
      reason,
      confidenceScore: Math.min(0.99, Number(score.toFixed(2))),
      badgeText: badge,
    });
  }

  // Sort by highest confidence score
  suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Return top 4 personalized suggestions
  return suggestions.slice(0, 4);
}

