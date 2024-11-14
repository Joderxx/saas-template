"use client"

import { useEffect, useState, useTransition } from "react"
import BlogItem from "./blog-item"
import { type BlogItemInfo } from "@/lib/blog/blog-api"

export default function ScrollBlog({ defaultStart, type }: { defaultStart: number, type: string }) {

  const [blogList, setBlogList] = useState<BlogItemInfo[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [isPending, startTransition] = useTransition()
  const offset = 4

  function handleScroll() {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5 && !isPending && !isFinished) {
      startTransition(async () => {
        await fetchBlogList()
      })
    }
  }

  async function fetchBlogList() {
    const res = await fetch(`/api/blog?type=${type}&start=${blogList.length + defaultStart}&offset=${offset}`)
    if (res.ok) {
      const addBlogList = await res.json()
      const add: BlogItemInfo[] = []
      addBlogList.forEach(e => {
        if (!blogList.some(b => b.id === e.id)) {
          add.push(e)
          blogList.push(e)
        }
      })
      setBlogList(blogList)
      if (add.length === 0) {
        setIsFinished(true)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])
  return (
    <>
      {blogList.map((blog, i) => (
        <BlogItem key={blog.id} blog={blog} left={i % 2 === 0} />
      ))}
      {isFinished && <div className="h-10 bg-primary/10 animate-pulse rounded-md text-center justify-center items-center flex">
        <span className="text-primary/50">Finished</span>
      </div>}
    </>
  )
}