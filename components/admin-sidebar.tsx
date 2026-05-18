"use client"

import { BriefcaseBusiness, Plus, FileText, LogOut, Home, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: "/signin"
    })
    router.push("/signin")
  }

  const menuItems = [
    {
      href: "/admin",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/admin/add-internship",
      icon: Plus,
      label: "Add Internship",
    },
    {
      href: "/admin/blogs",
      icon: FileText,
      label: "Blogs",
    },
  ]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center gap-2 px-2 py-3 sm:gap-3 sm:px-4 sm:py-4">
          <Image
            src="/logo.jpeg"
            alt="MUJ Toppers Logo"
            width={36}
            height={36}
            className="rounded-lg shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-lg truncate">MUJ Toppers</span>
            <span className="text-xs text-muted-foreground truncate">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "transition-colors duration-200",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <Link href={item.href} className="flex items-center">
                  <item.icon className="mr-3 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Version 1.0.0</div>
          <ModeToggle />
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors" 
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
