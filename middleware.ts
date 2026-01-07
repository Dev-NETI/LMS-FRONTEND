import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get user data from cookies
  const userCookie = request.cookies.get('user')
  const authToken = request.cookies.get('auth_token')
  
  // If no auth token, let the AuthGuard component handle the redirect
  if (!authToken) {
    return NextResponse.next()
  }
  
  // Parse user data if available
  let user = null
  if (userCookie?.value) {
    try {
      user = JSON.parse(userCookie.value)
    } catch (error) {
      console.error('Error parsing user cookie:', error)
      // Clear invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('user')
      response.cookies.delete('auth_token')
      response.cookies.delete('last_validation')
      return response
    }
  }
  
  // If user data is available, check role-based access
  if (user) {
    const userType = user.user_type
    
    // Debug logging
    console.log('Middleware - User Type:', userType, 'Path:', pathname)
    
    // Admin route protection - only admins can access /admin/*
    if (pathname.startsWith('/admin')) {
      if (userType !== 'admin') {
        // Non-admin trying to access admin routes - logout and redirect
        console.log('Non-admin trying to access admin routes, redirecting')
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('user')
        response.cookies.delete('auth_token')
        response.cookies.delete('last_validation')
        return response
      }
    }
    
    // Instructor route protection - only instructors can access /instructor/*
    if (pathname.startsWith('/instructor')) {
      if (userType !== 'instructor') {
        // Non-instructor trying to access instructor routes - logout and redirect
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('user')
        response.cookies.delete('auth_token')
        response.cookies.delete('last_validation')
        return response
      }
    }
    
    // Trainee route protection - trainees can access dashboard, courses, assessments
    const traineeRoutes = ['/dashboard', '/courses', '/assessments', '/announcements', '/progress']
    const isTraineeRoute = traineeRoutes.some(route => pathname.startsWith(route))
    
    if (isTraineeRoute) {
      if (userType !== 'trainee') {
        // Non-trainee trying to access trainee routes - logout and redirect
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('user')
        response.cookies.delete('auth_token')
        response.cookies.delete('last_validation')
        return response
      }
    }
    
    // Redirect authenticated users away from login/auth pages
    if (pathname.includes('/login') || pathname.includes('/auth')) {
      if (userType === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (userType === 'instructor') {
        return NextResponse.redirect(new URL('/instructor', request.url))
      } else if (userType === 'trainee') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Handle root path redirects based on user type
    if (pathname === '/') {
      console.log('Root path redirect - User Type:', userType)
      if (userType === 'admin') {
        console.log('Redirecting admin to /admin')
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (userType === 'instructor') {
        console.log('Redirecting instructor to /instructor')
        return NextResponse.redirect(new URL('/instructor', request.url))
      } else if (userType === 'trainee') {
        console.log('Redirecting trainee to /dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }
  
  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}