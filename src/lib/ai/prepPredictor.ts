export interface PrepItemInput {
  id: string;
  name: string;
  quantity: number;
  basePrepTimeMinutes: number;
}

export interface OutletCapacityInput {
  id: string;
  name: string;
  minPrepTimeMinutes: number;
  currentStaffCount: number;
  stationCapacityFactor?: number;
}

export interface PrepPredictionResult {
  predictedMinutes: number;
  promisedMinutes: number;
  minOutletMinutes: number;
  appliedRushFactor: number;
  kitchenLoadRatio: number;
  explanation: string;
  isRushHour: boolean;
}

/**
 * AI Prep-Time Prediction Engine
 * Computes honest prep-time based on item culinary complexity, active kitchen load,
 * staff capacity, and dinner rush patterns, enforced by strict guardrails.
 */
export function predictPrepTime(
  items: PrepItemInput[],
  outlet: OutletCapacityInput,
  openTicketsCount: number,
  currentTime: Date = new Date(),
  managerOverrideMinutes: number = 0
): PrepPredictionResult {
  // 1. Calculate base culinary preparation workload
  // Heaviest single dish defines the minimum cooking critical path,
  // plus marginal assembly/potting time for accompanying dishes.
  if (items.length === 0) {
    return {
      predictedMinutes: outlet.minPrepTimeMinutes,
      promisedMinutes: outlet.minPrepTimeMinutes,
      minOutletMinutes: outlet.minPrepTimeMinutes,
      appliedRushFactor: 1.0,
      kitchenLoadRatio: 0,
      explanation: `Standard outlet minimum prep time of ${outlet.minPrepTimeMinutes} mins.`,
      isRushHour: false,
    };
  }

  const maxItemBaseTime = Math.max(...items.map((i) => i.basePrepTimeMinutes));
  const additionalItemsTime = items.reduce((acc, item) => {
    // 25% incremental time per additional item for plating/packaging
    return acc + (item.quantity > 1 ? (item.quantity - 1) * 2 : 0) + item.basePrepTimeMinutes * 0.15;
  }, 0);

  const baseCulinaryTime = maxItemBaseTime + additionalItemsTime;

  // 2. Kitchen Load Physics: Open tickets vs Staff Capacity
  const staff = Math.max(1, outlet.currentStaffCount);
  const capacityFactor = outlet.stationCapacityFactor || 2.5;
  const kitchenCapacity = staff * capacityFactor;
  const kitchenLoadRatio = openTicketsCount / kitchenCapacity;
  const loadMultiplier = 1 + Math.min(kitchenLoadRatio, 2.0) * 0.6; // Max 2.2x scaling under heavy load

  // 3. Peak Rush Window Calibration (Friday and Sunday dinner peaks: 1,200 orders/hr brief constraint)
  const day = currentTime.getDay(); // 0 = Sunday, 5 = Friday
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Peak dinner window: 19:30 (1170 mins) to 22:30 (1350 mins)
  const isDinnerPeak = timeInMinutes >= 19 * 60 + 30 && timeInMinutes <= 22 * 60 + 30;
  const isFridayOrSunday = day === 0 || day === 5;

  let appliedRushFactor = 1.0;
  if (isFridayOrSunday && isDinnerPeak) {
    appliedRushFactor = 1.35; // Friday/Sunday dinner surge
  } else if (isDinnerPeak) {
    appliedRushFactor = 1.15; // Weekday dinner surge
  }

  // 4. Raw AI statistical estimate
  const rawPredictedMinutes = Math.round(baseCulinaryTime * loadMultiplier * appliedRushFactor);

  // 5. GUARDRAIL 1: Promised time is the HIGHER of AI estimate and outlet minimum prep time
  let finalPromisedMinutes = Math.max(outlet.minPrepTimeMinutes, rawPredictedMinutes);

  // 6. GUARDRAIL 2: Manager override adjustment
  if (managerOverrideMinutes !== 0) {
    finalPromisedMinutes += managerOverrideMinutes;
  }

  // Generate transparent human-readable explanation
  let explanation = "";
  if (managerOverrideMinutes !== 0) {
    explanation = `Manual override (+${managerOverrideMinutes}m) by outlet chef. Total promised: ${finalPromisedMinutes} mins.`;
  } else if (finalPromisedMinutes === outlet.minPrepTimeMinutes && rawPredictedMinutes < outlet.minPrepTimeMinutes) {
    explanation = `AI estimated ${rawPredictedMinutes} mins, but rounded up to outlet standard minimum (${outlet.minPrepTimeMinutes} mins) for guarantee.`;
  } else if (appliedRushFactor > 1.2) {
    explanation = `High weekend peak (${openTicketsCount} active tickets across ${staff} staff). Dynamic estimate: ${finalPromisedMinutes} mins.`;
  } else if (openTicketsCount > staff * 1.5) {
    explanation = `Elevated station load (${openTicketsCount} tickets in prep). Dynamic estimate: ${finalPromisedMinutes} mins.`;
  } else {
    explanation = `Optimal kitchen flow (${openTicketsCount} active tickets). Dynamic estimate: ${finalPromisedMinutes} mins.`;
  }

  return {
    predictedMinutes: rawPredictedMinutes,
    promisedMinutes: finalPromisedMinutes,
    minOutletMinutes: outlet.minPrepTimeMinutes,
    appliedRushFactor,
    kitchenLoadRatio: Number(kitchenLoadRatio.toFixed(2)),
    explanation,
    isRushHour: appliedRushFactor > 1.0,
  };
}

/**
 * Guardrail 3: 10-minute past promise breach monitor
 * An order 10 minutes past its promise alerts the outlet manager and updates the customer.
 */
export function checkOrderLateness(
  placedAt: Date | string,
  promisedAt: Date | string,
  currentTime: Date = new Date()
): { isLate: boolean; isPastGracePeriod: boolean; minutesLate: number } {
  const promisedTime = new Date(promisedAt).getTime();
  const now = currentTime.getTime();

  const diffMinutes = Math.floor((now - promisedTime) / (1000 * 60));

  return {
    isLate: diffMinutes > 0,
    isPastGracePeriod: diffMinutes >= 10, // 10 minutes past promise breach threshold
    minutesLate: Math.max(0, diffMinutes),
  };
}
