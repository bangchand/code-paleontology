/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ChevronRight, Loader2, Sparkles, Code2, Terminal, Info, LayoutGrid, Search, ArrowRight, Share2, Download, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type AppState = 'idle' | 'analyzing' | 'complete';

const CODE_SNIPPETS = [
  'import { Octokit } from "@octokit/core";',
  'const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });',
  'async function fetchRepoData(owner, repo) {',
  '  const { data } = await octokit.request("GET /repos/{owner}/{repo}", {',
  '    owner, repo',
  '  });',
  '  return data;',
  '}',
  'const analyzeComplexity = (ast) => {',
  '  let score = 0;',
  '  walk(ast, (node) => {',
  '    if (node.type === "ConditionalExpression") score += 5;',
  '    if (node.type === "NestedFunction") score += 10;',
  '  });',
  '  return score;',
  '};',
  '// Initializing neural weight vectors...',
  'function forward(input) {',
  '  return input.matmul(weights).add(biases).relu();',
  '}',
  'const vulnerabilities = scanDependencies(packageJson);',
  'if (vulnerabilities.length > 0) notifySecOps();',
  'export default class GitProcessor extends Component {',
  '  render() { return <div className="git-raw" />; }',
  '}',
  '// Parsing semantic layers...',
  '// Optimization pass level 3...',
  '// Finalizing result mapping...',
];

