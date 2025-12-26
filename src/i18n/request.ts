import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  // Obtener el locale del request
  let locale = await requestLocale;

  // Validar que el locale es soportado
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/../public/locales/${locale}.json`)).default,
  };
});
