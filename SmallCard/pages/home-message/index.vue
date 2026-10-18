<template>
  <view class="home-message-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">首页消息中心</text>
      <view class="header-right"></view>
    </view>

    <!-- 消息内容区域 -->
    <view class="message-content">
      <!-- 未读消息提示 -->
      <view v-if="unreadCount > 0" class="unread-tip">
        <text>您有 {{ unreadCount }} 条未读消息</text>
      </view>

      <!-- 消息分类标签 -->
      <view class="message-tabs">
        <view 
          v-for="tab in messageTabs" 
          :key="tab.id" 
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <text class="tab-text">{{ tab.name }}</text>
          <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view class="message-list">
        <!-- 点赞消息 -->
        <view v-if="activeTab === 'likes'" class="message-category">
          <text class="category-title">点赞消息</text>
          <view v-if="likeMessages.length > 0" class="messages-container">
            <view 
              v-for="msg in likeMessages" 
              :key="msg.id" 
              class="message-item"
              :class="{ unread: !msg.read }"
              @click="markAsRead(msg)"
            >
              <image :src="msg.avatar" class="user-avatar" mode="aspectFill"></image>
              <view class="message-info">
                <text class="message-text">{{ msg.content }}</text>
                <text class="message-time">{{ msg.time }}</text>
              </view>
              <view v-if="!msg.read" class="unread-dot"></view>
            </view>
          </view>
          <view v-else class="empty-message">
            <text>暂无点赞消息</text>
          </view>
        </view>

        <!-- 评论消息 -->
        <view v-if="activeTab === 'comments'" class="message-category">
          <text class="category-title">评论消息</text>
          <view v-if="commentMessages.length > 0" class="messages-container">
            <view 
              v-for="msg in commentMessages" 
              :key="msg.id" 
              class="message-item comment-item"
              :class="{ unread: !msg.read }"
              @click="markAsRead(msg)"
            >
              <image :src="msg.avatar" class="user-avatar" mode="aspectFill"></image>
              <view class="message-info">
                <text class="message-text">{{ msg.content }}</text>
                <view class="comment-content">
                  <text>{{ msg.commentContent }}</text>
                </view>
                <text class="message-time">{{ msg.time }}</text>
              </view>
              <view v-if="!msg.read" class="unread-dot"></view>
            </view>
          </view>
          <view v-else class="empty-message">
            <text>暂无评论消息</text>
          </view>
        </view>

        <!-- 关注消息 -->
        <view v-if="activeTab === 'follows'" class="message-category">
          <text class="category-title">关注消息</text>
          <view v-if="followMessages.length > 0" class="messages-container">
            <view 
              v-for="msg in followMessages" 
              :key="msg.id" 
              class="message-item"
              :class="{ unread: !msg.read }"
              @click="markAsRead(msg)"
            >
              <image :src="msg.avatar" class="user-avatar" mode="aspectFill"></image>
              <view class="message-info">
                <text class="message-text">{{ msg.content }}</text>
                <text class="message-time">{{ msg.time }}</text>
              </view>
              <button 
                v-if="!msg.isFollowing" 
                class="follow-button"
                @click.stop="followUser(msg)"
              >
                关注
              </button>
              <text v-else class="following-text">已关注</text>
              <view v-if="!msg.read" class="unread-dot"></view>
            </view>
          </view>
          <view v-else class="empty-message">
            <text>暂无关注消息</text>
          </view>
        </view>

        <!-- 系统通知 -->
        <view v-if="activeTab === 'system'" class="message-category">
          <text class="category-title">系统通知</text>
          <view v-if="systemMessages.length > 0" class="messages-container">
            <view 
              v-for="msg in systemMessages" 
              :key="msg.id" 
              class="message-item system-item"
              :class="{ unread: !msg.read }"
              @click="markAsRead(msg)"
            >
              <view class="system-icon">{{ msg.icon }}</view>
              <view class="message-info">
                <text class="system-title">{{ msg.title }}</text>
                <text class="message-text">{{ msg.content }}</text>
                <text class="message-time">{{ msg.time }}</text>
              </view>
              <view v-if="!msg.read" class="unread-dot"></view>
            </view>
          </view>
          <view v-else class="empty-message">
            <text>暂无系统通知</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 消息标签页
      messageTabs: [
        { id: 'likes', name: '点赞', count: 5 },
        { id: 'comments', name: '评论', count: 3 },
        { id: 'follows', name: '关注', count: 2 },
        { id: 'system', name: '系统', count: 1 }
      ],
      // 当前选中的标签
      activeTab: 'likes',
      // 未读消息总数
      unreadCount: 11,
      // 点赞消息列表
      likeMessages: [
        {
          id: 'like1',
          avatar: '/static/photo/S..png',
          content: 'S. 赞了你的帖子',
          postId: '1',
          time: '10分钟前',
          read: false
        },
        {
          id: 'like2',
          avatar: '/static/icon/社交媒体1.png',
          content: 'L. 赞了你的评论',
          postId: '2',
          commentId: '1',
          time: '1小时前',
          read: false
        },
        {
          id: 'like3',
          avatar: '/static/icon/社交媒体3.png',
          content: 'K. 赞了你的帖子',
          postId: '3',
          time: '昨天 14:30',
          read: true
        }
      ],
      // 评论消息列表
      commentMessages: [
        {
          id: 'comment1',
          avatar: '/static/icon/社交媒体2.png',
          content: 'M. 评论了你的帖子',
          postId: '1',
          commentId: '2',
          commentContent: '写得真好，很有启发！',
          time: '30分钟前',
          read: false
        },
        {
          id: 'comment2',
          avatar: '/static/icon/社交媒体4.png',
          content: 'Z. 回复了你的评论',
          postId: '2',
          commentId: '3',
          commentContent: '赞同你的观点，我也有同感！',
          time: '2小时前',
          read: false
        }
      ],
      // 关注消息列表
      followMessages: [
        {
          id: 'follow1',
          avatar: '/static/icon/社交媒体5.png',
          content: 'H. 关注了你',
          userId: 'user5',
          userName: 'H.',
          time: '今天 10:15',
          read: false,
          isFollowing: false
        },
        {
          id: 'follow2',
          avatar: '/static/photo/张三.jpg',
          content: '张三 关注了你',
          userId: 'user6',
          userName: '张三',
          time: '昨天 16:45',
          read: true,
          isFollowing: true
        }
      ],
      // 系统消息列表
      systemMessages: [
        {
          id: 'system1',
          icon: '📢',
          title: '活动通知',
          content: '「月度创作大赛」已开始，参与即可获得丰厚奖励！',
          time: '今天 08:00',
          read: false
        },
        {
          id: 'system2',
          icon: '🔔',
          title: '账号安全提醒',
          content: '你的账号于昨天在新设备上登录，如非本人操作请及时修改密码。',
          time: '昨天 20:30',
          read: true
        },
        {
          id: 'system3',
          icon: '🎉',
          title: '恭喜你！',
          content: '你发布的帖子「如何高效学习编程？」被推荐到首页！',
          time: '3天前',
          read: true
        }
      ]
    };
  },

  onLoad() {
    // 页面加载时获取消息数据
    this.loadMessages();
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 加载消息数据
    loadMessages() {
      // 模拟从服务器获取消息数据
      // 实际项目中应替换为真实的API请求
      console.log('加载首页消息数据');
    },

    // 标记消息为已读
    markAsRead(message) {
      if (!message.read) {
        message.read = true;
        this.unreadCount--;
        // 更新对应标签的未读计数
        this.updateTabCount();
        // 可以在这里调用API，将消息状态同步到服务器
      }
    },

    // 更新标签页的未读计数
    updateTabCount() {
      // 点赞消息未读数
      const likesUnread = this.likeMessages.filter(msg => !msg.read).length;
      // 评论消息未读数
      const commentsUnread = this.commentMessages.filter(msg => !msg.read).length;
      // 关注消息未读数
      const followsUnread = this.followMessages.filter(msg => !msg.read).length;
      // 系统消息未读数
      const systemUnread = this.systemMessages.filter(msg => !msg.read).length;

      // 更新标签计数
      this.messageTabs.find(tab => tab.id === 'likes').count = likesUnread;
      this.messageTabs.find(tab => tab.id === 'comments').count = commentsUnread;
      this.messageTabs.find(tab => tab.id === 'follows').count = followsUnread;
      this.messageTabs.find(tab => tab.id === 'system').count = systemUnread;
    },

    // 关注用户
    followUser(message) {
      message.isFollowing = true;
      uni.showToast({
        title: '关注成功',
        icon: 'success'
      });
      // 可以在这里调用API，将关注状态同步到服务器
    },

    // 查看帖子详情
    viewPost(postId) {
      uni.navigateTo({
        url: `/pages/index/post-detail?id=${postId}`
      });
    },

    // 查看用户主页
    viewUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/user/profile?id=${userId}`
      });
    },

    // 全部标记为已读
    markAllAsRead() {
      // 标记所有消息为已读
      [...this.likeMessages, ...this.commentMessages, ...this.followMessages, ...this.systemMessages]
        .forEach(msg => {
          msg.read = true;
        });
      // 更新未读计数
      this.unreadCount = 0;
      this.updateTabCount();
      uni.showToast({
        title: '已全部标记为已读',
        icon: 'success'
      });
    }
  }
};
</script>

<style scoped>
/* 页面整体样式 */
.home-message-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f8f8;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 20rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333333;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.header-right {
  width: 60rpx;
}

/* 消息内容区域 */
.message-content {
  padding-top: 88rpx;
  padding-bottom: 20rpx;
}

/* 未读消息提示 */
.unread-tip {
  background-color: #e8f4fd;
  padding: 20rpx;
  text-align: center;
}

.unread-tip text {
  color: #1989fa;
  font-size: 28rpx;
}

/* 消息标签栏 */
.message-tabs {
  display: flex;
  background-color: #ffffff;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #eeeeee;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  position: relative;
}

.tab-item.active {
  color: #1989fa;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 40%;
  height: 4rpx;
  background-color: #1989fa;
}

.tab-text {
  font-size: 28rpx;
}

.tab-badge {
  position: absolute;
  top: 10rpx;
  right: 25%;
  background-color: #ee0a24;
  color: #ffffff;
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 15rpx;
  min-width: 30rpx;
  text-align: center;
}

/* 消息列表 */
.message-list {
  background-color: #ffffff;
}

/* 消息分类 */
.message-category {
  padding: 20rpx;
}

.category-title {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 20rpx;
}

/* 消息项 */
.message-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.unread {
  background-color: #f8f8f8;
}

/* 用户头像 */
.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

/* 系统图标 */
.system-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background-color: #e8f4fd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
}

/* 消息信息 */
.message-info {
  flex: 1;
  padding-right: 20rpx;
}

.message-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.5;
}

.comment-content {
  font-size: 26rpx;
  color: #999999;
  margin-top: 8rpx;
  padding: 10rpx 15rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.message-time {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.system-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

/* 未读红点 */
.unread-dot {
  position: absolute;
  top: 25rpx;
  right: 20rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #ee0a24;
  border-radius: 50%;
}

/* 关注按钮 */
.follow-button {
  background-color: #1989fa;
  color: #ffffff;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  border: none;
  line-height: 1.6;
}

.following-text {
  font-size: 24rpx;
  color: #999999;
  padding: 0 24rpx;
}

/* 空消息提示 */
.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-message text {
  font-size: 28rpx;
  color: #999999;
}

/* 系统消息特殊样式 */
.system-item .message-info {
  padding-right: 40rpx;
}

/* 适配不同屏幕 */
@media screen and (min-width: 768px) {
  .home-message-page {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
  }
  
  .header {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>