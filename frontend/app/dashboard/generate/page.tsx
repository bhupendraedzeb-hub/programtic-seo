'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templatesApi, pagesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TemplateItem {
  id: string;
  name: string;
  variables: string[];
}

export default function GeneratePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const handleGenerate = async () => {
    if (!templateId) {
      toast.error('Select a template');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const header = selectedTemplate?.variables || [];
      if (!header.length) {
        throw new Error('Template has no variables');
      }
      const missing = header.filter((key) => !(variables[key] ?? '').trim());
      if (missing.length) {
        throw new Error(`Missing values: ${missing.join(', ')}`);
      }

      const page = await pagesApi.create(templateId, variables);
      const url = page?.storage_url || '';
      if (!url) {
        throw new Error('Generated page URL missing.');
      }

      const encoded = encodeURIComponent(url);
      toast.success('Page generated');
      router.push(`/dashboard/download?mode=single&url=${encoded}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate page';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Page</h1>
        <p className="text-gray-600">Fill variables and generate a single SEO page.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <select
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              setVariables({});
            }}
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

        {selectedTemplate && (
          <div className="space-y-3">
            {selectedTemplate.variables.map((variable) => (
              <div key={variable}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {variable}
                </label>
                <input
                  value={variables[variable] || ''}
                  onChange={(e) =>
                    setVariables((prev) => ({ ...prev, [variable]: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={`Enter ${variable}`}
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Page'}
        </button>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

      </div>
    </div>
  );
}
