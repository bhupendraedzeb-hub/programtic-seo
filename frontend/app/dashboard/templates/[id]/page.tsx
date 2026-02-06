'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { templatesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import TemplateEditor from '@/components/TemplateEditor';

interface TemplateDetail {
  id: string;
  name: string;
  html_content?: string;
  variables?: string[];
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = typeof params?.id === 'string' ? params.id : '';

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(searchParams?.get('edit') === '1');

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      setLoading(true);
      const res = await templatesApi.get(id);
      setTemplate(res);
    } catch (error) {
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  if (!templateId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Invalid template id.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template</h1>
          <p className="text-gray-600">{template?.name || 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Loading template...</p>
        </div>
      ) : !template ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Template not found.</p>
        </div>
      ) : isEditing ? (
        <TemplateEditor
          templateId={template.id}
          initialName={template.name}
          initialHtmlContent={template.html_content}
          onSaved={(id) => {
            setIsEditing(false);
            loadTemplate(id);
          }}
        />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Variables</h2>
            <p className="text-sm text-gray-600">
              {template.variables?.length ? template.variables.join(', ') : 'None'}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">HTML Content</h2>
            <pre className="mt-2 p-4 bg-gray-50 rounded text-sm overflow-auto whitespace-pre-wrap break-words">
              {template.html_content || ''}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
