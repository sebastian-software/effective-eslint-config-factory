import { Linter } from "eslint"

export type SimplifiedRuleLevel = "off" | "warn" | "error"
export type SimplifiedRuleValue<Options extends any[] = any[]> = Prepend<
  Partial<Options>,
  SimplifiedRuleLevel
>

export type UnifiedRuleFormat = Record<string, SimplifiedRuleValue>
export type RulesStructuredByOrigin = Record<string, UnifiedRuleFormat>
export type KeyValue = Record<string, any>

export interface SourcePriorityValue {
  use: string
  comment?: string
}

export type SourcePriorityTable = Record<string, SourcePriorityValue>

export interface RuleMeta {
  source?: "disabled" | "uniform" | "single" | "priority" | "unresolved"
  origin?: string
  resolution?: boolean
  droppedValue?: boolean
  relaxedLevel?: boolean
  alternatives?: string
  config?: string
  comment?: string
}

export interface SimplifyResult {
  simplified: Linter.RulesRecord
  meta: Record<string, RuleMeta>
}
