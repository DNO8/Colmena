"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remover el locale actual del pathname
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");

    // Construir nueva ruta con el nuevo locale (siempre incluir locale)
    const newPath = `/${newLocale}${pathnameWithoutLocale || "/"}`;

    router.push(newPath);
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={locale === loc}
          style={{
            padding: "5px 10px",
            background: locale === loc ? "#0070f3" : "transparent",
            color: locale === loc ? "white" : "#666",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: locale === loc ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: locale === loc ? "600" : "400",
          }}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
