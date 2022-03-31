import { escape } from "lodash"
import { ruleComparator } from "./util"
import { RuleMeta, SimplifiedRuleValue } from "./types"

function jsonToHtml(obj: JSON | any[]): string {
  return escape(JSON.stringify(obj, null, 2))
    .replaceAll("\n", "<br/>")
    .replaceAll(" ", "&#160;")
}

export function formatAlternatives(
  sources: Record<string, SimplifiedRuleValue>,
  selectedSource: string | undefined
): string {
  let html = ""

  for (const sourceName in sources) {
    const sourceValue = sources[sourceName]
    if (sourceName === selectedSource) {
      html += "<strong>"
    }

    html += `${sourceName}: `

    if (sourceName === selectedSource) {
      html += "</strong>"
    }

    if (sourceValue.length === 1) {
      html += "<em>defaults</em>"
    } else {
      html += sourceValue.slice(1).map(jsonToHtml).join("<br/>")
    }

    html += "<br/>"
  }

  return html
}

export function getReadableValue(entry: undefined | SimplifiedRuleValue) {
  if (!entry) {
    return ""
  }

  const config = entry.slice(1)
  return config.length === 0 ? "" : jsonToHtml(config)
}

export function formatRuleMeta(ruleMeta: RuleMeta, ruleName: string) {
  let cells = ``
  cells += `<td>${ruleMeta.source}</td>`
  cells += `<td>${ruleMeta.origin || ""}</td>`
  cells += `<td>${(ruleMeta.droppedValue && "dropped") || ""}</td>`
  cells += `<td>${ruleMeta.alternatives || ""}</td>`

  return `<tr class="source-${ruleMeta.source}"><th>${ruleName}</th>${cells}</tr>`
}

export async function formatMeta(rulesMeta: Record<string, RuleMeta>) {
  const metaKeys = Object.keys(rulesMeta)
  metaKeys.sort(ruleComparator)
  const rowsHtml = metaKeys
    .map((ruleName) => formatRuleMeta(rulesMeta[ruleName], ruleName))
    .join("\n")
  const styles = `
  html {
    font: 10px sans-serif;
    background: white;
    color: black;
  }

  th, td {
    text-align: left;
    padding: 4px 10px;
  }

  tr:nth-child(even) {
    background: #EEE;
  }

  .source-disabled{
    color: grey;
  }

  .source-disabled th {
    text-decoration: line-through;
  }

  .source-priority{

  }

  .source-uniform{
    color: green;
  }

  .source-unresolved {
    color: red;
  }

  `

  const header = `
  <tr><th>Rule</th><td>Source</td><td>Origin</td><td>Dropped?</td><td>Config</td></tr>
  `

  return `<html><style>${styles}</style><table>${header}${rowsHtml}</table></html>`
}
