<template>
  <h1>{{ message }}</h1>
</template>

<script>
export default {
  name: "MainHead",
  data() {
    return {
      message: "Hello ximingx!"
    };
  }
}
</script>

<style scoped>
h1 {
  padding-left: 10px;
  color: lightcyan;
}
</style>