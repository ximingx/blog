<template>
  <h1 ref="message">{{ message }}</h1>
</template>

<script>
export default {
  name: "MainHead",
  data() {
    return {
      message: "123",
      timer: null
    };
  },
  mounted() {
    this.countDown()
  },
  methods: {
    countDown() {
      this.timer = setInterval(() => {
        let nowTime = new Date();
        let future = new Date('2022/06/07 09:00:00');
        let timeSum = future.getTime() - nowTime.getTime();
        let day = parseInt(timeSum / 1000 / 60 / 60 / 24); // 天
        let hour = parseInt((timeSum / 1000 / 60 / 60) % 24); // 时
        let minu = parseInt((timeSum / 1000 / 60) % 60); // 分
        let sec = parseInt((timeSum / 1000) % 60); // 秒
        let millsec = parseInt(timeSum % 1000); // 毫秒

        day = day < 10 ? '0' + day : day;
        hour = hour < 10 ? '0' + hour : hour;
        minu = minu < 10 ? '0' + minu : minu;
        sec = sec < 10 ? '0' + sec : sec;

        if (millsec < 10) {
          millsec = '00' + millsec;
        } else if (millsec < 100) {
          millsec = '0' + millsec;
        }

        // 兜底处理
        if (timeSum < 0) {
          this.message = '结束';
          clearInterval(this.timer);
          return;
        }

        // 前端要显示的文案
        this.message = '距离高考倒计时还有' + day + '天' + hour + '小时' + minu + '分' + sec + '秒' + millsec + '毫秒';
      }, 1);
    }
  }
}
</script>

<style scoped>
h1 {
  padding-left: 10px;
  color: lightcyan;
}
</style>