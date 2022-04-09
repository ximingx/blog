<template>
  <div class="all">
    <div class="left">
      <PublicSource></PublicSource>
    </div>
    <div class="right">
      <div class="top"></div>
      <div class="main"></div>
      <div class="bottom"></div>
    </div>
  </div>
</template>

<script>
import PublicSource from './PublicSource.vue'
export default {
  name: "HomeIndex",
  components: {
    PublicSource
  },
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/variables';
.all {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  background: $background;
}

.left {
  width: 220px;
  max-width: 20vw;
  height: 100vh;
  box-sizing: border-box;
  border-right: 1px $hr-color solid;
  overflow-y: auto;
}

.right {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .top {
    width: 100%;
    height: 60px;
    background: $background_header;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: $background;
  }

  .bottom {
    width: 100%;
    height: 60px;
    background: $background;
    border-top: 1px $hr-color solid;
  }

}
</style>