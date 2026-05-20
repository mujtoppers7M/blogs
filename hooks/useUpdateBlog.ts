import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UpdateData {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
}

export const useUpdateBlog = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, UpdateData>({
    mutationFn: async ({ id, ...data }) => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update blog')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      toast.success('Blog updated successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to update blog: ${error.message}`)
    },
  })
}
