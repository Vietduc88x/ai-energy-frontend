'use client';

import { useState, useCallback } from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  editable?: boolean;
  type?: 'text' | 'select';
  options?: string[]; // for select type
}

interface EditableTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
  disabled?: boolean;
  addLabel?: string;
  className?: string;
}

/**
 * Editable table for structured data: checklists, risk registers, document requests.
 * Supports inline cell editing, row add/delete.
 */
export function EditableTable({
  columns,
  rows,
  onChange,
  disabled = false,
  addLabel = 'Add row',
  className = '',
}: EditableTableProps) {
  const updateCell = useCallback(
    (rowIndex: number, key: string, value: unknown) => {
      const updated = rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row));
      onChange(updated);
    },
    [rows, onChange],
  );

  const addRow = useCallback(() => {
    const newRow: Record<string, unknown> = {};
    for (const col of columns) newRow[col.key] = '';
    onChange([...rows, newRow]);
  }, [rows, columns, onChange]);

  const deleteRow = useCallback(
    (index: number) => {
      onChange(rows.filter((_, i) => i !== index));
    },
    [rows, onChange],
  );

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-3 py-2 border border-gray-200 font-medium text-gray-600 text-xs"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
            {!disabled && <th className="w-10 border border-gray-200" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50/50">
              {columns.map((col) => (
                <td key={col.key} className="border border-gray-200 px-1 py-0.5">
                  {col.editable === false || disabled ? (
                    <span className="px-2 py-1 text-gray-700">{String(row[col.key] ?? '')}</span>
                  ) : col.type === 'select' && col.options ? (
                    <select
                      value={String(row[col.key] ?? '')}
                      onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-0 focus:ring-2 focus:ring-blue-200 rounded text-sm"
                    >
                      <option value="">—</option>
                      {col.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={String(row[col.key] ?? '')}
                      onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-0 focus:ring-2 focus:ring-blue-200 rounded text-sm"
                    />
                  )}
                </td>
              ))}
              {!disabled && (
                <td className="border border-gray-200 text-center">
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIndex)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    title="Delete row"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!disabled && (
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {addLabel}
        </button>
      )}
    </div>
  );
}
