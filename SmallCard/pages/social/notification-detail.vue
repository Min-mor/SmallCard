<template>
  <view class="notification-detail-page">
    <!-- 顶部导航栏 -->
    <view class="detail-header">
      <view class="back-button" @click="goBack">
        <image src="/static/icon/back.png" class="back-image" mode="aspectFit"></image>
      </view>
      <view class="header-title">{{ notificationTitle }}</view>
      <view class="placeholder"></view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 通知详情内容 -->
    <view class="detail-content" v-else>
      <!-- 通知信息卡片 -->
      <view class="notification-card" v-if="messageData && Object.keys(messageData).length > 0" :class="{ 'card-visible': !loading }">
        <view class="notification-user-info">
          <image :src="messageData.avatar || '/static/icon/我的.png'" class="notification-avatar" mode="aspectFill"></image>
          <view class="notification-user-details">
            <view class="notification-user-name">{{ messageData.userName || '用户' }}</view>
            <view class="notification-action" :class="actionClass">
              {{ messageData.type === 'like' ? '点赞了你的帖子' : '评论了你的帖子' }}
            </view>
            <view class="notification-time">{{ formatTime(messageData.createTime) }}</view>
          </view>
        </view>
        
        <!-- 评论内容（仅在评论类型通知时显示） -->
        <view class="notification-comment" v-if="messageData.type === 'comment' && messageData.commentContent">
          <text>{{ messageData.commentContent }}</text>
        </view>
      </view>

      <!-- 帖子内容卡片 -->
      <view class="post-card" v-if="hasPostContent" :class="{ 'card-visible': !loading }">
        <view class="post-header">
          <image src="/static/icon/我的.png" class="post-avatar" mode="aspectFill"></image>
          <view class="post-user">
            <view class="post-user-name">{{ postData.userName || '我的帖子' }}</view>
            <view class="post-time">{{ formatTime(postData.createTime || messageData.createTime) }}</view>
          </view>
        </view>
        
        <view class="post-content">
          <view class="post-text">{{ postContent }}</view>
          
          <!-- 帖子图片（如果有） -->
          <view class="post-image-list" v-if="postImages && postImages.length > 0">
            <image 
              v-for="(img, index) in postImages" 
              :key="index" 
              :src="img" 
              class="post-image" 
              mode="aspectFill"
              @click="previewImage(postImages, index)"
              :class="{ 'image-visible': !loading, 'image-hover': isImageHover && hoveredImageIndex === index }"
              @touchstart="handleImageTouchStart(index)"
              @touchend="handleImageTouchEnd"
            ></image>
          </view>
          
          <!-- 帖子互动数据 -->
          <view class="post-interaction">
            <view class="interaction-item" @click="handleLike" :class="{ 'liked': isLiked }">
              <image :src="isLiked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" class="interaction-icon" mode="aspectFit"></image>
              <text :class="isLiked ? 'liked-text' : ''">{{ displayLikes }} 赞</text>
            </view>
            <view class="interaction-item" @click="replyToComment" v-if="messageData && messageData.type === 'comment'">
              <image src="/static/icon/评论.png" class="interaction-icon" mode="aspectFit"></image>
              <text>{{ postData.commentCount || 0 }} 评论</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-button primary" @click="goToFullPost" :class="{ 'button-visible': !loading }">查看完整帖子</button>
        <button class="action-button secondary" @click="replyToComment" v-if="messageData && messageData.type === 'comment'" :class="{ 'button-visible': !loading }">回复</button>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!messageData || Object.keys(messageData).length === 0">
        <view class="empty-icon">📭</view>
        <text class="empty-text">暂无通知信息</text>
        <button class="empty-button" @click="goBack">返回消息列表</button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import userService from '../../utils/userService.js';

