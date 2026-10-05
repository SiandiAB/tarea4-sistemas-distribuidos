# Tarea 4 — Bookstore con actualizaciones diferidas usando RabbitMQ

Implementación de los ejercicios 1–5 de la Tarea 4 (Tutoriales 8 y 9):
actualizaciones **diferidas (asíncronas)** de libros, autores y editoriales
mediante una cola de mensajes RabbitMQ (CloudAMQP) y funciones serverless de
Netlify.

## Cómo funciona el patrón

```mermaid
flowchart LR
    F[Frontend Vue 3] -->|PUT / POST / DELETE| P[Funciones de cola<br/>bookUpdate / bookInsert / bookDelete<br/>author* / publisher*]
    P -->|mensaje JSON| Q[(Cola RabbitMQ<br/>'bookstore')]
    Q --> T[Asignador de tareas<br/>bookTasks / authorTasks / publisherTasks]
    T -->|invoca por HTTP| B[Funciones batch<br/>*UpdateBatch / *InsertBatch / *DeleteBatch]
    B --> DB[(Base de datos<br/>data/*.json)]
```

1. El frontend **no escribe la base de datos directamente**: llama a las
   funciones `bookUpdate`, `bookInsert` o `bookDelete` (y sus equivalentes de
   autores y editoriales).
2. Esas funciones **solo envían un mensaje** a la cola `bookstore` de
   RabbitMQ con el método y los datos de la operación.
3. El **asignador de tareas** (`bookTasks`, `authorTasks`, `publisherTasks`)
   lee los mensajes de la cola, los analiza y, según el método del mensaje,
   invoca la función **batch** correspondiente.
4. Las funciones batch son las que realizan el cambio real en la base de
   datos (`bookUpdateBatch`, `bookInsertBatch`, `bookDeleteBatch`, etc.).

## Estructura del proyecto

```
bookstore-rabbitmq/
├── backend/                       # Se publica en Netlify
│   ├── netlify/functions/         # Funciones serverless
│   │   ├── headersCORS.js         # Encabezados CORS compartidos
│   │   ├── rabbitMQ.js            # Conexión a CloudAMQP (amqplib)
│   │   ├── db.js                  # Persistencia (JSON) usada por los batch
│   │   ├── books.js               # Lectura de libros (lista/detalle)
│   │   ├── bookUpdate.js          # Encola mensaje UPDATE
│   │   ├── bookInsert.js          # Encola mensaje INSERT
│   │   ├── bookDelete.js          # Encola mensaje DELETE
│   │   ├── bookTasks.js           # Asignador de tareas de libros
│   │   ├── bookUpdateBatch.js     # Cambio real (UPDATE)
│   │   ├── bookInsertBatch.js     # Cambio real (INSERT)
│   │   ├── bookDeleteBatch.js     # Cambio real (DELETE)
│   │   ├── authors.js, authorUpdate.js, authorInsert.js,
│   │   │   authorDelete.js, authorTasks.js,
│   │   │   authorUpdateBatch.js, authorInsertBatch.js, authorDeleteBatch.js
│   │   └── publishers.js, publisherUpdate.js, publisherInsert.js,
│   │       publisherDelete.js, publisherTasks.js,
│   │       publisherUpdateBatch.js, publisherInsertBatch.js,
│   │       publisherDeleteBatch.js
│   ├── data/                      # "Base de datos" inicial (books, authors, publishers)
│   ├── netlify.toml
│   ├── .env.example
│   └── package.json
└── frontend/                      # Sitio estático (Vue 3 + Vite)
    ├── src/
    │   ├── api.js                 # URL del backend (funciones Netlify)
    │   ├── main.js                # Rutas
    │   ├── App.vue / Home.vue
    │   ├── BookList.vue / BookDetail.vue
    │   ├── AuthorList.vue / AuthorDetail.vue
    │   ├── PublisherList.vue / PublisherDetail.vue
    │   └── css/
    └── package.json
```

## Requisitos

