<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h3>Publishers Information</h3>
      This section presents information about publishers.
      <table>
        <thead>
          <tr>
            <th>Publisher</th><th>Country</th><th>Founded</th>
            <th>Genere</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="publisher in publishers" :key="publisher.id">
            <td>{{ publisher.publisher }}</td>
            <td>{{ publisher.country }}</td>
            <td>{{ publisher.founded }}</td>
            <td>{{ publisher.genere }}</td>
            <td>
              <router-link class="button" :to="'/publishers/show/' + publisher.id">Show</router-link>
              <router-link class="button" :to="'/publishers/edit/' + publisher.id">Edit</router-link>
              <a class="button" v-on:click="deletePublisher(publisher.id)">Delete</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="notice" class="notice">{{ notice }}</p>
      <router-link class="button button-primary" to="/publishers/create">New</router-link>
    </div>
  </div>
</template>

<script>
import { functionsUrl } from './api.js'

export default {
  data() {
    return {
      publishers: [],
      notice: ''
    }
  },
  methods: {
    allPublishers() {
      fetch(functionsUrl + '/publishers',
        { headers: { 'Accept': 'application/json' } })
        .then((response) => response.json())
        .then((result) => {
          this.publishers = result;
        })
    },
    deletePublisher(id) {
      // Eliminacion diferida: solo se envia un mensaje a la cola.
      fetch(functionsUrl + '/publisherDelete/' + id, { method: 'DELETE' })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            this.notice = 'Error al encolar: ' +
              (data && data.error ? data.error : 'el backend no respondio');
            return;
          }
          this.notice = 'Mensaje DELETE encolado en "bookstore". ' +
            'El cambio se aplicara cuando publisherTasks procese la cola.';
          this.allPublishers();
        })
    }
  },
  mounted() {
    this.allPublishers()
  }
}
</script>
