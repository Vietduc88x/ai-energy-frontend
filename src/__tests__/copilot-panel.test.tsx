import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { CopilotPanel } from '@/components/CopilotPanel';
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
      technologies: ['solar_pv'],
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
    allPlanItems: [
      { actionId: 'yield-assessment', action: 'Commission energy yield assessment', status: 'open', priority: 1, blocking: true, workstream: 'Technical', dependsOn: [], statusChangedAt: 1 },
      { actionId: 'review-permits', action: 'Review permits', status: 'open', priority: 1, blocking: true, workstream: 'Regulatory', dependsOn: [], statusChangedAt: 1 },
    ],
    recentChanges: [],
    ...overrides,
  };
}

// ─── Context identity ──────────────────────────────────────────────────────

describe('CopilotPanel — context identity', () => {
  it('renders the panel container', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByTestId('copilot-panel')).toBeTruthy();
  });

  it('shows the context label', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getAllByText(/Lender Tdd Planning/).length).toBeGreaterThan(0);
  });

  it('shows Continuing badge for reused context', () => {
    render(<CopilotPanel panel={makePanel({ context: { ...makePanel().context, contextAction: 'reused' } })} />);
    expect(screen.getByText('Continuing')).toBeTruthy();
  });

  it('shows New context badge for new context', () => {
    render(<CopilotPanel panel={makePanel({ context: { ...makePanel().context, contextAction: 'new' } })} />);
    expect(screen.getByText('New context')).toBeTruthy();
  });

  it('shows Selected badge for explicit context', () => {
    render(<CopilotPanel panel={makePanel({ context: { ...makePanel().context, contextAction: 'explicit' } })} />);
    expect(screen.getByText('Selected')).toBeTruthy();
  });

  it('shows turn count for multi-turn contexts', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('Turn 3')).toBeTruthy();
  });

  it('prefers structured technologies for visible title', () => {
    render(<CopilotPanel panel={makePanel({ context: { ...makePanel().context, technologies: ['solar_pv', 'bess'] } })} />);
    expect(screen.getAllByText(/Solar PV \+ BESS/).length).toBeGreaterThan(0);
  });
});

// ─── Progress ───────────────────────────────────────────────────────────────

describe('CopilotPanel — progress', () => {
  it('renders progress section', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByTestId('copilot-progress')).toBeTruthy();
  });

  it('shows done/total count', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('1/4 done')).toBeTruthy();
  });

  it('shows blocked count', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('(1 blocked)')).toBeTruthy();
  });

  it('shows next actions', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('Commission energy yield assessment')).toBeTruthy();
    expect(screen.getByText('Review permits')).toBeTruthy();
  });

  it('hides progress when no plan items', () => {
    const panel = makePanel({ progress: { ...makePanel().progress, planTotal: 0, planDone: 0, planOpen: 0, planBlocked: 0, planDeferred: 0, nextActions: [] } });
    render(<CopilotPanel panel={panel} />);
    expect(screen.queryByTestId('copilot-progress')).toBeNull();
  });
});

// ─── Evidence ───────────────────────────────────────────────────────────────

describe('CopilotPanel — evidence', () => {
  it('renders evidence section', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByTestId('copilot-evidence')).toBeTruthy();
  });

  it('shows provided/total count', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('1/4 provided')).toBeTruthy();
  });

  it('shows missing count', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('2 missing')).toBeTruthy();
  });

  it('shows gate-blocking missing items', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('- Environmental permits')).toBeTruthy();
    expect(screen.getByText('- Grid connection study')).toBeTruthy();
  });

  it('hides evidence section when total is 0', () => {
    const panel = makePanel({ evidence: { ...makePanel().evidence, total: 0, provided: 0, missing: 0, partial: 0, outdated: 0, gateBlockingMissing: [], items: [] } });
    render(<CopilotPanel panel={panel} />);
    expect(screen.queryByTestId('copilot-evidence')).toBeNull();
  });
});

describe('CopilotPanel — compact mode', () => {
  it('shows critical-now summary and hides detailed evidence when compact', () => {
    render(<CopilotPanel panel={makePanel()} compact />);
    expect(screen.getByTestId('copilot-critical-now')).toBeTruthy();
    expect(screen.queryByTestId('copilot-evidence')).toBeNull();
  });
});

// ─── Gates ──────────────────────────────────────────────────────────────────

describe('CopilotPanel — gates', () => {
  it('does not render a separate gates section in the slimmed panel', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.queryByTestId('copilot-gates')).toBeNull();
  });

  it('keeps gate-blocking messaging in the evidence callout instead', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('Gate-blocking (missing)')).toBeTruthy();
  });

  it('hides gates section when all unknown', () => {
    const panel = makePanel({ gates: [{ gate: 'Test', status: 'unknown', blockerCount: 0, blockers: [] }] });
    render(<CopilotPanel panel={panel} />);
    expect(screen.queryByTestId('copilot-gates')).toBeNull();
  });
});

// ─── Blockers ───────────────────────────────────────────────────────────────

