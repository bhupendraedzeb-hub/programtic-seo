'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, getSession } from '@/lib/supabase';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await getSession();
    setIsLoggedIn(!!session);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 bg-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <style jsx global>{`
        @keyframes floaty {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        .hero-fade {
          animation: fadeUp 0.8s ease-out both;
        }
        .hero-fade.delay-2 { animation-delay: 0.12s; }
        .hero-fade.delay-3 { animation-delay: 0.24s; }
        .floaty {
          animation: floaty 6s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-black/5 bg-[var(--panel)]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white font-bold">
              PS
            </span>
            <div>
              <div className="font-display text-xl font-semibold tracking-tight">
                Programmatic SEO
              </div>
              <p className="text-xs text-[var(--muted)]">Templates. Bulk. Results.</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full border border-black/10 text-sm hover:bg-black/5"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    supabase.auth.signOut();
                    setIsLoggedIn(false);
                  }}
                  className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm hover:brightness-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-full border border-black/10 text-sm hover:bg-black/5"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-full bg-[var(--brand)] text-white text-sm hover:brightness-95"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-[var(--brand)]/15 blur-3xl" />
        <div className="absolute top-32 -left-12 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="hero-fade inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Build pages at scale
            </p>
            <h1 className="font-display hero-fade delay-2 text-5xl md:text-6xl font-semibold leading-tight">
              Generate search-ready pages with a template-first workflow.
            </h1>
            <p className="hero-fade delay-3 text-lg text-[var(--muted)] max-w-xl">
              Turn a single HTML template into hundreds of polished, SEO-optimized pages. Upload a CSV,
              preview instantly, and ship at the speed of your content team.
            </p>
            <div className="hero-fade delay-3 flex flex-wrap gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-full bg-[var(--brand)] text-white font-medium hover:brightness-95"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 rounded-full bg-[var(--brand)] text-white font-medium hover:brightness-95"
                  >
                    Start Free
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 rounded-full border border-black/10 hover:bg-black/5"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 text-sm text-[var(--muted)]">
              <div>
                <p className="text-xl font-semibold text-[var(--ink)]">10x</p>
                <p>Faster content ops</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-[var(--ink)]">1k+</p>
                <p>Pages per upload</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-[var(--ink)]">Live</p>
                <p>SEO scoring</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="floaty rounded-3xl border border-black/10 bg-[var(--panel)] shadow-xl p-6">
              <div className="flex items-center gap-3 border-b border-black/10 pb-4">
                <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--brand)]" />
                <div className="h-3 w-3 rounded-full bg-black/20" />
                <p className="ml-auto text-xs text-[var(--muted)]">template.html</p>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-4 text-sm">
                <div className="rounded-2xl bg-[#f9f5f0] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Variables</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['title', 'meta_description', 'city', 'service', 'price'].map((item) => (
                      <span key={item} className="rounded-full bg-white px-3 py-1 text-xs border border-black/10">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">SEO Score</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-[var(--brand)] flex items-center justify-center font-semibold">
                      92
                    </div>
                    <div>
                      <p className="font-medium">Ready to publish</p>
                      <p className="text-xs text-[var(--muted)]">2 minor suggestions</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#fef4ec] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Output</p>
                  <p className="mt-2 text-sm text-[var(--ink)]">
                    /plumbers/san-diego/24-hour-emergency.html
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 right-6 rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs text-[var(--muted)] shadow-lg">
              Bulk job running · 1,240 rows
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">What you get</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">
                A production pipeline for programmatic SEO.
              </h2>
            </div>
            <p className="text-[var(--muted)] max-w-xl">
              From template to deployment, every step is designed to keep your content output consistent and measurable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Template studio',
                desc: 'Author HTML templates with variables, preview instantly, and validate SEO issues early.',
                tag: 'Editor',
              },
              {
                title: 'Bulk generation',
                desc: 'Upload CSVs and process thousands of pages in the background with live job tracking.',
                tag: 'Scale',
              },
              {
                title: 'SEO scoring',
                desc: 'Automated checks for titles, meta descriptions, headings, and content length.',
                tag: 'Quality',
              },
              {
                title: 'Secure storage',
                desc: 'Every generated page is stored and versioned with public URLs for immediate deployment.',
                tag: 'Hosting',
              },
              {
                title: 'Analytics ready',
                desc: 'Know what launched, what failed, and what needs iteration across every batch.',
                tag: 'Insights',
              },
              {
                title: 'Fast iteration',
                desc: 'Edit templates, regenerate, and publish without rebuilding your entire pipeline.',
                tag: 'Speed',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{item.tag}</p>
                <h3 className="font-display mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Workflow</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">
                Four steps to launch thousands of pages.
              </h2>
            </div>
            <p className="text-[var(--muted)] max-w-xl">
              Bring your data, define the template, and let the generator do the heavy lifting.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Design template', description: 'Create the layout once with HTML and variables.' },
              { step: '02', title: 'Map variables', description: 'Validate your fields and preview SEO metadata.' },
              { step: '03', title: 'Run bulk job', description: 'Upload CSV, queue generation, and monitor progress.' },
              { step: '04', title: 'Publish', description: 'Download or deploy directly from stored outputs.' },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl border border-black/10 bg-white p-6">
                <div className="text-sm text-[var(--muted)]">Step {item.step}</div>
                <h3 className="font-display mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-black/10 bg-[var(--brand)] text-white px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] opacity-80">Launch now</p>
                <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">
                  Ship your first batch today.
                </h2>
                <p className="mt-3 text-white/80 max-w-xl">
                  No credit card needed. Build your template, upload your CSV, and publish in minutes.
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="px-6 py-3 rounded-full bg-white text-[var(--brand)] font-semibold hover:bg-white/90"
              >
                Start Free
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold">Programmatic SEO</p>
              <p className="text-sm text-[var(--muted)]">Build once. Publish everywhere.</p>
            </div>
            <div className="flex gap-6 text-sm text-[var(--muted)]">
              <a href="#" className="hover:text-[var(--ink)]">Docs</a>
              <a href="#" className="hover:text-[var(--ink)]">Pricing</a>
              <a
                href="https://wa.me/917347018650"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--ink)]"
              >
                Support
              </a>
            </div>
          </div>
          <div className="mt-6 text-xs text-[var(--muted)]">
            &copy; 2026 Programmatic SEO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
