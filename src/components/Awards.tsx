'use client'

import { motion } from 'framer-motion'
import { Users, Clock, School, CheckCircle } from 'lucide-react'

export function Awards() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Students Registered",
      description: "Faces enrolled and tracked across institutions",
      color: "accent-blue"
    },
    {
      icon: CheckCircle,
      value: "500,000+",
      label: "Attendances Marked",
      description: "Successful face recognition check-ins",
      color: "accent-emerald"
    },
    {
      icon: Clock,
      value: "< 0.5s",
      label: "Recognition Speed",
      description: "Average time to identify a student",
      color: "accent-purple"
    },
    {
      icon: School,
      value: "50+",
      label: "Institutions",
      description: "Schools and universities using FACELOG",
      color: "accent-blue"
    }
  ]

  return (
    <section id="stats" className="relative py-24 bg-background overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-background" />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-purple rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Trusted Worldwide
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
            FACELOG By The Numbers
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Real impact measured across educational institutions worldwide
          </p>
        </div>

        {/* Stats Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card clean-border rounded-2xl p-6 text-center hover:shadow-lg gentle-animation hover:-translate-y-1 h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-${stat.color}/10 flex items-center justify-center mx-auto mb-5`}>
                    <stat.icon className={`w-8 h-8 text-${stat.color}`} />
                  </div>
                  
                  {/* Value */}
                  <div className={`text-4xl font-black text-${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg font-bold text-foreground mb-2">
                    {stat.label}
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">Built with industry-leading technologies</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 bg-accent-blue rounded-full" />
              <span className="font-medium">DeepFace AI</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 bg-accent-emerald rounded-full" />
              <span className="font-medium">TensorFlow</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 bg-accent-purple rounded-full" />
              <span className="font-medium">OpenCV</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 bg-accent-blue rounded-full" />
              <span className="font-medium">Flask</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
