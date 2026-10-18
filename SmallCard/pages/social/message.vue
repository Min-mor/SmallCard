<template>
  <view class="message-page">
    <!-- 顶部导航栏 -->
    <view class="message-header">
      <view class="back-button" @click="goBack">
        <image src="/static/icon/back.png" class="back-image" mode="aspectFit"></image>
      </view>
      <view class="header-title">消息通知</view>
      <view class="placeholder"></view>
    </view>

    <!-- 消息列表 -->
  <view class="message-list">
    <!-- 消息项 - 点赞通知 -->
    <view class="message-item" v-for="(msg, index) in messageList" :key="index" :class="{ 'unread': !msg.isRead }" @click="handleMessageClick(msg)">
      <view style="position: relative;">
        <image :src="msg.avatar || '/static/icon/我的.png'" class="message-avatar" mode="aspectFill"></image>
        <!-- 未读红点提示 -->
        <view v-if="!msg.isRead" style="position: absolute; top: -5rpx; right: -5rpx; width: 20rpx; height: 20rpx; background-color: #ff4444; border-radius: 50%; border: 2rpx solid #fff;"></view>
      </view>
      <view class="message-content">
        <view class="message-info">
          <text class="message-name">{{ msg.userName || '用户' }}</text>
          <text class="message-action" :class="{liked: msg.type === 'like', commented: msg.type === 'comment'}">
            {{ msg.type === 'like' ? '点赞了你的帖子' : '评论了你的帖子' }}
          </text>
        </view>
        <view class="message-post-content" v-if="msg.postContent">{{ msg.postContent }}</view>
        <view class="message-comment-content" v-if="msg.commentContent && msg.type === 'comment'">{{ msg.commentContent }}</view>
        <view class="message-time">{{ formatTime(msg.createTime) }}</view>
      </view>
      <!-- 消息操作按钮 -->
      <view style="margin-left: 20rpx;">
        <button type="warn" size="mini" @click.stop="deleteMessage(msg.id)">删除</button>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="messageList.length === 0">
      <image src="/static/icon/通知.png" class="empty-icon" mode="aspectFit"></image>
      <text class="empty-text">暂无消息通知</text>
      <text style="font-size: 24rpx; color: #bbb; margin-top: 20rpx;">当有人点赞或评论你的帖子时，消息会显示在这里</text>
    </view>
  </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'MessagePage',
  setup() {
    const router = useRouter();
    const messageList = ref([]);
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const now = Date.now();
      const diff = now - timestamp;
      
      // 小于1分钟
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      // 小于1小时
      else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前';
      }
      // 小于24小时
      else if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
      }
      // 小于7天
      else if (diff < 7 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
      }
      // 其他显示具体日期
      else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    };

    // 加载消息列表
    const loadMessages = () => {
      try {
        // 从本地存储加载消息
        const storedMessages = uni.getStorageSync('userMessages') || [];
        messageList.value = storedMessages.sort((a, b) => b.createTime - a.createTime);
        
        // 如果没有消息，添加一些模拟数据用于展示
        if (messageList.value.length === 0) {
          messageList.value = [
            {
              id: '1',
              userId: '1001',
              type: 'like',
              userName: '张三',
              avatar: '/static/photo/张三.jpg',
              postId: 'post1',
              postContent: '今天天气真好，适合出去走走！',
              createTime: Date.now() - 30 * 60 * 1000 // 30分钟前
            },
            {
              id: '2',
              userId: '1002',
              type: 'comment',
              userName: '李四',
              avatar: '/static/photo/李四.jpg',
              postId: 'post2',
              postContent: '分享一个我最近学到的新技能',
              commentContent: '太棒了，学到了！',
              createTime: Date.now() - 2 * 60 * 60 * 1000 // 2小时前
            },
            {
              id: '3',
              userId: '1003',
              type: 'like',
              userName: '王五',
              avatar: '/static/photo/王五.jpg',
              postId: 'post1',
              postContent: '今天天气真好，适合出去走走！',
              createTime: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1天前
            }
          ];
        }
      } catch (error) {
        console.error('加载消息失败:', error);
        uni.showToast({ title: '加载消息失败', icon: 'none' });
      }
    };

    // 处理消息点击
    const handleMessageClick = (message) => {
      if (message.postId || message.id) {
        // 确保消息对象中包含userId字段
        if (!message.userId) {
          // 为已有的消息添加userId
          message.userId = message.id; // 简化处理，使用消息ID作为用户ID
        }
        
        // 标记消息为已读
        message.isRead = true;
        // 保存到本地存储
        uni.setStorageSync('userMessages', messageList.value);
        
        // 更新消息提示角标
        updateMessageBadge();
        
        // 使用uni.navigateTo跳转到通知详情页面
        uni.navigateTo({
          url: `/pages/social/notification-detail?messageData=${encodeURIComponent(JSON.stringify(message))}`,
          success: () => {
            console.log('成功跳转到通知详情页面');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            // 提供友好提示
            uni.showToast({
              title: '加载通知详情失败',
              icon: 'none',
              duration: 1500
            });
            
            // 失败时回退到原来的跳转方式
            setTimeout(() => {
              uni.navigateTo({
                url: `/pages/social/index?postId=${message.postId || message.id}&fromMessage=true&createPlaceholder=true&messageData=${encodeURIComponent(JSON.stringify(message))}`
              });
            }, 500);
          }
        });
      }
    };
    
    // 删除消息
    const deleteMessage = (messageId) => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条消息吗？',
        success: (res) => {
          if (res.confirm) {
            // 从列表中移除消息
            const index = messageList.value.findIndex(msg => msg.id === messageId);
            if (index > -1) {
              messageList.value.splice(index, 1);
              // 保存到本地存储
              uni.setStorageSync('userMessages', messageList.value);
              // 更新消息提示角标
              updateMessageBadge();
              // 显示成功提示
              uni.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
              });
            }
          }
        }
      });
    };
    
    // 更新消息提示角标
    const updateMessageBadge = () => {
      try {
        const userMessages = uni.getStorageSync('userMessages') || [];
        const unreadCount = userMessages.filter(msg => !msg.isRead).length;
        
        if (unreadCount > 0) {
          // 设置tabBar角标
          uni.setTabBarBadge({
            index: 2, // 假设消息页面在tabBar的第3位（索引为2）
            text: String(unreadCount > 99 ? '99+' : unreadCount)
          });
        } else {
          // 清除角标
          uni.removeTabBarBadge({
            index: 2
          });
        }
      } catch (error) {
        console.error('更新消息角标失败:', error);
      }
    };

    // 页面加载时执行
    onMounted(() => {
      loadMessages();
      // 更新消息提示角标
      updateMessageBadge();
    });

    return {
      messageList,
      goBack,
      formatTime,
      handleMessageClick,
      deleteMessage
    };
  }
};
</script>

<style scoped>
.message-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.message-header {
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

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

/* 消息项 */
.message-item {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.message-item:active {
  transform: scale(0.98);
}

.message-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.message-content {
  flex: 1;
  min-height: 96rpx;
}

.message-info {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-right: 10rpx;
}

.message-action {
  font-size: 28rpx;
  color: #666;
}

.message-action.liked {
  color: #ff4444;
}

.message-action.commented {
  color: #07c160;
}

.message-post-content {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-comment-content {
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 10rpx 20rpx;
  border-radius: 16rpx;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-time {
  font-size: 24rpx;
  color: #bbb;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.5;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>