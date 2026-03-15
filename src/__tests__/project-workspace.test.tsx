import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ProjectWorkspace } from '@/components/ProjectWorkspace';
import type { CopilotPanel as CopilotPanelData, ContextSummary } from '@/lib/api-client';

afterEach(() => cleanup());

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePanel(overrides?: Partial<CopilotPanelData>): CopilotPanelData {
  return {
    visible: true,
    context: {
      projectContextId: 'ctx-1',
      label: 'Lender TDD Planning — solar pv — vietnam — feasibility',
      workflowType: 'lender_tdd_planning',
      technology: 'solar_pv',
      jurisdiction: 'vietnam',
      stage: 'feasibility',
      contextAction: 'reused',
      confidence: 0.85,
      turnCount: 5,
    },
    progress: {
      planDone: 2,
      planOpen: 2,
      planBlocked: 1,
      planDeferred: 1,
      planTotal: 6,
      nextActions: [
        { actionId: 'yield-assessment', action: 'Commission energy yield assessment', priority: 1, blocking: true },
        { actionId: 'review-permits', action: 'Review permits', priority: 1, blocking: true },
      ],
    },
    evidence: {
      provided: 1,
      missing: 2,
      partial: 1,
      outdated: 0,
      total: 4,
      gateBlockingMissing: [
        { item: 'Environmental permits', status: 'missing', gateBlocking: true },
        { item: 'Grid connection study', status: 'missing', gateBlocking: true },
      ],
      items: [
        { item: 'Energy yield report', status: 'provided', gateBlocking: true },
        { item: 'Environmental permits', status: 'missing', gateBlocking: true },
        { item: 'Grid connection study', status: 'missing', gateBlocking: true },
        { item: 'Insurance confirmation', status: 'partial', gateBlocking: false },
      ],
    },
    gates: [
      { gate: 'Financial Close Readiness', status: 'partially_met', blockerCount: 2, blockers: ['Missing permits', 'No grid agreement'] },
      { gate: 'Technical Approval', status: 'unknown', blockerCount: 0, blockers: [] },
    ],
    blockers: {
      activeCount: 2,
      resolvedCount: 1,
      items: [
        { blocker: 'No policy data', blocks: 'Regulatory risk assessment', severity: 'significant', resolved: false },
        { blocker: 'Grid timeline uncertain', blocks: 'Revenue projection', severity: 'critical', resolved: false },
        { blocker: 'Missing solar resource data', blocks: 'Yield estimate', severity: 'significant', resolved: true },
      ],
    },
    hasChanges: false,
    allPlanItems: [
      { actionId: 'yield-assessment', action: 'Commission energy yield assessment', status: 'open', priority: 1, blocking: true, workstream: 'Technical', dependsOn: [], statusChangedAt: 1 },
      { actionId: 'review-permits', action: 'Review permits', status: 'open', priority: 1, blocking: true, workstream: 'Regulatory', dependsOn: [], statusChangedAt: 1 },
      { actionId: 'grid-study', action: 'Grid connection study', status: 'blocked', priority: 2, blocking: true, workstream: 'Technical', dependsOn: ['yield-assessment'], statusChangedAt: 4 },
      { actionId: 'financial-model', action: 'Prepare financial model', status: 'done', priority: 2, blocking: false, workstream: 'Financial', dependsOn: [], statusChangedAt: 3 },
      { actionId: 'insurance-review', action: 'Insurance adequacy review', status: 'done', priority: 3, blocking: false, workstream: 'Legal', dependsOn: [], statusChangedAt: 4 },
      { actionId: 'community-consult', action: 'Community consultation', status: 'deferred', priority: 4, blocking: false, workstream: 'Social', dependsOn: [], statusChangedAt: 2 },
    ],
    recentChanges: [
      { type: 'plan', description: 'Grid connection study', detail: '→ blocked', turn: 5 },
      { type: 'evidence', description: 'Energy yield report', detail: '→ provided', turn: 5 },
      { type: 'plan', description: 'Insurance adequacy review', detail: '→ done', turn: 4 },
      { type: 'blocker', description: 'Missing solar resource data', detail: '→ resolved', turn: 4 },
    ],
    ...overrides,
  };
}

