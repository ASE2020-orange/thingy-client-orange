<template>
  <div class="Answer list-group-item">
        <img
        v-bind:title="answer.title"
        height="50px" width="50px"
        v-bind:src="answer.position">
        {{answer.answer}}
  </div>
</template>

<script>
export default {
  name: "Answer",
  props: {
    answer: Object,
    position: String,
    title: String,
    css_class:String
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
