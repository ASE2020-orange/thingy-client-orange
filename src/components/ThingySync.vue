<template>
  <div class="ThingySync">
    Thingy-{{ thingy.id }}
    <div
      class="list-group-item"
      v-bind:key="index"
      v-for="(position, index) in thingy.positions"
      v-bind:class="isPositionSelected(index)"
    >
      <img height="50px" width="50px" v-bind:src="position" />
    </div>
    <button
      type="button"
      class="btn btn-primary"
      v-on:click="selectThingy(thingy.id)"
    >
      Select
    </button>
  </div>
</template>

<script>
export default {
  name: "ThingySync",
  props: {
    thingy: {
      positions: Object,
      id: Number,
      positions_selected: Object,
    },
  },
  methods: {
    isPositionSelected(index) {
      if (this.thingy.positions_selected[index]) {
        return "selected_position bg-info";
      } else {
        return "";
      }
    },
    selectThingy(thingy_id) {
      this.$parent.selectThingy(thingy_id);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.selected_position img {
  filter: invert(1);
}
</style>