import {
  exports_external,
  getTeamName,
  getTeammateContext,
  init_array,
  init_lazySchema,
  init_lockfile,
  init_teammate,
  init_teammateContext,
  init_v4,
  lazySchema,
  lock
} from "./index-3stg8t86.js";
import {
  init_log,
  logError
} from "./index-2g4gegqj.js";
import {
  errorMessage,
  getErrnoCode,
  getURConfigHomeDir,
  init_debug,
  init_envUtils,
  init_errors,
  init_slowOperations,
  isEnvTruthy,
  jsonParse,
  jsonStringify,
  logForDebugging
} from "./index-bdb5pzbm.js";
import {
  createSignal,
  getIsNonInteractiveSession,
  getSessionId,
  init_signal,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/tasks.ts
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
function setLeaderTeamName(teamName) {
  if (leaderTeamName === teamName)
    return;
  leaderTeamName = teamName;
  notifyTasksUpdated();
}
function clearLeaderTeamName() {
  if (leaderTeamName === undefined)
    return;
  leaderTeamName = undefined;
  notifyTasksUpdated();
}
function notifyTasksUpdated() {
  try {
    tasksUpdated.emit();
  } catch {}
}
function getHighWaterMarkPath(taskListId) {
  return join(getTasksDir(taskListId), HIGH_WATER_MARK_FILE);
}
async function readHighWaterMark(taskListId) {
  const path = getHighWaterMarkPath(taskListId);
  try {
    const content = (await readFile(path, "utf-8")).trim();
    const value = parseInt(content, 10);
    return isNaN(value) ? 0 : value;
  } catch {
    return 0;
  }
}
async function writeHighWaterMark(taskListId, value) {
  const path = getHighWaterMarkPath(taskListId);
  await writeFile(path, String(value));
}
function isTodoV2Enabled() {
  if (isEnvTruthy(process.env.UR_CODE_ENABLE_TASKS)) {
    return true;
  }
  return !getIsNonInteractiveSession();
}
async function resetTaskList(taskListId) {
  const dir = getTasksDir(taskListId);
  const lockPath = await ensureTaskListLockFile(taskListId);
  let release;
  try {
    release = await lock(lockPath, LOCK_OPTIONS);
    const currentHighest = await findHighestTaskIdFromFiles(taskListId);
    if (currentHighest > 0) {
      const existingMark = await readHighWaterMark(taskListId);
      if (currentHighest > existingMark) {
        await writeHighWaterMark(taskListId, currentHighest);
      }
    }
    let files;
    try {
      files = await readdir(dir);
    } catch {
      files = [];
    }
    for (const file of files) {
      if (file.endsWith(".json") && !file.startsWith(".")) {
        const filePath = join(dir, file);
        try {
          await unlink(filePath);
        } catch {}
      }
    }
    notifyTasksUpdated();
  } finally {
    if (release) {
      await release();
    }
  }
}
function getTaskListId() {
  if (process.env.UR_CODE_TASK_LIST_ID) {
    return process.env.UR_CODE_TASK_LIST_ID;
  }
  const teammateCtx = getTeammateContext();
  if (teammateCtx) {
    return teammateCtx.teamName;
  }
  return getTeamName() || leaderTeamName || getSessionId();
}
function sanitizePathComponent(input) {
  return input.replace(/[^a-zA-Z0-9_-]/g, "-");
}
function getTasksDir(taskListId) {
  return join(getURConfigHomeDir(), "tasks", sanitizePathComponent(taskListId));
}
function getTaskPath(taskListId, taskId) {
  return join(getTasksDir(taskListId), `${sanitizePathComponent(taskId)}.json`);
}
async function ensureTasksDir(taskListId) {
  const dir = getTasksDir(taskListId);
  try {
    await mkdir(dir, { recursive: true });
  } catch {}
}
async function findHighestTaskIdFromFiles(taskListId) {
  const dir = getTasksDir(taskListId);
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return 0;
  }
  let highest = 0;
  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }
    const taskId = parseInt(file.replace(".json", ""), 10);
    if (!isNaN(taskId) && taskId > highest) {
      highest = taskId;
    }
  }
  return highest;
}
async function findHighestTaskId(taskListId) {
  const [fromFiles, fromMark] = await Promise.all([
    findHighestTaskIdFromFiles(taskListId),
    readHighWaterMark(taskListId)
  ]);
  return Math.max(fromFiles, fromMark);
}
async function createTask(taskListId, taskData) {
  const lockPath = await ensureTaskListLockFile(taskListId);
  let release;
  try {
    release = await lock(lockPath, LOCK_OPTIONS);
    const highestId = await findHighestTaskId(taskListId);
    const id = String(highestId + 1);
    const task = { id, ...taskData };
    const path = getTaskPath(taskListId, id);
    await writeFile(path, jsonStringify(task, null, 2));
    notifyTasksUpdated();
    return id;
  } finally {
    if (release) {
      await release();
    }
  }
}
async function getTask(taskListId, taskId) {
  const path = getTaskPath(taskListId, taskId);
  try {
    const content = await readFile(path, "utf-8");
    const data = jsonParse(content);
    if (process.env.USER_TYPE === "ant") {
      if (data.status === "open")
        data.status = "pending";
      else if (data.status === "resolved")
        data.status = "completed";
      else if (data.status && ["planning", "implementing", "reviewing", "verifying"].includes(data.status)) {
        data.status = "in_progress";
      }
    }
    const parsed = TaskSchema().safeParse(data);
    if (!parsed.success) {
      logForDebugging(`[Tasks] Task ${taskId} failed schema validation: ${parsed.error.message}`);
      return null;
    }
    return parsed.data;
  } catch (e) {
    const code = getErrnoCode(e);
    if (code === "ENOENT") {
      return null;
    }
    logForDebugging(`[Tasks] Failed to read task ${taskId}: ${errorMessage(e)}`);
    logError(e);
    return null;
  }
}
async function updateTaskUnsafe(taskListId, taskId, updates) {
  const existing = await getTask(taskListId, taskId);
  if (!existing) {
    return null;
  }
  const updated = { ...existing, ...updates, id: taskId };
  const path = getTaskPath(taskListId, taskId);
  await writeFile(path, jsonStringify(updated, null, 2));
  notifyTasksUpdated();
  return updated;
}
async function updateTask(taskListId, taskId, updates) {
  const path = getTaskPath(taskListId, taskId);
  const taskBeforeLock = await getTask(taskListId, taskId);
  if (!taskBeforeLock) {
    return null;
  }
  let release;
  try {
    release = await lock(path, LOCK_OPTIONS);
    return await updateTaskUnsafe(taskListId, taskId, updates);
  } finally {
    await release?.();
  }
}
async function deleteTask(taskListId, taskId) {
  const path = getTaskPath(taskListId, taskId);
  try {
    const numericId = parseInt(taskId, 10);
    if (!isNaN(numericId)) {
      const currentMark = await readHighWaterMark(taskListId);
      if (numericId > currentMark) {
        await writeHighWaterMark(taskListId, numericId);
      }
    }
    try {
      await unlink(path);
    } catch (e) {
      const code = getErrnoCode(e);
      if (code === "ENOENT") {
        return false;
      }
      throw e;
    }
    const allTasks = await listTasks(taskListId);
    for (const task of allTasks) {
      const newBlocks = task.blocks.filter((id) => id !== taskId);
      const newBlockedBy = task.blockedBy.filter((id) => id !== taskId);
      if (newBlocks.length !== task.blocks.length || newBlockedBy.length !== task.blockedBy.length) {
        await updateTask(taskListId, task.id, {
          blocks: newBlocks,
          blockedBy: newBlockedBy
        });
      }
    }
    notifyTasksUpdated();
    return true;
  } catch {
    return false;
  }
}
async function listTasks(taskListId) {
  const dir = getTasksDir(taskListId);
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const taskIds = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  const results = await Promise.all(taskIds.map((id) => getTask(taskListId, id)));
  return results.filter((t) => t !== null);
}
async function blockTask(taskListId, fromTaskId, toTaskId) {
  const [fromTask, toTask] = await Promise.all([
    getTask(taskListId, fromTaskId),
    getTask(taskListId, toTaskId)
  ]);
  if (!fromTask || !toTask) {
    return false;
  }
  if (!fromTask.blocks.includes(toTaskId)) {
    await updateTask(taskListId, fromTaskId, {
      blocks: [...fromTask.blocks, toTaskId]
    });
  }
  if (!toTask.blockedBy.includes(fromTaskId)) {
    await updateTask(taskListId, toTaskId, {
      blockedBy: [...toTask.blockedBy, fromTaskId]
    });
  }
  return true;
}
function getTaskListLockPath(taskListId) {
  return join(getTasksDir(taskListId), ".lock");
}
async function ensureTaskListLockFile(taskListId) {
  await ensureTasksDir(taskListId);
  const lockPath = getTaskListLockPath(taskListId);
  try {
    await writeFile(lockPath, "", { flag: "wx" });
  } catch {}
  return lockPath;
}
async function claimTask(taskListId, taskId, claimantAgentId, options = {}) {
  const taskPath = getTaskPath(taskListId, taskId);
  const taskBeforeLock = await getTask(taskListId, taskId);
  if (!taskBeforeLock) {
    return { success: false, reason: "task_not_found" };
  }
  if (options.checkAgentBusy) {
    return claimTaskWithBusyCheck(taskListId, taskId, claimantAgentId);
  }
  let release;
  try {
    release = await lock(taskPath, LOCK_OPTIONS);
    const task = await getTask(taskListId, taskId);
    if (!task) {
      return { success: false, reason: "task_not_found" };
    }
    if (task.owner && task.owner !== claimantAgentId) {
      return { success: false, reason: "already_claimed", task };
    }
    if (task.status === "completed") {
      return { success: false, reason: "already_resolved", task };
    }
    const allTasks = await listTasks(taskListId);
    const unresolvedTaskIds = new Set(allTasks.filter((t) => t.status !== "completed").map((t) => t.id));
    const blockedByTasks = task.blockedBy.filter((id) => unresolvedTaskIds.has(id));
    if (blockedByTasks.length > 0) {
      return { success: false, reason: "blocked", task, blockedByTasks };
    }
    const updated = await updateTaskUnsafe(taskListId, taskId, {
      owner: claimantAgentId
    });
    return { success: true, task: updated };
  } catch (error) {
    logForDebugging(`[Tasks] Failed to claim task ${taskId}: ${errorMessage(error)}`);
    logError(error);
    return { success: false, reason: "task_not_found" };
  } finally {
    if (release) {
      await release();
    }
  }
}
async function claimTaskWithBusyCheck(taskListId, taskId, claimantAgentId) {
  const lockPath = await ensureTaskListLockFile(taskListId);
  let release;
  try {
    release = await lock(lockPath, LOCK_OPTIONS);
    const allTasks = await listTasks(taskListId);
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, reason: "task_not_found" };
    }
    if (task.owner && task.owner !== claimantAgentId) {
      return { success: false, reason: "already_claimed", task };
    }
    if (task.status === "completed") {
      return { success: false, reason: "already_resolved", task };
    }
    const unresolvedTaskIds = new Set(allTasks.filter((t) => t.status !== "completed").map((t) => t.id));
    const blockedByTasks = task.blockedBy.filter((id) => unresolvedTaskIds.has(id));
    if (blockedByTasks.length > 0) {
      return { success: false, reason: "blocked", task, blockedByTasks };
    }
    const agentOpenTasks = allTasks.filter((t) => t.status !== "completed" && t.owner === claimantAgentId && t.id !== taskId);
    if (agentOpenTasks.length > 0) {
      return {
        success: false,
        reason: "agent_busy",
        task,
        busyWithTasks: agentOpenTasks.map((t) => t.id)
      };
    }
    const updated = await updateTask(taskListId, taskId, {
      owner: claimantAgentId
    });
    return { success: true, task: updated };
  } catch (error) {
    logForDebugging(`[Tasks] Failed to claim task ${taskId} with busy check: ${errorMessage(error)}`);
    logError(error);
    return { success: false, reason: "task_not_found" };
  } finally {
    if (release) {
      await release();
    }
  }
}
async function unassignTeammateTasks(teamName, teammateId, teammateName, reason) {
  const tasks = await listTasks(teamName);
  const unresolvedAssignedTasks = tasks.filter((t) => t.status !== "completed" && (t.owner === teammateId || t.owner === teammateName));
  for (const task of unresolvedAssignedTasks) {
    await updateTask(teamName, task.id, { owner: undefined, status: "pending" });
  }
  if (unresolvedAssignedTasks.length > 0) {
    logForDebugging(`[Tasks] Unassigned ${unresolvedAssignedTasks.length} task(s) from ${teammateName}`);
  }
  const actionVerb = reason === "terminated" ? "was terminated" : "has shut down";
  let notificationMessage = `${teammateName} ${actionVerb}.`;
  if (unresolvedAssignedTasks.length > 0) {
    const taskList = unresolvedAssignedTasks.map((t) => `#${t.id} "${t.subject}"`).join(", ");
    notificationMessage += ` ${unresolvedAssignedTasks.length} task(s) were unassigned: ${taskList}. Use TaskList to check availability and TaskUpdate with owner to reassign them to idle teammates.`;
  }
  return {
    unassignedTasks: unresolvedAssignedTasks.map((t) => ({
      id: t.id,
      subject: t.subject
    })),
    notificationMessage
  };
}
var tasksUpdated, leaderTeamName, onTasksUpdated, TaskStatusSchema, TaskSchema, HIGH_WATER_MARK_FILE = ".highwatermark", LOCK_OPTIONS;
var init_tasks = __esm(() => {
  init_v4();
  init_state();
  init_array();
  init_debug();
  init_envUtils();
  init_errors();
  init_lazySchema();
  init_lockfile();
  init_log();
  init_signal();
  init_slowOperations();
  init_teammate();
  init_teammateContext();
  tasksUpdated = createSignal();
  onTasksUpdated = tasksUpdated.subscribe;
  TaskStatusSchema = lazySchema(() => exports_external.enum(["pending", "in_progress", "completed", "failed", "skipped"]));
  TaskSchema = lazySchema(() => exports_external.object({
    id: exports_external.string(),
    subject: exports_external.string(),
    description: exports_external.string(),
    activeForm: exports_external.string().optional(),
    owner: exports_external.string().optional(),
    status: TaskStatusSchema(),
    blocks: exports_external.array(exports_external.string()),
    blockedBy: exports_external.array(exports_external.string()),
    metadata: exports_external.record(exports_external.string(), exports_external.unknown()).optional()
  }));
  LOCK_OPTIONS = {
    retries: {
      retries: 30,
      minTimeout: 5,
      maxTimeout: 100
    }
  };
});

export { setLeaderTeamName, clearLeaderTeamName, onTasksUpdated, notifyTasksUpdated, TaskStatusSchema, isTodoV2Enabled, resetTaskList, getTaskListId, sanitizePathComponent, getTasksDir, ensureTasksDir, createTask, getTask, updateTask, deleteTask, listTasks, blockTask, claimTask, unassignTeammateTasks, init_tasks };
