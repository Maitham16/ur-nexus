import { isURAISubscriber } from './auth.js'
import { has1mContext } from './context.js'

export function isBilledAsExtraUsage(
  model: string | null,
  isFastMode: boolean,
  ismodelO1mMerged: boolean,
): boolean {
  if (!isURAISubscriber()) return false
  if (isFastMode) return true
  if (model === null || !has1mContext(model)) return false

  const m = model.toLowerCase().replace(/\[1m\]$/, '').trim()
  const ismodelO = m === 'modelo'
  const ismodelS = m === 'models'

  if (ismodelO && ismodelO1mMerged) return false

  return ismodelO || ismodelS
}