export default {
  name: 'NotificationDetail',
  setup() {
    const messageData = ref({});
    const postData = ref({});
    const loading = ref(true);
    const isLiked = ref(false);
    const localLikes = ref(0);
    const isImageHover = ref(false);
    const hoveredImageIndex = ref(-1);
    let likeAnimationTimer = null;
    
    // 计算属性
    const notificationTitle = computed(() => {
      return messageData.value.type === 'like' ? '点赞详情' : '评论详情';
    });
    
    const actionClass = computed(() => {
      return messageData.value.type === 'like' ? 'liked' : 'commented';
    });
    
    // 计算是否有帖子内容
    const hasPostContent = computed(() => {
      return messageData.value && (messageData.value.postContent || postData.value.content || postImages.value.length > 0);
    });
    
    // 计算帖子内容文本
    const postContent = computed(() => {
      if (postData.value.content) return postData.value.content;
      if (messageData.value.postContent) return messageData.value.postContent;
      return '该帖子内容已无法查看';
    });
    
    // 计算帖子图片
    const postImages = computed(() => {
      if (postData.value.images && Array.isArray(postData.value.images)) return postData.value.images;
      if (messageData.value.images && Array.isArray(messageData.value.images)) return messageData.value.images;
      return [];
    });
    
    // 计算显示的点赞数
    const displayLikes = computed(() => {
      if (localLikes.value) return localLikes.value;
      return postData.value.likeCount || messageData.value.likes || 0;
    });
    
    // 返回上一页
    const goBack = () => {
      // 添加返回动画效果
      setTimeout(() => {
        uni.navigateBack();
      }, 100);
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60 * 1000) {
        return '刚刚';
      } else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前';
      } else if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
      } else if (diff < 7 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
      } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    };
    
    // 预览图片
    const previewImage = (imageList, currentIndex) => {
      if (!imageList || imageList.length === 0 || currentIndex === undefined) {
        return;
      }
      
      uni.previewImage({
        urls: imageList,
        current: imageList[currentIndex],
        success: () => {
          console.log('图片预览成功');
        },
        fail: (err) => {
          console.error('预览图片失败:', err);
          uni.showToast({ title: '预览图片失败', icon: 'none' });
        }
      });
    };
    
    // 图片触摸开始处理
    const handleImageTouchStart = (index) => {
      isImageHover.value = true;
      hoveredImageIndex.value = index;
    };
    
    // 图片触摸结束处理
    const handleImageTouchEnd = () => {
      // 延迟一点时间再取消触摸效果，避免视觉闪烁
      setTimeout(() => {
        isImageHover.value = false;
        hoveredImageIndex.value = -1;
      }, 150);
    };
    
    // 跳转到完整帖子页面
    const goToFullPost = () => {
      if (!messageData.value) return;
      
      // 添加跳转动画效果
      uni.navigateTo({
        url: `/pages/social/index?postId=${messageData.value.postId || messageData.value.id}&fromMessage=true&createPlaceholder=true&messageData=${encodeURIComponent(JSON.stringify(messageData.value))}`,
        success: () => {
          console.log('成功跳转到完整帖子页面');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    };
    
    // 处理点赞
    const handleLike = () => {
      // 添加点赞动画效果
      isLiked.value = !isLiked.value;
      
      // 更新本地点赞数
      if (isLiked.value) {
        localLikes.value = displayLikes.value + 1;
      } else {
        localLikes.value = Math.max(0, displayLikes.value - 1);
      }
      
      // 清除之前的计时器
      if (likeAnimationTimer) {
        clearTimeout(likeAnimationTimer);
      }
      
      // 添加点赞反馈动画
      const likeElement = document.querySelector('.interaction-item.liked');
      if (likeElement) {
        likeElement.classList.add('like-animation');
        likeAnimationTimer = setTimeout(() => {
          likeElement.classList.remove('like-animation');
        }, 300);
      }
      
      // 显示反馈
      uni.showToast({
        title: isLiked.value ? '点赞成功' : '取消点赞',
        icon: 'success',
        duration: 1500
      });
    };
    
    // 回复评论
    const replyToComment = () => {
      if (messageData.value && messageData.value.type === 'comment') {
        goToFullPost();
      }
    };
    
    // 加载帖子数据
    const loadPostData = () => {
      if (!messageData.value) {
        loading.value = false;
        return;
      }
      
      // 初始化点赞状态
      if (messageData.value.type === 'like') {
        isLiked.value = true;
      }
      
      // 尝试从本地存储中获取帖子详情
      try {
        const storageKeys = ['recommendedPosts', 'myPosts', 'userPosts', 'socialPosts'];
        let foundPost = null;
        const postId = messageData.value.postId || messageData.value.id;
        
        // 尝试从多个存储键中查找
        for (const key of storageKeys) {
          const posts = uni.getStorageSync(key) || [];
          if (Array.isArray(posts)) {
            foundPost = posts.find(post => post.id === postId);
            if (foundPost) break;
          }
        }
        
        // 如果找到帖子，使用真实数据；否则使用消息中的数据创建临时帖子
        if (foundPost) {
          postData.value = { ...foundPost };
        } else {
          // 创建基于消息数据的临时帖子
          postData.value = {
            id: postId,
            content: messageData.value.postContent || '',
            userName: '我的帖子',
            userAvatar: '/static/icon/我的.png',
            createTime: messageData.value.postCreateTime || messageData.value.createTime || Date.now(),
            likeCount: messageData.value.likes || 0,
            commentCount: messageData.value.comments || 0,
            images: messageData.value.images || [],
            isPlaceholder: true
          };
        }
      } catch (error) {
        console.error('加载帖子数据失败:', error);
      } finally {
        // 延迟一下显示，避免加载闪烁，并添加淡入动画
        setTimeout(() => {
          loading.value = false;
        }, 300);
      }
    };
    
    // 获取最新的用户信息
    const getLatestUserInfo = async (userId) => {
      if (!userId) return;
      
      try {
        const userInfo = await userService.getUserById(userId);
        if (userInfo) {
          // 更新消息数据中的用户信息为最新的
          messageData.value.userName = userInfo.nickname || messageData.value.userName;
          messageData.value.avatar = userInfo.avatar_url || messageData.value.avatar;
          console.log('已更新为最新的用户信息:', userInfo.nickname, userInfo.avatar_url);
        }
      } catch (error) {
        console.error('获取最新用户信息失败:', error);
        // 失败时不影响页面显示，继续使用已有的用户信息
      }
    };
    
    // 页面加载时
    onMounted(async () => {
      // 获取页面参数
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      
      if (options && options.messageData) {
        try {
          // 解析消息数据
          messageData.value = JSON.parse(decodeURIComponent(options.messageData));
          console.log('解析到消息数据:', messageData.value);
          
          // 获取并更新最新的用户信息
          if (messageData.value.userId) {
            await getLatestUserInfo(messageData.value.userId);
          }
          
          // 加载帖子数据
          loadPostData();
        } catch (e) {
          console.error('解析messageData失败:', e);
          uni.showToast({ title: '加载通知详情失败', icon: 'none' });
          loading.value = false;
        }
      } else {
        loading.value = false;
      }
    });
    
    return {
      messageData,
      postData,
      loading,
      isLiked,
      isImageHover,
      hoveredImageIndex,
      hasPostContent,
      postContent,
      postImages,
      displayLikes,
      notificationTitle,
      actionClass,
      goBack,
      formatTime,
      previewImage,
      handleImageTouchStart,
      handleImageTouchEnd,
      goToFullPost,
      handleLike,
      replyToComment
    };
  }
};
</script>

<style scoped>
.notification-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: #999;
  transition: opacity 0.3s ease;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  border: 5rpx solid #f3f3f3;
  border-top: 5rpx solid #2699fb;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
}

