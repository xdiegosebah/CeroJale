import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function friendlyError(error: unknown): string {
  const text =
    error instanceof Error
      ? error.message
      : String((error as { message?: string })?.message ?? error);
  if (
    /email address.*not authorized|sending confirmation email|sending recovery email/i.test(
      text,
    )
  )
    return "No se pudo enviar el correo. El administrador debe revisar la configuración de envío de correos en Supabase.";
  if (/Invalid login credentials/i.test(text))
    return "Correo o contraseña incorrectos.";
  if (/Email not confirmed/i.test(text))
    return "Confirma tu correo antes de ingresar. Revisa también la carpeta de spam.";
  if (/rate limit|too many requests|security purposes/i.test(text))
    return "Se alcanzó el límite de intentos o correos. Espera unos minutos y vuelve a intentarlo.";
  if (/Failed to fetch|NetworkError|fetch failed/i.test(text))
    return "No se pudo conectar con Supabase. Comprueba tu conexión y la configuración del proyecto.";
  if (
    /schema cache|does not exist|could not find the table|Could not find the function/i.test(
      text,
    )
  )
    return "Falta configurar las tablas de CeroJale. Ejecuta supabase/setup.sql en el SQL Editor de tu proyecto.";
  if (/User already registered/i.test(text))
    return "Ese correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.";
  return text;
}
