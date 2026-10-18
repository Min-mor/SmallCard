<template>
  <view class="praise-page">
    <!-- 头部 -->
    <view class="header">
      <image src="/static/icon/back.png" class="back-btn" @click="goBack" mode="widthFix"></image>
      <text class="title">收到的夸夸</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 夸夸列表 -->
    <view class="praise-list">
      <view class="praise-card" v-for="(praise, index) in praises" :key="index">
        <view class="card-header">
          <!-- 用户头像 -->
          <image :src="praise.avatar" class="user-avatar" mode="cover"></image>
          
          <!-- 用户名 -->
          <view class="user-info">
            <text class="user-name">{{ praise.username }}</text>
            <text class="user-level">{{ praise.level }}</text>
          </view>
          
          <!-- 可点击的点赞图标 -->
          <image 
            :src="praise.isLiked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" 
            class="praise-icon" 
            mode="widthFix"
            @click="toggleLike(index)"
          ></image>
        </view>
        
        <!-- 夸夸内容 -->
        <view class="card-content">
          <text class="content-text">{{ praise.content }}</text>
          <!-- 图片显示 -->
          <image v-if="praise.image" :src="praise.image" class="praise-image" mode="aspectFit"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 模拟夸夸数据
      praises: []
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 切换点赞状态
    toggleLike(index) {
      // 切换当前夸夸的点赞状态
      this.praises[index].isLiked = !this.praises[index].isLiked;
      
      // 保存更新后的夸夸数据到本地存储
      this.savePraisesToStorage();
      
      // 触发全局事件，通知首页更新夸夸数量
      uni.$emit('praisesUpdated');
    },
    
    // 添加新的夸夸消息（从夸夸详情页调用）
    addPraiseMessage(content, image = '') {
      // 创建新的夸夸对象，包含内容和图片
      const newPraise = {
        avatar: '/static/photo/S..jpg', // 使用默认头像
        username: 'S.', // 使用默认用户名
        level: '大神', // 使用默认等级
        content: content,
        image: image,
        isLiked: false
      };
      
      // 将新夸夸添加到列表开头
      this.praises.unshift(newPraise);
      
      // 保存更新后的夸夸数据到本地存储
      this.savePraisesToStorage();
      
      // 触发全局事件，通知首页更新夸夸数量
      uni.$emit('praisesUpdated');
    },
    
    // 获取当前用户ID
    getCurrentUserId() {
      try {
        // 从全局数据或本地存储获取用户ID
        const app = getApp();
        const userInfo = app.globalData.userStatus?.userInfo;
        if (userInfo && userInfo.userId) {
          return userInfo.userId;
        }
        // 如果没有用户ID，使用游客标识
        const isGuest = uni.getStorageSync('isGuest');
        return isGuest ? 'guest' : 'default_user';
      } catch (e) {
        console.error('获取用户ID失败:', e);
        return 'default_user';
      }
    },
    
    // 保存夸夸数据到本地存储
    savePraisesToStorage() {
      try {
        // 获取当前用户ID和存储前缀，确保夸夸数据按用户隔离
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        uni.setStorageSync(`${storagePrefix}praises`, this.praises);
        console.log('夸夸数据已保存到本地存储');
      } catch (error) {
        console.error('保存夸夸数据失败:', error);
      }
    }
  },
    
    mounted() {
      // 尝试从本地存储加载夸夸数据
      try {
        // 获取当前用户ID和存储前缀，确保夸夸数据按用户隔离
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        const savedPraises = uni.getStorageSync(`${storagePrefix}praises`);
        if (savedPraises && savedPraises.length > 0) {
          this.praises = savedPraises;
        } else {
          // 如果没有保存的数据，使用模拟数据
          this.praises = [
            {
              avatar: '/static/photo/S..jpg',
              username: 'S.',
              level: '大神',
              content: '棒!',
              isLiked: false
            },
            {
              avatar: '/static/photo/S..jpg',
              username: 'S.',
              level: '大神',
              content: '棒!',
              isLiked: false
            },
            {
              avatar: '/static/photo/S..jpg',
              username: 'S.',
              level: '大神',
              content: '棒!',
              isLiked: false
            }
          ];
          // 保存模拟数据到本地存储
          this.savePraisesToStorage();
        }
      } catch (error) {
        console.error('加载夸夸数据失败:', error);
        // 出错时使用模拟数据
        this.praises = [
          {
            avatar: '/static/photo/S..jpg',
            username: 'S.',
            level: '大神',
            content: '棒!',
            isLiked: false
          },
          {
            avatar: '/static/photo/S..jpg',
            username: 'S.',
            level: '大神',
            content: '棒!',
            isLiked: false
          },
          {
            avatar: '/static/photo/S..jpg',
            username: 'S.',
            level: '大神',
            content: '棒!',
            isLiked: false
          }
        ];
      }
    }
}
</script>

<style scoped>
/* 页面容器 */
.praise-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 40rpx;
  height: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 50rpx;
}

/* 夸夸列表样式 */
.praise-list {
  padding: 100rpx 30rpx 30rpx 30rpx;
}

/* 夸夸卡片样式 */
.praise-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

/* 用户头像 */
.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

/* 用户信息 */
.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.user-level {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

/* 夸夸图标 */
.praise-icon {
  width: 48rpx;
  height: 48rpx;
}

/* 卡片内容 */
.card-content {
  padding-left: 100rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

/* 夸夸图片样式 */
.praise-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  margin-top: 20rpx;
  background-color: #f5f5f5;
}
</style>