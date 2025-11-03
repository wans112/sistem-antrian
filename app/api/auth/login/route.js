import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { queryOne } from '@/lib/db.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET tidak ditemukan di environment.');
      return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
    }

    const detail = queryOne(
      'SELECT full_name, phone_number, layanan_id FROM detail_users WHERE user_id = ?',
      [user.id]
    );

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = NextResponse.json({
      message: 'Login berhasil.',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        detail,
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error saat login:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat login.' }, { status: 500 });
  }
}
