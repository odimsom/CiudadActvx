# 🏙️ Ciudad Activa - Santo Domingo

**Plataforma ciudadana para reportar y dar seguimiento a problemas urbanos en Santo Domingo, República Dominicana.**

## 🌟 Características Principales

- ✅ **Landing Page Vibrante** con demo interactivo
- ✅ **PWA Completa** instalable como app nativa
- ✅ **Persistencia Simple** simulando servidor compartido
- ✅ **Reportes en Tiempo Real** entre usuarios
- ✅ **Notificaciones Push** para actualizaciones
- ✅ **Experiencia Móvil Optimizada**
- ✅ **Ubicación Santo Domingo** con coordenadas correctas

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Windows)
```bash
# Ejecutar desde la raíz del proyecto
start-ciudad-activa.bat
```

### Opción 2: Manual

#### 1. Landing Page
```bash
cd apps/landing
npm install
npm run dev
# Se abre en http://localhost:4321
```

#### 2. Aplicación Web
```bash
cd apps/web
npm install
npm run dev
# Se abre en http://localhost:5173
```

## 📱 Cómo Probar la PWA

1. Abre la landing page en tu móvil: `http://localhost:4321`
2. Haz clic en "Usar en tu móvil"
3. Sigue las instrucciones para instalar como app nativa

### Para iPhone:
1. Abre en Safari
2. Toca el botón compartir
3. Selecciona "Añadir a pantalla de inicio"

### Para Android:
1. Abre en Chrome
2. Toca el menú (⋮)
3. Selecciona "Instalar app"

## 🗺️ Funcionalidades del Sistema

### Landing Page (`/`)
- Hero section con estadísticas animadas
- Demo interactivo del mapa (haz clic en cualquier lugar)
- Características principales con efectos
- Call-to-action para instalación PWA

### Aplicación Web (`/app`)
- Mapa interactivo de Santo Domingo
- Reportes en tiempo real
- Notificaciones push automáticas
- Persistencia simulada entre usuarios

## 🔧 Estructura del Proyecto

```
Ciudad Activa/
├── apps/
│   ├── landing/          # Landing page (Astro)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro    # Página principal
│   │   │   │   ├── app.astro      # Redirección a la app
│   │   │   │   └── terminos.astro # Términos y condiciones
│   │   │   └── styles/
│   │   │       └── global.css     # Estilos con Tailwind
│   │   ├── public/
│   │   │   ├── manifest.json      # PWA manifest
│   │   │   ├── sw.js              # Service Worker
│   │   │   └── *.svg              # Iconos de la app
│   │   └── package.json
│   │
│   └── web/             # Aplicación principal (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   │   ├── CityMap.tsx              # Mapa principal
│       │   │   ├── RealtimeNotifications.tsx # Notificaciones
│       │   │   └── ...
│       │   ├── hooks/
│       │   │   └── useIncidents.ts          # Hook mejorado
│       │   ├── utils/
│       │   │   └── simpleServer.ts          # Servidor simulado
│       │   └── pages/
│       │       └── HomePage.tsx             # Página principal
│       └── package.json
│
└── packages/            # Paquetes compartidos
    └── utils/constants/
        └── map-config.ts # Configuración para Santo Domingo
```

## 🌍 Configuración de Ubicación

El sistema está configurado para **Santo Domingo, República Dominicana**:

- **Centro del mapa**: 18.4861°N, 69.9312°W (Zona Colonial)
- **Zonas incluidas**: Piantini, Los Alcarrizos, Malecón, Centro
- **Coordenadas ajustadas** en todos los componentes

## 📲 Persistencia y Tiempo Real

### Servidor Simulado (`SimpleServer`)
- Simula un backend real con localStorage
- Sincronización automática cada 5 segundos
- Genera reportes de "otros usuarios" automáticamente
- Actualiza estados: pendiente → en progreso → resuelto

### Notificaciones en Tiempo Real
- Aparecen cuando llegan nuevos reportes
- Se muestran actualizaciones de estado
- Auto-desaparecen después de 8 segundos
- Funciona como app nativa cuando está instalada

## 🎨 Mejoras Visuales

- **Tailwind CSS configurado correctamente** en Astro
- **Animaciones suaves** con Framer Motion
- **Diseño responsive** optimizado para móvil
- **Efectos hover** y transiciones
- **Iconos consistentes** con Lucide React

## 🔧 Solución de Problemas

### La landing no tiene estilos
```bash
# Asegúrate de que Tailwind esté configurado
cd apps/landing
npm install @astrojs/tailwind
```

### El botón "Usar en móvil" no funciona
1. Asegúrate de que la web app esté corriendo en puerto 5173
2. El botón automáticamente detecta puertos disponibles
3. Si no funciona, aparecerán instrucciones de desarrollo

### No aparecen notificaciones en tiempo real
1. Verifica que ambos servidores estén corriendo
2. Las notificaciones aparecen automáticamente cada 5-10 segundos
3. Otorga permisos de notificación cuando lo solicite

## 📞 Contacto

- 📧 contacto@ciudadactiva.do
- 📱 +1 809 123 4567
- 🏢 Santo Domingo, República Dominicana

## 🎯 Próximos Pasos

- [ ] Integrar con backend real
- [ ] Añadir autenticación de usuarios
- [ ] Conectar con APIs gubernamentales
- [ ] Implementar geolocalización avanzada
- [ ] Añadir más tipos de reportes

---

**¡Hecho con ❤️ para mejorar Santo Domingo!** 🇩🇴
