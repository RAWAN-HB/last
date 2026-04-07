import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, ArrowRight, Sparkles, Star } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-[#0A0118]">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-sm font-bold mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              The #1 Choice for Universities in 2026
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white leading-none mb-8">
              Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Future</span> Career Today.
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
              We connect the brightest students with world-class companies through an automated, data-driven ecosystem.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <button className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3">
                Start Exploring
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="flex items-center gap-3 group">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-white font-bold text-lg">Watch Video</span>
              </button>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0118] bg-slate-800 overflow-hidden">
                    <ImageWithFallback 
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
                <p className="text-slate-500 font-medium"><span className="text-white">5,000+</span> Students Hired</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* The "Video" Placeholder Look */}
            <div className="relative rounded-[2.5rem] overflow-hidden border-[12px] border-white/5 bg-slate-900 shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1662148932231-f75d645631c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWJyYW50JTIwbW9kZXJuJTIwY2FtcHVzJTIwbGlmZXN0eWxlJTIwc3R1ZGVudHMlMjBsYXVnaGluZ3xlbnwxfHx8fDE3NzA1NDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Students on campus"
                className="w-full aspect-[4/5] object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold">New Opportunities</p>
                        <p className="text-indigo-300 text-xs font-bold">Updated Just Now</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/30">
                      Live
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-2/3"></div>
                    </div>
                    <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
                    <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600/80 backdrop-blur-sm flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform group">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            </div>

            {/* Floating Accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
