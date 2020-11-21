<template>
  <div class="Category">
    <h1>Category: {{ category }}</h1>
  </div>
</template>

<script>
export default {
  name: "Category",
  props: {
    category: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