describe('CopilotPanel — blockers', () => {
  it('renders active blockers', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByTestId('copilot-blockers')).toBeTruthy();
    expect(screen.getByText('No policy data')).toBeTruthy();
    expect(screen.getByText('Grid timeline uncertain')).toBeTruthy();
  });

  it('hides blockers section when none active', () => {
    const panel = makePanel({ blockers: { activeCount: 0, resolvedCount: 0, items: [] } });
    render(<CopilotPanel panel={panel} />);
    expect(screen.queryByTestId('copilot-blockers')).toBeNull();
  });
});

// ─── Change indicator ───────────────────────────────────────────────────────

describe('CopilotPanel — changes', () => {
  it('shows change indicator when hasChanges is true', () => {
    render(<CopilotPanel panel={makePanel({ hasChanges: true })} />);
    expect(screen.getByText('State updated this turn')).toBeTruthy();
  });

  it('hides change indicator when hasChanges is false', () => {
    render(<CopilotPanel panel={makePanel({ hasChanges: false })} />);
    expect(screen.queryByText('State updated this turn')).toBeNull();
  });
});

// ─── Empty state ────────────────────────────────────────────────────────────

describe('CopilotPanel — empty state', () => {
  it('shows placeholder when no data sections present', () => {
    const panel = makePanel({
      progress: { planDone: 0, planOpen: 0, planBlocked: 0, planDeferred: 0, planTotal: 0, nextActions: [] },
      evidence: { provided: 0, missing: 0, partial: 0, outdated: 0, total: 0, gateBlockingMissing: [], items: [] },
      gates: [],
      blockers: { activeCount: 0, resolvedCount: 0, items: [] },
    });
    render(<CopilotPanel panel={panel} />);
    expect(screen.getByText(/Context created/)).toBeTruthy();
  });
});

// ─── Context switching ──────────────────────────────────────────────────────

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

describe('CopilotPanel — context switching', () => {
  it('shows context menu button when recent contexts available', () => {
    render(<CopilotPanel panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={() => {}} />);
    expect(screen.getByTestId('context-menu-btn')).toBeTruthy();
  });

  it('hides context menu button when no other contexts', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.queryByTestId('context-menu-btn')).toBeNull();
  });

  it('opens context menu on click', () => {
    render(<CopilotPanel panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={() => {}} />);
    fireEvent.click(screen.getByTestId('context-menu-btn'));
    expect(screen.getByTestId('context-menu')).toBeTruthy();
    expect(screen.getByText('Wind farm DD')).toBeTruthy();
  });

  it('calls onSwitchContext when a context is selected', () => {
    const onSwitch = vi.fn();
    render(<CopilotPanel panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={onSwitch} />);
    fireEvent.click(screen.getByTestId('context-menu-btn'));
    fireEvent.click(screen.getByText('Wind farm DD'));
    expect(onSwitch).toHaveBeenCalledWith('ctx-2');
  });

  it('shows new context button when onNewContext provided', () => {
    const onNew = vi.fn();
    render(<CopilotPanel panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={() => {}} onNewContext={onNew} />);
    fireEvent.click(screen.getByTestId('context-menu-btn'));
    expect(screen.getByTestId('new-context-btn')).toBeTruthy();
  });

  it('calls onNewContext when new context button clicked', () => {
    const onNew = vi.fn();
    render(<CopilotPanel panel={makePanel()} recentContexts={RECENT_CONTEXTS} onSwitchContext={() => {}} onNewContext={onNew} />);
    fireEvent.click(screen.getByTestId('context-menu-btn'));
    fireEvent.click(screen.getByTestId('new-context-btn'));
    expect(onNew).toHaveBeenCalledOnce();
  });
});

// ─── Evidence interaction ───────────────────────────────────────────────────

describe('CopilotPanel — evidence interaction', () => {
  it('shows evidence toggle button', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByTestId('evidence-toggle')).toBeTruthy();
  });

  it('toggles the evidence summary view on click', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.getByText('2 missing')).toBeTruthy();
    fireEvent.click(screen.getByTestId('evidence-toggle'));
    expect(screen.queryByText('2 missing')).toBeNull();
  });
});

// ─── Mark action done ───────────────────────────────────────────────────────

describe('CopilotPanel — mark action done', () => {
  it('shows mark-done buttons when onMarkActionDone provided', () => {
    render(<CopilotPanel panel={makePanel()} onMarkActionDone={() => {}} />);
    const buttons = screen.getAllByTestId('mark-done-btn');
    expect(buttons.length).toBe(2);
  });

  it('hides mark-done buttons when onMarkActionDone not provided', () => {
    render(<CopilotPanel panel={makePanel()} />);
    expect(screen.queryAllByTestId('mark-done-btn').length).toBe(0);
  });

  it('calls onMarkActionDone with action text', () => {
    const onDone = vi.fn();
    render(<CopilotPanel panel={makePanel()} onMarkActionDone={onDone} />);
    const buttons = screen.getAllByTestId('mark-done-btn');
    fireEvent.click(buttons[0]);
    expect(onDone).toHaveBeenCalledWith('yield-assessment');
  });
});
