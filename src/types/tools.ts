// Stub: not included in leaked source
export interface AgentToolProgress {}
export interface BashProgress {
  type?: 'bash_progress'
  output?: string
  fullOutput: string
  elapsedTimeSeconds: number
  totalLines: number
  totalBytes?: number
  taskId?: string
  timeoutMs?: number
}
export interface MCPProgress {}
export interface PowerShellProgress {}
export interface REPLToolProgress {}
export interface SdkWorkflowProgress {}
export interface ShellProgress {}
export interface SkillToolProgress {}
export interface TaskOutputProgress {}
export interface ToolProgressData {}
export interface WebSearchProgress {}
