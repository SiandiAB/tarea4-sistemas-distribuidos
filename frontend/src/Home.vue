<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h3>Books Example Site</h3>
      This site demonstrates asynchronous (deferred) updates using RabbitMQ:
      <ul>
        <li>Create, update and delete operations send a message to the
          <b>bookstore</b> queue instead of writing the database directly.</li>
        <li>A task dispatcher (<b>bookTasks</b>, <b>authorTasks</b>,
          <b>publisherTasks</b>) reads the queue and invokes the
          corresponding <b>batch</b> function, which applies the real change.</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
}
</script>
