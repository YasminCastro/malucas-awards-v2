import { NextRequest, NextResponse } from 'next/server';
import { getUserByInstagram, userNeedsPassword } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram, password } = body;

    // Validação
    if (!instagram || !password) {
      return NextResponse.json(
        { error: 'Instagram e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se usuário precisa definir senha primeiro
    const needsPassword = await userNeedsPassword(instagram);
    if (needsPassword) {
      return NextResponse.json(
        { error: 'Você precisa definir sua senha primeiro. Acesse /signup' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await getUserByInstagram(instagram);
    if (!user) {
      return NextResponse.json(
        { error: 'Instagram ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Instagram ou senha incorretos' },
        { status: 401 }
      );
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      instagram: user.instagram,
    });

    // Definir cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        instagram: user.instagram,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
