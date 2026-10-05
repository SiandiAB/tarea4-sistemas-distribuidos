<template>
  <div class="row">
    <div class="eleven columns" style="margin-top: 5%">
      <h3>Author Data</h3>
      <form>
        <div class="row">
          <div class="six columns">
            <label for="authorInput">Author</label>
            <input class="u-full-width" type="text" id="authorInput" v-model="author.author">
          </div>
          <div class="six columns">
            <label for="nationalityInput">Nationality</label>
            <input class="u-full-width" type="text" id="nationalityInput" v-model="author.nationality">
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="birthInput">Birth Year</label>
            <input class="u-full-width" type="number" id="birthInput" v-model="author.birth_year">
          </div>
          <div class="six columns">
            <label for="fieldsInput">Fields</label>
            <input class="u-full-width" type="text" id="fieldsInput" v-model="author.fields">
          </div>
        </div>
        <p v-if="notice" class="notice">{{ notice }}</p>
        <router-link class="button button-primary" to="/authors">Back</router-link>
        <a v-if="edit" class="button button-primary" v-on:click="updateAuthor()">Update</a>
        <a v-if="create" class="button button-primary" v-on:click="createAuthor()">Create</a>
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
      author: {
        author: '', nationality: '', birth_year: '', fields: ''
      }
    }
  },
  created() {
    if (this.$route.params.id) {
      this.findAuthor(this.$route.params.id);
    }
  },
  methods: {
    findAuthor(id) {
      fetch(functionsUrl + '/authors/' + id,
        { headers: { 'Accept': 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          this.author = result;
        })
    },
    updateAuthor() {
      const id = this.$route.params.id;
      // Actualizacion diferida: envia el mensaje a la cola via authorUpdate.
      fetch(functionsUrl + '/authorUpdate/' + id,
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(this.author)
        })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje UPDATE encolado en "bookstore". ' +
            'El cambio se aplicara cuando se invoque authorTasks.';
          setTimeout(() => this.$router.push('/authors'), 1800);
        })
    },
    createAuthor() {
      // Creacion diferida: envia el mensaje a la cola via authorInsert.
      fetch(functionsUrl + '/authorInsert',
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(this.author)
        })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje INSERT encolado en "bookstore". ' +
            'El registro se creara cuando se invoque authorTasks.';
          setTimeout(() => this.$router.push('/authors'), 1800);
        })
    }
  }
}
</script>
