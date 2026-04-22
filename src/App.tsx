/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Loader2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useAnalysisStore } from '@/src/store';

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

export default function App() {
  const [url, setUrl] = useState('');
  const { results, loading, error, analyze, reset: resetStore } = useAnalysisStore();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Sync loading/error to view state
  const viewState: AppState = loading ? 'analyzing' : results.length > 0 ? 'complete' : 'idle';

  const handleAnalyze = () => {
    if (!url) return;
    analyze(url);
  };

  const reset = () => {
    resetStore();
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {viewState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              className="text-center space-y-12 max-w-3xl w-full"
            >
              {/* Cartoon mascot bubble */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex justify-center mb-4"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10">
                  <Github size={40} className="text-black" />
                </div>
              </motion.div>

              <h1 className="text-lg md:text-2xl font-extrabold tracking-tight text-white/80 leading-relaxed">
                Taruh link github disini untuk{' '}
                <span className="bg-white text-black px-3 py-1 rounded-full">
                  menjelajahi
                </span>{' '}
                sejarah repositori
              </h1>

              <div className="w-full max-w-xl mx-auto">
                <div className="relative group">
                  <div className="bg-white/5 rounded-3xl border-2 border-white/10 focus-within:border-white/30 transition-colors p-2">
                    <Input
                      type="text"
                      placeholder="https://github.com/owner/repo"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      className="w-full bg-transparent border-0 focus:ring-0 text-white h-14 px-6 rounded-2xl text-base md:text-lg placeholder:text-white/20 text-center"
                    />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-focus-within:opacity-40 transition-opacity">
                    <CornerDownLeft size={18} className="text-white" />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex justify-center"
                >
                  <Button
                    onClick={handleAnalyze}
                    disabled={!url}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-sm font-bold tracking-wide uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/10"
                  >
                    Analyze
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </motion.div>

                <p className="text-[11px] font-semibold text-white/15 mt-6 tracking-wide">
                  System awaiting repository handshake
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewState === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex flex-col justify-end overflow-hidden z-[60]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-30 pointer-events-none" />

            <div className="relative h-screen flex flex-col items-center overflow-hidden">
              <motion.div
                animate={{ y: [0, '-50%'] }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                className="w-full max-w-2xl px-8 flex flex-col gap-3 pt-[50vh]"
              >
                {/* Render two identical blocks for seamless loop */}
                {[0, 1].map((blockIndex) => (
                  <div key={`block-${blockIndex}`} className="flex flex-col gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={`group-${blockIndex}-${i}`} className="flex flex-col gap-3">
                        {CODE_SNIPPETS.map((snippet, j) => {
                          const colors = ['#ffffff', '#d4d4d4', '#a3a3a3', '#737373'];
                          const color = colors[(i + j) % colors.length];

                          return (
                            <div
                              key={`${blockIndex}-${i}-${j}`}
                              className="font-mono text-[10px] md:text-sm font-medium tracking-tight whitespace-pre"
                              style={{
                                color,
                                marginLeft: `${(j % 6) * 12}px`,
                              }}
                            >
                              {snippet}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Bottom status - cartoon style */}
            <div className="absolute bottom-16 left-0 right-0 z-40 text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-white/5 backdrop-blur-md rounded-full px-6 py-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Loader2 size={18} className="text-white animate-spin" />
                    <span className="text-white font-extrabold text-sm tracking-wide">
                      Menganalisis Repository...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewState === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="h-screen w-screen bg-black flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative"
          >
            {/* Reset button - pill shape */}
            <div className="absolute top-6 right-6 z-50">
              <Button
                variant="ghost"
                onClick={reset}
                className="text-white/20 hover:text-white hover:bg-white/5 rounded-full font-extrabold text-xs uppercase tracking-wider h-auto px-5 py-2 border border-white/5 hover:border-white/10"
              >
                Reset
              </Button>
            </div>

            <div className="w-full max-w-6xl flex flex-col items-center gap-8 md:gap-10 relative">
              {/* Repository link - rounded pill */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="text-center"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full px-5 py-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <Github size={16} className="text-black" />
                  </div>
                  <span className="font-extrabold text-sm text-white/60 group-hover:text-white tracking-tight truncate max-w-[200px] md:max-w-md">
                    {url.replace('https://github.com/', '')}
                  </span>
                  <ArrowRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
              </motion.div>

              <Carousel className="w-full relative" opts={{ align: 'start', loop: false }}>
                <div className="relative">
                  <CarouselContent>
                    {results.map((result, index) => (
                      <CarouselItem key={result.index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.1 }}
                          className="space-y-6"
                        >
                          {/* Compact result card */}
                          <div className="bg-white/5 rounded-3xl border-2 border-white/10 overflow-hidden max-w-3xl mx-auto">
                            <div className="relative aspect-video overflow-hidden bg-white/5">
                              {result.image_url ? (
                                <img
                                  src={result.image_url}
                                  alt={`Analysis ${result.index}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                  <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                                    <Loader2 size={24} className="text-white/40" />
                                  </div>
                                  <p className="text-white/60 font-medium max-w-xs">
                                    Gambar gagal dimuat (Free tier API limit). Lanjut baca ceritanya aja ya!
                                  </p>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                              <div className="absolute bottom-3 left-4">
                                <h4 className="text-base md:text-lg font-extrabold tracking-tight">
                                  Slide #{result.index}
                                </h4>
                              </div>
                            </div>

                            <div className="px-4 py-3">
                              <p className="text-xs md:text-sm text-white/50 font-semibold leading-relaxed text-center">
                                {result.narration}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Rounded nav arrows */}
                  <CarouselPrevious className="absolute -left-4 md:-left-12 top-1/2 border border-white/10 bg-black/60 backdrop-blur-md text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 h-14 w-14 rounded-full disabled:opacity-0 transition-none" />
                  <CarouselNext className="absolute -right-4 md:-right-12 top-1/2 border border-white/10 bg-black/60 backdrop-blur-md text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 h-14 w-14 rounded-full disabled:opacity-0 transition-none" />
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-3 mt-8">
                  {results.map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  ))}
                </div>
              </Carousel>
            </div>

            {/* Watermark */}
            <div className="fixed bottom-6 right-8 pointer-events-none text-white/[0.03] font-extrabold text-5xl tracking-tighter select-none">
              MONOTRACE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>
    </div>
  );
}
