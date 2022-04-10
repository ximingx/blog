<template>


  <v-md-preview :text="text"></v-md-preview>
</template>

<script>
export default {
  name: "MainMessage",
  components: {

  },
  data () {
    return {
      text: '个人博客的搭建过程, 大二下半学期\n' +
          '\n' +
          '欢迎参观个人的博客地址 [ximingx.com](http://ximingx.com)\n' +
          '\n' +
          '## 项目的启动\n' +
          '\n' +
          '首先将项目克隆下来\n' +
          '\n' +
          '```bash\n' +
          '$ git clone https://github.com/ximingx/blog.git\n' +
          '```\n' +
          '\n' +
          '在 service 文件夹\n' +
          '\n' +
          '```bash\n' +
          '$ npm install\n' +
          '$ node app.js\n' +
          '```\n' +
          '\n' +
          '至于 web 文件夹可以不用管， 打包后的 dist 文件在 service 的 public 文件夹里\n' +
          '\n' +
          '## 展示\n' +
          '\n' +
          '### login\n' +
          '\n' +
          '![image-20220408214541308](https://raw.githubusercontent.com/ximingx/Figurebed/master/imgs/202204082145181.png)\n' +
          '\n' +
          '## 日志\n' +
          '\n' +
          '### 2022/04/08\n' +
          '\n' +
          '完成项目的搭建,\n' +
          '\n' +
          ' - 实现登录功能\n' +
          ' - 使用 Element-Plus 的提示功能\n' +
          '\n' +
          '![image-20220408214100603](https://raw.githubusercontent.com/ximingx/Figurebed/master/imgs/202204082141456.png)\n' +
          '\n' +
          '### 2022/04/09\n' +
          '\n' +
          '实现首页的大概样子\n' +
          '\n' +
          ' - 左侧开放静态资源，开放自己的笔记，软件，图片 （Node fs 模块）\n' +
          ' - 顶部目录跳转 （Element - Plus）\n' +
          ' - 中间内容展示 + 右边侧边栏准备放一个音乐播放器 （Node 接口， 可以看 github 中关于 node.md  文档，详细的介绍了 )\n' +
          ' - 底部展示一些乱七八糟的东西 （～ ～ ～ ）\n' +
          '\n' +
          '![](https://raw.githubusercontent.com/ximingx/Figurebed/master/img/202204092234396.png)\n' +
          '\n' +
          '> **要去搞比赛项目了， 先搁置几天**\n' +
          '>\n' +
          '> 哎， 还有中级软考， 还有英语四级考试， 还有两个比赛， 我这该死的只能写文档来吐槽的无奈',
    }
  }
}
</script>

<style scoped>

</style>