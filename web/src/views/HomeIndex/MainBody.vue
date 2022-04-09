<template>
  <el-menu
      class="el-menu-demo"
      mode="horizontal"
      background-color="rgb(22, 27, 34)"
      text-color="rgb(186, 187, 189)"
      active-text-color="rgb(240, 246, 252)"
      default-active="1-1"
      @select="handleSelect">
    <el-sub-menu index="1">
      <template #title>Workspace</template>
      <el-menu-item index="1-1">item one</el-menu-item>
      <el-menu-item index="1-2">item two</el-menu-item>
      <el-menu-item index="1-3">item three</el-menu-item>
      <el-sub-menu index="1-4">
        <template #title>item four</template>
        <el-menu-item index="1-4-1">item one</el-menu-item>
        <el-menu-item index="1-4-2">item two</el-menu-item>
        <el-menu-item index="1-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="2">Info</el-menu-item>
    <el-menu-item index="3">Message</el-menu-item>
  </el-menu>

  <div class="art">
    <div class="message">

    </div>
    <div class="show">

    </div>
  </div>


</template>

<script>
import { ElInput,ElMenu,ElSubMenu,ElMenuItem,ElCollapse,ElCollapseItem } from 'element-plus';
export default {
  name: "MainBody",
  components: {
    ElInput,
    ElMenu,
    ElSubMenu,
    ElMenuItem,
    ElCollapse,
    ElCollapseItem
  },
  data() {
    return {
      input: "",
      activeNames: 1,
    }
  },
  methods: {
    handleSelect(key, path) {
      console.log(key, path);
    },
    handleChange(val) {
      console.log(val);
    }
  }

}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/_variables.scss";
.all {
  height: 60px;
  display: flex;
}

.el-collapse-item {
  background: $background;
}

.art {
  display: flex;
  flex-direction: row;

  .message {
    flex: 1;
  }

  .show {
    width: 300px;
    // 记得修改高度
    min-height: 60vh;
    border-left: 1px solid $hr-color;
  }
}
</style>