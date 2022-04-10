<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>目录</span>
      </div>
    </template>
    <ul v-for="(item, index) in list" :key="index">
      <li :class="item.type">{{ item.name }}</li>
    </ul>
  </el-card>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>音乐</span>
      </div>
    </template>
  </el-card>
</template>

<script>
import { ElCard, ElButton } from 'element-plus';
export default {
  name: "MainShow",
  components: {
    ElCard,
    ElButton
  },
  data() {
    return {
      list: [
        {
          name: "Node.js",
          type: "one",
        },
        {
          name: "关于",
          type: "one",
        },
        {
          name: "介绍",
          type: "one",
        },
        {
          name: "总结",
          type: "one",
        }
      ]
    };
  },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/_variables.scss";
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: $vue;
}

.box-card {
  background: $background;
  color: $font_1;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li.one {
  border-bottom: 1px solid $ximingx;
  margin-bottom: 20px;
}
</style>