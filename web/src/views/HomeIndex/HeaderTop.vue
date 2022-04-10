<template>
  <div class="box">
    <el-avatar :src="circleUrl" color="#E0FFFFFF" class="avatar"/>
    <div class="demo-progress">
      <el-progress :percentage="percentage" />
    </div>
    <ul>
      <li><a href="">设置</a></li>
      <li><a href="">探索</a></li>
      <li><a href="">文档</a></li>
      <li><a href="">内容</a></li>
    </ul>
  </div>
</template>

<script>
import { ElAvatar,ElProgress } from 'element-plus';
export default {
  name: "HeaderTop",
  components: {
    ElAvatar,
    ElProgress
  },
  mounted() {
    this.timer = setTimeout(() => {
      this.getTime();
      if (this.percentage === 100) {
        clearTimeout(this.timer);
      }
    }, 1000);
  },
  data() {
    return {
      circleUrl: require("../../assets/images/avatar.jpg"),
      percentage: 0,
      timer: null
    }
  },
  props: {
    data: {
      type: Number
    }
  },
  methods: {
    getTime() {
      let begin = new Date(2022, 0, 1, 0, 0, 0);
      let nowTime = new Date();
      let future = new Date(2022, 5, 7, 9, 0, 0);
      let timeSum = future.getTime() - nowTime.getTime();
      let totalTime = future.getTime() - begin.getTime();
      this.percentage = 100 - Math.floor( timeSum / totalTime * 100);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/_variables";
div.box {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: space-between;
}

.avatar {
  margin: 0 0 0 20px;
}

ul {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding-left: 0;

  li {
    height: 100%;
    display: block;
    margin: 0 10px;

    a {
      text-decoration: none;
      color: $vue;
    }

    &:last-child {
      margin-right: 20px;
    }
  }
}

.demo-progress {
  width: 350px;
}
</style>