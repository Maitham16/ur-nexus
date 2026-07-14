import { useCallback, useEffect, useState } from 'react'
import { useDesktop } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Card } from '../components/Card.js'
import { CheckpointsPanel } from '../components/CheckpointsPanel.js'
import type { RunSummaryDto, RunDetailDto, RunReportDto } from '../../shared/ipc.js'

function formatDate(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}

function statusBadge(status: string): string {
  switch (status) {
    case 'finished':
      return '✓'
    case 'failed':
      return '✗'
    case 'stopped':
      return '■'
    default:
      return '●'
  }
}

export function HistoryPage() {
  const desktop = useDesktop()
  const { projectRoot } = useProject()
  const [runs, setRuns] = useState<RunSummaryDto[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [detail, setDetail] = useState<RunDetailDto | null>(null)
  const [report, setReport] = useState<RunReportDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastExportPath, setLastExportPath] = useState<string | null>(null)

  const refreshRuns = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setError(null)
    try {
      const list = await desktop.listRuns({ projectRoot })
      setRuns(list)
    } catch (err) {
      setError(String(err))
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    refreshRuns()
  }, [refreshRuns])

  const selectRun = useCallback(async (runId: string) => {
    if (!desktop || !projectRoot) return
    setSelectedRunId(runId)
    setError(null)
    try {
      const [d, r] = await Promise.all([
        desktop.getRun({ runId }),
        desktop.getReport({ projectRoot, runId }),
      ])
      setDetail(d)
      setReport(r)
    } catch (err) {
      setError(String(err))
    }
  }, [desktop, projectRoot])

  const exportMarkdown = async (runId: string) => {
    if (!desktop || !projectRoot) return
    try {
      const result = await desktop.exportReportMarkdown({ projectRoot, runId, format: 'markdown' })
      setLastExportPath(result.path)
    } catch (err) {
      setError(String(err))
    }
  }

  const exportJson = async (runId: string) => {
    if (!desktop || !projectRoot) return
    try {
      const result = await desktop.exportReportJson({ projectRoot, runId, format: 'json' })
      setLastExportPath(result.path)
    } catch (err) {
      setError(String(err))
    }
  }

  const deleteRun = async (runId: string) => {
    if (!desktop) return
    if (!window.confirm('Delete this run and its transcript?')) return
    try {
      await desktop.deleteRun({ runId })
      setRuns(prev => prev.filter(r => r.runId !== runId))
      if (selectedRunId === runId) {
        setSelectedRunId(null)
        setDetail(null)
        setReport(null)
      }
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">History</h1>
      <p className="page-subtitle">Past runs, transcripts, and reports stored in macOS Application Support.</p>

      {error && <div className="card-body" style={{ color: '#fca5a5', marginBottom: 16 }}>{error}</div>}

      {lastExportPath && (
        <div className="notice-banner">
          <span>Report saved to {lastExportPath}</span>
          <div>
            <button
              className="link-button"
              onClick={() => desktop?.revealInFinder(lastExportPath)}
            >
              Reveal in Finder
            </button>
            <button className="link-button" onClick={() => setLastExportPath(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="composer-footer" style={{ marginBottom: 16 }}>
        <span className="project-value">{projectRoot ?? 'No project open'}</span>
        <button className="button button-secondary" onClick={refreshRuns} disabled={!projectRoot}>
          Refresh
        </button>
      </div>

      <CheckpointsPanel projectRoot={projectRoot} />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
        <Card title={`Runs (${runs.length})`}>
          <div className="list">
            {runs.length === 0 && (
              <div className="list-item">
                <span>No past runs</span>
              </div>
            )}
            {runs.map(run => (
              <button
                key={run.runId}
                className={`list-item ${selectedRunId === run.runId ? 'active' : ''}`}
                onClick={() => selectRun(run.runId)}
                style={{ textAlign: 'left', width: '100%' }}
              >
                <div className="message-meta">
                  {statusBadge(run.status)} {formatDate(run.startedAt)}
                </div>
                <div className="message-body" style={{ fontSize: 13, marginTop: 4 }}>
                  {run.title ?? 'Untitled run'}
                </div>
                <div className="message-meta" style={{ fontSize: 11, marginTop: 4 }}>
                  {run.providerId ?? '-'} / {run.modelId ?? '-'} · {run.changedFiles.length} changed
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedRunId && detail && report && (
            <>
              <Card title="Run details">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div><strong>ID:</strong> {detail.record.runId}</div>
                  <div><strong>Status:</strong> {detail.record.status}</div>
                  <div><strong>Started:</strong> {formatDate(detail.record.startedAt)}</div>
                  <div><strong>Finished:</strong> {formatDate(detail.record.finishedAt)}</div>
                  <div><strong>Provider/model/mode:</strong> {detail.record.providerId ?? '-'} / {detail.record.modelId ?? '-'} / {report.providerMode ?? '-'}</div>
                  {report.tokenUsage?.totalTokens !== undefined && (
                    <div><strong>Tokens:</strong> {report.tokenUsage.inputTokens ?? '-'} in / {report.tokenUsage.outputTokens ?? '-'} out / {report.tokenUsage.totalTokens} total</div>
                  )}
                  <div><strong>Changed files:</strong> {detail.record.changedFiles.length}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="button button-secondary" onClick={() => exportMarkdown(detail.record.runId)}>
                      Export Markdown
                    </button>
                    <button className="button button-secondary" onClick={() => exportJson(detail.record.runId)}>
                      Export JSON
                    </button>
                    <button className="button button-danger" onClick={() => deleteRun(detail.record.runId)}>
                      Delete
                    </button>
                  </div>
                </div>
              </Card>

              <Card title="Completed tasks">
                <div className="card-body">
                  {report.completedTasks.length === 0 && <em>None</em>}
                  {report.completedTasks.map((t, i) => (
                    <div key={i}>- {t.id}: {t.title}</div>
                  ))}
                </div>
              </Card>

              <Card title="Failed tasks">
                <div className="card-body">
                  {report.failedTasks.length === 0 && <em>None</em>}
                  {report.failedTasks.map((t, i) => (
                    <div key={i}>- {t.id}: {t.title}{t.error ? ` — ${t.error}` : ''}</div>
                  ))}
                </div>
              </Card>

              <Card title="Verified changes">
                <div className="card-body">
                  {report.verifiedChanges.length === 0 && <em>None</em>}
                  {report.verifiedChanges.map((c, i) => (
                    <div key={i}>- {c.file}: {c.description}</div>
                  ))}
                </div>
              </Card>

              <Card title="Unverified claims">
                <div className="card-body">
                  {report.unverifiedClaims.length === 0 && <em>None</em>}
                  {report.unverifiedClaims.map((c, i) => (
                    <div key={i}>- {c.claim}</div>
                  ))}
                </div>
              </Card>

              <Card title="Tests run">
                <div className="card-body">
                  {report.testsRun.length === 0 && <em>None</em>}
                  {report.testsRun.map((t, i) => (
                    <div key={i}>- {t.passed ? '✓' : '✗'} {t.command}</div>
                  ))}
                </div>
              </Card>

              <Card title="Failed checks">
                <div className="card-body">
                  {report.failedChecks.length === 0 && <em>None</em>}
                  {report.failedChecks.map((c, i) => (
                    <div key={i}>- {c.check}: {c.reason}</div>
                  ))}
                </div>
              </Card>

              <Card title="Remaining issues">
                <div className="card-body">
                  {report.remainingIssues.length === 0 && <em>None</em>}
                  {report.remainingIssues.map((issue, i) => (
                    <div key={i}>- ({issue.severity}) {issue.issue}</div>
                  ))}
                </div>
              </Card>

              <Card title={`Transcript (${detail.transcript.length} events)`}>
                <div className="chat-stream" style={{ maxHeight: 400, overflow: 'auto' }}>
                  {detail.transcript.map((event, idx) => (
                    <pre key={idx} className="code-block" style={{ fontSize: 11 }}>
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  ))}
                </div>
              </Card>
            </>
          )}

          {!selectedRunId && (
            <Card title="Select a run">
              <p className="card-body">Choose a run from the list to view its transcript and report.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
