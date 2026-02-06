'use client';

import { getSeoStatus, getSeoStatusColor } from '@/lib/utils';

interface SEOValidatorProps {
  seoData?: any;
  showDetails?: boolean;
}

export function SEOValidator({ seoData, showDetails = true }: SEOValidatorProps) {
  if (!seoData) {
    return (
      <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800">
        No SEO data available
      </div>
    );
  }

  const score = seoData.score || 0;
  const status = getSeoStatus(score);
  const statusColor = getSeoStatusColor(status);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">SEO Analysis</h3>
          <div className={`text-3xl font-bold ${statusColor}`}>{score}</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className={`text-sm font-semibold mt-2 ${statusColor}`}>
          {status.toUpperCase()}
        </p>
      </div>

      {showDetails && (
        <div className="space-y-4">
          {/* Issues */}
          {seoData.issues && seoData.issues.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-600 mb-2">Issues ({seoData.issues.length})</h4>
              <ul className="space-y-1">
                {seoData.issues.map((issue: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-1">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {seoData.warnings && seoData.warnings.length > 0 && (
            <div>
              <h4 className="font-semibold text-yellow-600 mb-2">Warnings ({seoData.warnings.length})</h4>
              <ul className="space-y-1">
                {seoData.warnings.map((warning: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-600 mt-1">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path d="M12 8v6m0 4h.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M12 3l9 16H3z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {seoData.suggestions && seoData.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Suggestions ({seoData.suggestions.length})</h4>
              <ul className="space-y-1">
                {seoData.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-600 mt-1">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path d="M9 18h6m-5 3h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M12 3a6 6 0 0 0-3 11c.5.3 1 1 1 2h4c0-1 .5-1.7 1-2a6 6 0 0 0-3-11z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
