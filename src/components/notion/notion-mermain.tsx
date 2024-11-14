"use client"
import mermaid from "mermaid";
import {useEffect} from "react";
export default function NotionMermain() {

  useEffect(() => {
    renderMermain()
  })

  return <></>
}

function renderMermain() {
  const observer = new MutationObserver(async mutationsList => {
    for (const m of mutationsList) {
      if ((m.target as HTMLElement).className === 'notion-code language-mermaid') {
        const chart =(m.target as HTMLElement).querySelector('code')!.textContent
        if (chart && !(m.target as HTMLElement).querySelector('.mermaid')) {
          const mermaidChart = document.createElement('div')
          mermaidChart.classList.add("mermaid", "flex", "justify-center")
          mermaidChart.innerHTML = chart
          m.target.appendChild(mermaidChart)
          for (let childNode of m.target.childNodes) {
            if ((childNode as HTMLElement).tagName.toUpperCase() === "CODE") {
              (childNode as HTMLElement).classList.add('hidden')
            }
          }
        }

        const mermaidsSvg = document.querySelectorAll('.mermaid')
        if (mermaidsSvg) {
          let needLoad = false
          for (const e of mermaidsSvg) {
            if (e?.firstChild?.nodeName !== 'svg') {
              needLoad = true
            }
          }
          if (needLoad) {
            mermaid.contentLoaded()
          }
        }
      }
    }
  })
  if (document.querySelector('.notion-page-content-inner')) {
    observer.observe(document.querySelector('.notion-page-content-inner')!, { attributes: true, subtree: true })
  }
}