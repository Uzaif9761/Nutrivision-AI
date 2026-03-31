"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface ScanResult {
  food_name: string;
  confidence: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  description: string;
  suggestion?: string;
  manual_input?: boolean;
}

export default function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [mealType, setMealType] = useState<string>("lunch");
  const [dragOver, setDragOver] = useState(false);
  const [manualFoodInput, setManualFoodInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
      setLogged(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleScan = async (manualName?: string) => {
    if (!image && !manualName) return;
    setScanning(true);
    setResult(null);

    try {
      const payload: any = {};
      if (image) payload.image_base64 = image;
      if (manualName) payload.manual_food_name = manualName;

      const res = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        // Show error with suggestion
        setResult({
          food_name: manualName || "Unknown",
          confidence: 0,
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0,
          description: data.data?.description || data.error || "Could not identify this food. Try typing the food name instead.",
          suggestion: data.data?.suggestion,
        });
      }
    } catch (error) {
      setResult({
        food_name: manualName || "Error",
        confidence: 0,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        description: "Recognition failed. Try entering the food name manually (e.g., Roti sabji, Butter chicken).",
        suggestion: "Popular foods: Roti, Chapati, Dal, Rice, Biryani, Chicken, Paneer, Samosa",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleLog = async () => {
    if (!result) return;
    setLogging(true);

    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_name: result.food_name,
          meal_type: mealType,
          calories: result.calories,
          protein_g: result.protein_g,
          carbs_g: result.carbs_g,
          fat_g: result.fat_g,
          fiber_g: result.fiber_g,
          confidence: result.confidence,
          image_url: image && image.startsWith("data:") ? undefined : image,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to log meal: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error logging meal:", error);
      // Continue anyway - meal logging is optional
    }

    setLogged(true);
    setLogging(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setLogged(false);
    setManualFoodInput("");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Camera className="w-7 h-7 text-[var(--accent)]" />
          Food Scanner
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Upload a photo or type the food name for AI-powered nutrition analysis from IFCT 2017.
        </p>
      </div>

      {/* Manual Input Section */}
      <div className="glass-card p-5 space-y-3 border border-[rgba(56,239,125,0.1)] bg-[rgba(56,239,125,0.02)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[rgba(56,239,125,0.2)] flex items-center justify-center">
            <span className="text-xs text-[var(--accent)] font-bold">📝</span>
          </div>
          <h3 className="font-semibold text-sm">Or Type the Food Name</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Roti sabji, Butter chicken, Dal, Chapati with ghee..."
            value={manualFoodInput}
            onChange={(e) => setManualFoodInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && manualFoodInput.trim()) {
                handleScan(manualFoodInput);
                setManualFoodInput("");
              }
            }}
            disabled={scanning}
            className="flex-1 px-3 py-2.5 text-sm rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(56,239,125,0.2)] text-[var(--text)] placeholder-[rgba(139,148,158,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(56,239,125,0.5)] focus:border-transparent transition-all"
          />
          <button
            onClick={() => {
              if (manualFoodInput.trim()) {
                handleScan(manualFoodInput);
                setManualFoodInput("");
              }
            }}
            disabled={scanning || !manualFoodInput.trim()}
            className="px-4 py-2.5 bg-[rgba(56,239,125,0.15)] text-[var(--accent)] rounded-lg font-medium text-sm border border-[rgba(56,239,125,0.3)] hover:bg-[rgba(56,239,125,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>
        <p className="text-xs text-[rgba(139,148,158,0.6)]">
          ✓ Supports: Roti, Chapati, Dal, Rice, Biryani, Chicken, Paneer, Samosa, and more from IFCT 2017
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div>
          {!image ? (
            <div
              className={`glass-card p-8 border-2 border-dashed transition-all cursor-pointer min-h-[360px] flex flex-col items-center justify-center text-center ${
                dragOver
                  ? "border-[var(--accent)] bg-[rgba(56,239,125,0.04)]"
                  : "border-[rgba(56,239,125,0.1)] hover:border-[rgba(56,239,125,0.25)]"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div className="w-20 h-20 rounded-2xl bg-[rgba(56,239,125,0.08)] flex items-center justify-center mb-5">
                <Upload className="w-9 h-9 text-[var(--accent)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Drop your photo here</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                or click to browse • Supports JPG, PNG, WebP
              </p>
              <div className="flex items-center gap-3">
                <button className="btn-primary !text-sm !py-2.5 !px-5">
                  <ImageIcon className="w-4 h-4" /> Upload Image
                </button>
                <button className="btn-secondary !text-sm !py-2.5 !px-5">
                  <Camera className="w-4 h-4" /> Take Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Food preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex items-center justify-center hover:bg-[rgba(248,81,73,0.5)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {/* Meal type selector */}
                <div>
                  <label className="text-xs text-[var(--muted)] block mb-2">Meal Type</label>
                  <div className="flex gap-2">
                    {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setMealType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                          mealType === type
                            ? "bg-[rgba(56,239,125,0.15)] text-[var(--accent)] border border-[rgba(56,239,125,0.3)]"
                            : "bg-[rgba(255,255,255,0.03)] text-[var(--muted)] border border-transparent hover:bg-[rgba(255,255,255,0.06)]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {!result && !scanning && (
                  <button onClick={() => handleScan()} className="btn-primary w-full justify-center">
                    <Sparkles className="w-4 h-4" /> Analyze with AI
                  </button>
                )}

                {scanning && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
                    <span className="text-sm text-[var(--muted)]">AI is analyzing your meal...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="glass-card p-6 space-y-5 fade-in-up">
              {/* Food Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="text-xl font-bold">{result.food_name}</h2>
                </div>
                <p className="text-sm text-[var(--muted)]">{result.description}</p>
                {result.confidence > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(56,239,125,0.08)] text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    {Math.round(result.confidence * 100)}% confidence {result.manual_input && "(manual input)"}
                  </div>
                )}
                {result.suggestion && (
                  <div className="mt-3 p-2 rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] text-xs text-[rgba(248,113,113,0.8)]">
                    💡 {result.suggestion}
                  </div>
                )}
              </div>

              {result.confidence > 0 && (
                <>
                  {/* Calorie highlight */}
                  <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-extrabold gradient-text">{result.calories}</p>
                    <p className="text-sm text-[var(--muted)]">Calories per serving</p>
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Protein", value: result.protein_g, unit: "g", color: "#0ea5e9" },
                      { label: "Carbs", value: result.carbs_g, unit: "g", color: "#f0883e" },
                      { label: "Fat", value: result.fat_g, unit: "g", color: "#a78bfa" },
                      { label: "Fiber", value: result.fiber_g, unit: "g", color: "#38ef7d" },
                    ].map((macro) => (
                      <div key={macro.label} className="glass-card p-3 text-center">
                        <p className="text-lg font-bold" style={{ color: macro.color }}>
                          {macro.value}{macro.unit}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{macro.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Log Button */}
              {result.confidence > 0 && !logged ? (
                <button
                  onClick={handleLog}
                  disabled={logging}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {logging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Log This Meal
                    </>
                  )}
                </button>
              ) : result.confidence > 0 && logged ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[rgba(56,239,125,0.08)] text-[var(--accent)] text-sm font-medium">
                    <Check className="w-4 h-4" /> Meal Logged Successfully!
                  </div>
                  <div className="flex gap-3">
                    <button onClick={reset} className="btn-secondary flex-1 justify-center !text-sm">
                      Scan Another
                    </button>
                    <Link href="/dashboard" className="btn-primary flex-1 justify-center !text-sm">
                      Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="glass-card p-8 min-h-[360px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(56,239,125,0.06)] flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[rgba(56,239,125,0.3)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--muted)]">
                AI Results Will Appear Here
              </h3>
              <p className="text-sm text-[rgba(139,148,158,0.6)] max-w-xs">
                Upload a food photo or type the food name and click Search to get instant nutrition breakdown from IFCT 2017.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