- Node.js 18 o superior (requerido por `amqplib` 2.x).
- Cuenta gratuita en [CloudAMQP](https://www.cloudamqp.com).
- Cuenta en [Netlify](https://www.netlify.com) (para publicar el backend).
- (Opcional) cuenta en [BEEW](https://beew.io) para programar la ejecución
  automática de los asignadores de tareas.

---

## Paso 1 — Cuenta en CloudAMQP y cola `bookstore`

1. Cree una cuenta en CloudAMQP e inicie sesión.
2. Cree una nueva instancia con el plan gratuito **Little Lemur**.
3. Abra la instancia y copie el **AMQP URL** (lo usará en el paso 2).
4. Haga clic en el botón **Rabbit Manager**.
5. En la pestaña **Queues** cree una cola llamada `bookstore`.
   (La función `rabbitMQ.js` también la crea automáticamente si no existe,
   pero la tarea pide crearla manualmente y usarla para verificar los
   mensajes.)

En esta pantalla podrá ver la cantidad de mensajes encolados y confirmar
que las funciones `bookUpdate`, `bookInsert` y `bookDelete` efectivamente
dejan sus mensajes en la cola (punto 1 de la tarea).

## Paso 2 — Variables de entorno

En `backend/` copie `.env.example` a `.env` y complete:

```bash
CLOUDAMQP_URL=amqps://usuario:contrasena@host/vhost   # su AMQP URL
APP_URL=http://localhost:8888                          # desarrollo local
RABBIT_TRANSPORT=amqp                                  # o "http"
```

> `netlify dev` carga automaticamente las variables de `.env`.
>
> **Transporte**: `RABBIT_TRANSPORT=amqp` usa `amqplib` sobre el puerto
> 5671 (el del tutorial, ideal para Netlify/produccion). Si su red local
> bloquea los puertos AMQP (5671/5672/etc.), use
> `RABBIT_TRANSPORT=http`, que publica y lee mensajes mediante la API HTTP
> de gestion de RabbitMQ sobre el puerto 443 (HTTPS), disponible en todas
> las instancias de CloudAMQP. La cola `bookstore` y el patron de la tarea
> funcionan identico con ambos transportes.

## Paso 3 — Ejecución local

Terminal 1 (backend, en `backend/`):

```bash
npm install
npm run dev
```

Las funciones quedan disponibles en `http://localhost:8888/.netlify/functions/...`

> Alternativa más ligera (sin instalar netlify-cli): `node dev-server.js`.
> Este emulador local sirve las mismas funciones bajo
> `/.netlify/functions/<nombre>` y carga las variables de `.env`.

Terminal 2 (frontend, en `frontend/`):

```bash
npm install
npm run dev
```

Abra `http://localhost:5050`. El frontend apunta por defecto a
`http://localhost:8888` (configurable con `VITE_BACKEND_URL`).

## Paso 4 — Publicación

### Backend en Netlify (punto 4 de la tarea)

1. Suba la carpeta `backend/` a un repositorio de Git.
2. En Netlify: **Add new site → Import an existing project** y elija el repo.
3. Configure el **Base directory** como `backend` (si el repo contiene ambas
   carpetas), el build command como `npm run build` (o déjelo vacío) y el
   publish directory como `backend` también. Solo importan las funciones:
   Netlify las detecta en `netlify/functions`.
4. En **Site configuration → Environment variables** agregue:
   - `CLOUDAMQP_URL` = su AMQP URL.
   - `APP_URL` = `https://<su-sitio>.netlify.app`.

### Frontend en un hosting estático

Compile indicando la URL pública del backend:

```bash
cd frontend
VITE_BACKEND_URL=https://<su-sitio>.netlify.app npm run build
```

Publique la carpeta `frontend/dist` en GitHub Pages, Netlify o Vercel
(un drag & drop en Netlify Drop basta). Recuerde: **solo el backend va en
Netlify**; el frontend puede vivir en cualquier hosting estático.

## Paso 5 — Prueba manual del flujo completo (punto 5 de la tarea)

1. En el frontend, abra **Books → Edit** sobre un libro, cambie un dato y
   presione **Update**.
2. Abra el **Rabbit Manager** de CloudAMQP → pestaña **Queues**: verifique
   que la cola `bookstore` ahora tiene **1 mensaje encolado**
   (el mensaje `UPDATE` enviado por `bookUpdate`).
3. Confirme que el libro **aún no cambió**: `books` sigue mostrando los datos
   viejos, porque nadie ha procesado la cola.
4. Invoque manualmente el asignador de tareas:
   - En producción: abra en el navegador
     `https://<su-sitio>.netlify.app/.netlify/functions/bookTasks`
   - En local: `curl http://localhost:8888/.netlify/functions/bookTasks`
5. Vuelva a la lista de libros y verifique que el cambio **ya se refleja**:
   `bookTasks` leyó el mensaje, invocó a `bookUpdateBatch` y este aplicó la
   actualización real.

Puede repetir el flujo para autores (`authorTasks`) y editoriales
(`publisherTasks`).

### Programación automática (opcional)

Netlify no ejecuta tareas en intervalos de tiempo. Con una cuenta gratuita de
[BEEW](https://beew.io) cree un "Schedule Request" que invoque cada 30
minutos:

- `https://<su-sitio>.netlify.app/.netlify/functions/bookTasks`
- `https://<su-sitio>.netlify.app/.netlify/functions/authorTasks`
- `https://<su-sitio>.netlify.app/.netlify/functions/publisherTasks`

## ¿Por qué el mensaje debe ser un JSON válido (con comillas dobles)?

El mensaje se construye con `JSON.stringify(...)`, lo que produce un texto
JSON válido con **comillas dobles**:

```json
{"method":"UPDATE","id":1,"book":{"title":"..."}}
```

El asignador de tareas reconstruye el objeto con:

```js
const request = JSON.parse(message.content.toString());
```

`JSON.parse` sigue la especificación JSON, que solo acepta comillas dobles
para delimitar nombres y valores de texto. Si el mensaje se armara "a mano"
con comillas simples (por ejemplo `{'method':'UPDATE'}`), no sería JSON
válido y `JSON.parse` lanzaría una excepción, por lo que `bookTasks` no
podría reconstruir el objeto ni saber qué operación batch invocar. Por eso
se usa siempre `JSON.stringify` al publicar y `JSON.parse` al consumir.

## Notas

- Las funciones batch usan archivos JSON en `data/` como almacenamiento,
  igual que los tutoriales iniciales del curso. En producción real conviene
  sustituir `db.js` por una base de datos (MongoDB o SQL, como indican los
  tutoriales T8/T9): las funciones batch son las únicas que tocan el
  almacenamiento, así que el cambio es localizado.
- Todos los mensajes de las tres entidades comparten la cola `bookstore`;
  cada asignador de tareas solo procesa las operaciones de su entidad
  (el `switch` distingue el método y las funciones batch de cada entidad son
  distintas).
- `channel.get("bookstore", { noAck: true })` lee y elimina el mensaje de la
  cola. La confirmación automática (`noAck`) simplifica el tutorial; en
  producción conviene confirmar (`ack`) solo tras aplicar el cambio.
