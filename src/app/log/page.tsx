"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Trash2, Filter } from "lucide-react";
import {
  generateMockEntries,
  getMealTypeIcon,
  type NutritionEntry,
} from "@/lib/nutrition";

export default function FoodLogPage() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setEntries(generateMockEntries());
  }, []);

  const filteredEntries =
    filter === "all"
      ? entries
      : entries.filter((e) => e.meal_type === filter);

  const totalCalories = filteredEntries.reduce((sum, e) => sum + e.calories, 0);

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-[var(--accent)]" />
            Food Log
          </h1>
          <p className="text-[var(--muted)] mt-1">
            Today&apos;s meals • {totalCalories.toLocaleString()} kcal total
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[var(--muted)]" />
        {["all", "breakfast", "lunch", "dinner", "snack"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === type
                ? "bg-[rgba(56,239,125,0.15)] text-[var(--accent)] border border-[rgba(56,239,125,0.3)]"
                : "bg-[rgba(255,255,255,0.03)] text-[var(--muted)] border border-transparent hover:bg-[rgba(255,255,255,0.06)]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-[var(--muted)]">No meals logged yet for this filter.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="glass-card p-5 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(17,153,142,0.15)] to-[rgba(56,239,125,0.08)] flex items-center justify-center text-xl shrink-0">
                {getMealTypeIcon(entry.meal_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{entry.food_name}</p>
                <p className="text-xs text-[var(--muted)] capitalize mt-0.5">
                  {entry.meal_type}
                  {entry.confidence
                    ? ` • ${Math.round(entry.confidence * 100)}% AI match`
                    : ""}
                </p>
              </div>

              {/* Macros */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--muted)]">
                <span>P: <strong className="text-[#0ea5e9]">{entry.protein_g}g</strong></span>
                <span>C: <strong className="text-[#f0883e]">{entry.carbs_g}g</strong></span>
                <span>F: <strong className="text-[#a78bfa]">{entry.fat_g}g</strong></span>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold gradient-text">{entry.calories} kcal</p>
              </div>

              <button
                onClick={() => handleDelete(entry.id)}
                className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-[var(--danger)] transition-all p-1.5 rounded-lg hover:bg-[rgba(248,81,73,0.08)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
