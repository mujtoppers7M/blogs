import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { BlogPreview } from "@/components/blogs/blog-preview"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function BlogPage({ params }: { params: { id: string } }) {
  const blogPost = await prisma.blog.findUnique({
    where: { id: params.id },
    include: { coverImage: true },
  })

  if (!blogPost) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/admin/blogs" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Link>
      </div>

      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{blogPost.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {new Date(blogPost.createdAt).toLocaleDateString()}
          </div>
        </div>

        <BlogPreview
          title={blogPost.title}
          content={blogPost.content}
          coverImage={blogPost.coverImage?.fileUrl ?? null}
        />
      </div>
    </div>
  )
}
