import { cn } from "@/lib/utils"
import { AiFillFolderOpen, AiFillUpSquare } from "react-icons/ai"
import moment from "moment"
import { type BlogItemInfo } from "@/lib/blog/blog-api"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { AiFillLock } from "react-icons/ai"
function hashcode(str: string) {
  let hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export default function BlogItem({ blog, left }: { blog: BlogItemInfo, left: boolean }) {
  const t = useTranslations("BlogGroup")
  const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink"]
  return <div>

    <Link href={`/blog/detail/${blog.id}`} className={cn("flex gap-4 max-w-3xl w-[48rem] rounded-lg overflow-hidden shadow-md border cursor-pointer hover:scale-105 transition-all duration-300", left ? "flex-row" : "flex-row-reverse")}>
      {blog.cover && <img src={blog.cover} alt="blog" width={300} height={200} className="flex-1 flex aspect-[16/9]" />}
      <div className={cn("flex flex-col flex-1 gap-2 p-4  flex-between", !blog.cover ? "w-full" : "w-1/2")}>
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex justify-between items-center ">
            <h2 className="text-xl font-bold">{blog.title}</h2>
            <span className="flex gap-2 text-sm text-primary/50">
              {moment(blog.createdAt).format("YYYY-MM-DD")}
            </span>
          </div>
          <div className="flex gap-2 items-center text-primary/50">
            <AiFillFolderOpen />
            <span className="flex gap-2 text-sm">{t(blog.category)}</span>
            {blog.top && <AiFillUpSquare className=" text-red-500" />}
            {blog.hasAuth && <AiFillLock className=" text-[#ffa502]" />}
          </div>
          <p className="text-sm max-w-xl max-h-16 text-primary/50 text-wrap text-ellipsis overflow-hidden whitespace-nowrap w-full">
            {blog.description}
          </p>
        </div>
        <div className="flex justify-end gap-x-3">
          {blog.tags.map((tag, index) => (
            <div key={index} className={cn("px-2 py-1 rounded-lg text-white text-sm", `bg-${colors[hashcode(tag) % colors.length]}-500`)}>{tag}</div>
          ))}
        </div>
      </div>
    </Link>
  </div>
}