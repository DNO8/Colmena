# 🌐 Implementación de Internacionalización (i18n) - VERITAS

## ✅ Estado: Completado y Funcional

---

## 📁 Estructura de Archivos

```
src/
├── i18n/
│   ├── config.ts      # Configuración de locales (es, en)
│   └── request.ts     # Configuración de next-intl
├── middleware.ts      # Middleware integrado (i18n + auth)
├── components/
│   └── LanguageSwitcher.tsx  # Selector de idioma
└── app/
    ├── layout.tsx     # Root layout (redirige)
    ├── page.tsx       # Root page (verifica auth)
    └── [locale]/      # Todas las rutas con locale
        └── layout.tsx # Layout con NextIntlClientProvider

public/
└── locales/
    ├── en.json        # Traducciones en inglés (115 strings)
    └── es.json        # Traducciones en español (115 strings)
```

---

## ⚙️ Configuración

### **1. `src/i18n/config.ts`**
```typescript
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
```

### **2. `src/i18n/request.ts`**
```typescript
import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/../public/locales/${locale}.json`)).default,
  };
});
```

### **3. `next.config.ts`**
```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
```

### **4. `src/middleware.ts`**
```typescript
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Siempre incluir /es o /en
});

export async function middleware(request: NextRequest) {
  // 1. i18n
  const response = intlMiddleware(request);
  
  // 2. Supabase auth
  // 3. Protección de rutas
  
  return response;
}
```

---

## 🌍 URLs

### **Español (idioma por defecto):**
```
/es/projects
/es/login
/es/projects/new
/es/my-projects
```

### **Inglés:**
```
/en/projects
/en/login
/en/projects/new
/en/my-projects
```

**Nota:** Todas las URLs **siempre** incluyen el locale (`localePrefix: "always"`).

---

## 🎨 Uso en Componentes

### **Componentes Cliente:**
```typescript
"use client";
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("navigation");
  
  return <button>{t("login")}</button>;
  // ES: "Iniciar sesión"
  // EN: "Login"
}
```

### **Componentes Servidor:**
```typescript
import { useTranslations } from "next-intl";

export default async function MyServerComponent() {
  const t = await useTranslations("projects");
  
  return <h1>{t("createProject")}</h1>;
  // ES: "Crear Proyecto"
  // EN: "Create Project"
}
```

### **Obtener Locale Actual:**
```typescript
import { useLocale } from "next-intl";

const locale = useLocale(); // "es" o "en"
```

---

## 🔄 Selector de Idioma

**Componente:** `src/components/LanguageSwitcher.tsx`

```typescript
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");
    const newPath = `/${newLocale}${pathnameWithoutLocale || "/"}`;
    router.push(newPath);
  };

  return (
    <div>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={locale === loc}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

**Integrado en:** `Navbar.tsx`

---

## 📝 Archivos JSON de Traducciones

### **Estructura:**
```json
{
  "common": { ... },      // Textos comunes
  "auth": { ... },        // Autenticación
  "profile": { ... },     // Perfil
  "wallet": { ... },      // Wallet
  "projects": { ... },    // Proyectos
  "donations": { ... },   // Donaciones
  "errors": { ... },      // Errores
  "navigation": { ... },  // Navegación
  "validation": { ... }   // Validaciones
}
```

### **Total de Strings:**
- **115 strings** en cada idioma
- Organizados en **9 categorías**

---

## 🔒 Integración con Autenticación

El middleware maneja tanto i18n como autenticación:

```typescript
export async function middleware(request: NextRequest) {
  // 1. next-intl maneja locale
  const response = intlMiddleware(request);
  
  // 2. Supabase verifica auth
  const { user } = await supabase.auth.getUser();
  
  // 3. Proteger rutas privadas
  const protectedPaths = ["/projects/new", "/my-projects", "/edit", "/roadmap"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.includes(path),
  );

  if (!user && isProtectedPath) {
    return NextResponse.redirect(`/${locale}/login`);
  }

  return response;
}
```

---

## 🎯 Comportamiento de Rutas

### **Ruta Raíz (`/`):**
```
Sin sesión: / → /es/login
Con sesión: / → /es/projects
```

### **Cambio de Idioma:**
```
/es/projects → Click EN → /en/projects
/en/projects → Click ES → /es/projects
```

### **Rutas Protegidas:**
```
Usuario sin auth intenta: /es/projects/new
                       ↓
Middleware detecta: Sin autenticación
                       ↓
Redirige a: /es/login
```

---

## 📊 Archivos Clave

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `src/i18n/config.ts` | Configuración de locales | ✅ Limpio |
| `src/i18n/request.ts` | Configuración next-intl | ✅ Limpio |
| `src/middleware.ts` | Middleware integrado | ✅ Optimizado |
| `src/components/LanguageSwitcher.tsx` | Selector de idioma | ✅ Funcional |
| `src/app/[locale]/layout.tsx` | Provider de traducciones | ✅ Correcto |
| `public/locales/es.json` | Traducciones español | ✅ Completo |
| `public/locales/en.json` | Traducciones inglés | ✅ Completo |

---

## ✅ Funcionalidades Verificadas

- ✅ Servidor inicia sin errores
- ✅ Rutas con locale funcionan correctamente
- ✅ Selector de idioma ES ↔ EN funciona
- ✅ Traducciones cargan correctamente
- ✅ Navbar muestra textos traducidos
- ✅ Middleware protege rutas privadas
- ✅ Redirecciones mantienen locale
- ✅ No hay código duplicado o inconsistente

---

## 🚀 Próximos Pasos (Opcional)

1. **Migrar páginas existentes** - Reemplazar textos hardcodeados con `t()`
2. **Agregar más idiomas** - Crear `pt.json`, `fr.json`, etc.
3. **Metadata por locale** - Títulos y descripciones traducidos
4. **Interpolación** - Variables dinámicas en traducciones
5. **Pluralización** - Manejo de singular/plural

---

## 📚 Recursos

- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Next.js i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- Archivos JSON: `public/locales/`
- Configuración: `src/i18n/`

---

**Última actualización:** Diciembre 26, 2025  
**Estado:** ✅ Producción Ready