const RECENT_CONTEXTS: ContextSummary[] = [
  {
    id: 'ctx-1', label: 'Current context', workflowType: 'lender_tdd_planning',
    technology: 'solar_pv', jurisdiction: 'vietnam', stage: 'feasibility',
    turnCount: 5, planDone: 2, planTotal: 6, evidenceProvided: 1, evidenceTotal: 4,
    activeBlockers: 2, updatedAt: '2026-03-15T00:00:00Z', createdAt: '2026-03-14T00:00:00Z',
  },
  {
    id: 'ctx-2', label: 'Wind farm DD', workflowType: 'acquisition_dd',
    technology: 'onshore_wind', jurisdiction: 'australia', stage: 'construction',
    turnCount: 5, planDone: 3, planTotal: 6, evidenceProvided: 4, evidenceTotal: 5,
    activeBlockers: 0, updatedAt: '2026-03-14T00:00:00Z', createdAt: '2026-03-13T00:00:00Z',
  },
];

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('ProjectWorkspace — rendering', () => {
  it('renders the workspace container', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByTestId('project-workspace')).toBeTruthy();
  });

  it('shows context label', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText(/Lender TDD Planning/)).toBeTruthy();
  });

  it('shows workflow metadata', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('lender tdd planning')).toBeTruthy();
    expect(screen.getByText('vietnam')).toBeTruthy();
  });

  it('shows turn count', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('Turn 5')).toBeTruthy();
  });

  it('shows progress percentage', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('33%')).toBeTruthy(); // 2/6 = 33%
  });

  it('shows resolved blocker count', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('1 blocker resolved')).toBeTruthy();
  });
});

// ─── Full plan view ─────────────────────────────────────────────────────────

describe('ProjectWorkspace — full plan view', () => {
  it('renders all plan items (not just top 3)', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const items = screen.getAllByTestId('plan-item');
    expect(items.length).toBe(6);
  });

  it('shows plan filter tabs', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByTestId('plan-filters')).toBeTruthy();
    expect(screen.getByTestId('plan-filter-all')).toBeTruthy();
    expect(screen.getByTestId('plan-filter-open')).toBeTruthy();
    expect(screen.getByTestId('plan-filter-done')).toBeTruthy();
  });

  it('filters plan by status', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    // Click "Done" filter
    fireEvent.click(screen.getByTestId('plan-filter-done'));
    const items = screen.getAllByTestId('plan-item');
    expect(items.length).toBe(2); // financial-model + insurance-review
  });

  it('shows done items with strikethrough', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('Prepare financial model')).toBeTruthy();
    // Financial model is done — should have line-through
    const doneText = screen.getByText('Prepare financial model');
    expect(doneText.className).toContain('line-through');
  });

  it('shows blocked items', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const planList = screen.getByTestId('full-plan-list');
    expect(planList.textContent).toContain('Grid connection study');
  });

  it('shows deferred items', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('Community consultation')).toBeTruthy();
  });

  it('shows dependency count', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    // grid-study depends on yield-assessment
    expect(screen.getByText('← 1 dep')).toBeTruthy();
  });

  it('shows workstream labels', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const planList = screen.getByTestId('full-plan-list');
    expect(planList.textContent).toContain('Technical');
    expect(planList.textContent).toContain('Financial');
  });

  it('shows CRITICAL flag on blocking items', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const criticals = screen.getAllByText('CRITICAL');
    expect(criticals.length).toBeGreaterThanOrEqual(2);
  });

  it('shows empty state when filter has no items', () => {
    const panel = makePanel({
      allPlanItems: [
        { actionId: 'a1', action: 'Test action', status: 'open', priority: 1, blocking: false, workstream: 'Test', dependsOn: [], statusChangedAt: 1 },
      ],
      progress: { ...makePanel().progress, planDeferred: 0 },
    });
    render(<ProjectWorkspace panel={panel} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('plan-filter-done'));
    expect(screen.getByText('No done items')).toBeTruthy();
  });
});

// ─── Recent changes ─────────────────────────────────────────────────────────

