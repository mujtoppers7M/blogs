// This file can be empty or removed since we'll handle auth at the page level 

import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized: ({ token }) => {
      // Redirect to signin if no token is found
      return !!token
    },
  },
})

export const config = {
  matcher: [
    // Match all paths except public ones and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|ico|svg|css|js)$|signin|api/auth|api/blogs).*)',
  ],
} 