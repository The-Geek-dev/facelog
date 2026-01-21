'use client'

import { motion } from 'framer-motion'
import { UserPlus, Camera, Scan, CheckCircle, BarChart } from 'lucide-react'

export function About() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Register Students",
      description: "Enroll students by capturing their face photo and entering basic details like name, ID, and class section.",
      color: "accent-blue"
    },
    {
      number: "02", 
      icon: Camera,
      title: "Activate Camera",
      description: "Start the live camera feed on the attendance marking page. The system automatically detects faces in view.",
      color: "accent-emerald"
    },
    {
      number: "03",
      icon: Scan,
      title: "Face Recognition",
      description: "Our AI engine compares detected faces against registered students using advanced DeepFace algorithms.",
      color: "accent-purple"
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Mark Attendance",
      description: "Recognized students are instantly marked present with timestamp and class information recorded.",
      color: "accent-blue"
    },
    {
      number: "05",
      icon: BarChart,
      title: "Generate Reports",
      description: "View real-time analytics, export attendance to CSV or PDF, and track patterns over time.",
      color: "accent-emerald"
    }
  ]

  return (
    <section id="how-it-works" className="relative py-24 bg-card/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-purple rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Simple Process
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
            How FACELOG Works
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Get started in minutes with our intuitive 5-step process
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-blue via-accent-emerald to-accent-purple hidden lg:block" />
            
            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="flex items-start gap-6 lg:gap-8">
                    {/* Step Number Circle */}
                    <div className={`relative z-10 w-16 h-16 rounded-2xl bg-${step.color}/10 border-2 border-${step.color}/30 flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-7 h-7 text-${step.color}`} />
                    </div>
                    
                    {/* Content Card */}
                    <div className="flex-1 bg-background clean-border rounded-2xl p-6 hover:shadow-md gentle-animation">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-${step.color} font-black text-lg`}>{step.number}</span>
                        <h3 className="text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const contactSection = document.getElementById('contact')
              contactSection?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-accent-blue text-white font-semibold px-8 py-4 rounded-xl hover:bg-accent-blue/90 gentle-animation cursor-pointer shadow-lg shadow-accent-blue/25"
          >
            Start Using FACELOG Today
          </motion.button>
        </div>
      </div>
    </section>
  )
}
