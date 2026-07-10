import type { ApprovalScope } from '../../shared/ipc.js'

export interface ApprovalCardProps {
  actionType?: string
  target?: string
  reason?: string
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
  toolName?: string
  input?: Record<string, unknown>
  responded?: boolean
  approved?: boolean
  scope?: ApprovalScope
  onApprove: (approved: boolean, scope?: ApprovalScope) => void
}

export function ApprovalCard({
  actionType,
  target,
  reason,
  riskLevel,
  toolName,
  input,
  responded,
  approved,
  scope,
  onApprove,
}: ApprovalCardProps) {
  const riskClass = `risk-${riskLevel ?? 'low'}`
  const title = actionType ? `Approval required — ${actionType}` : `Approval required — ${toolName ?? 'tool'}`

  return (
    <div className={`message approval ${riskClass}`}>
      <div className="message-meta">⏸ {title}</div>
      {target && target !== toolName && (
        <div className="approval-target">{target}</div>
      )}
      {reason && <div className="approval-reason">{reason}</div>}
      {riskLevel && (
        <div className={`approval-risk ${riskClass}`}>Risk: {riskLevel}</div>
      )}
      {input && Object.keys(input).length > 0 && (
        <pre className="code-block">{JSON.stringify(input, null, 2)}</pre>
      )}
      {responded ? (
        <div className={`approval-result ${approved ? 'approved' : 'denied'}`}>
          {approved ? `Approved (${scope ?? 'once'})` : 'Denied'}
        </div>
      ) : (
        <div className="approval-actions">
          <button className="button" onClick={() => onApprove(true, 'once')}>Allow once</button>
          &nbsp;
          <button className="button" onClick={() => onApprove(true, 'run')}>Allow for this run</button>
          &nbsp;
          <button className="button button-secondary" onClick={() => onApprove(false)}>Deny</button>
        </div>
      )}
    </div>
  )
}
