<template>
  <view class="setting-page">
    <!-- 头部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">设置</text>
	  
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <image src="/static/logo.jpg" class="page-logo" mode="aspectFit"></image>
    </view>
    
    <!-- 设置列表 -->
    <view class="setting-list">
        <!-- 切换账号 -->
        <view class="setting-item" @click="switchAccount" hover-class="setting-item-hover">
          <view class="item-left">
            <image src="/static/icon/切换账号.png" class="item-icon"></image>
            <text class="item-text">切换账号</text>
          </view>
          <view class="item-right">
            <image src="/static/icon/arrow-right.png" class="arrow-icon"></image>
          </view>
        </view>

        <!-- 通知设置 -->
        <view class="setting-item">
          <view class="item-left">
            <image src="/static/icon/通知.png" class="item-icon"></image>
            <text class="item-text">通知设置</text>
          </view>
          <view class="switch-container">
            <switch 
              :checked="notificationEnabled"
              color="#07C160"
              @change="onNotificationChange"
            ></switch>
          </view>
        </view>

        <!-- 反馈 -->
        <view class="setting-item" @click="goToFeedback" hover-class="setting-item-hover">
          <view class="item-left">
            <image src="/static/icon/反馈.png" class="item-icon"></image>
            <text class="item-text">反馈</text>
          </view>
          <view class="item-right">
            <image src="/static/icon/arrow-right.png" class="arrow-icon"></image>
          </view>
        </view>

        <!-- 关于我们 -->
        <view class="setting-item" @click="goToAbout" hover-class="setting-item-hover">
          <view class="item-left">
            <image src="/static/icon/关于我们.png" class="item-icon"></image>
            <text class="item-text">关于我们</text>
          </view>
          <view class="item-right">
            <text class="item-desc">版本 v1.0.0</text>
            <image src="/static/icon/arrow-right.png" class="arrow-icon"></image>
          </view>
        </view>

      <!-- 退出登录 -->
      <view class="logout-btn" @click="showLogoutConfirm">
        <text>退出登录</text>
      </view>
    </view>
    
    <!-- 底部占位区域 -->
    <view class="bottom-placeholder"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notificationEnabled: true
    };
  },
  onLoad() {
    // 从本地存储读取通知设置状态
    try {
      const savedState = uni.getStorageSync('notificationEnabled');
      // uni.getStorageSync返回空字符串('')而不是null/undefined当键不存在时
      // 只有当值是布尔值时才更新
      if (typeof savedState === 'boolean') {
        this.notificationEnabled = savedState;
      }
    } catch (error) {
      console.error('读取通知设置失败:', error);
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    // 切换账号逻辑 - 跳转到切换账号页面
    switchAccount() {
      uni.navigateTo({
        url: '/pages/set/switch-account',
        fail: (err) => {
          console.error('跳转到切换账号页面失败:', err);
          uni.showToast({ title: '切换账号功能暂不可用', icon: 'none' });
        }
      });
    },
    // 跳转到反馈页面
    goToFeedback() {
      uni.navigateTo({
        url: '/pages/set/feedback',
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({ title: '反馈页面暂不可用', icon: 'none' });
        }
      });
    },
    // 跳转到关于我们页面
    goToAbout() {
      uni.navigateTo({
        url: '/pages/set/about',
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({ title: '关于我们页面暂不可用', icon: 'none' });
        }
      });
    },
    // 通知开关状态变化
    onNotificationChange(e) {
      this.notificationEnabled = e.detail.value;
      uni.setStorageSync('notificationEnabled', this.notificationEnabled);
      uni.showToast({
        title: this.notificationEnabled ? '通知已开启' : '通知已关闭',
        icon: 'none'
      });
    },
    // 退出登录确认 - 自定义弹窗样式
    showLogoutConfirm() {
      // 创建自定义弹窗
      const modal = {
        title: '退出账号',
        content: '退出账号后无法收到任何消息通知',
        buttons: [
          { text: '退出登录', type: 'primary' },
          { text: '取消', type: 'default' }
        ],
        success: (res) => {
          if (res.confirm) {
            try {
              // 清除所有用户相关数据
              uni.removeStorageSync('userToken');
              uni.removeStorageSync('userInfo');
              
              // 延迟一小段时间确保存储操作完成
              setTimeout(() => {
                // 跳转到主页面（根据第一张图，应该是欢迎页面）
                uni.reLaunch({
                  url: '/pages/index/cover',
                  success: () => {
                    uni.showToast({ 
                      title: '已退出登录', 
                      icon: 'none',
                      duration: 1500
                    });
                  },
                  fail: (err) => {
                    console.error('跳转主页面失败:', err);
                    uni.showToast({ 
                      title: '退出失败，请重试', 
                      icon: 'none'
                    });
                  }
                });
              }, 100);
            } catch (error) {
              console.error('退出登录出错:', error);
              uni.showToast({ 
                title: '退出失败，请重试', 
                icon: 'none'
              });
            }
          }
        }
      };
      
      // 使用自定义弹窗组件或默认弹窗
      // 如果有自定义组件，可以在这里使用，否则使用默认的showModal
      uni.showModal({
        title: modal.title,
        content: modal.content,
        confirmText: modal.buttons[0].text,
        cancelText: modal.buttons[1].text,
        success: (res) => {
          if (res.confirm) {
            modal.success({ confirm: true });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.setting-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.bottom-placeholder {
  flex: 1;
}

.logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
}

.page-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  background-color: transparent;
  border-bottom: none;
  position: fixed;
  top: 0;
  left: 30rpx;
  right: 30rpx;
  z-index: 10;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 36rpx;
  background: transparent;
  color: #333;
  padding: 0;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.setting-list {
  width: 100%;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding-top: 40rpx; /* 调整内边距，适配添加的logo区域 */
  max-height: 80vh;
  overflow-y: auto;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s;
}

.setting-item:last-child {
  border-bottom: none;
}

/* 点击效果 */
.setting-item-hover {
  background-color: #f5f5f5;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 24rpx;
  object-fit: contain;
  vertical-align: middle;
}

.item-text {
  font-size: 32rpx;
  color: #333333;
  font-weight: 400;
}

.item-desc {
  font-size: 26rpx;
  color: #999999;
  margin-right: 12rpx;
}

.arrow-icon {
  width: 20rpx;
  height: 36rpx;
  opacity: 0.5;
}

.switch-container {
  display: flex;
  align-items: center;
}

.logout-btn {
  margin: 60rpx auto;
  width: 670rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  border: 1rpx solid #ff4d4f;
  background-color: #ffffff;
  transition: background-color 0.2s;
}

.logout-btn:active {
  background-color: #fff1f0;
}

.logout-btn text {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: 500;
}

button::after {
  border: none;
}
</style>