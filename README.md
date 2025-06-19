# Ciudad Activa 🏙️

Plataforma de reporte de incidencias urbanas construida con React, React Native, TypeScript y Mapbox.

## Arquitectura

### Apps
- **web**: Aplicación web principal (React + Vite)
- **mobile**: Aplicación móvil (React Native + Expo)
- **landing**: Página de aterrizaje (Astro)

### Packages
- **ui**: Componentes UI reutilizables
- **maps**: Lógica de mapas con Mapbox
- **incidents**: Gestión de incidencias
- **storage**: Manejo de localStorage
- **types**: Tipos TypeScript compartidos
- **utils**: Utilidades compartidas

## Desarrollo

### Prerrequisitos
- Node.js 18+
- PNPM 8+

### Instalación
```bash
pnpm install
```

### Scripts
```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Tests
pnpm test
```

## Estructura del Proyecto

```
ciudad-activa/
├── apps/
│   ├── web/           # App web React
│   ├── mobile/        # App React Native
│   └── landing/       # Landing Astro
├── packages/
│   ├── ui/            # Componentes UI
│   ├── maps/          # Lógica Mapbox
│   ├── incidents/     # Gestión incidencias
│   ├── storage/       # localStorage
│   ├── types/         # Tipos TypeScript
│   └── utils/         # Utilidades
└── tools/
    ├── eslint-config/ # Configuración ESLint
    ├── tsconfig/      # Configuración TypeScript
    └── scripts/       # Scripts automatización
```

## Tecnologías

- **Frontend**: React, TypeScript, Vite
- **Mobile**: React Native, Expo
- **Landing**: Astro
- **Mapas**: Mapbox GL JS
- **Monorepo**: Turborepo, PNPM Workspaces
- **Styling**: Tailwind CSS
- **Almacenamiento**: localStorage

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT
