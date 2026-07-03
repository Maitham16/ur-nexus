import type { NexusTask, PromptPlan } from './types.js'

function pad(value: string, width: number): string {
  return value.padEnd(width, ' ')
}

export function progressSummary(tasks: NexusTask[]): string {
  const finished = tasks.filter(task => task.status === 'finished').length
  const running = tasks.filter(task => task.status === 'running').length
  const blocked = tasks.filter(task => task.status === 'blocked').length
  const failed = tasks.filter(task => task.status === 'failed').length
  return `Progress: ${finished}/${tasks.length} finished, ${running} running, ${blocked} blocked, ${failed} failed`
}

export function renderTaskBoard(planOrTasks: PromptPlan | NexusTask[]): string {
  const tasks = Array.isArray(planOrTasks) ? planOrTasks : planOrTasks.tasks
  const rows = tasks.map((task, index) => {
    const status = pad(task.status, 8)
    const agent = pad(String(task.assignedAgent), 8)
    return `${index + 1}. ${status} | ${agent} | ${task.title}`
  })

  return [
    '[UR-Nexus Task Board]',
    '',
    ...rows,
    '',
    progressSummary(tasks),
  ].join('\n')
}
