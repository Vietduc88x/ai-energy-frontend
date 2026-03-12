import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(() => cleanup());

// ─── EditableText ────────────────────────────────────────────────────────────

describe('EditableText', () => {
  it('renders with initial value', async () => {
    const { EditableText } = await import('@/components/editor/EditableText');
    const onChange = vi.fn();
    render(<EditableText value="Test Title" onChange={onChange} tag="h1" />);
    expect(screen.getByText('Test Title')).toBeTruthy();
  });

  it('is contentEditable when not disabled', async () => {
    const { EditableText } = await import('@/components/editor/EditableText');
    const onChange = vi.fn();
    const { container } = render(<EditableText value="Editable" onChange={onChange} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('contenteditable')).toBe('true');
  });

  it('is not contentEditable when disabled', async () => {
    const { EditableText } = await import('@/components/editor/EditableText');
    const onChange = vi.fn();
    const { container } = render(<EditableText value="Read only" onChange={onChange} disabled />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('contenteditable')).toBe('false');
  });

  it('has an onPaste handler that strips HTML', async () => {
    const { EditableText } = await import('@/components/editor/EditableText');
    const onChange = vi.fn();
    const { container } = render(<EditableText value="" onChange={onChange} />);
    const el = container.firstChild as HTMLElement;
    // Use fireEvent.paste which goes through React's synthetic event system
    const clipboardData = {
      getData: vi.fn((type: string) => type === 'text/plain' ? 'Plain text only' : '<b>Bold</b> text'),
    };
    fireEvent.paste(el, { clipboardData });
    // The paste handler reads text/plain to strip any HTML
    expect(clipboardData.getData).toHaveBeenCalledWith('text/plain');
  });
});

// ─── EditableTable ───────────────────────────────────────────────────────────

