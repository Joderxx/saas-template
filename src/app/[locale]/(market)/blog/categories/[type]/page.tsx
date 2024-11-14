import { getTranslations } from "next-intl/server"
import BlogItem from "./blog-item"
import { getBlogList } from "@/lib/blog/blog-api"
import ScrollBlog from "./scroll-blog"

export default async function BlogCategories({ params }: { params: { type: string } }) {
  const t = await getTranslations("BlogGroup")
  const defaultStart = 4
  const blogList = await getBlogList(params.type, 0, defaultStart)
  return <div className="p-4">
    <h1 className="text-2xl font-bold">{t(params.type)}</h1>
    <div className="flex flex-col gap-4 p-4 min-w-[48rem]">
      {blogList.map((blog, i) => (
        <BlogItem key={blog.id} blog={blog} left={i % 2 === 0} />
      ))}
      <ScrollBlog defaultStart={blogList.length} type={params.type} />
    </div>
  </div>
}