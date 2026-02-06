'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DownloadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';
  const mode = searchParams.get('mode') || 'single';
  const url = useMemo(() => {
    const raw = searchParams.get('url') || '';
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [searchParams]);
  const [hasUrl] = useState(!!searchParams.get('url'));
  const [downloading, setDownloading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Result Download</h1>
          <p className="text-gray-600">
            Your generated page is ready. Use the link below to open or download it.
          </p>
          {jobId && (
            <p className="text-gray-600 mt-1">Job ID: {jobId} ({mode === 'bulk' ? 'Bulk' : 'Single'})</p>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/pages')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Results
        </button>
      </div>

      {!hasUrl ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-700">Missing download URL.</p>
          <Link href="/dashboard/generate" className="text-blue-600 hover:text-blue-800">
            Go back to Generate
          </Link>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <p className="text-sm text-gray-700">
            Your generated page is ready. Use the Results page to access it.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!url || downloading) return;
                try {
                  setDownloading(true);
                  const response = await fetch(url);
                  if (!response.ok) {
                    throw new Error('Download failed');
                  }
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const filename = (() => {
                    try {
                      const pathname = new URL(url).pathname;
                      const name = pathname.split('/').pop();
                      return name || 'download.html';
                    } catch {
                      return 'download.html';
                    }
                  })();
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  URL.revokeObjectURL(blobUrl);
                } catch {
                  alert('Failed to download file.');
                } finally {
                  setDownloading(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Download'}
            </button>
            <Link
              href="/dashboard/pages"
              className="inline-flex px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Results
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
