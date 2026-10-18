<template>
  <view class="cover-container">
    <image src="/static/image/登录注册.png" class="cover-bg" mode="aspectFill"></image>
    <view class="cover-text">
      <text class="welcome-title">欢迎使用小卡</text>
      <text class="welcome-subtitle">Hello! My bro!</text>
    </view>
    <button class="setting-btn" @click="goToSetting">去设置</button>
    <button class="login-btn" @click="goToLoginExistingAccount">登录已有账号</button>
    <button class="guest-btn" @click="guestLogin">游客登录</button>
  </view>
</template>

<script>
export default {
  methods: {
    goToSetting() {
      uni.navigateTo({
        url: '/pages/setting/basic'
      });
    },
    goToLoginExistingAccount() {
      uni.navigateTo({
        url: '/pages/set/switch-account',
        fail: (err) => {
          console.error('跳转到登录已有账号页面失败:', err);
          uni.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
    },
    guestLogin() {
      try {
        // 设置游客登录状态
        uni.setStorageSync('isGuest', true);
        uni.setStorageSync('userInfo', JSON.stringify({
          nickname: '游客',
          // 同时设置avatar和avatarUrl字段，确保字段命名一致性
          avatar: '',
          avatarUrl: '',
          isGuest: true
        }));
        
        // 跳转到允许游客访问的首页
        uni.switchTab({
          url: '/pages/index/index',
          success: () => {
            console.log('游客登录成功，跳转到首页');
          },
          fail: (err) => {
            console.error('游客登录跳转失败:', err);
            // 失败时使用reLaunch备用
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        });
      } catch (error) {
        console.error('游客登录出错:', error);
        uni.showToast({
          title: '游客登录失败，请重试',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style scoped>
.cover-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
.cover-bg {
  width: 100%;
  height: 100%;
}
.cover-text {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #fff;
}
.welcome-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}
.welcome-subtitle {
  font-size: 24rpx;
  opacity: 0.8;
}
.setting-btn {
  position: absolute;
  bottom: 35%;
  left: 50%;
  transform: translateX(-50%);
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #2699fb;
  color: #fff;
  border-radius: 40rpx;
}

.login-btn {
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #00aaff;
  color: #fff;
  border-radius: 40rpx;
}

.guest-btn {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  border-radius: 40rpx;
}
</style>