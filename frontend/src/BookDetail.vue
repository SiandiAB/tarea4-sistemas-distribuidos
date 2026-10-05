<template>
  <div class="row">
    <div class="eleven columns" style="margin-top: 5%">
      <h3>Book Data</h3>
      <form>
        <div class="row">
          <div class="six columns">
            <label for="titleInput">Title</label>
            <input class="u-full-width" type="text" id="titleInput" v-model="book.title">
          </div>
          <div class="six columns">
            <label for="editionInput">Edition</label>
            <input class="u-full-width" type="text" id="editionInput" v-model="book.edition">
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="copyrightInput">Copyright</label>
            <input class="u-full-width" type="number" id="copyrightInput" v-model="book.copyright">
          </div>
          <div class="six columns">
            <label for="languageInput">Language</label>
            <input class="u-full-width" type="text" id="languageInput" v-model="book.language">
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="authorInput">Author</label>
            <input class="u-full-width" type="text" id="authorInput" v-model="book.author">
          </div>
          <div class="six columns">
            <label for="publisherInput">Publisher</label>
            <input class="u-full-width" type="text" id="publisherInput" v-model="book.publisher">
          </div>
        </div>
        <p v-if="notice" class="notice">{{ notice }}</p>
        <router-link class="button button-primary" to="/books">Back</router-link>
        <a v-if="edit" class="button button-primary" v-on:click="updateBook()">Update</a>
        <a v-if="create" class="button button-primary" v-on:click="createBook()">Create</a>
      </form>
    </div>
  </div>
</template>

<script>
import { functionsUrl } from './api.js'

export default {
  props: ['create', 'edit', 'show'],
  data() {
    return {
      notice: '',
      book: {
        title: '', edition: '', copyright: '',
        language: '', author: '', publisher: ''
      }
    }
  },
  created() {
    if (this.$route.params.id) {
      this.findBook(this.$route.params.id);
    }
  },
  methods: {
    findBook(id) {
      fetch(functionsUrl + '/books/' + id,
        { headers: { 'Accept': 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          this.book = result;
        })
    },
    updateBook() {
      const id = this.$route.params.id;
      // Actualizacion diferida: envia el mensaje a la cola via bookUpdate.
      fetch(functionsUrl + '/bookUpdate/' + id,
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(this.book)
        })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje UPDATE encolado en "bookstore". ' +
            'El cambio se aplicara cuando se invoque bookTasks.';
          setTimeout(() => this.$router.push('/books'), 1800);
        })
    },
    createBook() {
      // Creacion diferida: envia el mensaje a la cola via bookInsert.
      fetch(functionsUrl + '/bookInsert',
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(this.book)
        })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje INSERT encolado en "bookstore". ' +
            'El registro se creara cuando se invoque bookTasks.';
          setTimeout(() => this.$router.push('/books'), 1800);
        })
    }
  }
}
</script>
