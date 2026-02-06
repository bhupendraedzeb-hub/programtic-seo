'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { templatesApi, pagesApi, jobsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    templates: 0,
    pages: 0,
    jobs: 0,
  });
  const [recentItems, setRecentItems] = useState({
    templates: [],
    pages: [],
    jobs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load templates
      const templatesRes = await templatesApi.list();
      const templates = Array.isArray(templatesRes) ? templatesRes : [];

      // Load pages
      const pagesRes = await pagesApi.list();
      const pages = Array.isArray(pagesRes) ? pagesRes : [];

      // Load job stats
      const jobStats = await jobsApi.getStats();
      const recentJobs = await jobsApi.getRecent(5);

      setStats({
        templates: templates.length,
        pages: pages.length,
        jobs: jobStats.total_jobs,
      });

      setRecentItems({
        templates,
        pages,
        jobs: recentJobs,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/templates" className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Templates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.templates}</p>
            </div>
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-[var(--brand)]" aria-hidden="true">
              <path d="M6 4h9l3 3v13H6z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
              <path d="M15 4v4h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </Link>

        <Link href="/dashboard/pages" className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Results</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pages}</p>
            </div>
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-[var(--brand)]" aria-hidden="true">
              <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </Link>

        <Link href="/dashboard/generate/bulk" className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Bulk Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.jobs}</p>
            </div>
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-[var(--brand)]" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/templates/new"
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            Create New Template
          </Link>
          <Link
            href="/dashboard/generate"
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium"
          >
            Generate Page
          </Link>
          <Link
            href="/dashboard/generate/bulk"
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-medium"
          >
            Bulk Generation
          </Link>
          <Link
            href="/dashboard/pages"
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center font-medium"
          >
            View All Results
          </Link>
        </div>
      </div>

      {/* Recent Templates */}
      {recentItems.templates.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Templates</h2>
            <Link href="/dashboard/templates" className="text-blue-600 text-sm hover:text-blue-800">
              View all ->
            </Link>
          </div>
          <div className="space-y-2">
            {recentItems.templates.slice(0, 3).map((template: any) => (
              <Link
                key={template.id}
                href={`/dashboard/templates/${template.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-500">{template.variables?.length || 0} variables</p>
                </div>
                <span className="text-gray-400">{'->'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentItems.pages.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Results</h2>
            <Link href="/dashboard/pages" className="text-blue-600 text-sm hover:text-blue-800">
              View all ->
            </Link>
          </div>
          <div className="space-y-2">
            {recentItems.pages.slice(0, 3).map((page: any) => (
              <Link
                key={page.id}
                href={`/dashboard/pages/${page.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">{page.title}</p>
                </div>
                <span className="text-gray-400">{'->'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Tips & Best Practices</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Use unique and descriptive variable names</li>
          <li>Test templates with sample data before bulk generation</li>
          <li>Review SEO analysis before publishing pages</li>
        </ul>
      </div>
    </div>
  );
}
