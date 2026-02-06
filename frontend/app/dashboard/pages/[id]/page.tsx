'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pagesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PageDetail() {
  const params = useParams();
  const router = useRouter();
  const pageId = typeof params?.id === 'string' ? params.id : '';
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (pageId) loadPage(pageId);
  }, [pageId]);

  const loadPage = async (id: string) => {
    try {
      setLoading(true);
      const res = await pagesApi.get(id);
      setPage(res);
    } catch (error) {
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!page?.storage_url) {
      toast.error('No download available');
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(page.storage_url);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = `${page.slug || 'page'}.html`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  const deletePage = async () => {
    if (!pageId) return;
    if (!confirm('Delete this page? This cannot be undone.')) {
      return;
    }
    try {
      setDeleting(true);
      await pagesApi.delete(pageId);
      toast.success('Page deleted');
      router.push('/dashboard/pages');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete page');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page</h1>
          <p className="text-gray-600">{page?.title || 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-3">
          {page?.template_id && (
            <button
              type="button"
              onClick={() => router.push(`/dashboard/templates/${page.template_id}?edit=1`)}
              className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
            >
              Edit template
            </button>
          )}
          <button
            type="button"
            onClick={deletePage}
            disabled={deleting || loading}
            className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow">Loading...</div>
      ) : !page ? (
        <div className="bg-white p-6 rounded-lg shadow">Page not found.</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <p className="text-sm text-gray-600">Slug</p>
            <p className="font-medium">{page.slug}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Download</p>
            <button
              type="button"
              onClick={downloadFile}
              disabled={downloading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
