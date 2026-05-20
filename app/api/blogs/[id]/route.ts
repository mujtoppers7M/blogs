import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        {
          status: 404,
          headers: corsHeaders,
        }
      )
    }

    await prisma.$transaction([
      prisma.coverImage.deleteMany({
        where: { blogId: id },
      }),
      prisma.blog.delete({
        where: { id },
      }),
    ])

    return NextResponse.json(
      { message: 'Blog deleted successfully' },
      {
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}