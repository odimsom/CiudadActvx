# Despliegue de App Móvil en Vercel

## Opción 1: Proyecto separado (Recomendado)

### Paso 1: Crear nuevo proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Selecciona el repositorio `CiudadActvx`
4. En "Configure Project":
   - **Project Name**: `ciudad-activa-mobile`
   - **Framework Preset**: Other
   - **Root Directory**: `apps/mobile`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### Paso 2: Variables de entorno

Agrega en Vercel:

```
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoib2RpbXNvbSIsImEiOiJjbWRoOXcwa3cwMTg4MmtuOWdnaTVyamc0In0.5geWHeQ9BZQLSOSxW6OJ1A
```

### Paso 3: Deploy

- Click "Deploy"
- URL resultado: `https://ciudad-activa-mobile.vercel.app`

## Opción 2: Usando vercel.json personalizado

### Comando local

```bash
# En la raíz del proyecto
vercel --prod --local-config vercel-mobile.json
```

### Para uso automático con GitHub

1. Renombra `vercel-mobile.json` a `vercel.json` temporalmente
2. Push los cambios
3. Vercel detectará automáticamente

## Opción 3: Vercel CLI específico

```bash
# Navegar a la carpeta mobile
cd apps/mobile

# Deploy directo
vercel --prod

# Con configuración específica
vercel --prod --build-env EXPO_PUBLIC_MAPBOX_TOKEN=tu_token
```

## Testing Local Web

```bash
cd apps/mobile
pnpm run web
```

Esto abrirá la app en `http://localhost:19006`

## Consideraciones

### Pros de Expo Web:

- ✅ Código compartido entre móvil y web
- ✅ PWA automática (installable)
- ✅ Responsive design
- ✅ Push notifications
- ✅ Same codebase, multiple platforms

### Contras:

- ⚠️ Algunas funcionalidades móviles no disponibles en web
- ⚠️ React Native Maps puede tener limitaciones en web

### URLs finales:

- **Landing**: `https://ciudad-activa.vercel.app`
- **Web App**: `https://ciudad-activa-web.vercel.app`
- **Mobile Web**: `https://ciudad-activa-mobile.vercel.app`
- **Mobile QR**: Apunta a la URL móvil para PWA install

## PWA Features

La app móvil desplegada en Vercel tendrá:

- 📱 Installable como app nativa
- 🔄 Service worker para cache
- 📴 Funcionalidad offline básica
- 🏠 Home screen icon
- 🎨 Native app appearance
