import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useDesktop } from '../hooks/useDesktop.js'
import type { ProjectInfoDto, RecentProjectDto } from '../../shared/ipc.js'

interface ProjectState {
  projectRoot: string | null
  projectName: string
  projectInfo: ProjectInfoDto | null
  recentProjects: RecentProjectDto[]
  opening: boolean
  error: string | null
  /** Open a project by absolute path (recent list, drag & drop, deep link). */
  openProject: (root: string) => Promise<void>
  /** Show the native directory picker, then open the chosen project. */
  openProjectViaDialog: () => Promise<void>
  closeProject: () => Promise<void>
  /** Remove from Recents only. Project files are never deleted. */
  removeRecentProject: (root: string) => Promise<void>
  refreshRecent: () => Promise<void>
  refreshInfo: () => Promise<void>
}

const ProjectContext = createContext<ProjectState | null>(null)

const LAST_PROJECT_KEY = 'ur-desktop:lastProjectRoot'

export function ProjectProvider({ children }: { children: ReactNode }) {
  const desktop = useDesktop()
  const [projectRoot, setProjectRoot] = useState<string | null>(null)
  const [projectInfo, setProjectInfo] = useState<ProjectInfoDto | null>(null)
  const [recentProjects, setRecentProjects] = useState<RecentProjectDto[]>([])
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshRecent = useCallback(async () => {
    if (!desktop) return
    try {
      setRecentProjects(await desktop.listProjects())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop])

  const openProject = useCallback(
    async (root: string) => {
      if (!desktop) return
      setOpening(true)
      setError(null)
      try {
        const opened = await desktop.openProject(root)
        const info = await desktop.inspectProject(opened.root)
        setProjectRoot(opened.root)
        setProjectInfo(info)
        window.localStorage.setItem(LAST_PROJECT_KEY, opened.root)
        await refreshRecent()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        throw err
      } finally {
        setOpening(false)
      }
    },
    [desktop, refreshRecent],
  )

  const openProjectViaDialog = useCallback(async () => {
    if (!desktop) return
    const result = await desktop.openProjectDialog()
    if (result.canceled || !result.root) return
    await openProject(result.root)
  }, [desktop, openProject])

  const closeProject = useCallback(async () => {
    if (!desktop || !projectRoot) return
    await desktop.closeProject(projectRoot)
    setProjectRoot(null)
    setProjectInfo(null)
    window.localStorage.removeItem(LAST_PROJECT_KEY)
  }, [desktop, projectRoot])

  const removeRecentProject = useCallback(async (root: string) => {
    if (!desktop) return
    setError(null)
    try {
      if (projectRoot === root) {
        await desktop.closeProject(root)
        setProjectRoot(null)
        setProjectInfo(null)
        window.localStorage.removeItem(LAST_PROJECT_KEY)
      }
      await desktop.removeRecentProject(root)
      setRecentProjects(previous => previous.filter(project => project.root !== root))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }, [desktop, projectRoot])

  const refreshInfo = useCallback(async () => {
    if (!desktop || !projectRoot) return
    try {
      setProjectInfo(await desktop.inspectProject(projectRoot))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop, projectRoot])

  // Restore the last opened project on launch; a stale path fails visibly
  // in the error banner rather than blocking startup.
  useEffect(() => {
    void refreshRecent()
    const last = window.localStorage.getItem(LAST_PROJECT_KEY)
    if (last) {
      openProject(last).catch(() => {
        window.localStorage.removeItem(LAST_PROJECT_KEY)
      })
    }
    // Intentionally run once on mount.
  }, [desktop])

  const value: ProjectState = {
    projectRoot,
    projectName: projectInfo?.name ?? (projectRoot ? projectRoot.split('/').pop() ?? '' : ''),
    projectInfo,
    recentProjects,
    opening,
    error,
    openProject,
    openProjectViaDialog,
    closeProject,
    removeRecentProject,
    refreshRecent,
    refreshInfo,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectState {
  const ctx = useContext(ProjectContext)
  if (!ctx) {
    throw new Error('useProject must be used inside ProjectProvider')
  }
  return ctx
}
