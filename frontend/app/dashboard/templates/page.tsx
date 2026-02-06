'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { templatesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TemplateItem {
  id: string;
  name: string;
  variables?: string[];
  created_at?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await templatesApi.list(0, 50);
      setTemplates(Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Manage your HTML templates</p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Template
        </Link>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">No templates yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/dashboard/templates/${template.id}`}
              className="block p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-500">
                    {template.variables?.length || 0} variables
                  </p>
                </div>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
