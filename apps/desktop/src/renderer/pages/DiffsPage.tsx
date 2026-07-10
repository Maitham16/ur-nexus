import { Card } from '../components/Card.js'

export function DiffsPage() {
  return (
    <div className="page">
      <h1 className="page-title">Diffs</h1>
      <p className="page-subtitle">Review and approve proposed changes.</p>

      <div className="list">
        <div className="list-item">
          <span>No pending diffs</span>
          <span className="badge">0 files</span>
        </div>
      </div>

      <Card title="Diff review">
        <p className="card-body">Proposed file edits will appear here for approval before they are applied.</p>
      </Card>
    </div>
  )
}
