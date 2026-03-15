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
      turnCount: 3,
    },
    progress: {
      planDone: 1,
      planOpen: 2,
      planBlocked: 1,
      planDeferred: 0,
      planTotal: 4,
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
      resolvedCount: 0,
      items: [
        { blocker: 'No policy data', blocks: 'Regulatory risk assessment', severity: 'significant', resolved: false },
        { blocker: 'Grid timeline uncertain', blocks: 'Revenue projection', severity: 'critical', resolved: false },
      ],
    },
    hasChanges: false,
    ...overrides,
  };
}

const RECENT_CONTEXTS: ContextSummary[] = [
  {
    id: 'ctx-1', label: 'Current context', workflowType: 'lender_tdd_planning',
    technology: 'solar_pv', jurisdiction: 'vietnam', stage: 'feasibility',
    turnCount: 3, planDone: 1, planTotal: 4, evidenceProvided: 1, evidenceTotal: 4,
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
    expect(screen.getByText('Turn 3')).toBeTruthy();
  });

  it('shows progress percentage', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('25%')).toBeTruthy(); // 1/4 = 25%
  });
});

// ─── Sections ────────────────────────────────────────────────────────────────

describe('ProjectWorkspace — sections', () => {
  it('shows all plan actions', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('Commission energy yield assessment')).toBeTruthy();
    expect(screen.getByText('Review permits')).toBeTruthy();
  });

  it('shows all evidence items', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('Energy yield report')).toBeTruthy();
    expect(screen.getByText('Environmental permits')).toBeTruthy();
    expect(screen.getByText('Grid connection study')).toBeTruthy();
    expect(screen.getByText('Insurance confirmation')).toBeTruthy();
  });

  it('shows gate details with blockers', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('Financial Close Readiness')).toBeTruthy();
    expect(screen.getByText('Missing permits')).toBeTruthy();
    expect(screen.getByText('No grid agreement')).toBeTruthy();
  });

  it('shows blocker details with severity', () => {
    render(<ProjectWorkspace panel={makePanel()} onClose={() => {}} />);
    expect(screen.getByText('No policy data')).toBeTruthy();
    expect(screen.getByText('Grid timeline uncertain')).toBeTruthy();
  });
});

// ─── Interactions ────────────────────────────────────────────────────────────

describe('ProjectWorkspace — interactions', () => {
  it('calls onMarkActionDone when checkbox clicked', () => {
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
    // All sections start expanded; clicking should collapse
    const planHeader = screen.getByText('Plan');
    fireEvent.click(planHeader);
    // After collapsing, the action text should not be visible
    expect(screen.queryByText('Commission energy yield assessment')).toBeNull();
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
