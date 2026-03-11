'use client';

import { EditableText } from './EditableText';
import { RichTextEditor } from './RichTextEditor';
import { EditableTable } from './EditableTable';

interface BenchmarkEditorProps {
  content: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

const COMPARISON_COLUMNS = [
  { key: 'source', label: 'Source', width: '20%' },
  { key: 'valuePoint', label: 'Value', width: '15%' },
  { key: 'unit', label: 'Unit', width: '12%' },
  { key: 'valueMin', label: 'Min', width: '12%' },
  { key: 'valueMax', label: 'Max', width: '12%' },
  { key: 'methodology', label: 'Methodology', width: '29%' },
];

export function BenchmarkEditor({ content, updateField }: BenchmarkEditorProps) {
  const comparisonTable = (content.comparisonTable || []) as Record<string, unknown>[];
  const disagreementDrivers = (content.disagreementDrivers || []) as string[];

  return (
    <div className="space-y-8">
      {/* Subtitle */}
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

      {/* Key Takeaway */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Takeaway</h2>
        <RichTextEditor
          content={String(content.keyTakeaway || '')}
          onChange={(v) => updateField('keyTakeaway', v)}
        />
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Source Comparison</h2>
        <EditableTable
          columns={COMPARISON_COLUMNS}
          rows={comparisonTable}
          onChange={(rows) => updateField('comparisonTable', rows)}
          addLabel="Add source"
        />
      </section>

      {/* Disagreement Drivers */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Disagreement Drivers</h2>
        <div className="space-y-2">
          {disagreementDrivers.map((driver, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">•</span>
              <input
                type="text"
                value={driver}
                onChange={(e) => {
                  const updated = [...disagreementDrivers];
                  updated[i] = e.target.value;
                  updateField('disagreementDrivers', updated);
                }}
                className="flex-1 text-sm border-0 border-b border-transparent focus:border-blue-200 focus:ring-0 bg-transparent py-0.5"
              />
              <button
                type="button"
                onClick={() => updateField('disagreementDrivers', disagreementDrivers.filter((_, j) => j !== i))}
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
            onClick={() => updateField('disagreementDrivers', [...disagreementDrivers, ''])}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add driver
          </button>
        </div>
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
