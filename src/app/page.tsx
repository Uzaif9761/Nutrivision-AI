"use client";

import Link from "next/link";
import {
  Camera,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Apple,
  Target,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══ Navbar ═══ */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[rgba(5,10,14,0.8)] border-b border-[rgba(56,239,125,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#11998e] to-[#38ef7d] flex items-center justify-center">
              <Apple className="w-5 h-5 text-[#050a0e]" />
            </div>
            <span className="gradient-text">NutriVision</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--muted)]">
            <a href="#features" className="hover:text-[var(--accent)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--accent)] transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-[var(--accent)] transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary !py-2 !px-5 text-sm">
              Log In
            </Link>
            <Link href="/signup" className="btn-primary !py-2 !px-5 text-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full bg-[radial-gradient(circle,rgba(56,239,125,0.08)_0%,transparent_70%)] float"
            style={{ animationDelay: "0s" }}
          />
          <div className="absolute w-[400px] h-[400px] -bottom-32 -left-32 rounded-full bg-[radial-gradient(circle,rgba(17,153,142,0.1)_0%,transparent_70%)] float"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute w-[300px] h-[300px] top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,239,125,0.05)_0%,transparent_70%)] float"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(56,239,125,0.06)] border border-[rgba(56,239,125,0.15)] mb-8">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm text-[var(--accent)]">AI-Powered Nutrition Tracking</span>
          </div>

          {/* Heading */}
          <h1 className="fade-in-up fade-in-up-delay-1 text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Snap Your Meal.
            <br />
            <span className="gradient-text">Know Your Nutrition.</span>
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-up-delay-2 text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            NutriVision uses advanced AI to instantly recognize your food and
            break down every calorie, macro, and micro-nutrient — so you can eat
            smarter without the guesswork.
          </p>

          {/* CTAs */}
          <div className="fade-in-up fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg !px-8 !py-4">
              Start Tracking Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg !px-8 !py-4">
              View Demo Dashboard
            </Link>
          </div>

          {/* Hero Image / Mockup */}
          <div className="fade-in-up fade-in-up-delay-4 mt-16 relative">
            <div className="glass-card p-1 pulse-glow max-w-3xl mx-auto">
              <div className="rounded-[14px] overflow-hidden bg-[var(--card)] p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Calorie Ring */}
                  <div className="glass-card p-5 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(56,239,125,0.1)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8"
                          strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#11998e" />
                            <stop offset="100%" stopColor="#38ef7d" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">1,500</span>
                        <span className="text-xs text-[var(--muted)]">kcal</span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--muted)]">Daily Calories</p>
                  </div>

                  {/* Macros */}
                  <div className="glass-card p-5 space-y-4">
                    <p className="text-sm font-semibold text-[var(--muted)] mb-2">Macros</p>
                    {[
                      { label: "Protein", value: 113, max: 150, color: "#38ef7d" },
                      { label: "Carbs", value: 117, max: 250, color: "#11998e" },
                      { label: "Fat", value: 42, max: 65, color: "#0ea5e9" },
                    ].map((macro) => (
                      <div key={macro.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{macro.label}</span>
                          <span className="text-[var(--muted)]">{macro.value}g / {macro.max}g</span>
                        </div>
                        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.05)]">
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(macro.value / macro.max) * 100}%`,
                              background: macro.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Meal */}
                  <div className="glass-card p-5">
                    <p className="text-sm font-semibold text-[var(--muted)] mb-3">Latest Scan</p>
                    <div className="w-full h-20 rounded-lg bg-gradient-to-br from-[rgba(17,153,142,0.2)] to-[rgba(56,239,125,0.1)] flex items-center justify-center mb-3">
                      <Camera className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <p className="font-semibold text-sm">Grilled Chicken Salad</p>
                    <p className="text-xs text-[var(--muted)]">380 kcal • 94% match</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              Everything You Need to <span className="gradient-text">Eat Smarter</span>
            </h2>
          </div>

          <div className="feature-grid">
            {[
              {
                icon: <Camera className="w-6 h-6" />,
                title: "AI Food Scanner",
                desc: "Point your camera at any meal. Our AI identifies the food and estimates nutrition in seconds.",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Smart Dashboard",
                desc: "Beautiful charts showing your daily calories, macros, and weekly trends at a glance.",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Custom Goals",
                desc: "Set personalized calorie and macro targets. Track progress toward your health objectives.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Logging",
                desc: "One tap to log. No manual searching through food databases — AI does the heavy lifting.",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Progress Tracking",
                desc: "Weekly and monthly trends help you see patterns and stay accountable long-term.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Private & Secure",
                desc: "Your data is encrypted and protected. We never share your nutrition information.",
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card glow-border p-7 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(17,153,142,0.2)] to-[rgba(56,239,125,0.1)] flex items-center justify-center text-[var(--accent)] mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(17,153,142,0.03)] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              Three Steps to <span className="gradient-text">Better Nutrition</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Snap a Photo",
                desc: "Take a picture of your meal using your phone camera or upload an image.",
                icon: <Camera className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "AI Analyzes",
                desc: "Our AI model identifies the food, estimates portions, and calculates macros.",
                icon: <Sparkles className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Track & Improve",
                desc: "Log the meal with one tap. View your daily totals, trends, and progress.",
                icon: <TrendingUp className="w-8 h-8" />,
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="glass-card p-8 h-full">
                  <div className="text-6xl font-black gradient-text opacity-20 mb-4">{item.step}</div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#11998e] to-[#38ef7d] flex items-center justify-center text-[#050a0e] mx-auto mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-[var(--muted)] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section id="stats" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-10 md:p-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10K+", label: "Meals Scanned" },
                { value: "95%", label: "AI Accuracy" },
                { value: "2.5s", label: "Avg Scan Time" },
                { value: "500+", label: "Active Users" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-[var(--muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Transform Your Diet?</span>
          </h2>
          <p className="text-[var(--muted)] text-lg mb-10 max-w-xl mx-auto">
            Join thousands who are already using AI to make smarter food choices
            every day. Start your journey in seconds.
          </p>
          <Link href="/signup" className="btn-primary text-lg !px-10 !py-4">
            Get Started — It&apos;s Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-[rgba(56,239,125,0.06)] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#11998e] to-[#38ef7d] flex items-center justify-center">
              <Apple className="w-4 h-4 text-[#050a0e]" />
            </div>
            <span>© 2026 NutriVision AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
