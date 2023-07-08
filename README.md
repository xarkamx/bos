### Commands

| Command | Description                                          |
| ------- | ---------------------------------------------------- |
| local   | run a docker container and the nodejs process of BOS |
| dev     | run the node process of BOS                          |
| test    | run the cucumber tests of BOS                        |

### ToDo

1. [ ] Ordenes especiales
2. [X] Capacidad para eliminar ordenes
3. [ ] Capa de tutorial global
4. [X] Capacidad de eliminar pagos
5. [X] Registro de clientes
6. [X] Capacidad para registrar inventario
7. [ ] Capacidad para crear recetas por producto
8. [ ] Capacidad para registrar materiales
9. [X] Api Docs endpoint (JSON)
1. [X] Pruebas de integracion con Cucumber
     1. [X] Instalar docker
     2. [ ] Reiniciar DB entre pruebas
     3. [X] Generar seed con valores  iniciales.
     4. [ ] clonador de db
     5. [ ] Generador de pruebas en base a errores 500 registrados.
     6. [ ] Desactivar sistemas de usuarios en pruebas (?)
1. [ ] Agregar testing step en github actions (?)
1. [X] Vincular con sistema de usuarios
     1. [ ] Como testear un sistema externo de usuarios?
     2. [X] Crea interfaz en caso de que tengas que cambiar de manejador de usuarios.
1. [X] Vincular con sistema de facturas
     1. [ ] Como testear un sistema externo de facturas?
     2. [X] Crea interfaz en caso de que tengas que cambiar de API
1. [ ] Vincular con sistema de archivos
     1. [ ] Debera ser capaz de manejar multiples tipos de archivos al mismo tiempo.
     2. [ ] Crea interfaz en caso de que tengas que cambiar de manejador de archivos.
