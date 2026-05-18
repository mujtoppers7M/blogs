"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      toast.success("Signed in successfully!")

      // Get the callback URL from the search params
      const searchParams = new URLSearchParams(window.location.search)
      const callbackUrl = searchParams.get('callbackUrl')

      // Redirect to callback URL if it exists, otherwise to /admin
      router.replace(callbackUrl || "/admin")

    } catch (error) {
      console.error('Sign in error:', error)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-8 sm:p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0">
          <Image
            src="/hello.png"
            alt="Background"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-20 flex items-center justify-center text-base sm:text-lg font-medium gap-2">
          <Image
            src="/logo.jpeg"
            alt="MUJ Toppers Logo"
            width={40}
            height={40}
            style={{ borderRadius: '50%' }}
            priority
          />
          <span className="hidden sm:inline">MUJ Toppers Admin</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-base sm:text-lg">
              &ldquo;Empowering students with knowledge and opportunities for a brighter future.&rdquo;
            </p>
            <footer className="text-xs sm:text-sm">MUJ Toppers Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="w-full px-4 py-8 sm:px-0 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center">
              <Image
                src="/logo.jpeg"
                alt="MUJ Toppers Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your credentials to sign in to your account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={isLoading}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-xs sm:text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <Button type="submit" disabled={isLoading} size="sm" className="text-sm">
                    Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 