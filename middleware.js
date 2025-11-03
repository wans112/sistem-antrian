import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/', '/api/auth/login'];

const isPublicPath = (pathname) =>
	PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isAssetPath = (pathname) =>
	pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/assets');

export async function middleware(request) {
	const { pathname } = request.nextUrl;

	if (isAssetPath(pathname)) {
		return NextResponse.next();
	}

	const token = request.cookies.get('token')?.value;

	if (!token) {
		if (isPublicPath(pathname)) {
			return NextResponse.next();
		}

		const loginUrl = new URL('/', request.url);
		loginUrl.searchParams.set('returnTo', pathname);
		return NextResponse.redirect(loginUrl);
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		console.error('JWT_SECRET tidak tersedia di environment.');
		const response = NextResponse.redirect(new URL('/', request.url));
		response.cookies.delete('token');
		return response;
	}

	try {
		const secretKey = new TextEncoder().encode(secret);
		const { payload } = await jwtVerify(token, secretKey);
		const role = payload?.role;

		if (pathname === '/' || pathname === '/api/auth/login') {
			const redirectPath = role ? `/${role}` : '/';
			return NextResponse.redirect(new URL(redirectPath, request.url));
		}

		return NextResponse.next();
	} catch (error) {
		console.warn('Token tidak valid atau kedaluwarsa:', error);
		const response = NextResponse.redirect(new URL('/', request.url));
		response.cookies.delete('token');
		return response;
	}
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