const MOCK_RESULTS = [
  {
    id: 1,
    url: 'https://picsum.photos/seed/git_arch/1280/720',
    title: 'Architecture Blueprint',
    caption: 'Deep dependency graph analysis suggests a highly decoupled micro-service architecture with 94.2% modularity score.',
  },
  {
    id: 2,
    url: 'https://picsum.photos/seed/git_logic/1280/720',
    title: 'Logic Integrity',
    caption: 'Cyclomatic complexity is well-contained. Average nesting depth remains below 3, promoting high readability.',
  },
  {
    id: 3,
    url: 'https://picsum.photos/seed/git_sec/1280/720',
    title: 'Security Vectors',
    caption: 'Entropy analysis of string literals shows no hardcoded secrets or exposed API patterns in the root directory.',
  },
  {
    id: 4,
    url: 'https://picsum.photos/seed/git_perf/1280/720',
    title: 'Runtime Efficiency',
    caption: 'Memory footprint projection: Estimated sub-100MB heap usage for standard operations post-optimization.',
  },
];

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [url, setUrl] = useState('');

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleAnalyze = () => {
    if (!url) return;
    setState('analyzing');
    // Simulate a request
    setTimeout(() => {
      setState('complete');
    }, 6000); 
  };

  const reset = () => {
    setState('idle');
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-16 max-w-4xl w-full"
            >
              <h1 className="text-[10px] md:text-xs font-mono font-medium tracking-[0.4em] text-white/30 uppercase whitespace-nowrap">
                Taruh link github disini untuk menjelajahi sejarah repositori
              </h1>

              <div className="w-full max-w-2xl mx-auto">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="HTTPS://GITHUB.COM/OWNER/REPO"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/10 focus:border-white transition-colors text-white h-24 px-0 focus:ring-0 rounded-none text-xl md:text-3xl font-mono placeholder:text-[10px] md:placeholder:text-xs placeholder:text-white/5 uppercase tracking-[0.2em] text-center pr-12"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-focus-within:opacity-40 transition-opacity">
                    <CornerDownLeft size={20} className="text-white" />
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-[8px] font-mono text-white/10 uppercase tracking-[0.2em]">
                    System awaiting repository handshake
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {state === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex flex-col justify-end overflow-hidden z-[60]"
          >
            {/* The Cinematic "Post-Credit" Code Crawl */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-30 pointer-events-none" />
            
            <div className="relative h-screen flex flex-col items-center">
              <motion.div
                initial={{ y: '100vh' }}
                animate={{ y: '-250%' }}
                transition={{
                  duration: 35,
                  ease: "linear",
                  repeat: Infinity,
                }}
                className="w-full max-w-2xl px-8 flex flex-col gap-3"
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    {CODE_SNIPPETS.map((snippet, j) => {
                      const colors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00', '#ffffff'];
                      const color = colors[(i + j) % colors.length];
                      const isGlitchy = Math.random() > 0.92;
                      const blurAmount = Math.random() > 0.8 ? 'blur-[0.5px]' : 'blur-none';

                      return (
                        <motion.div 
                          key={`${i}-${j}`} 
                          animate={isGlitchy ? { 
                            x: [-1, 1, -0.5, 0],
                            opacity: [0.6, 1, 0.5, 0.8]
                          } : {}}
                          transition={{ duration: 0.15, repeat: isGlitchy ? Infinity : 0 }}
                          className={`font-mono text-[10px] md:text-sm font-medium tracking-tight ${blurAmount}`}
                          style={{ 
                            color: color,
                            textShadow: `0 0 8px ${color}33`,
                            marginLeft: `${(j % 6) * 12}px`
                          }}
                        >
                          {snippet}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Bottom Status Text */}
            <div className="absolute bottom-16 left-0 right-0 z-40 text-center space-y-4">
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                ))}
              </div>
              <p className="text-white font-mono text-xs md:text-sm tracking-[0.5em] uppercase font-bold">
                Menganalisis Kode...
              </p>
              <p className="text-white/20 font-mono text-[9px] tracking-[0.2em] uppercase">
                System decrypting repository sequences
              </p>
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen w-screen bg-black flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative"
          >
            {/* Minimalist Reset Trigger - Floating */}
            <div className="absolute top-8 right-8 z-50">
              <Button 
                variant="ghost" 
                onClick={reset} 
                className="text-white/20 hover:text-white hover:bg-white/5 rounded-none font-mono text-[10px] uppercase tracking-[0.3em] h-auto p-2"
              >
                [ RESET_SYSTEM ]
              </Button>
            </div>

            {/* Main Visual Display - Fixed Viewport */}
            <div className="w-full max-w-6xl flex flex-col items-center gap-8 md:gap-12 relative">
              {/* Repository Identifier - Replaces Title */}
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group inline-flex flex-col items-center gap-2"
                >
                  <span className="text-white/20 font-mono text-[10px] uppercase tracking-[0.5em] group-hover:text-white/40 transition-colors">
                    Source Node Path
                  </span>
                  <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors decoration-white/20 underline-offset-4 hover:underline">
                    <Github size={14} />
                    <span className="font-mono text-sm tracking-tight truncate max-w-[280px] md:max-w-md lowercase">
                      {url.replace('https://github.com/', '')}
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </motion.div>

              <Carousel className="w-full relative" opts={{ align: "start", loop: false }}>
                <div className="relative">
                  <CarouselContent>
                    {MOCK_RESULTS.map((result) => (
                      <CarouselItem key={result.id}>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8 }}
                          className="space-y-6 md:space-y-8"
                        >
                          <div className="aspect-[21/9] relative overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-white/5">
                            <img
                              src={result.url}
                              alt={result.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 hover:brightness-100 transition-all duration-1000 ease-in-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                              <span className="bg-white text-black px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">DATA_SET_{result.id}</span>
                            </div>
                            
                            <div className="absolute bottom-4 left-6">
                              <h4 className="text-xl font-bold tracking-tight uppercase">{result.title}</h4>
                            </div>
                          </div>
                          
                          <div className="max-w-2xl mx-auto text-center px-4">
                            <p className="text-sm md:text-lg text-white/50 font-light leading-relaxed tracking-wide italic">
                              "{result.caption}"
                            </p>
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Absolute Side Navigation - Finite Style */}
                  <CarouselPrevious className="absolute -left-4 md:-left-16 lg:-left-24 top-1/2 -translate-y-1/2 border border-white/10 bg-black/40 backdrop-blur-md text-white/40 hover:text-white hover:bg-white/10 hover:border-white h-20 w-12 rounded-none disabled:opacity-0 transition-none" />
                  <CarouselNext className="absolute -right-4 md:-right-16 lg:-right-24 top-1/2 -translate-y-1/2 border border-white/10 bg-black/40 backdrop-blur-md text-white/40 hover:text-white hover:bg-white/10 hover:border-white h-20 w-12 rounded-none disabled:opacity-0 transition-none" />
                </div>
                
                {/* Visual Indicators at Bottom */}
                <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
                  {MOCK_RESULTS.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  ))}
                </div>
              </Carousel>
            </div>

            {/* Global Watermark */}
            <div className="fixed bottom-6 right-8 pointer-events-none text-white/5 font-mono text-[60px] font-black italic tracking-tighter select-none">
              MONOTRACE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Effects */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}
