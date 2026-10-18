<template>
  <view class="social-setting">
    <view class="section-title"></view>
    <view class="social-item" v-for="(item, index) in socialList" :key="index">
      <image :src="item.icon" class="social-icon" mode="aspectFit"></image>
      <!-- 绑定input的值到item.link -->
      <input 
        type="text" 
        placeholder="请输入链接" 
        class="social-input" 
        v-model="item.link"
      />
      <!-- 点击清除当前输入框内容 -->
      <text class="close-text" @click="clearInput(index)">X</text>
    </view>
    <view class="btn-group">
      <button class="next-btn" @click="goToNext">保存，下一步</button>
      <button class="skip-btn" @click="goToHome">跳过</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 给每个社交平台添加唯一标识，便于在contact页面对应展示
      socialList: [
        { id: 'social1', name: '社交平台1', icon: '/static/icon/社交媒体1.png', link: '' },
        { id: 'social2', name: '社交平台2', icon: '/static/icon/社交媒体2.png', link: '' },
        { id: 'social3', name: '社交平台3', icon: '/static/icon/社交媒体3.png', link: '' },
        { id: 'social4', name: '社交平台4', icon: '/static/icon/社交媒体4.png', link: '' },
        { id: 'social5', name: '社交平台5', icon: '/static/icon/社交媒体5.png', link: '' }
      ]
    }
  },
  onLoad() {
    // 页面加载时读取本地存储的社交链接，回显数据
    this.loadSocialLinks();
  },
  methods: {
    // 加载本地存储的社交链接
    loadSocialLinks() {
      try {
        const storedSocialStr = uni.getStorageSync('socialLinks');
        // 确保storedSocial初始化为空数组
        let storedSocial = [];
        if (storedSocialStr) {
          // 尝试解析JSON字符串
          storedSocial = typeof storedSocialStr === 'string' ? JSON.parse(storedSocialStr) : storedSocialStr;
        }
        // 确保storedSocial是数组且有长度才执行查找操作
        if (Array.isArray(storedSocial) && storedSocial.length > 0) {
          this.socialList = this.socialList.map(item => {
            const storedItem = storedSocial.find(s => s.id === item.id);
            return storedItem ? { ...item, link: storedItem.link } : item;
          });
        }
      } catch (error) {
        console.error('加载社交链接失败:', error);
      }
    },

    // 清除输入框内容的方法
    clearInput(index) {
      this.socialList[index].link = '';
    },

    goToNext() {
      try {
        // 保存社交链接到本地存储，与contact页面共用缓存键，注意转换为JSON字符串
        uni.setStorageSync('socialLinks', JSON.stringify(this.socialList));
        
        // 更新用户状态为正式登录（非游客）
        this.updateUserStatus();
        
        // 同步用户数据到数据库
        const app = getApp();
        if (app && app.syncUserToDatabase) {
          app.syncUserToDatabase();
        }
        
        console.log('保存的链接:', this.socialList);
        
        // 优化：使用showToast的complete回调跳转，确保提示显示完整
        uni.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500,
          complete: () => {
            // 注册成功后跳转到"我的"页面
            uni.switchTab({
              url: '/pages/home/index',
              success: () => {
                console.log('跳转到"我的"页面成功');
              },
              fail: (err) => {
                console.error('跳转失败:', err);
                // 失败时使用reLaunch备用
                uni.reLaunch({
                  url: '/pages/home/index'
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('保存失败:', error);
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    },

    goToHome() {
      try {
        // 跳过也保存已输入的社交链接，注意转换为JSON字符串
        uni.setStorageSync('socialLinks', JSON.stringify(this.socialList));
        
        // 更新用户状态为正式登录（非游客）
        this.updateUserStatus();
        
        // 跳转到"我的"页面
        uni.switchTab({
          url: '/pages/home/index',
          fail: (err) => {
            console.error('跳转失败:', err);
            // 失败时使用reLaunch备用
            uni.reLaunch({
              url: '/pages/home/index'
            });
          }
        });
      } catch (error) {
        console.error('操作失败:', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 更新用户状态为正式登录
    updateUserStatus() {
      try {
        // 获取当前用户信息，处理可能已经是对象的情况
        const userInfoData = uni.getStorageSync('userInfo');
        let userInfo = {};
        if (userInfoData) {
          if (typeof userInfoData === 'string') {
            try {
              userInfo = JSON.parse(userInfoData);
            } catch (e) {
              // 如果解析失败，可能已经是对象
              userInfo = userInfoData;
            }
          } else {
            userInfo = userInfoData;
          }
        }
        
        // 将用户设置为非游客
        userInfo.isGuest = false;
        
        // 保存更新后的用户信息
        uni.setStorageSync('userInfo', JSON.stringify(userInfo));
        
        // 清除游客标记
        uni.removeStorageSync('isGuest');
        
        // 更新全局应用状态
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus) {
          app.globalData.userStatus.isLoggedIn = true;
          app.globalData.userStatus.isGuest = false;
          app.globalData.userStatus.userInfo = userInfo;
        }
        
        console.log('用户状态已更新为正式登录');
      } catch (error) {
        console.error('更新用户状态失败:', error);
      }
    }
  }
}
</script>

<style scoped>
.social-setting {
  padding: 40rpx;
}
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}
.social-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}
.social-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
}
.social-input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin-right: 20rpx;
  box-sizing: border-box;
}
.close-text {
  font-size: 32rpx;
  color: #999;
  /* 增加点击区域和反馈 */
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.close-text:active {
  background-color: #f5f5f5;
}
.btn-group {
  display: flex;
  justify-content: space-between;
  margin-top: 60rpx;
}
.next-btn, .skip-btn {
  width: 48%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
}
.next-btn {
  background-color: #2699fb;
  color: #fff;
}
.skip-btn {
  border: 1rpx solid #eee;
  background-color: #fff;
}
</style>