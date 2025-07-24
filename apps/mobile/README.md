# Ciudad Activa - App Móvil

La aplicación móvil nativa de Ciudad Activa construida con React Native y Expo. Incluye todas las funcionalidades de la web app optimizadas para dispositivos móviles.

## 🚀 Funcionalidades

### Core Features
- **Mapa Interactivo**: Visualización de incidentes en tiempo real con Mapbox
- **Reportar Incidentes**: Interfaz touch-friendly para reportar problemas urbanos
- **Geolocalización**: Ubicación automática y navegación optimizada para móvil
- **Notificaciones Push**: Alertas en tiempo real sobre incidentes
- **Modo Offline**: Funcionalidad básica sin conexión a internet

### Características Móviles
- **Long Press**: Mantén presionado el mapa para reportar un incidente
- **Gestos Touch**: Navegación intuitiva con gestos nativos
- **Panel Deslizante**: Detalles de incidentes en panel deslizable
- **Animaciones Fluidas**: Transiciones suaves entre pantallas
- **Diseño Responsivo**: Optimizado para diferentes tamaños de pantalla

### Tipos de Incidentes
- 🕳️ **Baches**: Problemas en pavimento
- 💡 **Alumbrado**: Fallas en iluminación pública
- 🗑️ **Basura**: Problemas de limpieza urbana
- 🚦 **Semáforos**: Fallas en semáforos
- 💧 **Agua**: Fugas y problemas de agua
- 🚧 **Vialidad**: Problemas de tránsito

## 📱 Instalación y Desarrollo

### Prerrequisitos
```bash
# Instalar Expo CLI
npm install -g expo-cli

# O usar npx (recomendado)
npx expo-cli
```

### Desarrollo Local
```bash
# Desde la raíz del proyecto
cd apps/mobile

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm start

# Para dispositivos específicos
pnpm run android  # Android
pnpm run ios      # iOS
pnpm run web      # Web (para pruebas)
```

### Probar en Dispositivo
1. **Instala Expo Go** en tu dispositivo móvil
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Escanea el QR** que aparece en la terminal o en el navegador

3. **¡Listo!** La app se cargará en tu dispositivo

## 🏗️ Arquitectura

### Estructura de Archivos
```
apps/mobile/
├── App.tsx                 # Punto de entrada principal
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── AppHeader.tsx
│   │   ├── IncidentFormModal.tsx
│   │   ├── IncidentDetailsPanel.tsx
│   │   ├── MapLegend.tsx
│   │   └── RealtimeNotifications.tsx
│   ├── screens/           # Pantallas principales
│   │   └── CityMapScreen.tsx
│   └── navigation/        # Configuración de navegación
├── package.json
└── app.config.js         # Configuración de Expo
```

### Dependencias Principales
- **React Native**: Framework base
- **Expo**: Plataforma de desarrollo
- **React Navigation**: Navegación entre pantallas
- **React Native Maps**: Mapas nativos
- **Workspace Packages**: Compartidos con web app
  - `@ciudad-activa/types`: Tipos TypeScript
  - `@ciudad-activa/incidents`: Lógica de incidentes
  - `@ciudad-activa/maps`: Utilidades de mapas

## 🎨 Diseño y UX

### Principios de Diseño
- **Mobile First**: Diseñado específicamente para móviles
- **Touch Friendly**: Botones y áreas touch optimizadas
- **Gestos Intuitivos**: Long press, swipe, pinch-to-zoom
- **Feedback Haptic**: Vibración para acciones importantes
- **Dark Mode Ready**: Soporte para modo oscuro

### Patrones de Interacción
- **Long Press en Mapa**: Reportar incidente
- **Tap en Marcador**: Ver detalles
- **Swipe Up**: Panel de detalles
- **Pull to Refresh**: Actualizar datos
- **Floating Action Button**: Acciones rápidas

## 🚀 Despliegue

### Build para Producción
```bash
# Build optimizado
pnpm run build

# Generar APK (Android)
expo build:android

# Generar IPA (iOS)
expo build:ios
```

### Distribución
- **Expo Go**: Para desarrollo y testing
- **Standalone Apps**: APK/IPA para distribución
- **App Stores**: Publicación en tiendas oficiales
- **OTA Updates**: Actualizaciones over-the-air

## 🔧 Configuración

### Variables de Entorno
```bash
# En .env
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
EXPO_PUBLIC_API_URL=https://api.ciudad-activa.com
```

### app.config.js
```javascript
export default {
  expo: {
    name: "Ciudad Activa",
    slug: "ciudad-activa",
    platforms: ["ios", "android", "web"],
    // ... más configuración
  },
};
```

## 🧪 Testing

### Testing en Desarrollo
```bash
# Lint del código
pnpm run lint

# Type checking
pnpm run type-check

# Testing con Jest (cuando se configure)
pnpm test
```

### Testing en Dispositivos
- **Expo Go**: Testing rápido en dispositivo real
- **Simuladores**: iOS Simulator, Android Emulator
- **Device Testing**: Testing en múltiples dispositivos

## 📊 Monitoreo y Analytics

### Métricas Importantes
- **Crash Reports**: Errores de la aplicación
- **Performance**: Tiempo de carga, FPS
- **User Engagement**: Tiempo en app, acciones
- **Feature Usage**: Funcionalidades más usadas

### Tools Integrados
- **Expo Analytics**: Métricas básicas
- **Crashlytics**: Reporte de errores
- **Performance Monitoring**: Rendimiento

## 🤝 Contribución

### Desarrollo
1. Fork el repositorio
2. Crea una branch: `git checkout -b feature/nueva-funcionalidad`
3. Desarrolla la funcionalidad
4. Prueba en dispositivo móvil
5. Crea un Pull Request

### Guidelines
- Seguir convenciones de React Native
- Probar en iOS y Android
- Documentar cambios importantes
- Optimizar para performance móvil

## 📚 Recursos

### Documentación
- [React Native](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

### Comunidad
- [React Native Community](https://github.com/react-native-community)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

**Nota**: Esta app móvil comparte la misma funcionalidad core que la web app, pero está optimizada específicamente para la experiencia móvil con gestos touch, notificaciones push y funcionalidades offline.