/* 顶部导航栏 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.back-image {
  width: 44rpx;
  height: 44rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.placeholder {
  width: 44rpx;
}

/* 内容区域 */
.detail-content {
  padding: 20rpx;
}

/* 卡片显示动画 */
.card-visible {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(20rpx);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* 通知卡片 */
.notification-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transform: translateY(20rpx);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.notification-card.card-visible {
  transform: translateY(0);
  opacity: 1;
}

.notification-user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.notification-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.notification-user-details {
  flex: 1;
}

.notification-user-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.notification-action {
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.notification-action.liked {
  color: #ff4444;
  font-weight: 500;
}

.notification-action.commented {
  color: #07c160;
  font-weight: 500;
}

.notification-time {
  font-size: 24rpx;
  color: #bbb;
}

.notification-comment {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  position: relative;
  overflow: hidden;
}

.notification-comment::before {
  content: '';
  position: absolute;
  left: 10rpx;
  top: -10rpx;
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-bottom: 10rpx solid #f5f5f5;
}

/* 帖子卡片 */
.post-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transform: translateY(20rpx);
  opacity: 0;
  transition: transform 0.4s ease 0.1s, opacity 0.4s ease 0.1s;
}

.post-card.card-visible {
  transform: translateY(0);
  opacity: 1;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.post-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.post-user-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.post-time {
  font-size: 22rpx;
  color: #bbb;
}

.post-content {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.post-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  word-break: break-all;
  word-wrap: break-word;
}

/* 帖子图片列表 */
.post-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: calc(33.33% - 7rpx);
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
  transform: scale(0.9);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease, filter 0.2s ease;
  position: relative;
}

.post-image.image-visible {
  transform: scale(1);
  opacity: 1;
}

.post-image:nth-child(1).image-visible {
  transition-delay: 0.2s;
}

.post-image:nth-child(2).image-visible {
  transition-delay: 0.3s;
}

.post-image:nth-child(3).image-visible {
  transition-delay: 0.4s;
}

.post-image.image-hover {
  filter: brightness(0.9);
  transform: scale(0.98);
}

.post-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.post-image.image-hover::after {
  opacity: 1;
}

/* 帖子互动数据 */
.post-interaction {
  display: flex;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
  color: #666;
}

.interaction-item {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
  font-size: 24rpx;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 10rpx 0;
}

.interaction-item:active {
  transform: scale(0.95);
}

.interaction-item.liked {
  transform: scale(1.1);
}

.like-animation {
  animation: likeBounce 0.3s ease;
}

@keyframes likeBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

.interaction-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
  transition: transform 0.2s ease;
}

