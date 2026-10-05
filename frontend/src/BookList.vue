<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h3>Books Information</h3>
      This section presents information about books.
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Edition</th><th>Copyright</th>
            <th>Author</th><th>Publisher</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.title }}</td>
            <td>{{ book.edition }}</td>
            <td>{{ book.copyright }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.publisher }}</td>
            <td>
              <router-link class="button" :to="'/books/show/' + book.id">Show</router-link>
              <router-link class="button" :to="'/books/edit/' + book.id">Edit</router-link>
              <a class="button" v-on:click="deleteBook(book.id)">Delete</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="notice" class="notice">{{ notice }}</p>
      <router-link class="button button-primary" to="/books/create">New</router-link>
    </div>
  </div>
</template>

<script>
import { functionsUrl } from './api.js'

export default {
  data() {
    return {
      books: [],
      notice: ''
    }
  },
  methods: {
    allBooks() {
      fetch(functionsUrl + '/books',
        { headers: { 'Accept': 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          this.books = result;
        })
    },
    deleteBook(id) {
      // La eliminacion es diferida: solo se envia un mensaje a la cola.
      fetch(functionsUrl + '/bookDelete/' + id, { method: 'DELETE' })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje DELETE encolado en "bookstore". ' +
            'El cambio se aplicara cuando bookTasks procese la cola.';
          this.allBooks();
        })
    }
  },
  mounted() {
    this.allBooks()
  }
}
</script>
