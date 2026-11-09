import { describe, it, expect } from "vitest";
import { predictPrepTime, checkOrderLateness } from "../src/lib/ai/prepPredictor";

describe("AI Prep-Time Prediction Engine", () => {
  const mockOutlet = {
    id: "kondapur",
    name: "Kondapur Hub",
    minPrepTimeMinutes: 25,
    currentStaffCount: 10,
    stationCapacityFactor: 2.5,
  };

  const sampleItems = [
    { id: "chk-dum-biryani-family", name: "Chicken Dum Biryani (Family)", quantity: 1, basePrepTimeMinutes: 20 },
    { id: "double-ka-meetha", name: "Shahi Double Ka Meetha", quantity: 2, basePrepTimeMinutes: 5 },
  ];

  it("should never promise less than the outlet minimum prep time (Guardrail 1)", () => {
    // Quick single item with 0 open tickets
    const singleQuickItem = [{ id: "double-ka-meetha", name: "Double Ka Meetha", quantity: 1, basePrepTimeMinutes: 5 }];
    const normalTime = new Date("2026-11-06T15:00:00"); // 3 PM Friday (non-dinner peak)

    const result = predictPrepTime(singleQuickItem, mockOutlet, 0, normalTime);
    expect(result.promisedMinutes).toBeGreaterThanOrEqual(mockOutlet.minPrepTimeMinutes);
    expect(result.promisedMinutes).toBe(25); // Lower bounded by 25
  });

  it("should increase prep time proportionally under heavy kitchen queue", () => {
    const normalTime = new Date("2026-11-06T15:00:00");
    const lowLoad = predictPrepTime(sampleItems, mockOutlet, 2, normalTime);
    const heavyLoad = predictPrepTime(sampleItems, mockOutlet, 30, normalTime);

    expect(heavyLoad.predictedMinutes).toBeGreaterThan(lowLoad.predictedMinutes);
    expect(heavyLoad.kitchenLoadRatio).toBeGreaterThan(lowLoad.kitchenLoadRatio);
  });

  it("should apply Friday and Sunday dinner rush factor (1.35x) during 19:30-22:30", () => {
    // Friday dinner peak 20:15
    const fridayDinner = new Date("2026-11-06T20:15:00"); // Day 5 = Friday
    // Friday afternoon 14:00
    const fridayAfternoon = new Date("2026-11-06T14:00:00");

    const peakResult = predictPrepTime(sampleItems, mockOutlet, 10, fridayDinner);
    const regularResult = predictPrepTime(sampleItems, mockOutlet, 10, fridayAfternoon);

    expect(peakResult.appliedRushFactor).toBe(1.35);
    expect(peakResult.isRushHour).toBe(true);
    expect(peakResult.promisedMinutes).toBeGreaterThan(regularResult.promisedMinutes);
  });

  it("should respect chef manager overrides", () => {
    const normalTime = new Date("2026-11-06T15:00:00");
    const base = predictPrepTime(sampleItems, mockOutlet, 5, normalTime, 0);
    const withOverride = predictPrepTime(sampleItems, mockOutlet, 5, normalTime, 10);

    expect(withOverride.promisedMinutes).toBe(base.promisedMinutes + 10);
    expect(withOverride.explanation).toContain("Manual override (+10m)");
  });

  it("should trigger late alert at 10 minutes past promise (Guardrail 3)", () => {
    const placed = new Date("2026-11-06T20:00:00");
    const promised = new Date("2026-11-06T20:40:00");

    // At 20:45 (5 mins late) -> isLate = true, isPastGracePeriod = false
    const check5mins = checkOrderLateness(placed, promised, new Date("2026-11-06T20:45:00"));
    expect(check5mins.isLate).toBe(true);
    expect(check5mins.isPastGracePeriod).toBe(false);
    expect(check5mins.minutesLate).toBe(5);

    // At 20:50 (10 mins late) -> isLate = true, isPastGracePeriod = true (breach alert!)
    const check10mins = checkOrderLateness(placed, promised, new Date("2026-11-06T20:50:00"));
    expect(check10mins.isLate).toBe(true);
    expect(check10mins.isPastGracePeriod).toBe(true);
    expect(check10mins.minutesLate).toBe(10);
  });
});
