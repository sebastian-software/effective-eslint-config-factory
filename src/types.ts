export type SimplifiedRuleLevel = "off" | "warn" | "error"
export type SimplifiedRuleValue<Options extends any[] = any[]> = Prepend<
  Partial<Options>,
  SimplifiedRuleLevel
>

export type UnifiedRuleFormat = Record<string, SimplifiedRuleValue>
export type RulesStructuredByOrigin = Record<string, UnifiedRuleFormat>
export type KeyValue = Record<string, any>
export type SourcePriorityTable = Record<string, SimplifiedRuleValue | string>
