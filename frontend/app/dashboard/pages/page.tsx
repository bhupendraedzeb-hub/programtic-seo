'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bulkApi, jobsApi, pagesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PageItem {
  id: string;
  title?: string;
  slug?: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState({
    total_jobs: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const [pagesRes, statsRes, jobsRes] = await Promise.all([
        pagesApi.list(),
        jobsApi.getStats(),
        jobsApi.getRecent(5),
      ]);

      setPages(Array.isArray(pagesRes) ? pagesRes : []);
      setJobStats(statsRes || jobStats);
      setRecentJobs(Array.isArray(jobsRes) ? jobsRes : []);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) {
      return;
    }
    try {
      await pagesApi.delete(pageId);
      setPages((prev) => prev.filter((page) => page.id !== pageId));
      toast.success('Page deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete page');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Delete this bulk job? This cannot be undone.')) {
      return;
    }
    try {
      await bulkApi.delete(jobId);
      await loadPages();
      toast.success('Bulk job deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete bulk job');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Results</h1>
        <p className="text-gray-600">View generated results</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Job Queue</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-semibold text-gray-900">{jobStats.total_jobs}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Queued</p>
            <p className="text-lg font-semibold text-gray-900">{jobStats.queued}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Processing</p>
            <p className="text-lg font-semibold text-gray-900">{jobStats.processing}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-lg font-semibold text-gray-900">{jobStats.completed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-lg font-semibold text-gray-900">{jobStats.failed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Page Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-semibold text-gray-900">{pages.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-lg font-semibold text-gray-900">
              {pages.filter((p: any) => p.status === 'active').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-lg font-semibold text-gray-900">
              {pages.filter((p: any) => p.status === 'completed').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Archived</p>
            <p className="text-lg font-semibold text-gray-900">
              {pages.filter((p: any) => p.status === 'archived').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Other</p>
            <p className="text-lg font-semibold text-gray-900">
              {pages.filter((p: any) => !['active', 'completed', 'archived'].includes(p.status)).length}
            </p>
          </div>
        </div>
      </div>

      {recentJobs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Bulk Jobs</h2>
            <Link href="/dashboard/generate/bulk" className="text-blue-600 text-sm hover:text-blue-800">
              Start bulk job ->
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job: any) => (
              <div
                key={job.id}
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/waiting?jobId=${job.id}&mode=bulk`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {job.csv_filename || 'Bulk Job'}
                    </Link>
                    <p className="text-sm text-gray-600">
                      Status: {job.status?.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {job.created_at ? new Date(job.created_at).toLocaleString() : 'Unknown time'}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                  <span>
                    Rows: {job.processed_rows}/{job.total_rows} ? Failed: {job.failed_rows}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteJob(job.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete job
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Loading results...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">No results generated yet.</p>
          <Link href="/dashboard/generate" className="text-blue-600 hover:text-blue-800">
            Generate a page
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {pages.map((page) => (
            <div key={page.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/dashboard/pages/${page.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {page.title || page.slug || 'Untitled'}
                </Link>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => deletePage(page.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                  <span className="text-gray-400" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
