<template>
  <div>
    <a class="title"> {{ title }} </a>
    <ul v-for="(item, index) in list" :key="index">
      <li>
        <a href="">
          <el-icon class="li-item" v-if="item.type === 'dir'"><folder /></el-icon>
          <el-icon class="li-item" v-else><document /></el-icon>
          <span>{{ item.name }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import request from '@/network/request'
import { ElIcon } from 'element-plus'
import { Folder,Document } from "@element-plus/icons-vue";

export default {
  name: "PublicSource",
  data() {
    return {
      list: [],
      title: 'ximingx/blog',
      github_url: "https://github.com/ximingx"
    }
  },
  components: {
    ElIcon,
    Folder,
    Document
  },
  mounted() {
    request({
      url: "/public/source",
      method: "GET",
      params: {
        token: this.$store.state.token,
        number: 10,
      }
    }).then(data => {
      this.list = data.data;
      console.log(this.list)
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variables";
div {
  color: #c1c1c1;

  a.title {
    display: inline-block;
    width: 100%;
    box-sizing: border-box;
    line-height: 60px;
    color: $font_1;
    position: relative;
    text-align: center;
    text-decoration: none;
  }

  ul {
    padding: 0;
    margin: 0;
    border-top: 1px solid $hr-color;

    a {
      display: block;
      width: 100%;
      box-sizing: border-box;
      line-height: 40px;
      color: $font_1-hover;
      text-decoration: none;
      text-align: left;
      position: relative;
      padding-left: 30px;

      &:hover {
        color: $font-1;
        background-color: gray;
      }

      .li-item {
        position: absolute;
        left: 12px;
        top: 14px;
        width: 14px;
        height: 14px;
        line-height: 14px;
        text-align: center;
        font-size: 14px;
        color: $font_1;
      }
    }
  }
}
</style>