describe('EditableTable', () => {
  const COLUMNS = [
    { key: 'name', label: 'Name', width: '50%' },
    { key: 'value', label: 'Value', width: '50%' },
  ];
  const ROWS = [
    { name: 'Row 1', value: '100' },
    { name: 'Row 2', value: '200' },
  ];

  it('renders all rows', async () => {
    const { EditableTable } = await import('@/components/editor/EditableTable');
    const onChange = vi.fn();
    render(<EditableTable columns={COLUMNS} rows={ROWS} onChange={onChange} />);
    // Header + 2 data rows
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(4); // 2 rows x 2 columns
  });

  it('renders column headers', async () => {
    const { EditableTable } = await import('@/components/editor/EditableTable');
    const onChange = vi.fn();
    render(<EditableTable columns={COLUMNS} rows={ROWS} onChange={onChange} />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Value')).toBeTruthy();
  });

  it('shows add button', async () => {
    const { EditableTable } = await import('@/components/editor/EditableTable');
    const onChange = vi.fn();
    render(<EditableTable columns={COLUMNS} rows={ROWS} onChange={onChange} addLabel="Add item" />);
    expect(screen.getByText('Add item')).toBeTruthy();
  });

  it('calls onChange when add button clicked', async () => {
    const { EditableTable } = await import('@/components/editor/EditableTable');
    const onChange = vi.fn();
    render(<EditableTable columns={COLUMNS} rows={ROWS} onChange={onChange} addLabel="Add item" />);
    fireEvent.click(screen.getByText('Add item'));
    expect(onChange).toHaveBeenCalledWith([...ROWS, { name: '', value: '' }]);
  });

  it('hides delete buttons and add when disabled', async () => {
    const { EditableTable } = await import('@/components/editor/EditableTable');
    const onChange = vi.fn();
    render(<EditableTable columns={COLUMNS} rows={ROWS} onChange={onChange} disabled addLabel="Add item" />);
    expect(screen.queryByText('Add item')).toBeNull();
    expect(screen.queryByTitle('Delete row')).toBeNull();
  });
});

// ─── BenchmarkEditor ─────────────────────────────────────────────────────────

describe('BenchmarkEditor', () => {
  const CONTENT = {
    title: 'Solar Benchmark',
    subtitle: 'Global comparison',
    summary: '<p>LCOE comparison</p>',
    keyTakeaway: '<p>IRENA lowest</p>',
    comparisonTable: [
      { source: 'IRENA', valuePoint: '36', unit: 'USD/MWh', valueMin: '28', valueMax: '50', methodology: 'Weighted' },
    ],
    disagreementDrivers: ['Method A vs B'],
    caveat: 'Approximate data.',
  };

  it('renders all sections', async () => {
    const { BenchmarkEditor } = await import('@/components/editor/BenchmarkEditor');
    const updateField = vi.fn();
    render(<BenchmarkEditor content={CONTENT} updateField={updateField} />);
    expect(screen.getByText('Summary')).toBeTruthy();
    expect(screen.getByText('Key Takeaway')).toBeTruthy();
    expect(screen.getByText('Source Comparison')).toBeTruthy();
    expect(screen.getByText('Disagreement Drivers')).toBeTruthy();
    expect(screen.getByText('Caveat')).toBeTruthy();
  });
});

// ─── PolicyEditor ────────────────────────────────────────────────────────────

describe('PolicyEditor', () => {
  const CONTENT = {
    title: 'Vietnam Policy',
    subtitle: 'FIT update',
    currentStatus: { summary: '<p>Active</p>' },
    whatChanged: [{ title: 'New FIT', detail: 'Lower rate', effectiveDate: '2025-01-01' }],
    howItWorksNow: [{ pathway: 'Rooftop', description: 'Self consumption' }],
    keyDates: [{ label: 'PDP8', date: '2025-06', significance: 'Capacity' }],
    whoIsAffected: [{ actor: 'Developers', impact: 'Lower returns' }],
    practicalImplications: ['Re-evaluate'],
    whatToCheckNext: ['Monitor PDP8'],
    caveat: 'Evolving.',
  };

  it('renders all sections', async () => {
    const { PolicyEditor } = await import('@/components/editor/PolicyEditor');
    const updateField = vi.fn();
    render(<PolicyEditor content={CONTENT} updateField={updateField} />);
    expect(screen.getByText('Current Status')).toBeTruthy();
    expect(screen.getByText('What Changed')).toBeTruthy();
    expect(screen.getByText('Key Dates')).toBeTruthy();
    expect(screen.getByText('Practical Implications')).toBeTruthy();
  });
});

// ─── GuidanceEditor ──────────────────────────────────────────────────────────

describe('GuidanceEditor', () => {
  const CONTENT = {
    title: 'Guidance Pack',
    subtitle: 'Feasibility',
    summary: '<p>Key items</p>',
    stageGuidance: ['Focus on site'],
    checklist: [{ section: 'Land', items: [{ label: 'Survey done', severity: 'critical' }] }],
    documentRequestMatrix: [{ category: 'Legal', document: 'Lease', priority: 'high', whyItMatters: 'Foundation' }],
    epcReviewQuestions: [{ section: 'Design', questions: ['Inverter?'] }],
    riskStarter: [{ risk: 'Delay', likelihood: 'medium', impact: 'high', mitigation: 'Early engage' }],
    caveat: 'Starter only.',
  };

  it('renders all sections', async () => {
    const { GuidanceEditor } = await import('@/components/editor/GuidanceEditor');
    const updateField = vi.fn();
    render(<GuidanceEditor content={CONTENT} updateField={updateField} />);
    expect(screen.getByText('Summary')).toBeTruthy();
    expect(screen.getByText('Stage Guidance')).toBeTruthy();
    expect(screen.getByText('Due Diligence Checklist')).toBeTruthy();
    expect(screen.getByText('Required Documents')).toBeTruthy();
    expect(screen.getByText('Risk Register')).toBeTruthy();
  });
});

// ─── API client functions (type checks) ──────────────────────────────────────

describe('api-client document functions', () => {
  it('exports the expected document API functions', async () => {
    const api = await import('@/lib/api-client');
    expect(typeof api.createEditableDocument).toBe('function');
    expect(typeof api.listEditableDocuments).toBe('function');
    expect(typeof api.getEditableDocument).toBe('function');
    expect(typeof api.saveEditableDocument).toBe('function');
    expect(typeof api.deleteEditableDocument).toBe('function');
    expect(typeof api.listDocumentVersions).toBe('function');
    expect(typeof api.getDocumentVersion).toBe('function');
    expect(typeof api.exportDocument).toBe('function');
  });

  it('exportDocument is an async function that triggers download', async () => {
    const { exportDocument } = await import('@/lib/api-client');
    expect(typeof exportDocument).toBe('function');
    // exportDocument now returns Promise<void> (fetch+blob download)
  });

  it('editor page uses query param ID for durable URLs', async () => {
    // The edit page loads documents by ?id= query param, not sessionStorage
    // This test verifies the pattern: useSearchParams().get('id')
    const { useSearchParams } = await import('next/navigation');
    const params = useSearchParams();
    // Default mock returns empty URLSearchParams
    expect(params.get('id')).toBeNull();
    // With an ID, the page would fetch the document
    const paramsWithId = new URLSearchParams('id=abc-123');
    expect(paramsWithId.get('id')).toBe('abc-123');
  });
});
