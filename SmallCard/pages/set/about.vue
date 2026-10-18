<template>
  <view class="about-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
      </view>
      <view class="placeholder"></view>
      <view class="placeholder"></view>
    </view>
    
    <view class="content">
      <!-- Logo和应用名称 -->
      <view class="app-info">
        <image src="/static/logo.jpg" class="app-logo" mode="aspectFit"></image>
        <text class="app-name">小卡</text>
        <text class="version-info">版本 {{ appVersion }}</text>
      </view>
      
      <!-- 功能列表 -->
      <view class="function-list">
        <view class="function-item" @click="checkUpdate" hover-class="item-hover">
          <text class="item-text">检查更新</text>
          <image src="/static/icon/arrow-right.png" class="arrow-icon" mode="aspectFit"></image>
        </view>
        
        <view class="function-item" @click="openPrivacyPolicy" hover-class="item-hover">
          <text class="item-text">隐私政策</text>
          <image src="/static/icon/arrow-right.png" class="arrow-icon" mode="aspectFit"></image>
        </view>
        
        <view class="function-item" @click="openUserAgreement" hover-class="item-hover">
          <text class="item-text">用户协议</text>
          <image src="/static/icon/arrow-right.png" class="arrow-icon" mode="aspectFit"></image>
        </view>
      </view>
      
      <!-- 版权信息 -->
      <view class="copyright">
        <text class="copyright-text">© 2025 小卡团队</text>
        <text class="copyright-text">保留所有权利</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appVersion: '1.0.0',
      isCheckingUpdate: false
    };
  },
  onLoad() {
    // 从应用配置中获取版本号
    this.getAppVersion();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 获取应用版本号
    getAppVersion() {
      try {
        // 在实际应用中，可以从配置文件或原生API获取
        // 这里使用硬编码的版本号
        this.appVersion = '1.0.0';
      } catch (error) {
        console.error('获取版本号失败:', error);
      }
    },
    
    // 检查更新
    checkUpdate() {
      if (this.isCheckingUpdate) return;
      
      this.isCheckingUpdate = true;
      uni.showLoading({ title: '检查更新中...' });
      
      // 模拟检查更新的网络请求
      setTimeout(() => {
        uni.hideLoading();
        this.isCheckingUpdate = false;
        
        // 模拟已是最新版本
        uni.showModal({
          title: '检查结果',
          content: '当前已是最新版本',
          showCancel: false,
          confirmText: '确定'
        });
        
        // 如果有新版本，可以这样处理
        /*
        uni.showModal({
          title: '发现新版本',
          content: '有新版本可用，是否立即更新？',
          confirmText: '立即更新',
          cancelText: '暂不更新',
          success: (res) => {
            if (res.confirm) {
              // 这里可以跳转到应用商店或直接下载更新
              uni.showToast({ title: '正在跳转到更新页面', icon: 'none' });
            }
          }
        });
        */
      }, 1500);
    },
    
    // 打开隐私政策
    openPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/set/privacy-policy',
        fail: () => {
          // 如果页面不存在，显示提示
          uni.showToast({ title: '隐私政策页面暂不可用', icon: 'none' });
        }
      });
    },
    
    // 打开用户协议
    openUserAgreement() {
      uni.navigateTo({
        url: '/pages/set/user-agreement',
        fail: () => {
          // 如果页面不存在，显示提示
          uni.showToast({ title: '用户协议页面暂不可用', icon: 'none' });
        }
      });
    }
  }
};
</script>

<style scoped>
.about-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  /* background-color: #ffffff; */
  /* border-bottom: 1px solid #f0f0f0; */
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn image {
  width: 20px;
  height: 20px;
}



.placeholder {
  width: 44px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0 40px 0;
}

.app-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.app-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 15px;
  border-radius: 16px;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 10px;
}

.version-info {
  font-size: 14px;
  color: #999999;
}

.function-list {
  background-color: #ffffff;
  margin-bottom: 30px;
}

.function-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.function-item:last-child {
  border-bottom: none;
}

.item-text {
  font-size: 16px;
  color: #333333;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.item-hover {
  background-color: #f5f5f5;
}

.copyright {
  text-align: center;
  padding-top: 20px;
}

.copyright-text {
  display: block;
  font-size: 12px;
  color: #999999;
  margin-bottom: 5px;
}
</style>