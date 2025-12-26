# 🌐 Guía de Implementación de Traducciones

## 📋 Resumen

VERITAS ahora soporta **internacionalización (i18n)** con **español como idioma principal** e inglés como idioma secundario.

---

## 🎯 Configuración Implementada

### 1. **Idiomas Soportados**
- 🇪🇸 **Español (es)** - Idioma por defecto
- 🇬🇧 **Inglés (en)** - Idioma secundario

### 2. **Archivos de Configuración**

#### `src/i18n.ts`
```typescript
export const locales = ["es", "en"] as const;
export const defaultLocale: Locale = "es";
```

#### `next.config.ts`
```typescript
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
export default withNextIntl(nextConfig);
```

#### `src/middleware.ts`
- Integra next-intl con Supabase auth
- Detecta locale automáticamente
- Usa `localePrefix: "as-needed"` - URLs en español no llevan `/es`

---

## 📁 Estructura de Archivos

```
veritas/
├── public/
│   └── locales/
│       ├── en.json          # Traducciones en inglés
│       └── es.json          # Traducciones en español
├── src/
│   ├── i18n.ts              # Configuración de i18n
│   ├── middleware.ts        # Middleware con i18n + auth
│   ├── app/
│   │   ├── [locale]/        # Nuevo: Rutas con locale
│   │   │   └── layout.tsx   # Layout con NextIntlClientProvider
│   │   └── layout.tsx       # Layout raíz (mantener vacío o redirigir)
│   └── components/
│       └── LanguageSwitcher.tsx  # Selector de idioma
```

---

## 🔧 Cómo Usar Traducciones

### En Componentes Cliente (`"use client"`)

```typescript
"use client";

import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("projects");
  
  return (
    <div>
      <h1>{t("createProject")}</h1>
      <p>{t("noProjects")}</p>
    </div>
  );
}
```

### En Componentes Servidor

```typescript
import { useTranslations } from "next-intl";

export default async function MyServerComponent() {
  const t = await useTranslations("projects");
  
  return <h1>{t("title")}</h1>;
}
```

### En Páginas con Parámetros

```typescript
export default function ProjectPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string }
}) {
  const t = useTranslations("projects");
  
  return <h1>{t("viewProject")}</h1>;
}
```

---

## 📝 Estructura de los JSON

Los archivos `en.json` y `es.json` tienen la misma estructura:

```json
{
  "common": { ... },      // Textos comunes (loading, error, save, etc.)
  "auth": { ... },        // Autenticación
  "profile": { ... },     // Perfil de usuario
  "wallet": { ... },      // Wallet de Stellar
  "projects": { ... },    // Proyectos
  "donations": { ... },   // Donaciones
  "errors": { ... },      // Mensajes de error
  "navigation": { ... },  // Navegación
  "validation": { ... }   // Validaciones
}
```

### Ejemplo de Uso por Categoría

```typescript
// common
const t = useTranslations("common");
t("loading")  // "Cargando..." / "Loading..."
t("save")     // "Guardar" / "Save"

// auth
const t = useTranslations("auth");
t("login")    // "Iniciar sesión" / "Login"

// projects
const t = useTranslations("projects");
t("createProject")  // "Crear Proyecto" / "Create Project"

// errors
const t = useTranslations("errors");
t("forbidden")  // "Acceso Prohibido" / "Access Forbidden"
```

---

## 🔄 Selector de Idioma

El componente `LanguageSwitcher` ya está integrado en el Navbar:

```typescript
import LanguageSwitcher from "./LanguageSwitcher";

// En tu componente
<LanguageSwitcher />
```

Muestra botones ES | EN y cambia el idioma manteniendo la ruta actual.

---

## 🌍 URLs y Comportamiento

### Español (idioma por defecto)
```
/projects          ✅ Sin prefijo
/login             ✅ Sin prefijo
/projects/new      ✅ Sin prefijo
```

### Inglés
```
/en/projects       ✅ Con prefijo /en
/en/login          ✅ Con prefijo /en
/en/projects/new   ✅ Con prefijo /en
```

### Redirecciones Automáticas
- Usuario en `/` → Redirige a `/projects` (español)
- Usuario en `/en` → Redirige a `/en/projects` (inglés)

---

## 🚀 Migración de Páginas Existentes

### Paso 1: Mover páginas a `[locale]`

**Antes:**
```
src/app/projects/page.tsx
```

**Después:**
```
src/app/[locale]/projects/page.tsx
```

### Paso 2: Actualizar imports de traducciones

```typescript
// Agregar al inicio del componente
import { useTranslations } from "next-intl";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  
  // Reemplazar textos hardcodeados
  return <h1>{t("projectsFeed")}</h1>;
}
```

### Paso 3: Actualizar Links

```typescript
// Antes
<Link href="/projects">Projects</Link>

// Después
<Link href="/projects">{t("projects")}</Link>
```

---

## 📋 Checklist de Migración

Para cada página:

- [ ] Mover a `app/[locale]/`
- [ ] Importar `useTranslations`
- [ ] Reemplazar textos hardcodeados con `t("key")`
- [ ] Actualizar Links con traducciones
- [ ] Verificar que los keys existan en `en.json` y `es.json`
- [ ] Probar en ambos idiomas

---

## 🛠️ Agregar Nuevas Traducciones

### 1. Agregar key en ambos JSON

**`public/locales/es.json`:**
```json
{
  "projects": {
    "newKey": "Nuevo texto en español"
  }
}
```

**`public/locales/en.json`:**
```json
{
  "projects": {
    "newKey": "New text in English"
  }
}
```

### 2. Usar en componente

```typescript
const t = useTranslations("projects");
<p>{t("newKey")}</p>
```

---

## 🔍 Debugging

### Ver locale actual
```typescript
import { useLocale } from "next-intl";

const locale = useLocale(); // "es" o "en"
```

### Ver todas las traducciones disponibles
```typescript
const t = useTranslations();
console.log(t.raw("projects")); // Objeto completo de "projects"
```

---

## ⚠️ Consideraciones Importantes

### 1. **Middleware**
El middleware ahora maneja:
- Detección de locale (next-intl)
- Autenticación (Supabase)
- Protección de rutas

### 2. **Rutas Protegidas**
Las rutas protegidas ahora consideran el locale:
```typescript
// Antes: /projects/new
// Ahora: /projects/new (español) o /en/projects/new (inglés)
```

### 3. **Metadata**
Actualizar metadata por locale:
```typescript
export async function generateMetadata({ params: { locale } }) {
  return {
    title: locale === "es" 
      ? "VERITAS - Plataforma de Crowdfunding"
      : "VERITAS - Crowdfunding Platform"
  };
}
```

---

## 📚 Recursos

- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Next.js i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

## 🎯 Próximos Pasos

1. **Migrar todas las páginas** a `app/[locale]/`
2. **Reemplazar textos hardcodeados** con traducciones
3. **Agregar traducciones faltantes** en los JSON
4. **Testing** en ambos idiomas
5. **Considerar agregar más idiomas** (pt, fr, etc.)

---

## 💡 Tips

- Usa nombres de keys descriptivos: `createProject` en vez de `btn1`
- Agrupa traducciones por contexto: `auth`, `projects`, `errors`
- Mantén consistencia entre `en.json` y `es.json`
- Documenta traducciones complejas con comentarios
- Usa interpolación para valores dinámicos:
  ```json
  {
    "welcome": "Bienvenido, {name}"
  }
  ```
  ```typescript
  t("welcome", { name: user.name })
  ```

---

**¡La internacionalización está lista! 🎉**

Ahora puedes empezar a migrar las páginas existentes y agregar traducciones según sea necesario.
