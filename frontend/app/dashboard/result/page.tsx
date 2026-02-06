'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bulkApi } from '@/lib/api';

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';
  const mode = searchParams.get('mode') || 'single';

  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    const load = async () => {
      try {
        const status = await bulkApi.getStatus(jobId);
        if (!active) return;
        setJob(status);
      } catch (err) {
        if (!active) return;
        setError('Unable to load job result.');
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [jobId]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900">Result</h1>
        <p className="text-gray-600">Job ID: {jobId || 'Unknown'}</p>
        <p className="text-gray-600">Type: {mode === 'bulk' ? 'Bulk' : 'Single'}</p>
      </div>

      {error && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      {job && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900">{job.status.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processed</p>
              <p className="font-medium text-gray-900">{job.processed_rows}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="font-medium text-gray-900">{job.failed_rows}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-medium text-gray-900">{job.total_rows}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600">Download links are hidden for this view.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
