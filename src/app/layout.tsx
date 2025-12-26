// Este layout es necesario pero no debe renderizar nada
// El middleware de next-intl maneja las redirecciones
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
