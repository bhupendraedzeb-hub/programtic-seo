'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bulkApi } from '@/lib/api';

const QUOTES = [
  'Drinking tea is important, but it has nothing to do with your work.',
  'Somewhere a developer just pressed save.',
  'Your pages are loading. The universe is expanding.',
  'This is the part where we pretend progress bars are honest.',
  'A build finished somewhere and nobody clapped.',
  'We are waiting. The servers are, too.',
  'If you can read this, the job is still running.',
  'Your template is doing its best.',
  'Loading... and pondering the meaning of tabs vs spaces.',
  'An API call walks into a bar. It gets a 200.',
];

function buildQuoteOrder(list: string[]) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function WaitingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';
  const mode = searchParams.get('mode') || 'single';

  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [quoteOrder, setQuoteOrder] = useState<string[]>(() => buildQuoteOrder(QUOTES));
  const [quoteIndex, setQuoteIndex] = useState(0);

  const currentQuote = useMemo(() => quoteOrder[quoteIndex] || QUOTES[0], [quoteOrder, quoteIndex]);

  useEffect(() => {
    if (!jobId) return;

    let active = true;
    const poll = async () => {
      try {
        const status = await bulkApi.getStatus(jobId);
        if (!active) return;
        setJob(status);
        if (status.status === 'completed' || status.status === 'completed_with_errors') {
          let downloadUrl = '';
          if (Array.isArray(status.result_urls) && status.result_urls.length > 0) {
            if (mode === 'bulk') {
              const zip = status.result_urls.find((r: any) => r.type === 'zip');
              downloadUrl = zip?.url || '';
            } else {
              const first = status.result_urls.find((r: any) => r.url);
              downloadUrl = first?.url || '';
            }
          }

          if (downloadUrl) {
            const encoded = encodeURIComponent(downloadUrl);
            router.replace(`/dashboard/download?jobId=${jobId}&mode=${mode}&url=${encoded}`);
          } else {
            router.replace(`/dashboard/result?jobId=${jobId}&mode=${mode}`);
          }
        } else if (status.status === 'failed') {
          setError('Job failed. Please try again.');
        }
      } catch (err) {
        if (!active) return;
        setError('Unable to fetch job status.');
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [jobId, mode, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        if (prev + 1 < quoteOrder.length) return prev + 1;
        setQuoteOrder(buildQuoteOrder(QUOTES));
        return 0;
      });
    }, 46000);

    return () => clearInterval(interval);
  }, [quoteOrder.length]);

  if (!jobId) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Waiting Page</h1>
        <p className="text-gray-600">Missing job ID.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900">Generating Your Pages</h1>
        <p className="text-gray-600">Job ID: {jobId}</p>
        {job && (
          <p className="text-gray-600 mt-2">
            Status: {job.status.replace('_', ' ').toUpperCase()}
          </p>
        )}
        {error && (
          <p className="text-gray-600 mt-4">
            {error}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm text-gray-600 mb-2">Useless Quote</p>
        <p className="text-lg font-medium text-gray-900">{currentQuote}</p>
      </div>
    </div>
  );
}
