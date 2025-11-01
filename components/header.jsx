'use client'; // <-- 1. CAMBIO: Esto convierte el componente en un Cliente Componente, necesario para usar hooks.

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import {
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'; // <-- 2. CAMBIO: Importa useState y useEffect.
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
// import { checkUser } from '@/lib/checkUser'; // <-- 3. CAMBIO: Comentamos esto por ahora. Es una acción de servidor y no se puede llamar directamente así en un componente de cliente.

const Header = () => {
  // <-- 4. CAMBIO: Quitamos 'async' porque los componentes de cliente no son asíncronos de esta manera.
  // await checkUser(); // <-- 5. CAMBIO: Comentamos la llamada directa.

  // <-- 6. CAMBIO: Añadimos la lógica del estado.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo de Sensai"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain"
          />
        </Link>

        {/* <-- 7. CAMBIO: Envuelve el contenido que depende de la autenticación. */}
        {isMounted && (
          <div className="flex items-center space-x-2 md:space-x-4">
            <SignedIn>
              <Link href={'/dashboard'}>
                <Button variant="outline">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidded md:block">
                    Perspectivas del Sector
                  </span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <StarsIcon className="h-4 w-4" />
                    <span className="hidded md:block">
                      Herramientas de Crecimiento
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={'/resume'} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Crear Curriculum</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={'/ai-cover-letter'}
                      className="flex items-center gap-2"
                    >
                      <PenBox className="h-4 w-4" />
                      <span>Carta de Presentacion</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={'/interview'}
                      className="flex items-center gap-2"
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Preparacion de Entrevista</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>

            <SignedOut>
              <SignInButton>
                <Button variant="outline">Iniciar Sesion</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                    userButtonPopoverCard: 'shadow-xl',
                    userPreviewMainIdentifier: 'font-semibold',
                  },
                }}
                afterSwitchSessionUrl="/"
              />
            </SignedIn>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
