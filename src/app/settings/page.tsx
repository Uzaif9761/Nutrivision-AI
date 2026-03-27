"use client";

import { useState } from "react";
import { Settings, User, Target, Save } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Demo User");
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [proteinGoal, setProteinGoal] = useState("150");
  const [carbsGoal, setCarbsGoal] = useState("250");
  const [fatGoal, setFatGoal] = useState("65");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Settings className="w-7 h-7 text-[var(--accent)]" />
          Settings
        </h1>
        <p className="text-[var(--muted)] mt-1">Manage your profile and daily goals.</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--accent)]" /> Profile
        </h2>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Goals */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-[var(--accent)]" /> Daily Goals
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Calories (kcal)", value: calorieGoal, set: setCalorieGoal },
            { label: "Protein (g)", value: proteinGoal, set: setProteinGoal },
            { label: "Carbs (g)", value: carbsGoal, set: setCarbsGoal },
            { label: "Fat (g)", value: fatGoal, set: setFatGoal },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs text-[var(--muted)] block mb-1.5">{field.label}</label>
              <input
                type="number"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="input-field"
              />
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">
        <Save className="w-4 h-4" />
        {saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}
