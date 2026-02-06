'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bulkApi, templatesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TemplateItem {
  id: string;
  name: string;
  variables: string[];
}

export default function BulkGeneratePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await templatesApi.list();
      setTemplates(res || []);
    } catch (error) {
      toast.error('Failed to load templates');
    }
  };

  const handleSubmit = async () => {
    if (!templateId) {
      toast.error('Select a template');
      return;
    }
    if (!file) {
      toast.error('Upload a CSV file');
      return;
    }
    setLoading(true);
    try {
      const res = await bulkApi.create(templateId, file);
      setJob(res);
      toast.success('Bulk job queued');
      router.push(`/dashboard/waiting?jobId=${res.id}&mode=bulk`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create bulk job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Generation</h1>
        <p className="text-gray-600">Upload a CSV to generate pages in bulk.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Make sure CSV headers match template variables.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Start Bulk Job'}
        </button>
      </div>

      {job && (
        <div className="bg-white p-6 rounded-lg shadow space-y-2">
          <h2 className="text-lg font-semibold">Job Status</h2>
          <p className="text-sm text-gray-700">ID: {job.id}</p>
          <p className="text-sm text-gray-700">Status: {job.status}</p>
          <p className="text-sm text-gray-700">
            Processed: {job.processed_rows}/{job.total_rows}
          </p>
        </div>
      )}
    </div>
  );
}
