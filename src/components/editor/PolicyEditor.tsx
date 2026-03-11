'use client';

import { EditableText } from './EditableText';
import { RichTextEditor } from './RichTextEditor';
import { EditableTable } from './EditableTable';

interface PolicyEditorProps {
  content: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

const KEY_DATES_COLUMNS = [
  { key: 'label', label: 'Label', width: '25%' },
  { key: 'date', label: 'Date', width: '20%' },
  { key: 'significance', label: 'Significance', width: '55%' },
];

const WHAT_CHANGED_COLUMNS = [
  { key: 'title', label: 'Change', width: '25%' },
  { key: 'detail', label: 'Detail', width: '55%' },
  { key: 'effectiveDate', label: 'Effective Date', width: '20%' },
];

const WHO_AFFECTED_COLUMNS = [
  { key: 'actor', label: 'Actor', width: '30%' },
  { key: 'impact', label: 'Impact', width: '70%' },
];

export function PolicyEditor({ content, updateField }: PolicyEditorProps) {
  const whatChanged = (content.whatChanged || []) as Record<string, unknown>[];
  const howItWorksNow = (content.howItWorksNow || []) as Record<string, unknown>[];
  const keyDates = (content.keyDates || []) as Record<string, unknown>[];
  const whoIsAffected = (content.whoIsAffected || []) as Record<string, unknown>[];
  const practicalImplications = (content.practicalImplications || []) as string[];
  const whatToCheckNext = (content.whatToCheckNext || []) as string[];

  const renderStringList = (
    label: string,
    items: string[],
    field: string,
    addLabel: string,
  ) => (
    <section>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-gray-300 mt-0.5">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                updateField(field, updated);
              }}
              className="flex-1 text-sm border-0 border-b border-transparent focus:border-blue-200 focus:ring-0 bg-transparent py-0.5"
            />
            <button
              type="button"
              onClick={() => updateField(field, items.filter((_, j) => j !== i))}
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
          onClick={() => updateField(field, [...items, ''])}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          + {addLabel}
        </button>
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      <EditableText
        value={String(content.subtitle || '')}
        onChange={(v) => updateField('subtitle', v)}
        tag="p"
        className="text-gray-500 text-lg"
        placeholder="Add a subtitle…"
      />

      {/* Current Status */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Status</h2>
        <RichTextEditor
          content={String((content.currentStatus as any)?.summary || content.currentStatus || '')}
          onChange={(v) => updateField('currentStatus', { ...(content.currentStatus as any || {}), summary: v })}
        />
      </section>

      {/* What Changed */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">What Changed</h2>
        <EditableTable
          columns={WHAT_CHANGED_COLUMNS}
          rows={whatChanged}
          onChange={(rows) => updateField('whatChanged', rows)}
          addLabel="Add change"
        />
      </section>

      {/* How It Works Now */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">How It Works Now</h2>
        <EditableTable
          columns={[
            { key: 'pathway', label: 'Pathway', width: '30%' },
            { key: 'description', label: 'Description', width: '70%' },
          ]}
          rows={howItWorksNow}
          onChange={(rows) => updateField('howItWorksNow', rows)}
          addLabel="Add pathway"
        />
      </section>

      {/* Key Dates */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Dates</h2>
        <EditableTable
          columns={KEY_DATES_COLUMNS}
          rows={keyDates}
          onChange={(rows) => updateField('keyDates', rows)}
          addLabel="Add date"
        />
      </section>

      {/* Who Is Affected */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Who Is Affected</h2>
        <EditableTable
          columns={WHO_AFFECTED_COLUMNS}
          rows={whoIsAffected}
          onChange={(rows) => updateField('whoIsAffected', rows)}
          addLabel="Add stakeholder"
        />
      </section>

      {renderStringList('Practical Implications', practicalImplications, 'practicalImplications', 'Add implication')}
      {renderStringList('What to Check Next', whatToCheckNext, 'whatToCheckNext', 'Add action')}

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
