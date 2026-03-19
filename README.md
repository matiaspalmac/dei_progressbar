# dei_progressbar

Sistema de barras de progreso universal para FiveM - Dei Ecosystem.

## Estilos disponibles

- **Linear** - Barra horizontal centrada en la parte inferior de la pantalla
- **Circular** - Barra radial SVG centrada en la pantalla
- **Mini** - Barra compacta en la esquina inferior derecha
- **Semicircle** - Arco semicircular en la parte inferior

## Instalacion

1. Colocar `dei_progressbar` en tu carpeta de resources
2. Agregar `ensure dei_progressbar` en tu `server.cfg`
3. (Opcional) Si usas `dei_hud`, los temas se sincronizan automaticamente

## Uso (Exports)

### Linear
```lua
local completado = exports['dei_progressbar']:Linear(5000, 'Reparando vehiculo...', {
    color = '#3b82f6',
    canCancel = true,
    anim = { dict = 'mini@repair', clip = 'fixing_a_player' },
    prop = { model = 'prop_tool_wrench', bone = 57005, offset = vec3(0.1, 0.02, 0.04), rot = vec3(-90.0, 0.0, 0.0) },
    freeze = true,
    disableActions = true,
})

if completado then
    print('Reparacion completada')
else
    print('Reparacion cancelada')
end
```

### Circular
```lua
local ok = exports['dei_progressbar']:Circular(3000, 'Hackeando...', {
    icon = 'lock',
    color = '#ef4444',
    canCancel = false,
})
```

### Mini
```lua
local ok = exports['dei_progressbar']:Mini(10000, 'Descargando...', {
    color = '#4ade80',
    canCancel = true,
})
```

### Semicircle
```lua
local ok = exports['dei_progressbar']:Semicircle(4000, 'Pescando...', {
    color = '#fbbf24',
    canCancel = true,
})
```

### Cancelar / Verificar
```lua
exports['dei_progressbar']:Cancel()
local activo = exports['dei_progressbar']:IsActive()
```

## Opciones disponibles

| Opcion | Tipo | Descripcion |
|--------|------|-------------|
| `color` | string | Color hex del progreso |
| `canCancel` | boolean | Permitir cancelar (default: true en linear, false en otros) |
| `cancelKey` | string | Tecla para cancelar (default: 'x') |
| `anim` | table | `{ dict, clip, flag }` - Animacion durante el progreso |
| `prop` | table | `{ model, bone, offset, rot }` - Prop adjunto durante el progreso |
| `freeze` | boolean | Congelar al jugador durante el progreso |
| `disableActions` | boolean | Deshabilitar disparar, correr, saltar durante el progreso |
| `icon` | string | Icono dentro del circulo (solo circular): wrench, lock, gear, heart, etc |

## Temas

Se sincroniza automaticamente con `dei_hud` via KVP `dei_hud_prefs` y evento `dei:themeChanged`.

Temas soportados: `dark`, `midnight`, `neon`, `minimal` + modo claro.

## Dependencias

Ninguna. Recurso standalone.

## Licencia

MIT License - Dei
