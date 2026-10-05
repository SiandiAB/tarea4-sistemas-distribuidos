import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import App from './App.vue'

import './css/normalize.css';
import './css/skeleton.css';

import Home from './Home.vue'
import BookList from './BookList.vue'
import BookDetail from './BookDetail.vue'
import AuthorList from './AuthorList.vue'
import AuthorDetail from './AuthorDetail.vue'
import PublisherList from './PublisherList.vue'
import PublisherDetail from './PublisherDetail.vue'

const routes = [
  { path: '/', component: Home },

  { path: '/books', component: BookList },
  { path: '/books/show/:id', component: BookDetail, props: { show: true } },
  { path: '/books/create', component: BookDetail, props: { create: true } },
  { path: '/books/edit/:id', component: BookDetail, props: { edit: true } },

  { path: '/authors', component: AuthorList },
  { path: '/authors/show/:id', component: AuthorDetail, props: { show: true } },
  { path: '/authors/create', component: AuthorDetail, props: { create: true } },
  { path: '/authors/edit/:id', component: AuthorDetail, props: { edit: true } },

  { path: '/publishers', component: PublisherList },
  { path: '/publishers/show/:id', component: PublisherDetail, props: { show: true } },
  { path: '/publishers/create', component: PublisherDetail, props: { create: true } },
  { path: '/publishers/edit/:id', component: PublisherDetail, props: { edit: true } },
]

// Se usa hash history para que la navegacion funcione en cualquier
// servidor estatico sin configuracion adicional de redirecciones.
const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

let app = createApp(App)

app.use(router)

app.mount('#app')
