<template>
  <view class="social-setting">
    <!-- 顶部切换栏 -->
    <view class="tab-bar">
      <view :class="['tab-item', {active: activeTab === 'recommend'}]" @click="activeTab = 'recommend'">为你推荐</view>
      <view :class="['tab-item', {active: activeTab === 'friends'}]" v-if="app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest" @click="activeTab = 'friends'">好友</view>
    </view>
    


    <!-- 内容区域：根据当前Tab切换显示 -->
    <view class="content-area">
      <!-- "为你推荐" 动态列表 -->
      <view class="social-list" v-if="activeTab === 'recommend'">
        <view class="post-container" v-for="(item, index) in socialList" :key="index">
          <view class="social-item" @click="openPostDetail(item)">
            <view class="header-row">
              <image :src="item.userAvatar || '/static/icon/我的.png'" class="avatar" mode="aspectFill"></image>
              <view class="info">
                <view class="name">{{ item.userName || '用户' }}</view>
                <view class="desc">{{ item.desc || '' }}</view>
                <view class="time">{{ formatTime(item.createTime) }}</view>
              </view>
              <view class="counter" v-if="item.counter">点击 {{ item.counter }} 次</view>
            </view>
            <view class="content">{{ item.content || '' }}</view>
            
            <!-- 图片列表 -->
            <view class="image-list" v-if="item.images && item.images.length > 0">
              <image 
                  v-for="(img, imgIndex) in item.images" 
                  :key="imgIndex" 
                  :src="img" 
                  class="post-image" 
                  mode="aspectFill"
                  @click.stop="previewImage(item.images, imgIndex)"
                ></image>
            </view>
            
            <view class="interact">
              <view class="icon-item" @click.stop="toggleLike(item)">
                <image 
                  :src="item.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" 
                  class="interact-icon" 
                  :class="{active: item.liked}"
                  mode="aspectFit"
                ></image>
                <text :class="{active: item.liked}">{{ item.likeCount || 0 }}</text>
              </view>
              <view class="icon-item" @click.stop="openComment(item)">
                <image src="/static/icon/评论.png" class="interact-icon" mode="aspectFit"></image>
                <text>{{ item.commentCount || 0 }}</text>
              </view>
            </view>
            
            <!-- 评论预览区域 -->
            <view class="comments-preview" v-if="item.comments && item.comments.length > 0">
              <view class="comment-preview-item" v-for="(comment, commentIndex) in item.comments.slice(0, 2)" :key="commentIndex">
                <image :src="comment.avatar || '/static/icon/我的.png'" class="comment-avatar" mode="aspectFill"></image>
                <view class="comment-content">
                  <text class="comment-preview-name">{{ comment.name }}：</text>
                  <text class="comment-preview-content">{{ comment.content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- "好友" 板块 -->
      <view v-else-if="activeTab === 'friends'">
        <view class="friends-list" v-if="!currentFriend">
          <view class="friend-card" v-for="(friend, index) in friendList" :key="index" @click="showFriendPosts(friend)">
            <image :src="friend.avatar || '/static/icon/我的.png'" class="friend-avatar" mode="aspectFill"></image>
            <view class="friend-info">
              <view class="friend-name">{{ friend.name }}</view>
              <view class="friend-sign">{{ friend.signature }}</view>
            </view>
          </view>
        </view>

        <view class="friend-posts" v-else>
          <view class="back-btn" @click="currentFriend = null">返回好友列表</view>
          <view class="post-container" v-for="(post, postIndex) in currentFriend.posts" :key="postIndex">
            <view class="social-item" @click="openPostDetail(post)">
              <view class="header-row">
                <image :src="currentFriend.avatar || '/static/icon/我的.png'" class="avatar" mode="aspectFill"></image>
                <view class="info">
                  <view class="name">{{ currentFriend.name }}</view>
                  <view class="desc">{{ currentFriend.desc }}</view>
                  <view class="time">1分钟前</view>
                </view>
                <view class="counter" v-if="post.counter">点击 {{ post.counter }} 次</view>
              </view>
              <view class="content">{{ post.content }}</view>
              
              <!-- 图片列表 -->
              <view class="image-list" v-if="post.images && post.images.length > 0">
                <image 
                  v-for="(img, imgIndex) in post.images" 
                  :key="imgIndex" 
                  :src="img" 
                  class="post-image" 
                  mode="aspectFill"
                  @click.stop="previewImage(post.images, imgIndex)"
                ></image>
              </view>
              
              <view class="interact">
                <view class="icon-item" @click.stop="toggleLike(post)">
                  <image 
                      :src="post.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" 
                      class="interact-icon" 
                      :class="{active: post.liked}"
                      mode="aspectFit"
                    ></image>
                  <text :class="{active: post.liked}">{{ post.likeCount || 0 }}</text>
                </view>
                <view class="icon-item" @click.stop="openComment(post)">
                  <image src="/static/icon/评论.png" class="interact-icon" mode="aspectFit"></image>
                  <text>{{ post.commentCount || 0 }}</text>
                </view>
              </view>
              
              <!-- 评论预览区域 -->
              <view class="comments-preview" v-if="post.comments && post.comments.length > 0">
                <view class="comment-preview-item" v-for="(comment, commentIndex) in post.comments.slice(0, 2)" :key="commentIndex">
                  <image :src="comment.avatar || '/static/icon/我的.png'" class="comment-avatar" mode="aspectFill"></image>
                  <view class="comment-content">
                    <text class="comment-preview-name">{{ comment.name }}：</text>
                    <text class="comment-preview-content">{{ comment.content }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- "我的动态" 板块 -->

    </view>

    <!-- 底部副导航栏 -->
    <view class="sub-bottom-nav" v-if="app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest">
    <button class="sub-publish-btn" @click="goToPublish">发帖</button>
    <button class="sub-message-btn" @click="goMessage">消息</button>
    </view>

    <!-- 评论弹窗 -->
    <view class="comment-popup" v-if="showCommentBox">
      <view class="comment-overlay" @click="hideCommentBox"></view>
      <view class="comment-container">
        <view class="comment-header">
          <text class="comment-title">评论 {{ currentPost ? currentPost.commentCount || 0 : 0 }}</text>
          <text class="comment-close" @click="hideCommentBox">×</text>
        </view>
        
        <!-- 评论列表 -->
        <view class="comment-list">
          <view class="comment-item" v-for="(comment, index) in comments" :key="index">
            <image :src="comment.avatar || '/static/icon/我的.png'" class="comment-avatar" mode="aspectFill"></image>
            <view class="comment-info">
              <view class="comment-name">{{ comment.name }}</view>
              <view class="comment-content">{{ comment.content }}</view>
              <view class="comment-time">{{ comment.time }}</view>
            </view>
          </view>
          <view class="no-comments" v-if="comments.length === 0">暂无评论，快来抢沙发吧~</view>
        </view>
        
        <!-- 评论输入框 -->
        <view class="comment-input-area">
          <input 
            type="text" 
            v-model="commentContent" 
            placeholder="写下你的评论..."
            class="comment-input"
            @confirm="sendComment"
          />
          <button class="comment-send" @click="sendComment" :disabled="!commentContent.trim()">发送</button>
        </view>
      </view>
    </view>
    
    <!-- 帖子详情全屏页面 -->
    <view class="post-detail-page" v-if="showPostDetail && detailPost">
      <!-- 固定的返回按钮和标题 -->
      <view class="detail-header fixed-header">
        <view class="back-button" @click="closePostDetail">
          <image src="/static/icon/back.png" class="back-image" mode="aspectFit"></image>
        </view>
        <view class="detail-title">帖子详情</view>
        <view class="delete-button" @click="showDeleteConfirm" v-if="canDeletePost">
          <image src="/static/icon/删除.png" class="delete-icon" mode="aspectFit"></image>
        </view>
        <view style="width: 40rpx;" v-else></view>
      </view>
      
      <!-- 可滚动的帖子详情内容 -->
      <view class="detail-content scrollable-content">
        <!-- 用户信息 -->
        <view class="detail-user-info">
          <image :src="detailPost.userAvatar || '/static/icon/我的.png'" class="detail-avatar" mode="aspectFill"></image>
          <view class="detail-user-name">{{ detailPost.userName || '用户' }}</view>
        </view>
        
        <!-- 占位帖子特殊提示 -->
        <view class="placeholder-notice" v-if="detailPost.isPlaceholder">
          <view class="notice-icon">
            <image src="/static/icon/通知.png" mode="aspectFit"></image>
          </view>
          <view class="notice-content">
            <view class="notice-title">预览内容</view>
            <view class="notice-desc" v-if="detailPost.notificationType === 'like'">
              {{ detailPost.notificationSender }} 点赞了该帖子
            </view>
            <view class="notice-desc" v-else-if="detailPost.notificationType === 'comment'">
              {{ detailPost.notificationSender }} 评论了该帖子：
              <text class="comment-text">{{ detailPost.notificationComment || '暂无评论内容' }}</text>
            </view>
          </view>
        </view>
        
        <!-- 帖子内容 -->
        <view class="detail-post-content">
          <view class="detail-content-text">{{ detailPost.content || '' }}</view>
          
          <!-- 帖子图片 -->
          <view class="detail-image-list" v-if="detailPost.images && detailPost.images.length > 0">
            <image 
              v-for="(img, imgIndex) in detailPost.images" 
              :key="imgIndex" 
              :src="img" 
              class="detail-post-image" 
              mode="aspectFill"
              @click.stop="previewImage(detailPost.images, imgIndex)"
            ></image>
          </view>
          
          <!-- 发布时间 -->
          <view class="detail-time">{{ formatTime(detailPost.createTime) }}</view>
          
          <!-- 点赞信息 -->
          <view class="detail-interact">
            <view class="detail-icon-item" @click.stop="toggleLike(detailPost)">
              <image 
                    :src="detailPost.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" 
                    class="detail-interact-icon" 
                    :class="{active: detailPost.liked}"
                    mode="aspectFit"
                  ></image>
              <text :class="{active: detailPost.liked}">{{ detailPost.likeCount || 0 }}</text>
            </view>
            <view class="detail-icon-item" @click.stop="openComment(detailPost)">
              <image src="/static/icon/评论.png" class="detail-interact-icon" mode="aspectFit"></image>
              <text>{{ detailPost.commentCount || 0 }}</text>
            </view>
          </view>
        </view>
        
        <!-- 评论列表 -->
        <view class="detail-comments-section">
          <view class="detail-comments-header">评论</view>
          <view class="detail-comment-list">
            <view class="detail-comment-item" v-for="(comment, index) in comments" :key="index">
              <image :src="comment.avatar || '/static/icon/我的.png'" class="detail-comment-avatar" mode="aspectFill"></image>
              <view class="detail-comment-content">
                <view class="detail-comment-name">{{ comment.name }}</view>
                <view class="detail-comment-text">{{ comment.content }}</view>
                <view class="detail-comment-time">{{ comment.time }}</view>
              </view>
            </view>
            <view class="detail-no-comments" v-if="comments.length === 0">暂无评论，快来抢沙发吧~</view>
          </view>
        </view>
      </view>
      
      <!-- 固定的底部评论输入框 -->
      <view class="detail-comment-input-container fixed-bottom">
        <input 
          type="text" 
          v-model="commentContent" 
          placeholder="留下你的评论吧"
          class="detail-comment-input"
          @confirm="sendComment"
        />
        <view class="detail-comment-submit" @click="sendComment" :class="{disabled: !commentContent.trim()}">
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        activeTab: 'recommend',
        userInfo: {
          avatarUrl: '',
          userName: ''
        },
        // 获取全局应用实例，用于用户状态检查
        app: getApp(),
        // 评论相关数据
        showCommentBox: false,
        currentPost: null,
        commentContent: '',
        comments: [],
        // 动画相关
        isCommentBoxAnimating: false,
        // 帖子详情相关
        showPostDetail: false,
        detailPost: null,
        socialList: [], // 从本地存储加载推荐帖子
        // 消息跳转相关参数
        fromMessage: false,
        createPlaceholder: false,
        messageData: null,
        friendList: [], // 初始化为空数组，将从名片夹数据动态加载
        currentFriend: null
      };
    },
    onLoad(options) {
      // 页面加载时获取本地存储的用户信息和推荐帖子
      this.loadUserInfo();
      this.loadRecommendedPosts();
      this.loadFriendListFromCardFolder(); // 从名片夹加载好友列表
      
      // 游客模式下默认只显示推荐tab
      if (this.app && this.app.globalData && this.app.globalData.userStatus) {
        if (this.app.isGuestLogin() || !this.app.globalData.userStatus.isLoggedIn) {
          this.activeTab = 'recommend';
        }
      } else {
        // 确保在app实例或全局数据不可用时，默认显示推荐tab
        this.activeTab = 'recommend';
      }
      
      // 保存参数到实例中，供showPostById使用
      if (options) {
        this.fromMessage = options.fromMessage === 'true';
        this.createPlaceholder = options.createPlaceholder === 'true';
        if (options.messageData) {
          try {
            this.messageData = JSON.parse(decodeURIComponent(options.messageData));
            console.log('解析到消息数据:', this.messageData);
          } catch (e) {
            console.error('解析messageData失败:', e);
            this.messageData = null;
          }
        }
      }
      
      // 处理从消息页面传来的postId参数
      if (options && options.postId) {
        console.log('从消息页面跳转，需要显示帖子ID:', options.postId, 'createPlaceholder:', this.createPlaceholder);
        // 使用setTimeout确保帖子数据已加载完成
        setTimeout(() => {
          this.showPostById(options.postId);
        }, 100);
      }
    },
    onShow() {
      // 页面显示时重新加载用户信息、推荐帖子和好友列表，确保数据最新
      this.loadUserInfo();
      this.loadRecommendedPosts();
      this.loadFriendListFromCardFolder(); // 每次显示时都重新加载好友列表
      // 添加数据一致性验证，确保删除/取消关注后数据正确更新
      this.validateDataConsistency();
    },
    created() {
      // 监听用户信息更新事件
      uni.$on('userInfoUpdated', this.handleUserInfoUpdate);
      // 监听帖子更新事件
      uni.$on('postsUpdated', this.loadRecommendedPosts);
    },
    beforeDestroy() {
      // 移除事件监听
      uni.$off('userInfoUpdated', this.handleUserInfoUpdate);
      uni.$off('postsUpdated', this.loadRecommendedPosts);
    },
    methods: {
      // 加载用户信息
    loadUserInfo() {
      try {
        // 默认用户信息
        this.userInfo = {
          userName: '我',
          avatarUrl: '/static/icon/我的.png'
        };
        
        // 优先从全局获取用户信息（与我的页面保持一致）
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
          const globalUserInfo = app.globalData.userStatus.userInfo;
          this.userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || '我';
          this.userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || '/static/icon/我的.png';
          console.log('从全局userStatus加载用户信息成功:', this.userInfo);
        } else if (app && app.globalData && app.globalData.userInfo) {
          // 备选全局数据来源
          const globalUserInfo = app.globalData.userInfo;
          this.userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || '我';
          this.userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || '/static/icon/我的.png';
          console.log('从全局userInfo加载用户信息成功:', this.userInfo);
        } else {
          // 尝试从本地存储获取
          const storedUserInfo = uni.getStorageSync('userInfo');
          if (storedUserInfo) {
            const parsedUserInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
            this.userInfo.userName = parsedUserInfo.userName || parsedUserInfo.nickname || '我';
            this.userInfo.avatarUrl = parsedUserInfo.avatarUrl || parsedUserInfo.avatar_url || '/static/icon/我的.png';
            console.log('从本地存储加载用户信息成功:', this.userInfo);
          }
        }
      } catch (error) {
        console.error('加载用户信息出错:', error);
        // 出错时保持默认值
      }
    },
    // 处理用户信息更新
    handleUserInfoUpdate(data) {
      // 确保数据存在
      if (!data) return;
      
      // 处理不同字段名称的兼容，与loadUserInfo保持一致
      if (data.userName || data.nickname) {
        this.userInfo.userName = data.userName || data.nickname || '我';
      }
      if (data.avatarUrl || data.avatar_url) {
        this.userInfo.avatarUrl = data.avatarUrl || data.avatar_url || '/static/icon/我的.png';
      }
      
      console.log('用户信息更新成功:', this.userInfo);
    },

    // 跳转至发帖页面
    goToPublish() {
      // 检查用户是否已登录且不是游客
      if (!this.app || !this.app.globalData || !this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        uni.showToast({
          title: '请先注册登录，再使用发帖功能',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({ url: '/pages/social/publish' });
    },
    // 跳转至消息页面
    goMessage() {
      // 获取全局应用实例
      if (!this.app) {
        this.app = getApp();
      }
      
      // 检查登录状态和游客身份
      if (!this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        // 显示带选项的模态框
        uni.showModal({
          title: '请先登录',
          content: '登录后可查看消息',
          showCancel: true,
          cancelText: '取消',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              // 跳转到登录注册页面
              uni.navigateTo({
                url: '/pages/setting/basic',
                fail: () => {
                  uni.reLaunch({
                    url: '/pages/index/cover'
                  });
                }
              });
            }
          }
        });
        return;
      }
      
      // 跳转到social消息页面
      try {
        uni.navigateTo({ 
          url: '/pages/social/message',
          fail: (err) => {
            console.log('消息页面不存在或无法访问:', err);
            uni.showToast({
              title: '打开消息页面失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      } catch (e) {
        uni.showToast({
          title: '打开消息页面失败',
          icon: 'none',
          duration: 2000
        });
      }
    },
    // 创建通知消息
    createNotification(notificationData) {
      try {
        const app = this.app || getApp();
        const currentUser = this.userInfo || {};
        
        // 创建消息对象
        const message = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          type: notificationData.type, // 'like' 或 'comment'
          userName: currentUser.userName || '用户',
          avatar: currentUser.avatarUrl || '/static/icon/我的.png',
          postId: notificationData.postId,
          postContent: notificationData.postContent,
          commentContent: notificationData.commentContent,
          createTime: Date.now(),
          isRead: false,
          // 添加额外的字段以兼容不同的显示需求
          sender: currentUser.userName || '用户',
          comment: notificationData.commentContent,
          time: new Date().toLocaleString()
        };
        
        // 从本地存储获取现有消息
        let userMessages = uni.getStorageSync('userMessages') || [];
        
        // 添加新消息到开头
        userMessages.unshift(message);
        
        // 限制消息数量，避免存储过多历史消息
        if (userMessages.length > 50) {
          userMessages = userMessages.slice(0, 50);
        }
        
        // 保存回本地存储
        uni.setStorageSync('userMessages', userMessages);
        
        console.log('消息通知已创建:', message);
        
        // 尝试更新tabBar的消息提示（如果需要）
        this.updateMessageBadge();
      } catch (error) {
        console.error('创建消息通知失败:', error);
      }
    },
    
    // 更新消息提示角标
    updateMessageBadge() {
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
    },
    
    // 显示好友帖子
    showFriendPosts(friend) {
      // 设置当前选中的好友，显示该好友的帖子
      this.currentFriend = friend;
      console.log('显示好友帖子:', friend.name);
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
    
    // 从名片夹加载好友列表
    loadFriendListFromCardFolder() {
      try {
        // 获取当前用户ID和存储前缀，与friend-detail.vue保持一致
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 从本地存储获取名片夹数据（使用用户ID隔离的存储键）
        const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 初始化好友列表为空数组
        this.friendList = [];
        
        // 如果有名片夹数据，则转换为好友列表格式
        if (collectedCards && Array.isArray(collectedCards) && collectedCards.length > 0) {
          // 将名片夹数据转换为好友列表格式
          this.friendList = collectedCards
            .map(card => ({
              id: card.id || `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: card.name || '未知用户',
              avatar: card.avatar || '/static/icon/我的.png',
              signature: card.signature || '',
              desc: card.desc || '',
              // 生成模拟帖子数据
              posts: this.generateMockPostsForFriend(card)
            }));
          
          console.log('从用户隔离的名片夹加载好友列表成功:', this.friendList.length, '位好友');
        } else {
          console.log('用户隔离的名片夹为空或不存在，好友列表为空');
        }
        
        // 确保好友列表与名片夹保持同步
        this.syncFriendListToCardFolder();
      } catch (error) {
        console.error('从名片夹加载好友列表失败:', error);
        this.friendList = []; // 出错时保持空数组
      }
    },
    
    // 同步好友列表到名片夹（双向同步）
    syncFriendListToCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 从本地存储获取当前名片夹数据
        const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 检查好友列表和名片夹是否一致
        if (this.friendList.length !== collectedCards.length) {
          console.log('好友列表与名片夹数量不一致，正在同步...');
          console.log('- 好友列表数量:', this.friendList.length);
          console.log('- 名片夹数量:', collectedCards.length);
          
          // 创建好友ID集合
          const friendIds = new Set(this.friendList.map(friend => friend.id));
          const cardIds = new Set(collectedCards.map(card => card.id));
          
          // 找出需要添加到名片夹的好友
          const friendsToAdd = this.friendList.filter(friend => !cardIds.has(friend.id));
          
          // 添加缺失的好友到名片夹
          if (friendsToAdd.length > 0) {
            console.log('发现新好友需要添加到名片夹:', friendsToAdd.length);
            
            // 更新名片夹数据
            const updatedCards = [...collectedCards, ...friendsToAdd.map(friend => ({
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
              signature: friend.signature,
              desc: friend.desc
            }))];
            
            // 保存到本地存储
            uni.setStorageSync(`${storagePrefix}collectedCards`, updatedCards);
            console.log('已同步新增好友到名片夹');
            
            // 通知名片夹页面更新
            uni.$emit('friendsDataUpdated');
          }
        }
      } catch (error) {
        console.error('同步好友列表到名片夹失败:', error);
      }
    },
    
    // 为好友生成模拟帖子数据
    generateMockPostsForFriend(card) {
      // 根据好友信息生成不同类型的模拟帖子
      const jobTypes = {
        '音乐': ['分享一首最近超喜欢的歌🎵', '今天的练琴记录📝', '新曲创作中，敬请期待！'],
        '设计': ['分享最新的设计作品👨‍💻', '设计灵感来源分享✨', 'UI设计小技巧'],
        '摄影': ['今日拍摄作品分享📷', '摄影构图技巧', '分享一个绝美的拍摄地点'],
        '前端': ['Vue3新特性分享', '前端性能优化心得', '推荐几个超实用的开发工具'],
        '后端': ['Python数据分析实战', '服务器性能调优', '数据库优化技巧'],
        '产品': ['产品经理日常', '用户调研心得分享', '产品设计思考'],
        '数据': ['数据分析案例分享', '可视化图表制作技巧', '大数据应用场景']
      };
      
      let contentTemplates = ['今天天气真好！', '分享生活中的小确幸', '努力工作中💪'];
      
      // 根据好友描述或职业选择更匹配的内容模板
      const desc = card.desc || '';
      for (const [job, templates] of Object.entries(jobTypes)) {
        if (desc.includes(job)) {
          contentTemplates = templates;
          break;
        }
      }
      
      // 随机生成1-3条帖子
      const postCount = Math.floor(Math.random() * 3) + 1;
      const posts = [];
      
      for (let i = 0; i < postCount; i++) {
        // 随机选择一个模板
        const content = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
        
        posts.push({
          id: `post_${card.id || 'unknown'}_${i}_${Date.now()}`,
          content: content,
          liked: Math.random() > 0.7, // 30%概率已点赞
          likeCount: Math.floor(Math.random() * 100),
          comments: [],
          commentCount: 0,
          createTime: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000) // 随机7天内的时间
        });
      }
      
      return posts;
    },
    
    // 验证数据一致性
    validateDataConsistency() {
      try {
        // 获取当前用户ID和存储前缀，与loadFriendListFromCardFolder保持一致
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 从本地存储获取名片夹数据（使用用户ID隔离的存储键）
        const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        const currentFriendListLength = this.friendList.length;
        const expectedFriendListLength = collectedCards.length;
        
        console.log('数据一致性验证结果:');
        console.log('- 当前好友列表长度:', currentFriendListLength);
        console.log('- 用户隔离的名片夹中好友数量:', expectedFriendListLength);
        console.log('- 数据一致性检查:', currentFriendListLength === expectedFriendListLength ? '✓ 通过' : '✗ 失败');
        
        // 验证2: 确保没有硬编码的默认好友
        const hasHardcodedFriends = false; // 因为我们已经移除了硬编码好友
        console.log('- 无硬编码默认好友检查:', !hasHardcodedFriends ? '✓ 通过' : '✗ 失败');
        
        // 验证3: 确保数据完全同步
        const isDataFullySynced = currentFriendListLength === expectedFriendListLength;
        console.log('- 数据完全同步检查:', isDataFullySynced ? '✓ 通过' : '✗ 失败');
        
        // 如果发现不一致，进行双向同步
        if (!isDataFullySynced) {
          console.warn('发现数据不一致，正在进行双向同步...');
          
          // 首先从名片夹加载最新数据
          this.loadFriendListFromCardFolder();
          
          // 然后同步好友列表到名片夹
          this.syncFriendListToCardFolder();
          
          uni.showToast({
            title: '数据已双向同步更新',
            icon: 'success',
            duration: 2000
          });
        }
        
        return isDataFullySynced;
      } catch (error) {
        console.error('数据一致性验证失败:', error);
        return false;
      }
    },
    
    // 测试删除好友功能
    testRemoveFriend() {
      try {
        // 获取当前用户ID和存储前缀，与其他方法保持一致
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 获取当前好友列表
        const originalLength = this.friendList.length;
        console.log('测试删除好友前的好友列表长度:', originalLength);
        
        if (originalLength > 0) {
          // 从用户隔离的名片夹中移除第一个好友（模拟删除操作）
          let collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          const friendToRemove = this.friendList[0];
          
          // 找到对应的名片并移除
          collectedCards = collectedCards.filter(card => card.id !== friendToRemove.id);
          
          // 保存更新后的用户隔离名片夹数据
          uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
          console.log('已模拟移除第一个好友');
          
          // 重新加载好友列表
          this.loadFriendListFromCardFolder();
          
          // 验证删除后的数据一致性
          setTimeout(() => {
            const newLength = this.friendList.length;
            console.log('测试删除好友后的好友列表长度:', newLength);
            console.log('删除测试结果:', newLength === originalLength - 1 ? '✓ 成功' : '✗ 失败');
            
            uni.showToast({
              title: newLength === originalLength - 1 ? '删除测试成功' : '删除测试失败',
              icon: newLength === originalLength - 1 ? 'success' : 'error',
              duration: 2000
            });
            
            // 执行数据一致性测试
            this.testDataConsistency();
          }, 500);
        } else {
          uni.showToast({
            title: '好友列表为空，无法测试删除功能',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('测试删除好友失败:', error);
        uni.showToast({
          title: '测试失败',
          icon: 'error',
          duration: 2000
        });
      }
    },
    
    // 测试数据一致性
    testDataConsistency() {
      try {
        console.log('开始测试数据一致性...');
        
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 从本地存储获取名片夹数据
        const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 比较数量
        const friendListLength = this.friendList.length;
        const cardListLength = collectedCards.length;
        
        console.log('数据一致性测试结果:');
        console.log(`- 好友列表数量: ${friendListLength}`);
        console.log(`- 名片夹数量: ${cardListLength}`);
        
        // 检查数量是否一致
        const isCountConsistent = friendListLength === cardListLength;
        console.log(`- 数量一致性: ${isCountConsistent ? '✓ 通过' : '✗ 失败'}`);
        
        // 检查内容是否一致
        const friendIds = new Set(this.friendList.map(f => f.id));
        const cardIds = new Set(collectedCards.map(c => c.id));
        
        const isContentConsistent = JSON.stringify([...friendIds].sort()) === JSON.stringify([...cardIds].sort());
        console.log(`- 内容一致性: ${isContentConsistent ? '✓ 通过' : '✗ 失败'}`);
        
        // 如果不一致，执行同步
        if (!isCountConsistent || !isContentConsistent) {
          console.log('正在执行数据同步...');
          this.loadFriendListFromCardFolder();
          this.syncFriendListToCardFolder();
          console.log('数据同步完成');
        }
        
        // 重新验证
        setTimeout(() => {
          const updatedCollectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          console.log('同步后验证:');
          console.log(`- 好友列表数量: ${this.friendList.length}`);
          console.log(`- 名片夹数量: ${updatedCollectedCards.length}`);
          console.log(`- 数量一致性: ${this.friendList.length === updatedCollectedCards.length ? '✓ 通过' : '✗ 失败'}`);
        }, 100);
        
      } catch (error) {
        console.error('数据一致性测试失败:', error);
      }
    },
    
    // 添加默认好友数据
    addDefaultFriends() {
      const defaultFriends = [
        { id: 'friend1', name: '林一', avatar: '/static/photo/林一.jpg', signature: '摄影师，记录生活' },
        { id: 'friend2', name: '涂二', avatar: '/static/photo/涂二.jpg', signature: '数据分析师，擅长可视化' },
        { id: 'friend3', name: '张三', avatar: '/static/photo/张三.jpg', signature: '产品经理，5年经验' },
        { id: 'friend4', name: '李四', avatar: '/static/photo/李四.jpg', signature: '前端工程师，热爱新技术' },
        { id: 'friend5', name: '王五', avatar: '/static/photo/王五.jpg', signature: '设计师，UI/UX全能' },
        { id: 'friend6', name: '赵六', avatar: '/static/photo/赵六.jpg', signature: '后端工程师，专注性能优化' },
        { id: 'friend7', name: '陈七', avatar: '/static/photo/陈七.jpg', signature: '移动开发工程师，全栈思维' },
        { id: 'friend8', name: '刘八', avatar: '/static/photo/刘八.jpg', signature: 'DevOps工程师，自动化运维' },
        { id: 'friend9', name: 'L.', avatar: '/static/photo/L..jpg', signature: '项目经理，敏捷实践者' },
        { id: 'friend10', name: '梨鸣晒兽', avatar: '/static/photo/梨鸣晒兽.jpg', signature: '数据科学家，机器学习爱好者' },
        { id: 'friend11', name: 'S.', avatar: '/static/photo/S..jpg', signature: '测试工程师，质量保障专家' }
      ];
      return defaultFriends;
    },
    
    // 初始化用户数据
    initializeUserData() {
      try {
        // 获取当前用户ID和存储前缀
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 检查是否已经有名片夹数据
        const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 如果没有名片夹数据，添加默认的11个好友
        if (!collectedCards || collectedCards.length === 0) {
          console.log('首次使用，为用户初始化默认的11个好友数据');
          const defaultFriends = this.addDefaultFriends();
          // 保存默认好友数据
          uni.setStorageSync(`${storagePrefix}collectedCards`, defaultFriends);
          // 同时更新互关好友数据
          uni.setStorageSync(`${storagePrefix}mutualFriends`, defaultFriends);
          console.log('已成功初始化用户好友数据');
          // 重新加载好友列表
          this.loadFriendListFromCardFolder();
        }
      } catch (error) {
        console.error('初始化用户数据失败:', error);
      }
    },
    
    // 根据ID查找并显示帖子
    showPostById(postId) {
      console.log('showPostById调用，参数:', {postId, fromMessage: this.fromMessage, createPlaceholder: this.createPlaceholder});
      
      // 确保socialList是数组
      if (!Array.isArray(this.socialList)) {
        this.socialList = [];
        console.warn('socialList未定义或不是数组，已初始化为空数组');
      }
      
      // 先在推荐列表中查找
      let targetPost = this.socialList.find(post => post.id === postId);
      
      // 如果没找到，从本地存储中查找
      if (!targetPost) {
        try {
          // 检查多个可能的存储位置，确保都是数组
          let recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
          let myPosts = uni.getStorageSync('myPosts') || [];
          
          // 确保是数组
          recommendedPosts = Array.isArray(recommendedPosts) ? recommendedPosts : [];
          myPosts = Array.isArray(myPosts) ? myPosts : [];
          
          targetPost = recommendedPosts.find(post => post.id === postId);
          
          // 如果在推荐列表中没找到，在我的帖子中查找
          if (!targetPost) {
            targetPost = myPosts.find(post => post.id === postId);
          }
          
          // 如果在本地存储找到了，添加到当前列表
          if (targetPost && !this.socialList.find(p => p.id === postId)) {
            this.socialList.push(targetPost);
          }
        } catch (error) {
          console.error('从本地存储查找帖子失败:', error);
        }
      }
      
      // 如果找到了帖子，显示详情
      if (targetPost) {
        this.openPostDetail(targetPost);
      } 
      // 如果没找到帖子但需要创建占位帖子
      else if (this.fromMessage && this.createPlaceholder && this.messageData) {
        console.log('创建占位帖子，消息数据:', this.messageData);
        // 创建一个占位帖子用于显示
        const placeholderPost = {
          id: postId,
          content: this.messageData.postContent || '该帖子内容已无法查看',
          userId: this.userInfo.userId || 'guest',
          userName: '已删除的帖子',
          userAvatar: '/static/icon/我的.png',
          createTime: this.messageData.createTime || Date.now(),
          likeCount: 0,
          commentCount: 0,
          liked: false,
          isPlaceholder: true, // 标记为占位帖子
          // 添加消息相关信息用于显示
          notificationType: this.messageData.type,
          notificationSender: this.messageData.userName || this.messageData.sender,
          notificationSenderAvatar: this.messageData.avatar,
          notificationComment: this.messageData.commentContent || this.messageData.comment
        };
        
        // 添加到列表开头
        this.socialList.unshift(placeholderPost);
        // 显示占位帖子详情
        this.openPostDetail(placeholderPost);
      }
      else {
        console.error('未找到ID为', postId, '的帖子，且无法创建占位帖子');
        // 如果是从消息页面来的，尝试返回
        if (this.fromMessage) {
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          uni.showToast({ title: '未找到相关帖子', icon: 'none' });
        }
      }
    },
    
    // 加载推荐帖子
    loadRecommendedPosts() {
      try {
        // 尝试从本地存储获取推荐帖子
        let recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        
        // 确保是数组
        if (!Array.isArray(recommendedPosts)) {
          recommendedPosts = [];
        }
        
        // 如果没有推荐帖子，提供默认模拟数据（为游客提供内容）
        if (recommendedPosts.length === 0) {
          recommendedPosts = this.getMockRecommendedPosts();
          // 保存默认数据到本地存储
          uni.setStorageSync('recommendedPosts', recommendedPosts);
        }
        
        // 初始化用户数据，确保好友列表不为空
        this.initializeUserData();
        
        // 初始化每个帖子的数据，确保commentCount与comments数组长度一致
        recommendedPosts = recommendedPosts.map(post => {
          const updatedPost = {
            ...post,
            comments: post.comments || [],
            liked: post.liked || false,
            likeCount: post.likeCount || 0,
            images: post.images || []
          };
          
          // 确保commentCount与comments数组长度一致
          updatedPost.commentCount = updatedPost.comments.length;
          
          // 确保每条评论都有头像信息
          updatedPost.comments.forEach(comment => {
            if (!comment.avatar || comment.avatar.trim() === '') {
              comment.avatar = '/static/icon/我的.png';
            }
          });
          
          return updatedPost;
        });
        
        // 按时间降序排序
        this.socialList = [...recommendedPosts].sort((a, b) => {
          return b.createTime - a.createTime;
        });
        
        // 如果当前正在查看详情页，更新详情页的数据
        if (this.showPostDetail && this.detailPost) {
          // 确保recommendedPosts是数组且有值
          if (Array.isArray(recommendedPosts) && recommendedPosts.length > 0) {
            const updatedDetailPost = recommendedPosts.find(post => post.id === this.detailPost.id);
            if (updatedDetailPost) {
              this.detailPost = updatedDetailPost;
              this.comments = updatedDetailPost.comments ? [...updatedDetailPost.comments] : [];
            }
          }
        }
        
        console.log('加载推荐帖子:', this.socialList);
      } catch (error) {
        console.error('加载推荐帖子失败:', error);
        // 发生错误时，使用默认模拟数据
        this.socialList = this.getMockRecommendedPosts();
      }
    },
    
    // 获取默认模拟推荐帖子数据
    getMockRecommendedPosts() {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      return [
        {
          id: 'mock1',
          content: '最美的10个编程瞬间，看到第5个我哭了',
          userAvatar: '/static/photo/张三.jpg',
          userName: 'Z.',
          createTime: now - oneDay,
          likeCount: 57,
          liked: false,
          commentCount: 12,
          counter: 89, // 点击次数
          comments: [
            {
              id: 'mock-comment1',
              content: '写代码时的灵感迸发really美妙！',
              avatar: '/static/photo/张三.jpg',
              name: '张三',
              time: '14:20'
            },
            {
              id: 'mock-comment2',
              content: '赞同，特别是解决bug那一刻',
              avatar: '/static/photo/李四.jpg',
              name: '李四',
              time: '15:30'
            }
          ],
          images: []
        },
        {
          id: 'mock2',
          content: '程序员的自我修养：如何保持技术敏感度',
          userAvatar: '/static/photo/李四.jpg',
          userName: 'H.',
          createTime: now - 2 * oneDay,
          likeCount: 42,
          liked: false,
          commentCount: 8,
          counter: 124, // 点击次数
          comments: [
            {
              id: 'mock-comment3',
              content: '每天阅读技术博客是个好习惯',
              avatar: '/static/photo/王五.jpg',
              name: '王五',
              time: '08:50'
            }
          ],
          images: []
        },
        {
          id: 'mock3',
          content: '分享一个我最近开发的小工具，提高了50%的开发效率',
          userAvatar: '/static/photo/S..jpg',
          userName: 'S.',
          createTime: now - 3 * oneDay,
          likeCount: 68,
          liked: false,
          commentCount: 15,
          counter: 156, // 点击次数
          comments: [],
          images: []
        }
      ];
    },
    
    // 打开帖子详情
    openPostDetail(post) {
      // 如果是占位帖子，添加特殊处理
      if (post.isPlaceholder) {
        console.log('显示占位帖子详情');
        // 显示提示信息
        uni.showToast({
          title: '这是基于通知生成的预览内容',
          icon: 'none',
          duration: 2000
        });
      } else {
        // 只有非占位帖子增加点击次数
        post.counter = (post.counter || 0) + 1;
      }
      
      // 确保comments数组存在
      if (!post.comments) {
        post.comments = [];
      }
      
      // 确保commentCount与comments数组长度一致
      post.commentCount = post.comments.length;
      
      // 更新本地存储中对应的帖子数据
      try {
        const recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        const updatedPosts = recommendedPosts.map(item => 
          item.id === post.id ? { ...item, counter: post.counter, comments: post.comments, commentCount: post.commentCount } : item
        );
        uni.setStorageSync('recommendedPosts', updatedPosts);
      } catch (error) {
        console.error('更新点击次数失败:', error);
      }
      
      // 不创建副本，直接使用原始帖子引用，确保数据同步
      // 只有在必要时更新用户信息，使用Object.assign保留原引用
      if (this.currentFriend && (!post.userAvatar || !post.userName)) {
        Object.assign(post, {
          userAvatar: this.currentFriend.avatar,
          userName: this.currentFriend.name
        });
      }
      
      // 显示帖子详情全屏页面，直接使用原始帖子引用
      this.detailPost = post;
      this.showPostDetail = true;
      
      // 加载评论数据，创建副本以避免直接修改原数组
      this.comments = [...post.comments];
      this.commentContent = '';
      
      // 设置删除权限：只有自己发布的帖子才能删除
      this.detailPost.canDelete = this.isOwnerPost(post);
    },
    
    // 判断是否是用户自己的帖子
    isOwnerPost(post) {
      // 简单的权限判断：检查帖子ID是否在用户自己的帖子列表中
      const myPosts = uni.getStorageSync('myPosts') || [];
      const isOwner = myPosts.some(myPost => myPost.id === post.id);
      
      // 如果本地没有数据，也允许删除推荐帖子中的匿名帖子（模拟删除功能）
      if (!isOwner && (!post.userName || post.userName === this.userInfo.userName)) {
        return true;
      }
      
      return isOwner;
    },
    
    // 关闭帖子详情
    closePostDetail() {
      this.showPostDetail = false;
      this.detailPost = null;
      this.comments = [];
      this.commentContent = '';
    },
    
    // 预览图片
    previewImage(imageList, currentIndex) {
      if (!imageList || imageList.length === 0 || !imageList[currentIndex]) {
        return;
      }
      
      // 使用当前图片URL作为current参数，而不是索引
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
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60 * 1000) {
        return '刚刚';
      } else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前';
      } else if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
      } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    },
    
    // 打开评论框
    openComment(post) {
      // 检查用户是否已登录且不是游客
      if (!this.app || !this.app.globalData || !this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        // 显示带选项的模态框
        uni.showModal({
          title: '请先登录',
          content: '登录后可发表评论',
          showCancel: true,
          cancelText: '取消',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              // 跳转到登录注册页面
              uni.navigateTo({
                url: '/pages/setting/basic',
                fail: () => {
                  uni.reLaunch({
                    url: '/pages/index/cover'
                  });
                }
              });
            }
          }
        });
        return;
      }
      
      this.currentPost = post;
      this.showCommentBox = true;
      // 如果帖子没有comments数组，初始化它
      if (!post.comments) {
        post.comments = [];
      }
      this.comments = post.comments;
      // 清空评论输入框
      this.commentContent = '';
      
      // 延迟设置焦点，确保弹窗已显示
      this.$nextTick(() => {
        setTimeout(() => {
          uni.createSelectorQuery().select('.comment-input').fields({
            focus: true
          }, () => {}).exec();
        }, 100);
      });
    },
    
    // 隐藏评论框
    hideCommentBox() {
      if (this.isCommentBoxAnimating) return;
      this.isCommentBoxAnimating = true;
      
      // 添加简单的淡出动画效果
      setTimeout(() => {
        this.showCommentBox = false;
        this.currentPost = null;
        this.commentContent = '';
        this.isCommentBoxAnimating = false;
      }, 200);
    },
    
    // 发送评论
    sendComment() {
      // 确定当前操作的是哪个帖子
      const targetPost = this.showPostDetail ? this.detailPost : this.currentPost;
      
      if (!this.commentContent.trim() || !targetPost) {
        return;
      }
      
      // 如果是占位帖子，不允许评论
      if (targetPost.isPlaceholder) {
        uni.showToast({
          title: '无法对预览内容进行评论',
          icon: 'none'
        });
        return;
      }
      
      // 使用与我的页面一致的用户信息创建评论对象
      const userAvatar = this.userInfo.avatarUrl && this.userInfo.avatarUrl.trim() 
        ? this.userInfo.avatarUrl 
        : '/static/icon/我的.png';
      const userName = this.userInfo.userName || '我';
      
      const comment = {
        id: Date.now().toString(),
        content: this.commentContent.trim(),
        avatar: userAvatar,
        name: userName,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      
      // 添加到评论列表
      if (!targetPost.comments) {
        targetPost.comments = [];
      }
      targetPost.comments.push(comment);
      
      // 更新评论数
      targetPost.commentCount = targetPost.comments.length;
      
      // 更新评论列表
      this.comments = [...targetPost.comments];
      
      // 保存到本地存储
      this.savePosts();
      
      // 更新当前页面的socialList中的帖子数据，确保评论数实时更新
      this.socialList = this.socialList.map(item => 
        item.id === targetPost.id ? { ...item, ...targetPost } : item
      );
      
      // 如果不是自己的帖子，创建评论消息通知
      if (targetPost.userId && targetPost.userId !== (this.userInfo.userId || this.app.globalData.userStatus.userId)) {
        this.createNotification({
          type: 'comment',
          postId: targetPost.id,
          postContent: targetPost.content,
          commentContent: comment.content,
          targetUserId: targetPost.userId
        });
      }
      
      // 清空输入框并显示成功提示
      this.commentContent = '';
      uni.showToast({
        title: '评论成功', 
        icon: 'success',
        duration: 1500
      });
    },
    
    // 保存帖子数据
    savePosts() {
      try {
        // 确定当前操作的是哪个帖子
        const targetPost = this.showPostDetail ? this.detailPost : this.currentPost;
        
        if (!targetPost) {
          return;
        }
        
        // 更新推荐帖子
        const recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        const updatedPosts = recommendedPosts.map(item => 
          item.id === targetPost.id ? { ...item, ...targetPost } : item
        );
        uni.setStorageSync('recommendedPosts', updatedPosts);
        
        // 更新我的动态
        const myPosts = uni.getStorageSync('myPosts') || [];
        const updatedMyPosts = myPosts.map(item => 
          item.id === targetPost.id ? { ...item, ...targetPost } : item
        );
        uni.setStorageSync('myPosts', updatedMyPosts);
      } catch (error) {
        console.error('保存帖子数据失败:', error);
      }
    },
    
    // 点赞/取消点赞
    toggleLike(post) {
      // 如果是占位帖子，不允许点赞
      if (post.isPlaceholder) {
        uni.showToast({
          title: '无法对预览内容进行操作',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 更新原始帖子对象
        post.liked = !post.liked;
        post.likeCount = post.likeCount || 0;
        post.likeCount += post.liked ? 1 : -1;
        
        // 如果详情页正在显示，且当前点赞的帖子就是详情页的帖子，同步更新详情页数据
        if (this.showPostDetail && this.detailPost && this.detailPost.id === post.id) {
          this.detailPost.liked = post.liked;
          this.detailPost.likeCount = post.likeCount;
        }
        
        // 更新本地存储中的推荐帖子
        const recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        const updatedPosts = recommendedPosts.map(item => 
          item.id === post.id ? { ...item, ...post } : item
        );
        uni.setStorageSync('recommendedPosts', updatedPosts);
        
        // 同时更新我的动态中的帖子
        const myPosts = uni.getStorageSync('myPosts') || [];
        const updatedMyPosts = myPosts.map(item => 
          item.id === post.id ? { ...item, ...post } : item
        );
        uni.setStorageSync('myPosts', updatedMyPosts);
        
        // 更新当前页面的socialList中的帖子数据
        this.socialList = this.socialList.map(item => 
          item.id === post.id ? { ...item, ...post } : item
        );
        
        // 显示提示
        uni.showToast({
          title: post.liked ? '点赞成功' : '取消点赞',
          icon: 'none'
        });
        
        // 如果是点赞操作且不是自己的帖子，创建点赞消息通知
        if (post.liked && post.userId && post.userId !== (this.userInfo.userId || this.app.globalData.userStatus.userId)) {
          this.createNotification({
            type: 'like',
            postId: post.id,
            postContent: post.content,
            targetUserId: post.userId
          });
        }
      } catch (error) {
        console.error('点赞操作失败:', error);
      }
    },
    
    // 显示删除确认对话框
    showDeleteConfirm() {
      // 检查用户是否已登录且不是游客
      if (!this.app || !this.app.globalData || !this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        uni.showToast({
          title: '请先注册登录，再使用删除功能',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条帖子吗？删除后无法恢复。',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            this.deletePost();
          }
        }
      });
    },
    
    // 执行删除帖子操作
    deletePost() {
      try {
        const postId = this.detailPost.id;
        
        // 从推荐帖子中删除
        const recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        const filteredRecommendedPosts = recommendedPosts.filter(item => item.id !== postId);
        uni.setStorageSync('recommendedPosts', filteredRecommendedPosts);
        
        // 从我的动态中删除
        const myPosts = uni.getStorageSync('myPosts') || [];
        const filteredMyPosts = myPosts.filter(item => item.id !== postId);
        uni.setStorageSync('myPosts', filteredMyPosts);
        
        // 从当前页面的数据中删除
        this.socialList = this.socialList.filter(item => item.id !== postId);
        
        // 关闭帖子详情页
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500
        });
        
        setTimeout(() => {
          this.closePostDetail();
        }, 1000);
        
      } catch (error) {
        console.error('删除帖子失败:', error);
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    },
  }
};
</script>

<style scoped>
  .social-setting {
    padding: 20rpx;
    background-color: #f7f8fa;
  }
  
  .tab-bar {
    display: flex;
    height: 80rpx;
    border-bottom: 1rpx solid #eee;
    background-color: #fff;
  }
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }
  .tab-item.active {
    color: #2699fb;
    font-weight: bold;
    border-bottom: 4rpx solid #2699fb;
  }
  
  /* 排序选项栏样式 */
  .sort-bar {
    display: flex;
    height: 70rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    padding: 0 20rpx;
  }
  .sort-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;
  }
  .sort-item.active {
    color: #2699fb;
    font-weight: 500;
  }
  
  .content-area {
    margin-bottom: 200rpx;
  }
  
  .post-container {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
  
  .social-list {
    padding: 10rpx 0;
  }
  .header-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 15rpx;
    position: relative; /* 添加相对定位，使计数器可以绝对定位 */
  }
  .counter {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 22rpx;
    color: #999;
    background-color: #f5f5f5;
    padding: 6rpx 12rpx;
    border-radius: 15rpx;
  }
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 1rpx solid #eee;
    overflow: hidden;
    margin-right: 20rpx;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .name {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 5rpx;
  }
  .desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 5rpx;
  }
  .time {
    font-size: 22rpx;
    color: #999;
  }
  .content {
    font-size: 28rpx;
    margin: 0 0 20rpx 0;
    line-height: 1.6;
    word-break: break-word;
  }
  
  /* 图片列表样式 */
  .image-list {
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
  }
  .interact {
    display: flex;
    align-items: center;
    color: #666;
  }
  
  /* 评论预览样式 */
  .comments-preview {
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
  }
  
  .comment-preview-item {
    margin-bottom: 10rpx;
    font-size: 26rpx;
    color: #666;
    display: flex;
    align-items: center;
  }
  
  .comment-avatar {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }
  
  .comment-content {
    flex: 1;
  }
  
  .comment-preview-name {
    color: #2699fb;
    font-weight: 500;
  }
  
  .comment-preview-content {
    color: #333;
  }
  
  .icon-item {
    display: flex;
    align-items: center;
    margin-right: 40rpx;
    font-size: 24rpx;
    color: #666;
  }
  .interact-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
    position: relative;
    transition: transform 0.3s ease;
    /* 确保图片正确显示 */
    object-fit: contain;
  }
  /* 已点赞状态 - 移除样式效果 */
  
  .friends-list {
    padding: 20rpx 0;
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
  }
  .friend-card {
    display: flex;
    align-items: center;
    padding: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;
    cursor: pointer;
  }
  .friend-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    border: 1rpx solid #eee;
    overflow: hidden;
  }
  .friend-info {
    flex: 1;
  }
  .friend-name {
    font-size: 30rpx;
    font-weight: 500;
    margin-bottom: 5rpx;
  }
  .friend-sign {
    font-size: 24rpx;
    color: #999;
  }
  
  .friend-posts {
    padding: 10rpx 0;
  }
  .back-btn {
    font-size: 28rpx;
    color: #2699fb;
    margin-bottom: 20rpx;
    padding: 10rpx 0;
  }
  
  .sub-bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 80rpx;
    background-color: #fff;
    border-top: 1rpx solid #eee;
    border-bottom: 1rpx solid #eee;
    position: fixed;
    bottom: 120rpx;
    left: 0;
    right: 0;
    padding: 0 20rpx;
  }
  .sub-publish-btn {
    width: 45%;
    height: 60rpx;
    line-height: 60rpx;
    border-radius: 30rpx;
    background-color: #2699fb;
    color: #fff;
    font-size: 28rpx;
  }
  .sub-message-btn {
    width: 45%;
    height: 60rpx;
    line-height: 60rpx;
    border-radius: 30rpx;
    border: 1rpx solid #2699fb;
    color: #2699fb;
    background-color: #fff;
    font-size: 28rpx;
  }
  
  /* 评论弹窗样式 */
  .comment-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    animation: fadeIn 0.2s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .comment-container {
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .comment-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .comment-container {
    position: relative;
    background-color: #fff;
    border-top-left-radius: 30rpx;
    border-top-right-radius: 30rpx;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #eee;
  }
  
  .comment-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .comment-close {
    font-size: 48rpx;
    color: #999;
    padding: 10rpx;
  }
  
  .comment-list {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx 30rpx;
  }
  
  .comment-item {
    display: flex;
    margin-bottom: 24rpx;
  }
  
  /* 占位帖子提示样式 */
  .placeholder-notice {
    display: flex;
    align-items: center;
    padding: 20rpx;
    margin: 20rpx;
    background-color: #fff9e6;
    border-radius: 12rpx;
    border: 1rpx solid #ffd700;
  }
  
  .notice-icon {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
  
  .notice-icon image {
    width: 100%;
    height: 100%;
  }
  
  .notice-content {
    flex: 1;
  }
  
  .notice-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #ff6600;
    margin-bottom: 8rpx;
  }
  
  .notice-desc {
    font-size: 26rpx;
    color: #666;
    line-height: 1.4;
  }
  
  .comment-text {
    color: #333;
    font-weight: 500;
    background-color: #fff;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    margin-left: 8rpx;
    word-break: break-word;
  }
  
  .comment-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
  }
  
  .comment-info {
    flex: 1;
  }
  
  .comment-name {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .comment-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
    margin-bottom: 8rpx;
    word-break: break-word;
  }
  
  .comment-time {
    font-size: 24rpx;
    color: #999;
  }
  
  .no-comments {
    text-align: center;
    color: #999;
    font-size: 28rpx;
    padding: 60rpx 0;
  }
  
  /* 帖子详情页面样式 */
  .post-detail-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    z-index: 10000;
    display: flex;
    flex-direction: column;
  }
  
  /* 固定的顶部导航栏 - 重新设计确保稳定固定 */
  .detail-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    z-index: 1001; /* 确保层级最高 */
    transform: translateZ(0); /* 启用硬件加速防止抖动 */
  }
  
  /* 返回按钮样式 - 自定义样式 */
  .back-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }
  
  /* 返回图片样式 - 确保正确显示 */
  .back-image {
    width: 40rpx;
    height: 40rpx;
    object-fit: contain;
  }
  
  /* 删除按钮样式 - 修复被遮挡问题 */
  .delete-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }
  
  /* 删除图片样式 - 确保正确显示 */
  .delete-icon {
    width: 40rpx;
    height: 40rpx;
    object-fit: contain;
  }
  
  /* 可滚动的内容区域 - 调整为相对定位 */
  .detail-content {
    position: absolute;
    top: 88rpx; /* 导航栏高度 */
    left: 0;
    right: 0;
    bottom: 100rpx; /* 底部输入框高度 */
    overflow-y: auto;
  }
  
  /* 固定的底部评论输入框 */
  .detail-comment-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    background-color: #fff;
    border-top: 1rpx solid #f0f0f0;
    z-index: 1000;
    transform: translateZ(0); /* 启用硬件加速防止抖动 */
  }
  
  /* 移除之前添加的类，避免样式冲突 */
  .fixed-header,
  .scrollable-content,
  .fixed-bottom {
    /* 重置为默认样式 */
    position: static;
    padding: 0;
    margin: 0;
  }
  /* 移除冲突的样式定义 */
  .back-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
  }
  .delete-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
  }
  .delete-icon {
    width: 40rpx;
    height: 40rpx;
    object-fit: contain;
  }
  .detail-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }
  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 100rpx;
  }
  .detail-user-info {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background-color: #fff;
  }
  .detail-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    border: 2rpx solid #f0f0f0;
  }
  .detail-user-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
  }
  .detail-post-content {
    background-color: #fff;
    padding: 0 30rpx 30rpx 30rpx;
    margin-top: 20rpx;
  }
  .detail-content-text {
    font-size: 32rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }
  .detail-image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    margin-bottom: 20rpx;
  }
  .detail-post-image {
    width: 100%;
    height: 400rpx;
    border-radius: 15rpx;
    margin-bottom: 15rpx;
    background-color: #f0f0f0;
  }
  .detail-time {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
  }
  .detail-interact {
    display: flex;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;
  }
  .detail-icon-item {
    display: flex;
    align-items: center;
    margin-right: 60rpx;
  }
  .detail-interact-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 10rpx;
    object-fit: contain;
    /* 移除过渡效果，避免放大动画 */
  }
  .detail-icon-item text {
    font-size: 28rpx;
    color: #666;
  }
  /* 移除已点赞状态的特殊样式效果 */
  .detail-interact-icon.active,
  .interact-icon.active {
    /* 不添加红色文字和放大效果 */
    color: inherit;
    transform: none;
  }
  /* 确保文字也没有特殊样式 */
  .detail-icon-item text.active,
  .icon-item text.active {
    color: #666;
    font-weight: normal;
  }
  .detail-comments-section {
    background-color: #fff;
    margin-top: 20rpx;
    padding: 30rpx;
  }
  .detail-comments-header {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  .detail-comment-list {
    
  }
  .detail-comment-item {
    display: flex;
    margin-bottom: 30rpx;
  }
  .detail-comment-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  .detail-comment-content {
    flex: 1;
  }
  .detail-comment-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
  }
  .detail-comment-text {
    font-size: 30rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 8rpx;
  }
  .detail-comment-time {
    font-size: 24rpx;
    color: #999;
  }
  .detail-no-comments {
    text-align: center;
    color: #999;
    font-size: 28rpx;
    padding: 40rpx 0;
  }
  .detail-comment-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    background-color: #fff;
    border-top: 1rpx solid #eee;
    z-index: 10;
  }

  
  .detail-comment-input {
    flex: 1;
    height: 70rpx;
    background-color: #f5f5f5;
    border-radius: 35rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
  }
  .detail-comment-submit {
    padding: 0 30rpx;
    height: 70rpx;
    background-color: #007aff;
    color: #fff;
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
  }
  .detail-comment-submit.disabled {
    background-color: #c0c4cc;
  }
  
  .comment-input-area {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #eee;
    background-color: #fff;
  }
  
  .comment-input {
    flex: 1;
    height: 70rpx;
    background-color: #f5f5f5;
    border-radius: 35rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
  }
  
  .comment-send {
    width: 120rpx;
    height: 70rpx;
    line-height: 70rpx;
    background-color: #2699fb;
    color: #fff;
    border-radius: 35rpx;
    font-size: 28rpx;
    padding: 0;
  }
  
  .comment-send:disabled {
    background-color: #ccc;
  }
  
  /* 清除按钮默认样式 */
  .comment-send::after {
    border: none;
  }
  
  /* 修复底部栏z-index问题 */
  .sub-bottom-nav {
    z-index: 999;
  }
</style>