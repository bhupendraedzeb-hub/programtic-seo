'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { templatesApi } from '@/lib/api';
import toast from 'react-hot-toast';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TemplateEditorProps {
  templateId?: string;
  initialName?: string;
  initialHtmlContent?: string;
  onSaved?: (templateId: string) => void;
}

const DEFAULT_TEMPLATE =
  '<!doctype html>\n<html>\n<head>\n  <title>{{title}}</title>\n  <meta name="description" content="{{meta_description}}" />\n</head>\n<body>\n  <h1>{{title}}</h1>\n  <p>{{content}}</p>\n</body>\n</html>';

export default function TemplateEditor({
  templateId,
  initialName,
  initialHtmlContent,
  onSaved,
}: TemplateEditorProps) {
  const [name, setName] = useState(initialName || '');
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent || DEFAULT_TEMPLATE);
  const [variables, setVariables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const detectVariables = useCallback(async (content: string) => {
    try {
      const result = await templatesApi.validateContent(content);
      setVariables(result.variables || []);
    } catch (error) {
      setVariables([]);
    }
  }, []);

  useEffect(() => {
    detectVariables(htmlContent);
  }, [htmlContent, detectVariables]);

  useEffect(() => {
    if (initialName && name === '') {
      setName(initialName);
    }
    if (initialHtmlContent && htmlContent === DEFAULT_TEMPLATE) {
      setHtmlContent(initialHtmlContent);
    }
  }, [initialName, initialHtmlContent, name, htmlContent]);

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    setHtmlContent(text);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('Template content is required');
      return;
    }
    setLoading(true);
    try {
      if (templateId) {
        await templatesApi.update(templateId, {
          name: name.trim(),
          html_content: htmlContent,
        });
        toast.success('Template updated');
        if (onSaved) onSaved(templateId);
      } else {
        const res = await templatesApi.create(name.trim(), htmlContent);
        toast.success('Template saved');
        if (onSaved) onSaved(res.id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">Template Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Product landing page template"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Upload HTML</label>
          <input
            type="file"
            accept=".html,.htm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Template HTML</span>
          <span className="text-xs text-gray-500">
            Variables: {variables.length ? variables.join(', ') : 'None detected'}
          </span>
        </div>
        <div className="h-[500px]">
          <MonacoEditor
            language="html"
            value={htmlContent}
            onChange={(value) => setHtmlContent(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : templateId ? 'Save Changes' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}
