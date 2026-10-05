<template>
  <div class="row">
    <div class="eleven columns" style="margin-top: 5%">
      <h3>Publisher Data</h3>
      <form>
        <div class="row">
          <div class="six columns">
            <label for="publisherInput">Publisher</label>
            <input class="u-full-width" type="text" id="publisherInput" v-model="publisher.publisher">
          </div>
          <div class="six columns">
            <label for="countryInput">Country</label>
            <input class="u-full-width" type="text" id="countryInput" v-model="publisher.country">
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="foundedInput">Founded</label>
            <input class="u-full-width" type="number" id="foundedInput" v-model="publisher.founded">
          </div>
          <div class="six columns">
            <label for="genereInput">Genere</label>
            <input class="u-full-width" type="text" id="genereInput" v-model="publisher.genere">
          </div>
        </div>
        <p v-if="notice" class="notice">{{ notice }}</p>
        <router-link class="button button-primary" to="/publishers">Back</router-link>
        <a v-if="edit" class="button button-primary" v-on:click="updatePublisher()">Update</a>
        <a v-if="create" class="button button-primary" v-on:click="createPublisher()">Create</a>
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
      publisher: {
        publisher: '', country: '', founded: '', genere: ''
      }
    }
  },
  created() {
    if (this.$route.params.id) {
      this.findPublisher(this.$route.params.id);
    }
  },
  methods: {
    findPublisher(id) {
      fetch(functionsUrl + '/publishers/' + id,
        { headers: { 'Accept': 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          this.publisher = result;
        })
    },
    updatePublisher() {
      const id = this.$route.params.id;
      // Actualizacion diferida: envia el mensaje a la cola via publisherUpdate.
      fetch(functionsUrl + '/publisherUpdate/' + id,
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'PUT',
          body: JSON.stringify(this.publisher)
        })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje UPDATE encolado en "bookstore". ' +
            'El cambio se aplicara cuando se invoque publisherTasks.';
          setTimeout(() => this.$router.push('/publishers'), 1800);
        })
    },
    createPublisher() {
      // Creacion diferida: envia el mensaje a la cola via publisherInsert.
      fetch(functionsUrl + '/publisherInsert',
        {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(this.publisher)
        })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje INSERT encolado en "bookstore". ' +
            'El registro se creara cuando se invoque publisherTasks.';
          setTimeout(() => this.$router.push('/publishers'), 1800);
        })
    }
  }
}
</script>
