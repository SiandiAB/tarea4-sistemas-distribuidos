<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h3>Authors Information</h3>
      This section presents information about authors.
      <table>
        <thead>
          <tr>
            <th>Author</th><th>Nationality</th><th>Birth Year</th>
            <th>Fields</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in authors" :key="author.id">
            <td>{{ author.author }}</td>
            <td>{{ author.nationality }}</td>
            <td>{{ author.birth_year }}</td>
            <td>{{ author.fields }}</td>
            <td>
              <router-link class="button" :to="'/authors/show/' + author.id">Show</router-link>
              <router-link class="button" :to="'/authors/edit/' + author.id">Edit</router-link>
              <a class="button" v-on:click="deleteAuthor(author.id)">Delete</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="notice" class="notice">{{ notice }}</p>
      <router-link class="button button-primary" to="/authors/create">New</router-link>
    </div>
  </div>
</template>

<script>
import { functionsUrl } from './api.js'

export default {
  data() {
    return {
      authors: [],
      notice: ''
    }
  },
  methods: {
    allAuthors() {
      fetch(functionsUrl + '/authors',
        { headers: { 'Accept': 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          this.authors = result;
        })
    },
    deleteAuthor(id) {
      // Eliminacion diferida: solo se envia un mensaje a la cola.
      fetch(functionsUrl + '/authorDelete/' + id, { method: 'DELETE' })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje DELETE encolado en "bookstore". ' +
            'El cambio se aplicara cuando authorTasks procese la cola.';
          this.allAuthors();
        })
    }
  },
  mounted() {
    this.allAuthors()
  }
}
</script>
