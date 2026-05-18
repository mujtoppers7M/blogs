import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <SidebarInset className="flex flex-col w-full">
          <div className="flex items-center gap-2 md:hidden p-2 border-b bg-background sticky top-0 z-10">
            <SidebarTrigger className="h-8 w-8" />
            <span className="text-sm font-semibold">Menu</span>
          </div>
          <main className="flex-1 overflow-auto w-full p-3 sm:p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
