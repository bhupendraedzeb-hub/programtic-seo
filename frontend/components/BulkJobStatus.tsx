'use client';

import { useEffect, useState } from 'react';
import { bulkApi } from '@/lib/api';
import { getProgressColor, getJobStatusColor, formatProgressLabel } from '@/lib/utils';

interface BulkJobStatusProps {
  jobId: string;
  onComplete?: () => void;
}

export function BulkJobStatus({ jobId, onComplete }: BulkJobStatusProps) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadJobStatus();

    if (!autoRefresh) return;

    const interval = setInterval(loadJobStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId, autoRefresh]);

  const loadJobStatus = async () => {
    try {
      const status = await bulkApi.getStatus(jobId);
      setJob(status);
      setLoading(false);

      // Stop auto-refresh when completed
      if (status.status === 'completed' || status.status === 'completed_with_errors' || status.status === 'failed') {
        setAutoRefresh(false);
        onComplete?.();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading job status...</div>;
  }

  if (!job) {
    return <div className="text-center py-8">Job not found</div>;
  }

  const statusColor = getJobStatusColor(job.status);

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Job Status</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${statusColor}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-gray-600">{formatProgressLabel(job.processed_rows, job.total_rows)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(job.progress_percent)}`}
              style={{ width: `${job.progress_percent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{job.processed_rows}</p>
            <p className="text-sm text-gray-600">Processed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-600">{job.error_count}</p>
            <p className="text-sm text-gray-600">Errors</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{job.total_rows}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(job.updated_at).toLocaleTimeString()}
        </p>
      </div>

      {/* Results */}
      {job.status === 'completed' || job.status === 'completed_with_errors' ? (
        <>
          {job.result_urls.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Generated Pages ({job.result_urls.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {job.result_urls.slice(0, 10).map((result: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded hover:bg-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 truncate">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.slug}</p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.error_count > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4 text-red-600">Errors ({job.error_count})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
                {job.errors?.slice(0, 10).map((error: any, idx: number) => (
                  <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="font-medium text-red-800">Row {error.row}</p>
                    <p className="text-red-700">{error.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
