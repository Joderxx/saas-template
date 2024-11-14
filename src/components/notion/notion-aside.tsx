"use client"
import {type ExtendedRecordMap} from "notion-types";
import {useEffect, useMemo} from "react";
import Link from "next/link";

interface Header {
  id: string;
  title: string;
  type: "page" | "header" | "sub_header" | "sub_sub_header";
}

export default function NotionAside({recordMap}: {recordMap: ExtendedRecordMap}) {
  const directory = useMemo(() => {
    const keys = Object.keys(recordMap?.block || {})
    const block = recordMap?.block?.[keys[0]]?.value
    const contents = (block?.content as string[])
      .map(e => recordMap.block[e].value)
      .filter(e => e.type === "page" || e.type === "header" || e.type === "sub_header" || e.type === "sub_sub_header")
      .map(e => ({
        id: e?.id as string || "",
        title: e?.properties?.title[0] || "",
        type: e.type,
      }))
    return [{
      id: block?.id as string || "",
      title: block?.properties.title[0] as string || "",
      type: "page"
    }, ...contents] as Header[]
  }, [recordMap])

  function handleScroll() {
    let found = false
    for (const d of directory.reverse()) {
      const element = document.getElementById(`block-${d.id}`)
      if (!element) {
        continue
      }
      element.classList.remove(`text-red-500`)
      if (!found && element.offsetTop <= window.scrollY) {
        element.classList.add(`text-red-500`)
        found = true
      }
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  })

  return (
    <aside className="flex flex-col gap-x-2">
      {
        directory.map(e => {
          if (e.type === "page") {
            return <h1 key={e.id} id={`block-${e.id}`} className="font-bold text-lg cursor-pointer hover:text-primary/50">
              <Link href={`#${e.id}`} passHref>{e.title}</Link>
            </h1>
          } else if (e.type === "header") {
            return <h2 key={e.id} id={`block-${e.id}`} className="pl-2 text-md cursor-pointer  hover:text-primary/50">
              <Link href={`#${e.id}`} passHref >{e.title}</Link>
            </h2>
          } else if (e.type === "sub_header") {
            return <h3 key={e.id} id={`block-${e.id}`} className="pl-4 text-sm cursor-pointer hover:text-primary/50">
              <Link href={`#${e.id}`} passHref >{e.title}</Link>
            </h3>
          } else if (e.type === "sub_sub_header") {
            return <h4 key={e.id} id={`block-${e.id}`} className="pl-6 text-sm cursor-pointer  hover:text-primary/50">
              <Link href={`#${e.id}`} passHref >{e.title}</Link>
            </h4>
          }
        })
      }
    </aside>
  )

}