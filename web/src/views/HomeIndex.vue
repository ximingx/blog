<template>
  <div class="all">

    <div class="left">
      <PublicSource></PublicSource>
    </div>

    <div class="right">
      <div class="message">
        <div class="top">
          <HeaderTop></HeaderTop>
        </div>
        <div class="main">
         <div class="box">
           <MainHead></MainHead>
           <MainBody></MainBody>
         </div>
          <div class="show">

          </div>
        </div>
        <div class="bottom"></div>
      </div>

    </div>
  </div>
</template>

<script>
import PublicSource from "./HomeIndex/PublicSource.vue";
import HeaderTop from "./HomeIndex/HeaderTop.vue";
import MainHead from "./HomeIndex/MainHead";
import MainBody from "./HomeIndex/MainBody";
export default {
  name: "HomeIndex",
  components: {
    PublicSource,
    HeaderTop,
    MainBody,
    MainHead
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

  .message {
    flex: 1;
    flex-direction: row;

    .top {
      width: 100%;
      height: 60px;
      background: $background_header;
    }

    .main {
      flex: 1;
      display: flex;
      background: $background;
      flex-direction: column;
    }

    .bottom {
      width: 100%;
      height: 40px;
      background: $background;
      border-top: 1px $hr-color solid;
    }
  }

  .especial {
  //  固定定位
  }

}
</style>