describe('ProjectWorkspace — recent changes', () => {
  it('renders recent changes section', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByTestId('recent-changes')).toBeTruthy();
  });

  it('shows correct number of change items', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const items = screen.getAllByTestId('change-item');
    expect(items.length).toBe(4);
  });

  it('shows change descriptions', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const changesSection = screen.getByTestId('recent-changes');
    expect(changesSection.textContent).toContain('Grid connection study');
    expect(changesSection.textContent).toContain('Energy yield report');
  });

  it('shows change details with status transitions', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('→ blocked')).toBeTruthy();
    expect(screen.getByText('→ provided')).toBeTruthy();
    expect(screen.getByText('→ resolved')).toBeTruthy();
  });

  it('shows turn numbers', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    const turn5 = screen.getAllByText('turn 5');
    expect(turn5.length).toBeGreaterThanOrEqual(1);
  });

  it('hides recent changes when empty', () => {
    render(<ProjectWorkspace panel={makePanel({ recentChanges: [] })} onClose={() => {}} />);
    expect(screen.queryByTestId('recent-changes')).toBeNull();
  });
});

// ─── Interactions ────────────────────────────────────────────────────────────

describe('ProjectWorkspace — interactions', () => {
  it('calls onMarkActionDone for open items', () => {
    const onDone = vi.fn();
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} onMarkActionDone={onDone} />);
    const buttons = screen.getAllByTestId('ws-mark-done-btn');
    fireEvent.click(buttons[0]);
    expect(onDone).toHaveBeenCalledWith('yield-assessment');
  });

  it('calls onUpdateEvidence when evidence dot clicked', () => {
    const onUpdate = vi.fn();
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} onUpdateEvidence={onUpdate} />);
    const buttons = screen.getAllByTestId('ws-evidence-btn');
    fireEvent.click(buttons[1]); // Environmental permits: missing → partial
    expect(onUpdate).toHaveBeenCalledWith('Environmental permits', 'partial');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ProjectWorkspace panel={makePanel()} onClose={onClose} />);
    fireEvent.click(screen.getByTitle('Close workspace'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('toggles section accordion', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    // Plan section starts expanded; clicking should collapse
    const planHeader = screen.getByText('Plan');
    fireEvent.click(planHeader);
    // After collapsing, the full plan list should not be visible
    expect(screen.queryByTestId('full-plan-list')).toBeNull();
  });

  it('does not show mark-done buttons for done/blocked items', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} onMarkActionDone={() => {}} />);
    // Click "Done" filter to see only done items
    fireEvent.click(screen.getByTestId('plan-filter-done'));
    // Done items should have checkmark, not mark-done button
    expect(screen.queryAllByTestId('ws-mark-done-btn').length).toBe(0);
  });
});

// ─── Context switching ──────────────────────────────────────────────────────

describe('ProjectWorkspace — context switching', () => {
  it('shows other contexts', () => {
    render(<ProjectWorkspace panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={() => {}} onClose={() => {}} />);
    expect(screen.getByText('Wind farm DD')).toBeTruthy();
  });

  it('calls onSwitchContext when context clicked', () => {
    const onSwitch = vi.fn();
    render(<ProjectWorkspace panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={onSwitch} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Wind farm DD'));
    expect(onSwitch).toHaveBeenCalledWith('ctx-2');
  });

  it('shows new project button', () => {
    const onNew = vi.fn();
    render(<ProjectWorkspace panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={() => {}} onNewContext={onNew} onClose={() => {}} />);
    fireEvent.click(screen.getByText('+ New project'));
    expect(onNew).toHaveBeenCalledOnce();
  });
});

// ─── Backward compatibility ─────────────────────────────────────────────────

describe('ProjectWorkspace — backward compatibility', () => {
  it('works when allPlanItems is undefined (v1.1 backend)', () => {
    const panel = makePanel();
    // Simulate older backend response without allPlanItems
    const oldPanel = { ...panel, allPlanItems: undefined as any, recentChanges: undefined as any };
    render(<ProjectWorkspace panel={oldPanel} onClose={() => {}} />);
    expect(screen.getByTestId('project-workspace')).toBeTruthy();
    // Should not crash, just show empty plan
    expect(screen.queryByTestId('full-plan-list')).toBeNull();
  });

  it('works when recentChanges is undefined', () => {
    const panel = makePanel({ recentChanges: undefined as any });
    render(<ProjectWorkspace panel={panel} onClose={() => {}} />);
    expect(screen.queryByTestId('recent-changes')).toBeNull();
  });
});
