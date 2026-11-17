import React from 'react';
import { GraduationCap, ShieldCheck, TrendingUp, Sparkles, Award, BookOpen } from 'lucide-react';

export const AuthHeroGraphic = ({
  headline = "Next-Generation Higher Education Governance.",
  subtext = "Unified student records, dynamic analytics, and administrative precision in one cloud platform."
}) => {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-midnight-950 via-midnight-900 to-brand-900 text-white">
      {/* Background ambient light effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subdued geometric grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Tagline */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/10 backdrop-blur-md border border-white/15 text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          University SaaS Suite 2.0
        </span>
      </div>

      {/* Centerpiece Vector Illustration with Modern Campus Architecture */}
      <div className="relative z-10 my-auto py-8">
        <div className="relative mx-auto max-w-md">
          {/* Main campus SVG artwork */}
          <svg
            viewBox="0 0 400 280"
            className="w-full h-auto drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5546E8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10152B" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#12B8C9" />
                <stop offset="100%" stopColor="#5546E8" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#12B8C9" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#12B8C9" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Glowing Ground Foundation */}
            <ellipse cx="200" cy="240" rx="180" ry="24" fill="url(#glowGrad)" />

            {/* University Central Hall */}
            <path d="M120 120 L200 70 L280 120 V230 H120 Z" fill="url(#buildingGrad)" stroke="#5546E8" strokeWidth="2" />
            <path d="M110 120 L200 65 L290 120" stroke="#12B8C9" strokeWidth="3" strokeLinecap="round" />

            {/* Dome & Clock Tower */}
            <rect x="185" y="40" width="30" height="30" rx="3" fill="#181F3E" stroke="#5546E8" strokeWidth="1.5" />
            <circle cx="200" cy="55" r="7" fill="#10152B" stroke="#12B8C9" strokeWidth="2" />
            <line x1="200" y1="55" x2="200" y2="51" stroke="#12B8C9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="200" y1="55" x2="203" y2="55" stroke="#12B8C9" strokeWidth="1.5" strokeLinecap="round" />
            <polygon points="182,40 200,20 218,40" fill="#5546E8" />
            <line x1="200" y1="20" x2="200" y2="12" stroke="#12B8C9" strokeWidth="2" strokeLinecap="round" />

            {/* Pillars */}
            <rect x="145" y="140" width="12" height="90" rx="2" fill="#E2E0FF" fillOpacity="0.8" />
            <rect x="175" y="140" width="12" height="90" rx="2" fill="#E2E0FF" fillOpacity="0.8" />
            <rect x="213" y="140" width="12" height="90" rx="2" fill="#E2E0FF" fillOpacity="0.8" />
            <rect x="243" y="140" width="12" height="90" rx="2" fill="#E2E0FF" fillOpacity="0.8" />

            {/* Grand Arch Doorway */}
            <path d="M188 230 V195 C188 188 212 188 212 195 V230 Z" fill="#10152B" stroke="#12B8C9" strokeWidth="2" />

            {/* Modern Left Wing Building */}
            <rect x="50" y="145" width="70" height="85" rx="4" fill="#181F3E" stroke="#323E70" strokeWidth="1.5" />
            <rect x="62" y="160" width="14" height="20" rx="2" fill="#12B8C9" fillOpacity="0.4" />
            <rect x="86" y="160" width="14" height="20" rx="2" fill="#12B8C9" fillOpacity="0.4" />
            <rect x="62" y="190" width="14" height="20" rx="2" fill="#5546E8" fillOpacity="0.4" />
            <rect x="86" y="190" width="14" height="20" rx="2" fill="#5546E8" fillOpacity="0.4" />

            {/* Modern Right Wing Building */}
            <rect x="280" y="145" width="70" height="85" rx="4" fill="#181F3E" stroke="#323E70" strokeWidth="1.5" />
            <rect x="292" y="160" width="14" height="20" rx="2" fill="#5546E8" fillOpacity="0.4" />
            <rect x="316" y="160" width="14" height="20" rx="2" fill="#5546E8" fillOpacity="0.4" />
            <rect x="292" y="190" width="14" height="20" rx="2" fill="#12B8C9" fillOpacity="0.4" />
            <rect x="316" y="190" width="14" height="20" rx="2" fill="#12B8C9" fillOpacity="0.4" />

            {/* Pathway & Landscaping */}
            <path d="M175 230 L150 255 H250 L225 230 Z" fill="#181F3E" stroke="#5546E8" strokeWidth="1" />
            <circle cx="85" cy="235" r="8" fill="#12B8C9" fillOpacity="0.6" />
            <circle cx="315" cy="235" r="8" fill="#5546E8" fillOpacity="0.6" />
          </svg>

          {/* Floating Glassmorphism Badge 1: Top-Left */}
          <div className="absolute -top-4 -left-6 bg-midnight-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-bounce [animation-duration:5s]">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Analytics Precision</p>
              <p className="text-sm font-extrabold text-white">99.8% Accuracy</p>
            </div>
          </div>

          {/* Floating Glassmorphism Badge 2: Bottom-Right */}
          <div className="absolute -bottom-4 -right-6 bg-midnight-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-pulse [animation-duration:4s]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Role Security</p>
              <p className="text-sm font-extrabold text-white">Enterprise Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Content */}
      <div className="relative z-10 space-y-3 max-w-lg">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          {headline}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          {subtext}
        </p>

        {/* Feature Checkpoints */}
        <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Real-time Enrollment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            <span>Curriculum Mapping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Academic Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroGraphic;

