'use client';

import { EditableText } from './EditableText';
import { RichTextEditor } from './RichTextEditor';
import { EditableTable } from './EditableTable';

interface GuidanceEditorProps {
  content: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

const CHECKLIST_COLUMNS = [
  { key: 'label', label: 'Item', width: '55%' },
  { key: 'severity', label: 'Severity', width: '20%', type: 'select' as const, options: ['critical', 'medium', 'low'] },
  { key: 'status', label: 'Status', width: '25%', type: 'select' as const, options: ['pending', 'done', 'n/a'] },
];

const DOC_REQUEST_COLUMNS = [
  { key: 'category', label: 'Category', width: '20%' },
  { key: 'document', label: 'Document', width: '40%' },
  { key: 'priority', label: 'Priority', width: '15%', type: 'select' as const, options: ['high', 'medium', 'low'] },
  { key: 'whyItMatters', label: 'Why It Matters', width: '25%' },
];

const RISK_COLUMNS = [
  { key: 'risk', label: 'Risk', width: '30%' },
  { key: 'likelihood', label: 'Likelihood', width: '15%', type: 'select' as const, options: ['high', 'medium', 'low'] },
  { key: 'impact', label: 'Impact', width: '15%', type: 'select' as const, options: ['high', 'medium', 'low'] },
  { key: 'mitigation', label: 'Mitigation', width: '40%' },
];

export function GuidanceEditor({ content, updateField }: GuidanceEditorProps) {
  const checklist = (content.checklist || []) as Array<Record<string, unknown>>;
  const documentRequestMatrix = (content.documentRequestMatrix || []) as Record<string, unknown>[];
  const riskStarter = (content.riskStarter || []) as Record<string, unknown>[];
  const stageGuidance = (content.stageGuidance || []) as string[];
  const epcReviewQuestions = (content.epcReviewQuestions || []) as Array<Record<string, unknown>>;

  // Flatten checklist sections into a single table for editing
  const flatChecklist = checklist.flatMap((section) => {
    const items = (section.items || []) as Array<Record<string, unknown>>;
    return items.map((item) => ({
      section: section.section,
      ...item,
    }));
  });

  const updateChecklist = (rows: Record<string, unknown>[]) => {
    // Re-group by section
    const grouped = new Map<string, Record<string, unknown>[]>();
    for (const row of rows) {
      const sec = String(row.section || 'General');
      if (!grouped.has(sec)) grouped.set(sec, []);
      grouped.get(sec)!.push({ label: row.label, severity: row.severity, status: row.status });
    }
    updateField('checklist', Array.from(grouped.entries()).map(([section, items]) => ({ section, items })));
  };

  return (
    <div className="space-y-8">
      <EditableText
        value={String(content.subtitle || '')}
        onChange={(v) => updateField('subtitle', v)}
        tag="p"
        className="text-gray-500 text-lg"
        placeholder="Add a subtitle…"
      />

      {/* Summary */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Summary</h2>
        <RichTextEditor
          content={String(content.summary || '')}
          onChange={(v) => updateField('summary', v)}
        />
      </section>

      {/* Stage Guidance */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Stage Guidance</h2>
        <div className="space-y-2">
          {stageGuidance.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...stageGuidance];
                  updated[i] = e.target.value;
                  updateField('stageGuidance', updated);
                }}
                className="flex-1 text-sm border-0 border-b border-transparent focus:border-blue-200 focus:ring-0 bg-transparent py-0.5"
              />
              <button
                type="button"
                onClick={() => updateField('stageGuidance', stageGuidance.filter((_, j) => j !== i))}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateField('stageGuidance', [...stageGuidance, ''])}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add guidance item
          </button>
        </div>
      </section>

      {/* Due Diligence Checklist */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Due Diligence Checklist</h2>
        <EditableTable
          columns={[
            { key: 'section', label: 'Section', width: '20%' },
            ...CHECKLIST_COLUMNS,
          ]}
          rows={flatChecklist}
          onChange={updateChecklist}
          addLabel="Add checklist item"
        />
      </section>

      {/* Document Request Matrix */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Documents</h2>
        <EditableTable
          columns={DOC_REQUEST_COLUMNS}
          rows={documentRequestMatrix}
          onChange={(rows) => updateField('documentRequestMatrix', rows)}
          addLabel="Add document"
        />
      </section>

      {/* EPC Review Questions */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">EPC Review Questions</h2>
        {epcReviewQuestions.map((section, si) => (
          <div key={si} className="mb-4">
            <input
              type="text"
              value={String(section.section || '')}
              onChange={(e) => {
                const updated = [...epcReviewQuestions];
                updated[si] = { ...section, section: e.target.value };
                updateField('epcReviewQuestions', updated);
              }}
              className="text-sm font-medium text-gray-700 border-0 border-b border-transparent focus:border-blue-200 focus:ring-0 bg-transparent mb-1"
            />
            <div className="space-y-1 ml-4">
              {((section.questions || []) as string[]).map((q, qi) => (
                <div key={qi} className="flex items-start gap-2">
                  <span className="text-gray-300 text-sm">{qi + 1}.</span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      const updatedQuestions = [...(section.questions as string[])];
                      updatedQuestions[qi] = e.target.value;
                      const updated = [...epcReviewQuestions];
                      updated[si] = { ...section, questions: updatedQuestions };
                      updateField('epcReviewQuestions', updated);
                    }}
                    className="flex-1 text-sm border-0 border-b border-transparent focus:border-blue-200 focus:ring-0 bg-transparent py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updatedQuestions = (section.questions as string[]).filter((_, j) => j !== qi);
                      const updated = [...epcReviewQuestions];
                      updated[si] = { ...section, questions: updatedQuestions };
                      updateField('epcReviewQuestions', updated);
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [...epcReviewQuestions];
                  updated[si] = { ...section, questions: [...(section.questions as string[]), ''] };
                  updateField('epcReviewQuestions', updated);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-4"
              >
                + Add question
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Risk Register */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Risk Register</h2>
        <EditableTable
          columns={RISK_COLUMNS}
          rows={riskStarter}
          onChange={(rows) => updateField('riskStarter', rows)}
          addLabel="Add risk"
        />
      </section>

      {/* Caveat */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Caveat</h2>
        <EditableText
          value={String(content.caveat || '')}
          onChange={(v) => updateField('caveat', v)}
          tag="p"
          className="text-sm text-gray-500 italic"
          placeholder="Add a caveat note…"
        />
      </section>
    </div>
  );
}
