<template>
  <div id="login">
    <div id="login-form" @keyup.enter="inputInfo">
      <h1>登陆界面</h1>
      <label for="username"><i class="el-icon-user-solid" style="color: #c1c1c1"></i></label>
      <input type="text" placeholder="用户名" name="username" id="username" autocapitalize="off" v-model.trim=username aria-autocomplete="off">
      <label for="password"><i class="el-icon-right" style="color: #c1c1c1"></i></label>
      <input type="password" placeholder="密码" name="password" id="password" autocapitalize="off" v-model.trim="password">
      <div>
        <el-button type="primary" v-on:click="inputInfo">登录</el-button>
        <el-button type="info"  @click="open2" v-on:click="resetInfo">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ElButton,ElNotification  } from 'element-plus'
import request from "@/network/request"
export default {
  name: "UserLogin",
  components: {
    ElButton
  },
  data: function () {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    inputInfo: function () {
      request({
        url: '/user/login',
        method: 'POST',
        params: {
          username: this.username,
          password: this.password
        }
      }).then(res => {
        if (res.status == 200) {
          ElNotification({
            title: 'Success',
            message: '登录成功',
            type: 'success',
          });
          this.$router.push({
            path: '/index'
          })
        } else {
          ElNotification({
            title: 'Error',
            message: '用户名或者密码错误',
            type: 'error',
          });
        }
      }).catch(res => {
        ElNotification({
          title: 'Error',
          message: '用户名或者密码错误',
          type: 'error',
        });
      })
    },
    resetInfo: function () {
      this.username = ''
      this.password = ''
    },
    open2: function () {
      if (this.username != '' || this.password != '') {
        ElNotification({
          title: 'Success',
          message: '用户名和密码将被清空',
          type: 'success',
        });
        return;
      } else {
        ElNotification({
          title: 'Error',
          message: '请不要重复此操作',
          type: 'error',
        });
      }

    }
  }
}
</script>

<style lang="scss" scoped>
#login {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-image: url("../assets/images/bg.jpg");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
}

#login-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50vw;
  min-width: 300px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, .5);

  h1 {
    width: 60%;
    margin: 50px auto 20px;
    color: #c1c1c1;
    text-align: center;
  }

  input {
    width: 60%;
    margin: 15px auto;
    outline: none;
    border: none;
    padding: 10px;
    border-bottom: 1px solid #fff;
    background: transparent;
    color: white;
  }

  label {
    width: 60%;
    margin: 0 auto;
    position: relative;
    top: 30px;
    left: -15px;
  }

  div {
    width: 60%;
    margin: 10px auto;
    display: flex;
    justify-content: center;
    align-content: center;
  }

  button {
    // rgba
    background-color: rgba(9, 108, 144, 0.5);
    margin: 10px 25px 40px 25px;
  }

  p {
    width: 60%;
    margin: 8px auto;
    position: relative;
    left: -15px;
    color: #ff0000;
    font-size: 8px;
  }
}

input {
  -webkit-text-fill-color: #ffffff !important;
  transition: background-color 5000s ease-in-out ,width 1s ease-out!important;
}
</style>