# Portal Condominios del Valle 2 🏘️

App web completa para gestión de pagos y comunicación del condominio.

## Pasos para poner en marcha

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y abre tu proyecto
2. Ve a **SQL Editor** y pega TODO el contenido de `SETUP_SUPABASE.sql` y haz clic en **Run**
3. Ve a **Storage > New Bucket**, crea uno llamado `receipts` y márcalo como **Public**
4. Ve a **Authentication > Users > Add User** y crea tu cuenta de admin
5. Copia el UUID de tu usuario y ejecuta en SQL Editor:
   ```sql
   insert into profiles (id, role, resident_name, email)
   values ('TU_UUID_AQUI', 'admin', 'Tu Nombre', 'tu@correo.com');
   ```

### 2. Configurar la app

1. Ve a **Settings > API** en Supabase y copia tu **anon public key**
2. Crea un archivo `.env` en la raíz del proyecto:
   ```
   VITE_SUPABASE_ANON_KEY=pega_tu_anon_key_aqui
   ```
3. En `src/lib/supabase.js` ya está configurada tu URL del proyecto

### 3. Correr localmente

```bash
npm install
npm run dev
```

Abre http://localhost:5173 y inicia sesión con tu cuenta de admin.

### 4. Publicar en Vercel (gratis)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio
3. En **Environment Variables** agrega: `VITE_SUPABASE_ANON_KEY` con tu key
4. Haz clic en **Deploy** — en 2 minutos tienes tu link

## Uso

**Como admin:**
- Dashboard: resumen del estado del condominio
- Casas: ver todas las 52 casas y su estado de pago
- Historial: todos los pagos filtrados por fecha y estado
- Anuncios: publicar comunicados para residentes
- Residentes: crear cuentas para cada casa

**Como residente:**
- Ver si el pago del mes está al día
- Ver historial de pagos
- Subir comprobantes de pago
- Leer anuncios del administrador
