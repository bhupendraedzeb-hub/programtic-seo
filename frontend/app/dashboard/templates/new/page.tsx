'use client';

import { useRouter } from 'next/navigation';
import TemplateEditor from '@/components/TemplateEditor';

export default function NewTemplatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Template</h1>
        <p className="text-gray-600">Upload HTML and define variables to generate pages.</p>
      </div>

      <TemplateEditor onSaved={(id) => router.push(`/dashboard/templates/${id}`)} />
    </div>
  );
}
