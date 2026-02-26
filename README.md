# 🌸 SistemaPacientes · Frontend React

Frontend completo para el sistema de gestión ginecológica, construido con **React + Vite**.

## 🚀 Instalación y uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar el backend
El frontend hace proxy automático hacia `http://localhost:8080`.
Asegúrate que tu backend Spring Boot esté corriendo en ese puerto.

### 3. Configurar CORS en Spring Boot
Agrega esto en tu `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("*"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

Y en tu `SecurityConfig`, agrega `.cors(Customizer.withDefaults())` en el `SecurityFilterChain`.

### 4. Levantar el frontend
```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── Layout.jsx        # Sidebar + navegación principal
│   ├── Modal.jsx         # Componente modal reutilizable
│   └── UI.jsx            # Botones, badges, tablas, campos, etc.
├── context/
│   ├── AuthContext.jsx   # Manejo de autenticación JWT
│   └── ToastContext.jsx  # Notificaciones toast
├── pages/
│   ├── LoginPage.jsx     # Login + Registro
│   ├── Dashboard.jsx     # Estadísticas y resumen
│   ├── Pacientes.jsx     # CRUD pacientes
│   ├── Citas.jsx         # Gestión de citas
│   └── Historial.jsx     # Historial médico
├── services/
│   └── api.js            # Llamadas a la API REST
└── styles/
    └── global.css        # Variables CSS y estilos globales
```

## 🔌 Endpoints usados

| Método | Ruta                        | Descripción              |
|--------|-----------------------------|--------------------------|
| POST   | /api/auth/login             | Iniciar sesión           |
| POST   | /api/auth/registro          | Registrar usuario        |
| GET    | /api/pacientes              | Listar pacientes         |
| POST   | /api/pacientes              | Crear paciente           |
| PUT    | /api/pacientes/{id}         | Actualizar paciente      |
| DELETE | /api/pacientes/{id}         | Eliminar paciente        |
| GET    | /api/citas                  | Listar citas             |
| POST   | /api/citas                  | Crear cita               |
| DELETE | /api/citas/{id}             | Eliminar cita            |
| GET    | /api/historial              | Listar historial         |
| POST   | /api/historial              | Crear registro           |
| DELETE | /api/historial/{id}         | Eliminar registro        |

> ⚠️ Los controladores de Citas e Historial estaban vacíos en el código backend. Necesitarás implementarlos siguiendo el patrón del `PacienteController`.
"# sistema-pacientes-frontend" 
