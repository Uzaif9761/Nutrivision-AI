import axios from "axios";

const YOLO_API_KEY = process.env.YOLO_API_KEY!;

// ✅ Map YOLO classes → IFCT-friendly names
const FOOD_NAME_MAP: Record<string, string> = {
  roti: "Roti (wheat)",
  chapati: "Chapati (wheat, made with ghee)",
  rice: "Rice, basmati, cooked",
  dal: "Dal, mixed (cooked)",
  biryani: "Biryani, chicken",
  paneer: "Paneer (cheese)",
  samosa: "Samosa (fried)",
  idli: "Idli (steamed rice cake)",
  dosa: "Dosa (rice crepe)",
  chai: "Chai (tea with milk)",
  lassi: "Lassi (sweet yogurt drink)",
};

// ═══════════════════════════════════════════════
// YOLO DETECTION ONLY (NO NUTRITION HERE)
// ═══════════════════════════════════════════════

export async function detectFoodWithYOLO(imageBase64: string): Promise<{
  foodName: string;
  confidence: number;
}> {
  try {
    const response = await axios.post(
      "https://api.ultralytics.com/v1/predict",
      {
        image: imageBase64,
        conf: 0.4,
      },
      {
        headers: {
          "x-api-key": YOLO_API_KEY,
        },
      }
    );

    const detections = response.data.results || [];

    if (!detections.length) {
      return { foodName: "unknown", confidence: 0 };
    }

    // 🔍 Get highest confidence detection
    const best = detections.sort(
      (a: any, b: any) => (b.confidence || 0) - (a.confidence || 0)
    )[0];

    let detectedName =
      best.class_name || best.name || "unknown";

    detectedName = detectedName.toLowerCase();

    // ✅ Map to IFCT names
    const mappedFood =
      FOOD_NAME_MAP[detectedName] || detectedName;

    return {
      foodName: mappedFood,
      confidence: best.confidence || 0,
    };
  } catch (error) {
    console.error("YOLO detection error:", error);

    return {
      foodName: "unknown",
      confidence: 0,
    };
  }
}