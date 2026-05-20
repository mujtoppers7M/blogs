"use client"

import { useBlogs } from "@/hooks/useBlogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDeleteBlog } from "@/hooks/useDeleteBlog"
import { useState } from "react"

export default function BlogsPage() {
  const { data: blogs, isLoading, error } = useBlogs()
  const deleteBlog = useDeleteBlog()
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null)

  const handleDelete = async (blogId: string) => {
    setDeletingBlogId(blogId)
    try {
      await deleteBlog.mutateAsync(blogId)
    } finally {
      setDeletingBlogId(null)
    }
  }

  if (error instanceof Error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Error loading blogs</h1>
            <p className="text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Blogs</h1>
          <Link href="/admin/blogs/editor">
            <Button className="rounded-full w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span>New Blog</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))
          ) : blogs?.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No blogs yet.
            </div>
          ) : (
            // Blog cards
            blogs?.map((blog) => (
              <Card key={blog.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                  <CardDescription>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{blog.content}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/blogs/${blog.id}`}>
                      <Button variant="outline">Read More</Button>
                    </Link>
                    <Link href={`/admin/blogs/editor?id=${blog.id}`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteBlog.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingBlogId === blog.id ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the blog post.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(blog.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
