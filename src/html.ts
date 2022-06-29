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

    if (sourceValue[0] === "off") {
      html += "<em>off</em>"
    } else if (sourceValue.length === 1) {
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
  cells += `<td class="source">${ruleMeta.source}</td>`
  cells += `<td class="origin">${ruleMeta.origin ?? "&#160;"}</td>`
  cells += `<td class="comment">${ruleMeta.comment ?? "&#160;"}</td>`
  cells += `<td class="alternatives">${ruleMeta.alternatives ?? "&#160;"}</td>`

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
    font: 12px sans-serif;
    background: white;
    color: #222;
  }

  html,
  body{
    padding: 0;
    margin: 0;
  }

  table{
    border-spacing: 0;
    font: inherit;
    width: 100%;
  }

  td, th{
    vertical-align: top;
  }

  thead th{
    background: lightskyblue;
    padding: 6px 10px;
    font-size: 14px;
  }

  th, td {
    text-align: left;
    padding: 4px 10px;
  }

  tr:nth-child(even) {
    background: #F4F8FA;
  }

  th:first-child{
    white-space: nowrap;
    border-left: 8px solid transparent;
  }

  tbody th::after {
    font-size: 10px;
    color: white;
    display: inline-block;
    border-radius: 50% 50%;
    width: 18px;
    height: 18px;
    text-align: center;
    vertical-align: middle;
    line-height: 18px;
    margin-left: 8px;
    font-weight: normal;
  }

  .source-disabled th::after{
    content: "✘";
    background: darkgrey;
  }

  .source-priority th::after{
    content: "♥";
    background: orange;
  }

  .source-single th::after,
  .source-uniform th::after{
    content: "✔";
    background: green;
  }

  .source-unresolved th{
    border-color: #FF7276;
  }

  .source-unresolved th::after{
    content: "➔";
    background: orangered;
  }
  `

  const header = `
  <thead><tr><th>Rule</th><th>Source</th><th>Origin</th><th>Comment</th><th>Config</th></tr></thead>
  `

  const meta = `
  <title>Effective ESLint Factory</title>
  <meta charset="utf-8"/>`

  return `<html>${meta}<style>${styles}</style><table>${header}<tbody>${rowsHtml}</tbody></table></html>`
}
