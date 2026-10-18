<template>
  <view class="basic-setting">
    <!-- 头部标题 -->
    <view class="header">
      <!-- 可根据需要添加标题文字 -->
    </view>

    <!-- 头像区域（修改后） -->
    <view class="avatar-section">
      <view class="avatar-container" @click="chooseAvatar">
        <!-- 已选择头像时显示图片 -->
        <image 
          :src="userInfo.avatarUrl" 
          class="avatar-img" 
          mode="cover" 
          v-if="userInfo.avatarUrl"
        ></image>
        
        <!-- 未选择头像时显示占位圆框和提示文字 -->
        <view class="avatar-placeholder" v-else>
          <text class="upload-text">点击上传头像</text>
          <text class="upload-subtext">建议使用清晰的个人照片</text>
        </view>
        
        <!-- 编辑头像时的提示（可选） -->
        <view class="edit-overlay" v-if="userInfo.avatarUrl">
          <text class="edit-text">上传头像</text>
        </view>
      </view>
    </view>

    <!-- 用户输入区域 -->
    <view class="input-section">
      <input 
        type="text" 
        placeholder="你的名字" 
        v-model="userInfo.userName" 
        class="input-item" 
      />
      <!-- 使用textarea替换input，支持多行输入 -->
      <textarea 
        placeholder="你的简介" 
        v-model="userInfo.userIntro" 
        class="textarea-item"
        auto-height
        maxlength="200"
      />
    </view>

    <!-- 吉梨模块（固定展示） -->
    <view class="card-section">
      <view class="card-item">
        <image :src="defaultInfo.avatarUrl || '/static/icon/我的.png'" class="card-avatar" mode="cover"></image>
        <view class="card-info">
          <text class="card-name">{{ defaultInfo.userName }}</text>
          <text class="card-desc">{{ defaultInfo.userIntro }}</text>
        </view>
        <button class="copy-btn" @click="copyDefaultCard">复制吉梨信息</button>
      </view>
    </view>

    <!-- 底部按钮 -->
    <button class="next-btn" @click="saveUserInfo">保存，下一步</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 用户输入的信息（独立存储）
      userInfo: {
        avatarUrl: '', 
        userName: '',
        userIntro: ''
      },
      // 吉梨的默认信息（固定不变）
      defaultInfo: {
        avatarUrl: '',
        userName: '吉梨',
        userIntro: '00后intp 产品设计ios开发 做好产品，交好朋友'
      }
    }
  },
  onLoad() {
    // 页面加载时获取本地存储的用户信息
    this.loadUserInfo();
    // 页面加载时检查是否是新用户，如果是则自动初始化并保存到历史账号
    this.checkAndSaveNewUser();
  },
  methods: {
    // 检查并保存新用户到历史账号列表
    checkAndSaveNewUser() {
      try {
        // 获取当前用户信息
        let currentUser = null;
        const storedUser = uni.getStorageSync('userInfo');
        if (storedUser) {
          currentUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
        }
        
        // 如果是新创建的用户（没有明确的userInfo），初始化并保存
        if (!currentUser || (!currentUser.id || currentUser.id.startsWith('guest_'))) {
          console.log('检测到新用户或游客，将初始化并保存到历史账号');
          // 这里不需要立即保存，因为在用户填写信息后保存时会处理
        }
      } catch (error) {
        console.error('检查新用户状态失败:', error);
      }
    },
    // 加载用户信息
    loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
          // 确保是对象格式
          this.userInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
          // 为了确保兼容性，统一字段名称
          if (this.userInfo.name) {
            this.userInfo.userName = this.userInfo.name;
          }
          // 即使是已存在的用户，也确保其在历史账号列表中
          this.saveToHistoryAccounts();
        } else {
          // 如果没有用户信息，使用默认信息创建新用户
          this.userInfo = {
            id: `user_${Date.now()}`, // 生成唯一ID
            userName: this.defaultInfo.userName,
            userIntro: this.defaultInfo.userIntro,
            avatarUrl: ''
          };
          
          // 立即将新用户保存到历史账号列表
          this.saveToHistoryAccounts();
          console.log('创建了新用户并保存到历史账号列表');
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        // 出错时也创建默认用户
        this.userInfo = {
          id: `user_${Date.now()}`,
          userName: this.defaultInfo.userName,
          userIntro: this.defaultInfo.userIntro,
          avatarUrl: ''
        };
      }
    },
    goBack() {
      uni.navigateBack();
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatarUrl = res.tempFilePaths[0];
        }
      });
    },
    // 保存用户信息到本地存储
    saveUserInfo() {
      try {
        // 首先检查用户名是否为空
        if (!this.userInfo.userName || this.userInfo.userName.trim() === '') {
          uni.showToast({
            title: '用户名不能为空',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        
        // 先验证并保存到历史账号列表
        const historySaveSuccess = this.saveToHistoryAccounts();
        
        // 如果历史账号保存失败（用户名冲突），则不继续保存
        if (!historySaveSuccess) {
          return;
        }
        
        // 保存用户信息到本地存储（需要转换为JSON字符串）
        uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
        
        // 更新全局应用的用户信息
        const app = getApp();
        if (app && app.globalData) {
          if (app.globalData.userStatus) {
            app.globalData.userStatus.isLoggedIn = true;
            app.globalData.userStatus.isGuest = false;
            app.globalData.userStatus.userInfo = this.userInfo;
          } else {
            app.globalData.userStatus = {
              isLoggedIn: true,
              isGuest: false,
              userInfo: this.userInfo
            };
          }
        }
        
        // 触发一个自定义事件，通知其他页面用户信息已更新
        uni.$emit('userInfoUpdated', this.userInfo);
        
        // 显示成功提示
        uni.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 800,
          complete: () => {
            // 跳转到社交信息设置页面
            uni.navigateTo({
              url: '/pages/setting/social',
              success: () => {
                console.log('跳转到社交设置页面成功');
              },
              fail: (err) => {
                console.error('跳转失败:', err);
                // 失败时使用reLaunch备用
                uni.reLaunch({
                  url: '/pages/setting/social'
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('保存用户信息失败:', error);
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    },
    // 复制吉梨的信息
    copyDefaultCard() {
      const { userName, userIntro } = this.defaultInfo;
      uni.setClipboardData({
        data: `${userName}\n${userIntro}`,
        success: () => {
          uni.showToast({
            title: '复制吉梨信息成功',
            icon: 'success'
          });
        }
      });
    },
    
    // 保存到历史账号列表
    saveToHistoryAccounts() {
      try {
        // 创建账号信息对象，确保包含必要的字段
        const accountInfo = {
          userId: this.userInfo.id || `user_${Date.now()}`,
          username: this.userInfo.userName || this.defaultInfo.userName,
          nickname: this.userInfo.userName || this.defaultInfo.userName,
          avatar: this.userInfo.avatarUrl || '',
          lastLoginTime: new Date().toISOString()
        };
        
        // 读取现有历史账号
        let historyAccounts = [];
        const storedAccounts = uni.getStorageSync('historyAccounts');
        if (storedAccounts) {
          historyAccounts = typeof storedAccounts === 'string' ? JSON.parse(storedAccounts) : storedAccounts;
          if (!Array.isArray(historyAccounts)) {
            historyAccounts = [];
          }
        }
        
        // 检查是否存在相同用户ID的账号（更新现有账号）
        const existingUserIdIndex = historyAccounts.findIndex(account => 
          account.userId === accountInfo.userId
        );
        
        if (existingUserIdIndex !== -1) {
          // 更新现有账号信息
          historyAccounts[existingUserIdIndex] = accountInfo;
          // 将更新后的账号移到列表开头
          const updatedAccount = historyAccounts.splice(existingUserIdIndex, 1)[0];
          historyAccounts.unshift(updatedAccount);
        } else {
          // 检查是否存在相同用户名但不同用户ID的账号
          const existingUsernameIndex = historyAccounts.findIndex(account => 
            account.username === accountInfo.username && account.userId !== accountInfo.userId
          );
          
          if (existingUsernameIndex !== -1) {
            // 显示提示：用户名已被使用
            uni.showToast({
              title: '该用户名已被其他账号使用，请选择不同的用户名',
              icon: 'none',
              duration: 2000
            });
            // 阻止保存并返回
            return false;
          }
          
          // 将新账号添加到列表开头
          historyAccounts.unshift(accountInfo);
        }
        
        // 限制历史账号数量（最多保存5个）
        if (historyAccounts.length > 5) {
          historyAccounts = historyAccounts.slice(0, 5);
        }
        
        // 保存回本地存储
        uni.setStorageSync('historyAccounts', JSON.stringify(historyAccounts));
        console.log('保存到历史账号列表成功:', accountInfo);
        return true;
      } catch (error) {
        console.error('保存到历史账号列表失败:', error);
        return false;
      }
    }
  }
}
</script>

<style scoped>
.basic-setting {
  padding: 40rpx;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  padding-top: 20rpx;
}

/* 头像区域样式（修改后） */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
}

.avatar-container {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%; /* 圆形边框 */
  overflow: hidden;
  border: 2rpx solid #eee;
  cursor: pointer;
}

/* 已选择的头像图片 */
.avatar-img {
  width: 100%;
  height: 100%;
}

/* 未选择头像时的占位圆框 */
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20rpx;
}

/* 上传提示文字 */
.upload-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

/* 上传辅助提示文字 */
.upload-subtext {
  font-size: 22rpx;
  color: #999;
}

/* 已选择头像时的编辑提示层 */
.edit-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-text {
  font-size: 24rpx;
  color: #fff;
}

/* 用户输入区域样式 */
.input-section {
  margin-bottom: 40rpx;
}

.input-item {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.textarea-item {
  width: 100%;
  min-height: 120rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.5;
  margin-bottom: 30rpx;
}

/* 吉梨模块样式 */
.card-section {
  margin-bottom: 80rpx;
  width: 320rpx;
  margin-left: auto;
  margin-right: auto;
}

.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  width: 100%;
  height: 320rpx;
  background-color: #fafafa;
}

.card-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.card-info {
  text-align: center;
  margin-bottom: 25rpx;
}

.card-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #333;
}

.card-desc {
  display: block;
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  white-space: pre-wrap;
}

.copy-btn {
  width: 120rpx;
  height: 50rpx;
  line-height: 50rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
  color: #666;
}

/* 底部按钮样式 */
.next-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #2699fb;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
}

button::after {
  border: none;
}
</style>