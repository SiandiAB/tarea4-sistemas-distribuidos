<template>
  <div id="app" class="container">
    <div class="row" style="margin-top: 5%">
      <router-link class="button button-primary"
        style="margin-right: 10px;" to="/">Home</router-link>
      <router-link class="button button-primary"
        style="margin-right: 10px;" to="/books">Books</router-link>
      <router-link class="button button-primary"
        style="margin-right: 10px;" to="/authors">Authors</router-link>
      <router-link class="button button-primary"
        to="/publishers">Publishers</router-link>
    </div>
    <router-view>
    </router-view>
  </div>
</template>

<script>
export default {
}
</script>
