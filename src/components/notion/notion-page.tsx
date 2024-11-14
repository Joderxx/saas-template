"use client"
import "@/components/notion/styles.module.css";
// import 'prismjs/themes/prism-coy.css'
import 'react-notion-x/src/styles.css'
import "./custom-notion.css"

import dynamic from 'next/dynamic'
import Image from 'next/legacy/image'
import Link from 'next/link'
import {type ExtendedRecordMap} from 'notion-types'
import {getPageTitle, formatDate} from 'notion-utils'
import {NotionRenderer} from 'react-notion-x'
import TweetEmbed from 'react-tweet-embed'
import NotionAside from "@/components/notion/notion-aside";
import NotionMermain from "@/components/notion/notion-mermain";

import NotionHeader from "@/components/notion/notion-header";

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(async (m) => {
    // additional prism syntaxes
    await Promise.allSettled([
      import('prismjs/components/prism-markup-templating'),
      import('prismjs/components/prism-markup'),
      import('prismjs/components/prism-bash'),
      import('prismjs/components/prism-c'),
      import('prismjs/components/prism-cpp'),
      import('prismjs/components/prism-csharp'),
      import('prismjs/components/prism-docker'),
      import('prismjs/components/prism-java'),
      import('prismjs/components/prism-javascript'),
      import('prismjs/components/prism-js-templates'),
      import('prismjs/components/prism-coffeescript'),
      import('prismjs/components/prism-diff'),
      import('prismjs/components/prism-git'),
      import('prismjs/components/prism-go'),
      import('prismjs/components/prism-graphql'),
      import('prismjs/components/prism-handlebars'),
      import('prismjs/components/prism-less'),
      import('prismjs/components/prism-makefile'),
      import('prismjs/components/prism-markdown'),
      import('prismjs/components/prism-mermaid'),
      import('prismjs/components/prism-objectivec'),
      import('prismjs/components/prism-ocaml'),
      import('prismjs/components/prism-python'),
      import('prismjs/components/prism-reason'),
      import('prismjs/components/prism-rust'),
      import('prismjs/components/prism-sass'),
      import('prismjs/components/prism-scss'),
      import('prismjs/components/prism-solidity'),
      import('prismjs/components/prism-sql'),
      import('prismjs/components/prism-stylus'),
      import('prismjs/components/prism-swift'),
      import('prismjs/components/prism-wasm'),
    ])
    return m.Code
  })
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false
  }
)
const Modal = dynamic(
  () =>
    import('react-notion-x/build/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport')
      return m.Modal
    }),
  {
    ssr: false
  }
)

function Tweet({id}: { id: string }) {
  return <TweetEmbed tweetId={id}/>
}

const propertyLastEditedTimeValue = (
  {block, pageHeader},
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Last updated ${formatDate(block?.last_edited_time, {
      month: 'long'
    })}`
  }

  return defaultFn()
}

const propertyDateValue = (
  {data, schema, pageHeader},
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'published') {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: 'long'
      })}`
    }
  }

  return defaultFn()
}

const propertyTextValue = (
  {schema, pageHeader},
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>
  }

  return defaultFn()
}

export function NotionPage({
                             properties,
                             recordMap,
                             previewImagesEnabled
                           }: {
  properties: any,
  recordMap: ExtendedRecordMap
  previewImagesEnabled?: boolean
}) {
  const title = getPageTitle(recordMap) || ""

  // useful for debugging from the dev console
  if (typeof window !== 'undefined') {
    const keys = Object.keys(recordMap?.block || {})
    const block = recordMap?.block?.[keys[0]]?.value
    const g = window as any
    g.recordMap = recordMap
    g.block = block
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return (
    <div>
      <NotionRenderer
        recordMap={recordMap}
        disableHeader={true}
        pageHeader={<NotionHeader title={title} properties={properties}></NotionHeader>}
        pageTitle={<></>}
        fullPage={true}
        darkMode={false}
        previewImages={previewImagesEnabled}
        components={{
          nextLegacyImage: Image,
          nextLink: Link,
          Code,
          Collection,
          Equation,
          Pdf,
          Modal,
          Tweet,
          propertyLastEditedTimeValue,
          propertyTextValue,
          propertyDateValue
        }}
        pageAside={<NotionAside recordMap={recordMap}></NotionAside>}
      />
      <NotionMermain/>
    </div>
  )
}
