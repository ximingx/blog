<template>
  <div>
    <a class="title" :href="github_url"><el-icon class="title-item"><house /></el-icon> {{ title }} </a>
    <hr />
    <ul v-for="(item, index) in list" :key="index">
      <li>
        <el-icon color="white" class="li-item"><folder /></el-icon>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import request from '@/network/request'
import { ElIcon } from 'element-plus'
import { Folder,House } from "@element-plus/icons-vue";

export default {
  name: "PublicSource",
  data() {
    return {
      list: [],
      title: 'ximingx/blog',
      github_url: ""
    }
  },
  components: {
    ElIcon,
    Folder,
    House
  },
  mounted() {
    request({
      url: "/public/source",
      method: "GET",
      params: {
        token: this.$store.state.token,
        page: 1,
      }
    }).then(data => {
      this.list = data.data;
      console.log(this.list)
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables";
div {
  color: #c1c1c1;

  a.title {
    display: inline-block;
    color: $font_1;
    margin: 0.5em 0.5em 0.5em 2em;
    position: relative;
    text-decoration: none;

    .title-item {
      position: absolute;
      left: -20px;
    }
  }

  hr {
    color: $hr-color;
  }

  ul {

    li {
      list-style: none;
      position: relative;

      .li-item {
        position: absolute;
        left: -20px;
        width: 20px;
        height: 100%;
      }
    }
  }
}
</style>