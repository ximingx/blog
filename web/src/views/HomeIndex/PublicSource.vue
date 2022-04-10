<template>
  <div>
    <a class="title"> {{ title }} </a>
    <ul v-for="(item, index) in list" :key="index">
      <li>
        <a href="{{ item.url }}">
          <el-icon class="li-item" v-if="isDir(index)"><folder /></el-icon>
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
      title: 'ximingx 的资源列表',
      github_url: "https://github.com/ximingx"
    }
  },
  components: {
    ElIcon,
    Folder,
    Document
  },
  computed() {
    return {

    }
  },
  mounted() {
    request({
      url: "/public/source",
      method: "GET",
      params: {
        number: 10,
      }
    }).then(data => {
      let arr = []
      for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].type == "dir") {
          arr.unshift({
            name: data.data[i].name,
            type: data.data[i].type,
            path: data.data[i].path
          })
        }
        if (data.data[i].type == "file") {
          arr.push({
            name: data.data[i].name,
            type: data.data[i].type,
            path: data.data[i].path
          })
        }
      }
      this.list = JSON.parse(JSON.stringify(arr))
    })
  },
  methods: {
    isDir(index) {
      return this.list[index].type === 'dir';
    }
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
    color: $vue;
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