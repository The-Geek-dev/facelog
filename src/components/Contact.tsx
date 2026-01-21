'use client'

import { motion } from 'framer-motion'
import { Mail, MessageSquare, Github, FileText } from 'lucide-react'

export function Contact() {
  return (
    <section id="contact" className="relative py-24 bg-card/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Get In Touch
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
            Ready to Get Started?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Contact us for a demo or to learn more about implementing FACELOG at your institution
          </p>
        </div>

        {/* Contact Options */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Email Card */}
            <motion.a
              href="mailto:contact@facelog.io"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-card clean-border rounded-2xl p-8 hover:shadow-lg gentle-animation hover:-translate-y-1 h-full">
                <div className="w-14 h-14 rounded-xl bg-accent-blue/10 flex items-center justify-center mb-5">
                  <Mail className="w-7 h-7 text-accent-blue" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-4">Get in touch for demos, pricing, and support</p>
                <span className="text-accent-blue font-semibold group-hover:underline">contact@facelog.io</span>
              </div>
            </motion.a>

            {/* Documentation Card */}
            <motion.a
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <div className="bg-card clean-border rounded-2xl p-8 hover:shadow-lg gentle-animation hover:-translate-y-1 h-full">
                <div className="w-14 h-14 rounded-xl bg-accent-emerald/10 flex items-center justify-center mb-5">
                  <FileText className="w-7 h-7 text-accent-emerald" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Documentation</h3>
                <p className="text-muted-foreground mb-4">Read the API docs and integration guides</p>
                <span className="text-accent-emerald font-semibold group-hover:underline">View Docs →</span>
              </div>
            </motion.a>
          </div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-accent-blue via-accent-purple to-accent-emerald p-0.5 rounded-3xl"
          >
            <div className="bg-card rounded-3xl p-8 lg:p-12">
              <div className="text-center">
                <h3 className="text-2xl lg:text-3xl font-black text-foreground mb-4">
                  Schedule a Live Demo
                </h3>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  See FACELOG in action with a personalized walkthrough. Our team will show you how facial recognition attendance can transform your institution.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-accent-blue text-white font-semibold px-8 py-4 rounded-xl hover:bg-accent-blue/90 gentle-animation cursor-pointer shadow-lg shadow-accent-blue/25"
                  >
                    Request Demo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-secondary text-secondary-foreground font-semibold px-8 py-4 rounded-xl hover:bg-secondary/80 gentle-animation cursor-pointer"
                  >
                    Download Brochure
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card clean-border rounded-2xl p-6">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-accent-blue" />
              </div>
              <h4 className="font-bold text-foreground mb-2">24/7 Support</h4>
              <p className="text-muted-foreground text-sm">
                Our support team is always ready to help
              </p>
            </div>
            
            <div className="bg-card clean-border rounded-2xl p-6">
              <div className="w-12 h-12 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-6 h-6 text-accent-emerald" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Open Source</h4>
              <p className="text-muted-foreground text-sm">
                Contribute and customize on GitHub
              </p>
            </div>
            
            <div className="bg-card clean-border rounded-2xl p-6">
              <div className="w-12 h-12 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-accent-purple" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Free Trial</h4>
              <p className="text-muted-foreground text-sm">
                Try FACELOG free for 30 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
