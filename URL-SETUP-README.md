# Clean URLs Setup - Dota 2 MMR Calculator

## ¿Qué se configuró?

Se configuraron URLs limpias sin extensión `.html` para todas las páginas del sitio.

### URLs Antiguas → URLs Nuevas

- `mmrcalculator.com/index.html` → `mmrcalculator.com/`
- `mmrcalculator.com/guide.html` → `mmrcalculator.com/guide`
- `mmrcalculator.com/howto.html` → `mmrcalculator.com/howto`
- `mmrcalculator.com/faq.html` → `mmrcalculator.com/faq`

## Archivos modificados

### 1. `.htaccess` (NUEVO)
Este archivo controla la reescritura de URLs en el servidor:
- Redirige automáticamente URLs con `.html` a versiones sin extensión (301 redirect)
- Sirve archivos `.html` cuando se accede a URLs sin extensión
- Previene navegación de directorios

### 2. Todos los archivos HTML
Se actualizaron todos los links internos:
- Links de navegación
- Botones de llamada a acción
- Meta tags Open Graph (`og:url`)

### 3. `sitemap.xml`
Se actualizaron todas las URLs para usar el formato sin extensión.

## Compatibilidad

### ✅ Funciona con:
- **Apache** (mayoría de hosting compartido)
- **Servidores con mod_rewrite habilitado**
- Cualquier servidor que soporte `.htaccess`

### ⚠️ Requiere configuración adicional:
- **GitHub Pages**: No soporta `.htaccess` nativamente. Necesitas usar Jekyll o un workaround.
- **Nginx**: Requiere configuración en el archivo de configuración del servidor.
- **Netlify/Vercel**: Tienen sus propios archivos de configuración (`_redirects` o `vercel.json`)

## Si estás usando GitHub Pages

GitHub Pages no soporta `.htaccess`. Opciones:

### Opción 1: Usar Jekyll (recomendado para GitHub Pages)
Agrega al `_config.yml`:
```yaml
permalink: /:title
```

### Opción 2: Configurar redirects manualmente
Crea carpetas para cada página:
```
guide/
  index.html (copia de guide.html)
howto/
  index.html (copia de howto.html)
faq/
  index.html (copia de faq.html)
```

## Si estás usando Netlify

Crea un archivo `_redirects` en la raíz:
```
/guide.html /guide 301
/howto.html /howto 301
/faq.html /faq 301
```

Y un archivo `netlify.toml`:
```toml
[[redirects]]
  from = "/*.html"
  to = "/:splat"
  status = 301
  force = true
```

## Si estás usando Vercel

Crea un archivo `vercel.json`:
```json
{
  "cleanUrls": true
}
```

## Verificar que funciona

Después de subir los cambios:

1. Visita `mmrcalculator.com/guide` (sin .html)
2. Debe cargar la página correctamente
3. Visita `mmrcalculator.com/guide.html` (con .html)
4. Debe redirigir automáticamente a la versión sin .html

## Notas importantes

- **Los archivos HTML mantienen su extensión** en el servidor
- **Solo las URLs visibles cambian** (sin .html)
- **Los redirects son 301** (permanentes) para SEO
- **Todos los links internos ya están actualizados** para usar URLs sin extensión