.interaction-item:active .interaction-icon {
  transform: scale(0.9);
}

.liked-text {
  color: #ff4444;
  font-weight: 500;
}

/* 操作按钮 */
.action-buttons {
  margin-top: 30rpx;
}

.action-button {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
  border: none;
  background-color: transparent;
  transform: translateY(20rpx);
  opacity: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-button.button-visible {
  transform: translateY(0);
  opacity: 1;
}

.action-button.button-visible:nth-child(1) {
  transition-delay: 0.4s;
}

.action-button.button-visible:nth-child(2) {
  transition-delay: 0.5s;
}

.action-button:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.action-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-button:active::after {
  width: 300rpx;
  height: 300rpx;
}

.action-button.primary {
  background-color: #2699fb;
  color: #fff;
  box-shadow: 0 4rpx 20rpx rgba(38, 153, 251, 0.3);
}

.action-button.secondary {
  background-color: #f0f0f0;
  color: #666;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.empty-button {
  padding: 20rpx 60rpx;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 30rpx;
  font-size: 28rpx;
  transition: all 0.2s;
}

.empty-button:active {
  background-color: #e0e0e0;
  transform: scale(0.95);
}

/* 响应式设计 */
@media screen and (min-width: 768px) {
  .notification-detail-page {
    max-width: 600rpx;
    margin: 0 auto;
  }
  
  .detail-header {
    max-width: 600rpx;
    margin: 0 auto;
    position: sticky;
  }
}
</style>