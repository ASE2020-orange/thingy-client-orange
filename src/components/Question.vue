<template>
  <div class="Question">
    <h2>{{question}}</h2>
  </div>
</template>

<script>
export default {
  name: "Question",
  props: {
    question: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
