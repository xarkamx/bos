### Commands

| Command | Description                                          |
| ------- | ---------------------------------------------------- |
| local   | run a docker container and the nodejs process of BOS |
| dev     | run the node process of BOS                          |
| test    | run the cucumber tests of BOS                        |

# Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

* Node.js (v20.x or later)
* Yarn (v1.x or later)
* MariaDB or MySQL
* Git

## Clone the Repository

First, clone the repository to your local machine:

**git** **clone** **https://github.com/your-username/your-repo.git**

**cd** **your-repo**

## Install Dependencies

Install the required dependencies using Yarn:

**yarn** **install**

## Configure Environment Variables

Create a file:///c%3A/wamp64/www/bos/.env file in the root directory of your project and add the following environment variables. Replace the placeholders with your actual values:

```.env
APP_ENV={{APP_ENV}}
PORT={{PORT}}
SERVER_HOSTNAME={{SERVER_HOSTNAME}}
JWT_SECRET={{JWT_SECRET}}

DB_CONNECTION={{DB_CONNECTION}}
DB_HOST={{DB_HOST}}
DB_PORT={{DB_PORT}}
DB_DATABASE={{DB_DATABASE}}
DB_USERNAME={{DB_USERNAME}}
DB_PASSWORD={{DB_PASSWORD}}

BAS_URL={{BAS_URL}}
BAS_SUPER_ADMIN_TOKEN={{BAS_SUPER_ADMIN_TOKEN}}
BAS_COMPANY={{BAS_COMPANY}}

FACTURAPI_KEY={{FACTURAPI_KEY}}

MAIL_URL={{MAIL_URL}}

SMTP_HOST={{SMTP_HOST}}
SMTP_PORT={{SMTP_PORT}}
SMTP_USER={{SMTP_USER}}
SMTP_PASSWORD={{SMTP_PASSWORD}}
```


## Set Up the Database

Ensure your database is running and create a new database with the name specified in the `DB_DATABASE` environment variable.

Run the database migrations to set up the necessary tables:

**yarn** **migrate**

## Start the Application

Start the application using the following command:

**yarn** **dev**

The application should now be running at `http://127.0.0.1:8000`.

## Running Tests

To run the tests, use the following command:

**yarn** **test**

## Formatting and Linting

To format the code, use:

**yarn** **format**

To lint the code, use:

**yarn** **lint**

## Type Checking

To run TypeScript type checks, use:

**yarn** **typecheck**

## Additional Notes

* Ensure you have configured your SMTP settings correctly to enable email notifications.
* Replace all placeholder values in the file:///c%3A/wamp64/www/bos/.env file with your actual configuration values.

## Conclusion

You should now have a basic understanding of how to set up and run your project. For more detailed information, refer to the project's documentation or source code.


### TODO

1. [ ] Ordenes especiales
2. [X] Capacidad para eliminar ordenes
3. [ ] Capa de tutorial global
4. [X] Capacidad de eliminar pagos
5. [X] Registro de clientes
6. [X] Capacidad para registrar inventario
7. [X] Capacidad para crear recetas por producto
8. [X] Capacidad para registrar materiales
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
