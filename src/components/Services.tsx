'use client'

import { motion } from 'framer-motion'
import { Zap, Clock, TrendingUp, ShieldCheck, Users, Leaf } from 'lucide-react'

export function Services() {
  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Mark attendance for an entire class in seconds, not minutes. Face recognition happens in real-time with sub-second response.",
      stat: "< 1 sec",
      statLabel: "Recognition Time",
      color: "accent-blue"
    },
    {
      icon: Clock,
      title: "Save Valuable Time",
      description: "Eliminate roll calls and manual attendance sheets. Teachers can focus on teaching while FACELOG handles the rest.",
      stat: "15+ min",
      statLabel: "Saved Per Class",
      color: "accent-emerald"
    },
    {
      icon: TrendingUp,
      title: "Improve Accuracy",
      description: "No more proxy attendance or errors. Each student is uniquely identified by their facial features.",
      stat: "99.5%",
      statLabel: "Accuracy Rate",
      color: "accent-purple"
    },
    {
      icon: ShieldCheck,
      title: "Complete Privacy",
      description: "All data stays on your local system. No cloud uploads, no third-party access. Your students' data is yours alone.",
      stat: "100%",
      statLabel: "Local Storage",
      color: "accent-blue"
    },
    {
      icon: Users,
      title: "Multi-Class Support",
      description: "Manage multiple classes and sections seamlessly. Filter reports by class, date range, or individual students.",
      stat: "Unlimited",
      statLabel: "Classes",
      color: "accent-emerald"
    },
    {
      icon: Leaf,
      title: "Go Paperless",
      description: "Reduce paper waste with digital attendance records. Generate PDF reports only when needed.",
      stat: "0",
      statLabel: "Paper Required",
      color: "accent-purple"
    }
  ]

  return (
    <section id="benefits" className="relative py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-purple/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white/60">
              Why Choose FACELOG
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Benefits That Transform
          </h2>
          
          <p className="text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            Experience the future of attendance management with measurable results
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 gentle-animation hover:-translate-y-1">
                {/* Icon & Stat Row */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-xl bg-${benefit.color}/20 flex items-center justify-center`}>
                    <benefit.icon className={`w-7 h-7 text-${benefit.color}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black text-${benefit.color}`}>{benefit.stat}</div>
                    <div className="text-xs text-white/50">{benefit.statLabel}</div>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-white/60 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
