# Web-Gestion-TEC - Sistema de Gestión Académica

## Arquitectura MVC

Este proyecto utiliza una arquitectura MVC (Model-View-Controller) con PHP puro y una API REST.

### Estructura del Proyecto

```
Web-Gestion-TEC/
├── app/                          # Lógica de aplicación
│   ├── controllers/              # Controladores de la API
│   ├── models/                   # Modelos de datos
│   ├── views/                    # Vistas HTML
│   └── middleware/               # Middleware de autenticación
├── config/                       # Archivos de configuración
│   └── Database.php              # Configuración de base de datos
├── public/                       # Punto de entrada público
│   ├── index.php                 # API REST unificada
│   ├── assets/                   # Recursos estáticos
│   │   ├── css/                  # Hojas de estilo
│   │   └── js/                   # Scripts JavaScript
│   └── .htaccess                 # Configuración Apache
├── .htaccess                     # Redirección a public/
└── README.md                     # Este archivo
```

## Requisitos del Sistema

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- XAMPP (Apache, MySQL, PHP)
- Visual Studio Code
- Git

## Guía de Instalación

### 1. Instalar XAMPP

1. Ve al sitio web oficial de XAMPP: [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Descarga la versión más reciente para tu sistema operativo (Windows, macOS, Linux)
3. Ejecuta el instalador descargado
4. Sigue las instrucciones del asistente de instalación
5. Asegúrate de instalar Apache, MySQL y PHP
6. Una vez instalado, inicia XAMPP Control Panel como administrador

### 2. Instalar Visual Studio Code

1. Ve al sitio web oficial: [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Descarga Visual Studio Code para tu sistema operativo
3. Ejecuta el instalador
4. Sigue las instrucciones de instalación
5. Una vez instalado, abre Visual Studio Code

### 3. Instalar Git (si no lo tienes instalado)

#### Para Windows:
1. Ve a [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Descarga la versión más reciente
3. Ejecuta el instalador
4. Acepta las configuraciones por defecto durante la instalación

#### Para macOS:
\`\`\`bash
# Usando Homebrew (recomendado)
brew install git

# O descarga desde: https://git-scm.com/download/mac
\`\`\`

#### Para Linux (Ubuntu/Debian):
\`\`\`bash
sudo apt update
sudo apt install git
\`\`\`

### 4. Verificar la instalación de Git

Abre una terminal o símbolo del sistema y ejecuta:
\`\`\`bash
git --version
\`\`\`

## Configuración del Proyecto

### 1. Crear la carpeta del proyecto

** IMPORTANTE:** El proyecto debe clonarse en la siguiente ruta específica:

\`\`\`
C:\xampp\htdocs\NahimWeb
\`\`\`

Nota: Debes buscar la carpeta xampp, luego htdocs y crear dentro la carpeta NahimWeb o el nombre que gustes darle.
### 2. Abrir Visual Studio Code

1. Abre Visual Studio Code
2. Ve a `File` → `Open Folder` (o presiona `Ctrl + K, Ctrl + O`)
3. Navega hasta `C:\xampp\htdocs\`
4. Crea una nueva carpeta llamada `NahimWeb` si no existe
5. Selecciona la carpeta `NahimWeb` y haz clic en "Seleccionar carpeta"

### 3. Clonar el repositorio

Una vez que tengas Visual Studio Code abierto con la carpeta `NahimWeb`:

#### Opción 1: Usando la terminal integrada de VS Code
1. Abre la terminal integrada: `View` → `Terminal` (o presiona `Ctrl + `Ñ`)
2. Asegúrate de estar en la ruta correcta: `C:\xampp\htdocs\NahimWeb`
3. Ejecuta el siguiente comando:

\`\`\`bash
git clone https://github.com/CarlosGonzalez7u7/Web-Gestion-TEC.git .
\`\`\`

**Nota:** El punto (.) al final es importante, clona el contenido directamente en la carpeta actual.

#### Opción 2: Usando la interfaz de VS Code
1. Presiona `Ctrl + Shift + P` para abrir la paleta de comandos
2. Escribe "Git: Clone" y selecciona la opción
3. Pega la URL del repositorio: `https://github.com/CarlosGonzalez7u7/Web-Gestion-TEC.git`
4. Selecciona la carpeta `C:\xampp\htdocs\NahimWeb` como destino

## 🔧 Configuración de XAMPP

1. Abre XAMPP Control Panel
2. Inicia los servicios de **Apache** y **MySQL**
3. Verifica que ambos servicios estén corriendo (aparecerán en verde)

## Acceder al Proyecto

Una vez que hayas clonado el proyecto y XAMPP esté corriendo:

1. Abre tu navegador web
2. Ve a: `http://localhost/NahimWeb`
3. Deberías ver tu proyecto funcionando

## Notas Importantes

- **Ruta obligatoria:** El proyecto DEBE estar en `C:\xampp\htdocs\NahimWeb`
- Asegúrate de que Apache y MySQL estén corriendo en XAMPP antes de acceder al proyecto
- Si encuentras problemas, verifica que los puertos 80 (Apache) y 3306 (MySQL) no estén siendo usados por otros programas

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Soporte

Si tienes problemas con la instalación o configuración, por favor:

1. Verifica que hayas seguido todos los pasos correctamente
2. Asegúrate de que la ruta del proyecto sea exactamente: `C:\xampp\htdocs\NahimWeb`
3. Confirma que XAMPP esté corriendo correctamente

---

**Desarrollado por:** Juancho  
**Repositorio:** [https://github.com/CarlosGonzalez7u7/Web-Gestion-TEC](https://github.com/CarlosGonzalez7u7/Web-Gestion-TEC)
