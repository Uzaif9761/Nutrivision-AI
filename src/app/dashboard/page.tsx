"use client";

import { useState, useMemo } from "react";
import {
  Flame,
  TrendingUp,
  Zap,
  Droplets,
  Plus,
  Camera,
} from "lucide-react";
import Link from "next/link";
import {
  generateMockEntries,
  generateWeeklyData,
  calculateDailyTotals,
  calculateProgress,
  getMealTypeIcon,
  DEFAULT_GOALS,
} from "@/lib/nutrition";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [entries] = useState(generateMockEntries());
  const weeklyData = useMemo(() => generateWeeklyData(), []);
  const totals = calculateDailyTotals(entries);

  const macroCards = [
    {
      label: "Calories",
      value: totals.calories,
      goal: DEFAULT_GOALS.calories,
      unit: "kcal",
      icon: Flame,
      color: "#38ef7d",
    },
    {
      label: "Protein",
      value: totals.protein_g,
      goal: DEFAULT_GOALS.protein_g,
      unit: "g",
      icon: Zap,
      color: "#0ea5e9",
    },
    {
      label: "Carbs",
      value: totals.carbs_g,
      goal: DEFAULT_GOALS.carbs_g,
      unit: "g",
      icon: TrendingUp,
      color: "#f0883e",
    },
    {
      label: "Fat",
      value: totals.fat_g,
      goal: DEFAULT_GOALS.fat_g,
      unit: "g",
      icon: Droplets,
      color: "#a78bfa",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Good Evening! 👋
          </h1>
          <p className="text-[var(--muted)] mt-1">
            Here&apos;s your nutrition overview for today.
          </p>
        </div>
        <Link href="/scan" className="btn-primary !text-sm">
          <Camera className="w-4 h-4" /> Scan Meal
        </Link>
      </div>

      {/* ═══ Macro Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {macroCards.map((card) => {
          const progress = calculateProgress(card.value, card.goal);
          return (
            <div key={card.label} className="glass-card p-5 group">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${card.color}15`,
                  }}
                >
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span className="text-xs text-[var(--muted)]">{progress}%</span>
              </div>
              <p className="text-2xl font-bold">
                {card.value.toLocaleString()}
                <span className="text-sm font-normal text-[var(--muted)] ml-1">
                  {card.unit}
                </span>
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                of {card.goal.toLocaleString()} {card.unit} goal
              </p>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: card.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Weekly Chart + Calorie Ring ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Weekly Overview</h2>
            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#38ef7d" }} />
                Calories
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(56,239,125,0.2)" }} />
                Goal
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8b949e", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8b949e", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d1117",
                    border: "1px solid rgba(56,239,125,0.15)",
                    borderRadius: "12px",
                    color: "#e8ecf1",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="goal"
                  fill="rgba(56,239,125,0.1)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="calories"
                  fill="#38ef7d"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Ring */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h2 className="font-semibold text-lg mb-6">Daily Progress</h2>
          <div className="relative w-40 h-40 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(56,239,125,0.08)"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * calculateProgress(totals.calories, DEFAULT_GOALS.calories)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#11998e" />
                  <stop offset="100%" stopColor="#38ef7d" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{totals.calories.toLocaleString()}</span>
              <span className="text-xs text-[var(--muted)]">of {DEFAULT_GOALS.calories.toLocaleString()} kcal</span>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {DEFAULT_GOALS.calories - totals.calories > 0
              ? `${DEFAULT_GOALS.calories - totals.calories} kcal remaining`
              : "🎉 Goal reached!"}
          </p>
        </div>
      </div>

      {/* ═══ Recent Meals ═══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Today&apos;s Meals</h2>
          <Link
            href="/scan"
            className="flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Meal
          </Link>
        </div>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="glass-card p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(17,153,142,0.15)] to-[rgba(56,239,125,0.08)] flex items-center justify-center text-xl shrink-0">
                {getMealTypeIcon(entry.meal_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{entry.food_name}</p>
                <p className="text-xs text-[var(--muted)] capitalize">
                  {entry.meal_type} •{" "}
                  {entry.confidence
                    ? `${Math.round(entry.confidence * 100)}% match`
                    : "Manual entry"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">{entry.calories} kcal</p>
                <p className="text-xs text-[var(--muted)]">
                  P:{entry.protein_g}g C:{entry.carbs_g}g F:{entry.fat_g}g
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
