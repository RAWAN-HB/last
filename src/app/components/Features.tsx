import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, FileCheck, Users, BarChart3, Globe, Rocket, Heart } from 'lucide-react';

const features = [
  {
    title: "Digital Agreements",
    desc: "Generate legally binding internship contracts automatically with e-signature support.",
    icon: FileCheck,
    gradient: "from-blue-600 to-indigo-600",
    size: "col-span-1 md:col-span-2"
  },
  {
    title: "Skill Matching",
    desc: "AI-driven matching between student skills and company requirements.",
    icon: Zap,
    gradient: "from-purple-600 to-pink-600",
    size: "col-span-1"
  },
  {
    title: "Secure Data",
    desc: "Centralized and encrypted storage for all academic and corporate documents.",
    icon: Shield,
    gradient: "from-emerald-500 to-teal-500",
    size: "col-span-1"
  },
  {
    title: "University Portal",
    desc: "University admins get instant insights into placement rates and student performance.",
    icon: BarChart3,
    gradient: "from-orange-500 to-amber-500",
    size: "col-span-1 md:col-span-2"
  },
  {
    title: "Global Reach",
    desc: "Connect with international companies and launch a career without borders.",
    icon: Globe,
    gradient: "from-indigo-600 to-cyan-500",
    size: "col-span-1"
  }
];

export const Features: React.FC = () => {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-indigo-500/5 select-none pointer-events-none whitespace-nowrap">
        ECOSYSTEM
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-600 text-sm font-black mb-6"
            >
              <Rocket className="w-4 h-4" />
              Powering the next generation
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-none"
            >
              Beyond just <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">internships.</span>
            </motion.h2>
          </div>
          <p className="text-xl text-slate-500 max-w-md font-medium leading-relaxed">
            Our platform bridges the gap between academic theory and professional practice with a unified digital workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${f.size} group relative p-10 rounded-[3rem] border border-slate-200 bg-white hover:bg-slate-900 transition-all duration-500 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/20`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${f.gradient} rounded-[1.5rem] flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white transition-colors">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{f.desc}</p>
              
              <div className="mt-10 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-indigo-600 group-hover:text-indigo-400">
                Explore Feature
                <div className="w-8 h-[2px] bg-current"></div>
              </div>

              {/* Decorative circle in corner */}
              <div className={`absolute top-6 right-6 w-12 h-12 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-full blur-xl`}></div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:scale-105 transition-transform cursor-pointer">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            Loved by 200+ Institutions
          </div>
        </div>
      </div>
    </section>
  );
};
