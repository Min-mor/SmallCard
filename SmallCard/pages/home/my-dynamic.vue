<template>
  <view class="my-dynamic-page">
    <!-- 顶部导航栏 -->
   <!-- <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <view class="nav-title">我的动态</view>
      <view class="empty"></view>
    </view> -->

    <!-- 动态列表 -->
        <view class="dynamic-list">
          <view class="post-item" v-for="(post, index) in myPosts" :key="post.id" @click="openPostDetail(post)">
        <!-- 头部信息 -->
        <view class="post-header">
          <image :src="post.userAvatar" class="avatar" mode="aspectFill"></image>
          <view class="user-info">
            <view class="user-name">{{ post.userName }}</view>
            <view class="post-time">{{ formatTime(post.createTime) }}</view>
          </view>
        </view>
        
        <!-- 内容 -->
        <view class="post-content">{{ post.content }}</view>
        
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
        
        <!-- 操作栏 -->
        <view class="post-actions">
          <view class="action-item" @click="toggleLike(post, $event)" :class="{liked: post.liked}">
            <image 
              :src="post.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" 
              class="action-icon"
              mode="aspectFit"
            ></image>
            <text :class="{liked: post.liked}">{{ post.likeCount || 0 }}</text>
          </view>
          <view class="action-item">
            <image src="/static/icon/评论.png" class="action-icon" mode="aspectFit"></image>
            <text>{{ post.commentCount || 0 }}</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="myPosts.length === 0">
        <image src="/static/icon/社交媒体1.png" class="empty-icon" mode="aspectFit"></image>
        <text class="empty-text">还没有发布过动态</text>
        <button class="publish-btn" @click="goToPublish">去发布</button>
      </view>
    </view>
    
    <!-- 帖子详情全屏页面 -->
    <view class="post-detail-page" v-if="showPostDetail && detailPost">
      <!-- 固定的返回按钮和标题 -->
      <view class="detail-header fixed-header">
          <view class="back-button" @click="closePostDetail">
            <image src="/static/icon/back.png" class="back-icon" mode="aspectFit"></image>
          </view>
        <view class="detail-title">帖子详情</view>
        <view class="delete-button" @click="showDeleteConfirm">
          <image src="/static/icon/删除.png" class="delete-icon" mode="aspectFit"></image>
        </view>
      </view>
      
      <!-- 可滚动的帖子详情内容 -->
      <view class="detail-content scrollable-content">
        <!-- 用户信息 -->
        <view class="detail-user-info">
          <image :src="detailPost.userAvatar" class="detail-avatar" mode="aspectFill"></image>
          <view class="detail-user-name">{{ detailPost.userName }}</view>
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
            <view class="detail-icon-item" @click.stop="toggleLike(detailPost, $event)" :class="{liked: detailPost.liked}">
              <image 
                    :src="detailPost.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" 
                    class="detail-interact-icon" 
                    :class="{liked: detailPost.liked}"
                    mode="aspectFit"
                  ></image>
              <text :class="{liked: detailPost.liked}">{{ detailPost.likeCount || 0 }}</text>
            </view>
            <view class="detail-icon-item comment-icon" @click="toggleComment">
              <image src="/static/icon/评论.png" class="detail-interact-icon" mode="aspectFit"></image>
              <text>{{ detailPost.commentCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view class="delete-confirm" v-if="showDeleteBox">
      <view class="delete-overlay" @click="showDeleteBox = false"></view>
      <view class="delete-content">
        <view class="delete-title">确认删除</view>
        <view class="delete-message">确定要删除这条动态吗？删除后无法恢复。</view>
        <view class="delete-buttons">
          <view class="cancel-btn" @click="showDeleteBox = false">取消</view>
          <view class="confirm-btn" @click="deletePost">确定</view>
        </view>
      </view>
    </view>
    
    <!-- 评论区域 - 移除对showPostDetail的依赖 -->
    <view class="comments-section" v-if="showComments">
      <view class="comment-list-header">
        <text class="comment-list-title">全部评论 ({{ comments.length }})</text>
      </view>
      
      <!-- 评论列表 - 独立于showPostDetail状态 -->
      <view class="comment-section">
        <view class="comment-header" @click="toggleComment">
          <text class="comment-list-title">全部评论 ({{ comments.length }})</text>
          <text class="toggle-icon">{{ showComments ? '收起' : '展开' }}</text>
        </view>
        
        <!-- 评论列表内容 -->
        <view class="comment-list" v-if="showComments">
          <view class="comment-item" v-for="comment in comments" :key="comment.id">
            <!-- 评论主体 -->
            <image :src="comment.avatar" class="comment-avatar" mode="cover"></image>
            <view class="comment-main">
              <text class="comment-user">{{ comment.user }}</text>
              <text class="comment-content">{{ comment.content }}</text>
              <view class="comment-meta">
                <text class="comment-time">{{ comment.time || '刚刚' }}</text>
                <text class="like-icon" :class="{ 'liked': comment.liked }" @click.stop="likeComment(comment)">❤️ {{ comment.likeCount || 0 }}</text>
                <text class="reply-icon" @click.stop="replyToComment(comment)">回复</text>
              </view>
              
              <!-- 子评论（回复） -->
              <view class="child-comments" v-if="comment.replies && comment.replies.length > 0">
                <view class="child-comment-item" 
                      v-for="reply in comment.showAllReplies ? comment.replies : comment.replies.slice(0, 1)" 
                      :key="reply.id">
                  <text class="comment-user">{{ reply.user }}</text>
                  <text v-if="reply.toUser" class="reply-to"> 回复 @{{ reply.toUser }}</text>
                  <text class="comment-content">{{ reply.content }}</text>
                  <view class="comment-meta">
                    <text class="comment-time">{{ reply.time || '刚刚' }}</text>
                    <text class="like-icon" :class="{ 'liked': reply.liked }" @click.stop="likeComment(reply)">❤️ {{ reply.likeCount || 0 }}</text>
                    <text class="reply-icon" @click.stop="replyToComment(comment, reply)">回复</text>
                  </view>
                </view>
              </view>
              
              <!-- 展开/收起回复 -->
              <view class="expand-replies" 
                    v-if="comment.replies && comment.replies.length > 1" 
                    @click.stop="toggleReplies(comment)">
                <text>{{ comment.showAllReplies ? '收起' : '展开' }} {{ comment.replies.length - 1 }}条回复</text>
              </view>
            </view>
          </view>
          
          <!-- 无评论提示 -->
          <view class="no-comments" v-if="comments.length === 0">
            <text>暂无评论，快来发表你的看法吧~</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部评论输入框 - 移除对showPostDetail的依赖 -->
    <view class="bottom-comment-input" v-if="showComments">
      <input type="text" v-model="commentInput" placeholder="说点什么" class="comment-input" @confirm="submitComment" />
      <button class="comment-submit" @click="submitComment">发送</button>
    </view>
         
    
    <!-- 删除确认弹窗 -->
    <view class="delete-confirm" v-if="showDeleteBox">
      <view class="delete-overlay" @click="showDeleteBox = false"></view>
      <view class="delete-content">
        <view class="delete-title">确认删除</view>
        <view class="delete-message">确定要删除这条动态吗？删除后无法恢复。</view>
        <view class="delete-buttons">
          <view class="cancel-btn" @click="showDeleteBox = false">取消</view>
          <view class="confirm-btn" @click="deletePost">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      myPosts: [],
      showPostDetail: false,
      detailPost: null,
      showDeleteBox: false,
      app: null,
      comments: [],
      commentInput: '',
      replyTarget: null,
      showComments: true
    }
  },
  
  onLoad() {
    // 获取全局应用实例
    this.app = getApp();
    
    // 检查登录状态
    if (!this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
      // 显示带选项的模态框
      uni.showModal({
        title: '请先登录',
        content: '登录后可查看动态',
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
    
    this.loadMyPosts();
    // 监听全局数据更新事件
    uni.$on('postDataUpdated', this.handlePostDataUpdated);
    uni.$on('commentAdded', this.handleCommentAdded);
    uni.$on('likeStatusChanged', this.handleLikeStatusChanged);
  },
  
  onUnload() {
    // 移除事件监听
    uni.$off('postDataUpdated', this.handlePostDataUpdated);
    uni.$off('commentAdded', this.handleCommentAdded);
    uni.$off('likeStatusChanged', this.handleLikeStatusChanged);
  },
  
  onShow() {
    // 页面每次显示时都检查登录状态
    if (!this.app || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
      // 显示带选项的模态框
      uni.showModal({
        title: '请先登录',
        content: '登录后可查看动态',
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
    
    // 页面每次显示时都重新加载，确保数据最新
    this.loadMyPosts();
},
  created() {
    // 监听帖子更新事件
    uni.$on('postsUpdated', this.loadMyPosts);
  },
  beforeDestroy() {
    // 移除事件监听
    uni.$off('postsUpdated', this.loadMyPosts);
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 跳转到发布页面
    goToPublish() {
      uni.navigateTo({
        url: '/pages/social/publish'
      });
    },
    
    // 全局数据更新处理
    handlePostDataUpdated(data) {
      if (data && data.postId) {
        const postIndex = this.myPosts.findIndex(p => p.id === data.postId);
        if (postIndex !== -1) {
          // 更新本地帖子数据
          this.myPosts[postIndex] = { ...this.myPosts[postIndex], ...data.updatedData };
          // 如果当前正在查看这个帖子，同步更新当前帖子数据
          if (this.detailPost && this.detailPost.id === data.postId) {
            this.detailPost = { ...this.detailPost, ...data.updatedData };
          }
          // 更新本地存储
          this.updatePostsToStorage();
        }
      }
    },
    
    // 评论添加处理
    handleCommentAdded(data) {
      if (data && data.postId) {
        // 如果当前正在查看对应帖子，更新评论列表
        if (this.detailPost && this.detailPost.id === data.postId) {
          // 重新初始化评论数据以包含新评论
          this.initCommentsData();
          // 更新评论数
          if (this.detailPost) {
            this.detailPost.commentCount = (this.detailPost.commentCount || 0) + 1;
          }
        }
        // 更新列表中的评论数 - 添加更宽松的匹配逻辑
        let postIndex = this.myPosts.findIndex(p => p.id === data.postId);
        
        // 如果没找到完全匹配，尝试其他可能的匹配方式
        if (postIndex === -1) {
          // 检查是否是通过postId的一部分匹配
          postIndex = this.myPosts.findIndex(p => 
            String(p.id).includes(String(data.postId)) || 
            String(data.postId).includes(String(p.id))
          );
        }
        
        if (postIndex !== -1) {
          // 更新评论数
          this.myPosts[postIndex].commentCount = (this.myPosts[postIndex].commentCount || 0) + 1;
          // 更新存储并重新加载以确保数据同步
          this.updatePostsToStorage();
          // 重新初始化评论数据，确保最新评论显示
          if (this.detailPost && this.detailPost.id === this.myPosts[postIndex].id) {
            this.initCommentsData();
          }
        } else {
          console.log('未找到匹配的帖子:', data.postId, '在', this.myPosts.map(p => p.id));
        }
      }
    },
    
    // 点赞状态变更处理
    handleLikeStatusChanged(data) {
      if (data && data.postId) {
        const postIndex = this.myPosts.findIndex(p => p.id === data.postId);
        if (postIndex !== -1) {
          this.myPosts[postIndex].likeCount = data.likeCount;
          this.myPosts[postIndex].liked = data.liked;
          this.updatePostsToStorage();
        }
        // 更新当前查看的帖子
        if (this.detailPost && this.detailPost.id === data.postId) {
          this.detailPost.likeCount = data.likeCount;
          this.detailPost.liked = data.liked;
        }
      }
    },
    
    // 发送全局数据更新事件
    emitGlobalUpdate(type, data) {
      uni.$emit(type, data);
    },
    
    // 加载我的动态
    loadMyPosts() {
      try {
        const savedPosts = uni.getStorageSync('myPosts') || [];
        // 获取当前登录用户的ID - 修复：从userInfo对象中获取
        const currentUserId = this.app.globalData.userStatus.userInfo?.userId || this.app.globalData.userStatus.userId || 'current_user';
        // 只显示当前用户的帖子
        const myUserPosts = savedPosts.filter(post => post.userId === currentUserId);
        
        // 如果没有动态，添加一些模拟数据用于测试
        if (myUserPosts.length === 0) {
          // 获取当前用户的真实信息 - 修复：从userInfo对象中获取
        const currentUserName = this.app.globalData.userStatus.userInfo?.userName || this.app.globalData.userStatus.userName || '我的昵称';
        const currentUserAvatar = this.app.globalData.userStatus.userInfo?.userAvatar || this.app.globalData.userStatus.userAvatar || '/static/icon/用户.png';
          
          const mockPosts = [
            {
              id: 'mock-post-1',
              userId: currentUserId,
              userName: currentUserName,
              userAvatar: currentUserAvatar,
              content: '这是一条测试动态，用于展示帖子详情功能。',
              images: ['/static/image/1.png', '/static/image/2.png', '/static/image/3.png'],
              createTime: new Date().toISOString(),
              likeCount: 12,
              commentCount: 3,
              liked: false
            },
            {
              id: 'mock-post-2',
              userId: currentUserId,
              userName: currentUserName,
              userAvatar: currentUserAvatar,
              content: '这条动态只有文字内容，可以测试文字详情的展示效果。',
              images: [],
              createTime: new Date(Date.now() - 3600000).toISOString(),
              likeCount: 5,
              commentCount: 1,
              liked: true
            },
            {
              id: 'mock-post-3',
              userId: currentUserId,
              userName: currentUserName,
              userAvatar: currentUserAvatar,
              content: '这条动态有9张图片，可以测试图片网格布局和点击预览功能。',
              images: [
                '/static/image/1.png', '/static/image/2.png', '/static/image/3.png',
                '/static/image/1.png', '/static/image/2.png', '/static/image/3.png',
                '/static/image/1.png', '/static/image/2.png', '/static/image/3.png'
              ],
              createTime: new Date(Date.now() - 7200000).toISOString(),
              likeCount: 23,
              commentCount: 8,
              liked: false
            }
          ];
          
          // 将模拟数据保存到本地存储
          const allPosts = [...mockPosts, ...savedPosts];
          uni.setStorageSync('myPosts', allPosts);
          this.myPosts = mockPosts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        } else {
          // 按时间倒序排列，最新的在前面
          this.myPosts = myUserPosts.sort((a, b) => b.createTime - a.createTime);
        }
        console.log('加载我的动态:', this.myPosts);
      } catch (error) {
        console.error('加载动态失败:', error);
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
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
      // 超过7天显示具体日期
      else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    },
    
    // 点赞/取消点赞
    toggleLike(post, event) {
      // 再次检查登录状态（防止登录过期）
      if (!this.app.globalData.userStatus.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      // 直接进行点赞/取消点赞操作
      const wasLiked = post.liked;
      post.liked = !wasLiked;
      post.likeCount = post.likeCount || 0;
      post.likeCount += post.liked ? 1 : -1;
      
      // 添加点赞动画效果
      if (event && event.currentTarget && event.currentTarget.classList) {
        const likeIcon = event.currentTarget;
        // 点赞动画类
        const animationClass = post.liked ? 'like-animation' : 'unlike-animation';
        try {
          likeIcon.classList.add(animationClass);
          setTimeout(() => {
            if (likeIcon && likeIcon.classList) {
              likeIcon.classList.remove(animationClass);
            }
          }, 600);
        } catch (e) {
          console.warn('动画应用失败:', e);
        }
      }
      
      // 如果是详情页的点赞，同时更新列表中的对应帖子
      if (this.detailPost && this.detailPost.id === post.id) {
        const index = this.myPosts.findIndex(p => p.id === post.id);
        if (index !== -1) {
          this.myPosts[index].liked = post.liked;
          this.myPosts[index].likeCount = post.likeCount;
        }
      }
      
      // 更新本地存储
      this.updatePostsToStorage();
      
      // 发送全局点赞状态变更事件
      this.emitGlobalUpdate('likeStatusChanged', {
        postId: post.id,
        likeCount: post.likeCount,
        liked: post.liked
      });
      
      // 显示更清晰的提示信息
      uni.showToast({
        title: post.liked ? '点赞成功' : '已取消点赞',
        icon: 'success',
        duration: 1200
      });
    },
    
    // 更新帖子到本地存储
    updatePostsToStorage() {
      try {
        // 数据验证
        if (!Array.isArray(this.myPosts)) {
          console.error('myPosts数据格式错误');
          return;
        }
        
        // 保存当前用户的帖子到本地存储
        uni.setStorageSync('myPosts', this.myPosts);
        
        // 同时更新推荐帖子中的对应帖子的点赞状态，确保数据一致性
        let recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        if (Array.isArray(recommendedPosts)) {
          // 同步点赞状态到推荐帖子
          this.myPosts.forEach(myPost => {
            const index = recommendedPosts.findIndex(post => post.id === myPost.id);
            if (index !== -1) {
              recommendedPosts[index].liked = myPost.liked;
              recommendedPosts[index].likeCount = myPost.likeCount;
            }
          });
          // 保存更新后的推荐帖子
          uni.setStorageSync('recommendedPosts', recommendedPosts);
        }
        
        // 触发全局事件，通知社交页面更新
        uni.$emit('postsUpdated');
        
        console.log('点赞状态已成功保存到本地存储');
      } catch (error) {
        console.error('保存帖子失败:', error);
        // 显示错误提示给用户
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    // 预览图片
    previewImage(imageList, currentIndex) {
      if (!imageList || imageList.length === 0) {
        return;
      }
      
      uni.previewImage({
        urls: imageList,
        current: currentIndex,
        success: () => {
          console.log('图片预览成功');
        },
        fail: (err) => {
          console.error('预览图片失败:', err);
          uni.showToast({ title: '预览图片失败', icon: 'none' });
        }
      });
    },
    
    // 打开帖子详情
    openPostDetail(post) {
      // 显示帖子详情全屏页面
      this.detailPost = post;
      this.showPostDetail = true;
      // 初始化评论数据
      this.initCommentsData();
    },
    
    // 关闭帖子详情
    closePostDetail() {
      this.showPostDetail = false;
      this.detailPost = null;
      this.comments = [];
      this.commentInput = '';
      this.replyTarget = null;
    },
    
    // 初始化评论数据
    initCommentsData() {
      if (!this.detailPost) return;
      
      const postId = this.detailPost.id;
      let comments = [];
      
      try {
        // 1. 首先尝试从本地存储中获取真实的评论数据
        const allComments = uni.getStorageSync('postComments') || {};
        
        // 检查是否有当前帖子的真实评论 - 添加更宽松的匹配逻辑
        let foundComments = false;
        
        // 1. 尝试精确匹配
        if (allComments[postId] && Array.isArray(allComments[postId]) && allComments[postId].length > 0) {
          comments = allComments[postId];
          foundComments = true;
          console.log('从存储中精确匹配获取评论:', postId, comments.length, '条');
        } 
        // 2. 如果精确匹配失败，尝试宽松匹配（字符串包含关系）
        else if (Object.keys(allComments).length > 0) {
          for (let storedPostId in allComments) {
            if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
              comments = allComments[storedPostId];
              foundComments = true;
              console.log('从存储中宽松匹配获取评论:', postId, '匹配到', storedPostId, comments.length, '条');
              break;
            }
          }
        }
        
        if (!foundComments) {
          // 2. 如果没有真实评论，才生成模拟评论
          const commentCount = this.detailPost.commentCount || 0;
          
          // 如果评论数为0，则返回空数组
          if (commentCount === 0) {
            this.comments = [];
            return;
          }
          
          // 模拟用户数据
          const mockUsers = ['张三', '李四', '王五', '赵六', '陈七'];
          const mockAvatars = ['/static/photo/张三.jpg', '/static/photo/李四.jpg', '/static/photo/王五.jpg', '/static/photo/赵六.jpg', '/static/photo/陈七.jpg'];
          const mockContents = [
            '写代码时的灵感进发really美妙！',
            '赞同，特别是解决bug那一刻',
            '确实很有启发',
            '同感，学习了',
            '这个想法太棒了',
            '很实用的建议',
            '感谢分享'
          ];
          
          // 生成评论数据，确保评论总数与帖子显示的评论数一致
          let totalGenerated = 0;
          let commentIndex = 0;
          
          while (totalGenerated < commentCount) {
            // 创建主评论
            const hasReplies = commentIndex > 0 && totalGenerated < commentCount - 1 && Math.random() > 0.5;
            const replyCount = hasReplies ? Math.min(1, commentCount - totalGenerated - 1) : 0;
            
            const userIndex = Math.floor(Math.random() * mockUsers.length);
            const mainComment = {
              id: `${commentIndex + 1}`,
              user: mockUsers[userIndex],
              avatar: mockAvatars[userIndex],
              content: mockContents[Math.floor(Math.random() * mockContents.length)],
              time: `${this.getRandomTime()}`,
              likeCount: 0,
              liked: false,
              showAllReplies: false,
              replies: []
            };
            
            // 添加回复
            if (replyCount > 0) {
              const replyUserIndex = (userIndex + 1) % mockUsers.length;
              mainComment.replies.push({
                id: `${commentIndex + 1}_1`,
                user: mockUsers[replyUserIndex],
                avatar: mockAvatars[replyUserIndex],
                toUser: mainComment.user,
                content: mockContents[Math.floor(Math.random() * mockContents.length)],
                time: `${this.getRandomTime()}`,
                likeCount: 0,
                liked: false
              });
              totalGenerated += replyCount;
            }
            
            comments.push(mainComment);
            totalGenerated++;
            commentIndex++;
          }
          console.log('生成模拟评论:', postId, comments.length, '条');
        }
      } catch (error) {
        console.error('加载评论数据失败:', error);
      }
      
      // 确保评论数据格式正确
      this.comments = comments.map(comment => ({
        ...comment,
        replies: comment.replies || [],
        showAllReplies: comment.showAllReplies || false
      }));
    },
    
    // 生成随机时间
    getRandomTime() {
      const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      return `11-13 ${hour}:${minute}`;
    },
    
    // 点赞评论（切换点赞状态）
    likeComment(comment) {
      if (comment.liked) {
        comment.liked = false;
        comment.likeCount = Math.max(0, comment.likeCount - 1);
      } else {
        comment.liked = true;
        comment.likeCount++;
      }
    },
    
    // 回复评论
    replyToComment(comment, reply = null) {
      // 明确设置回复目标
      this.replyTarget = reply || comment;
      
      // 设置输入框内容，始终显示@用户名格式
      const targetUser = reply ? reply.user : comment.user;
      this.commentInput = `@${targetUser} `;
      
      // 聚焦输入框 - 使用uni-app的方式
      this.$nextTick(() => {
        // 在uni-app中使用setTimeout确保DOM已更新
        setTimeout(() => {
          uni.createSelectorQuery().select('.comment-input')
            .fields({ node: true })
            .exec((res) => {
              if (res && res[0] && res[0].node) {
                res[0].node.focus();
              }
            });
        }, 100);
      });
    },
    
    // 展开/收起回复
    toggleReplies(comment) {
      comment.showAllReplies = !comment.showAllReplies;
    },
    
    // 提交评论
    submitComment() {
      // 确保content不为null或undefined
      let content = this.commentInput;
      if (!content || content.trim() === '') {
        uni.showToast({
          title: '评论内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 移除@用户名前缀（如果有），因为我们会单独存储toUser
      content = content.trim();
      let toUser = null;
      if (content.startsWith('@')) {
        const spaceIndex = content.indexOf(' ');
        if (spaceIndex > 0) {
          toUser = content.substring(1, spaceIndex);
          content = content.substring(spaceIndex + 1).trim();
        }
      }
      
      // 获取当前时间
      const now = new Date();
      const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // 获取当前用户信息
      const userInfo = this.getUserInfo();
      
      // 初始化新评论对象变量
      let newComment;
      
      if (this.replyTarget) {
        // 回复评论
        const replyId = `${Date.now()}`;
        newComment = {
          id: replyId,
          user: userInfo.userName,
          avatar: userInfo.avatarUrl,
          toUser: toUser,
          content: content,
          time: timeStr,
          likeCount: 0,
          liked: false
        };
        
        // 确保replies数组存在
        if (this.replyTarget.replies === undefined) {
          // 回复的是子评论，需要找到父评论
          const parentComment = this.findParentComment(this.replyTarget.id);
          if (parentComment) {
            parentComment.replies.push(newComment);
          }
        } else {
          // 回复的是主评论
          this.replyTarget.replies.push(newComment);
        }
        // 重置回复目标
        this.replyTarget = null;
      } else {
        // 添加新评论
        const mainCommentId = `${Date.now()}`;
        newComment = {
          id: mainCommentId,
          user: userInfo.userName,
          avatar: userInfo.avatarUrl,
          content: content,
          time: timeStr,
          likeCount: 0,
          liked: false,
          showAllReplies: false,
          replies: []
        };
        this.comments.unshift(newComment);
      }
      
      // 更新评论数
      this.detailPost.commentCount = (this.detailPost.commentCount || 0) + 1;
      
      // 更新列表中的评论数
      const index = this.myPosts.findIndex(p => p.id === this.detailPost.id);
      if (index !== -1) {
        this.myPosts[index].commentCount = this.detailPost.commentCount;
      }
      
      // 保存到本地存储
      this.updatePostsToStorage();
      
      // 发送全局评论添加事件
      this.emitGlobalUpdate('commentAdded', {
        postId: this.detailPost.id,
        comment: newComment
      });
      
      // 清空输入框
      this.commentInput = '';
      
      // 保存评论到本地存储，确保两个页面共享相同的评论数据
      try {
        const postId = this.detailPost.id;
        // 获取现有评论
        const allComments = uni.getStorageSync('postComments') || {};
        
        let targetPostId = postId;
        
        // 检查是否已经存在相似的postId
        for (let storedPostId in allComments) {
          if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
            targetPostId = storedPostId;
            console.log('发现相似的postId，使用已存在的键:', targetPostId);
            break;
          }
        }
        
        // 更新当前帖子的评论
        allComments[targetPostId] = this.comments;
        // 保存回本地存储
        uni.setStorageSync('postComments', allComments);
        console.log('评论已保存到本地存储:', targetPostId, this.comments.length, '条');
      } catch (error) {
        console.error('保存评论到本地存储失败:', error);
      }
      
      uni.showToast({
        title: '评论成功',
        icon: 'success'
      });
    },
    
    // 获取当前用户信息
    getUserInfo() {
      const currentUser = this.app.globalData.userStatus || {};
      return {
        userName: currentUser.userName || '当前用户',
        avatarUrl: currentUser.userAvatar || '/static/icon/我的.png'
      };
    },
    
    // 查找父评论
    findParentComment(replyId) {
      for (const comment of this.comments) {
        if (comment.replies) {
          for (const reply of comment.replies) {
            if (reply.id === replyId) {
              return comment;
            }
          }
        }
      }
      return null;
    },
    
    // 切换评论显示
    toggleComment() {
      this.showComments = !this.showComments;
    },
    
    // 关闭帖子详情
    closePostDetail() {
      this.showPostDetail = false;
      this.detailPost = null;
    },
    
    // 显示删除确认对话框
    showDeleteConfirm() {
      this.showDeleteBox = true;
    },
    
    // 执行删除帖子操作
    deletePost() {
      // 再次检查登录状态（防止登录过期）
      if (!this.app.globalData.userStatus.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        this.showDeleteBox = false;
        return;
      }
      
      try {
        const postId = this.detailPost.id;
        
        // 从我的动态中删除
        this.myPosts = this.myPosts.filter(item => item.id !== postId);
        
        // 更新本地存储
        uni.setStorageSync('myPosts', this.myPosts);
        
        // 更新推荐列表中的帖子
        const recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        const filteredRecommendedPosts = recommendedPosts.filter(item => item.id !== postId);
        uni.setStorageSync('recommendedPosts', filteredRecommendedPosts);
        
        // 触发全局事件，通知社交页面更新
        uni.$emit('postsUpdated');
        
        // 关闭弹窗和详情页
        this.showDeleteBox = false;
        this.closePostDetail();
        
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500
        });
      } catch (error) {
        console.error('删除帖子失败:', error);
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style scoped>
.my-dynamic-page {
  padding-bottom: 40rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 导航栏样式 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #333;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.empty {
  width: 60rpx;
}

/* 动态列表样式 */
.dynamic-list {
  padding: 20rpx;
}

.post-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 头部信息 */
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 5rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

/* 内容样式 */
.post-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  word-break: break-word;
}

/* 确保即使内容为空也有基本的最小高度 */
.detail-post-content {
  min-height: 200rpx;
}

/* 图片列表 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: calc((100% - 20rpx) / 3);
  height: calc((100% - 20rpx) / 3);
  border-radius: 10rpx;
  background-color: #f0f0f0;
}

/* 操作栏 */
.post-actions {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 60rpx;
  transition: transform 0.3s ease;
}

.action-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 10rpx;
  transition: transform 0.3s ease;
}

.action-item text {
  font-size: 26rpx;
  color: #666;
  transition: color 0.3s ease;
}

/* 已点赞状态样式 */
.action-item.liked text {
  color: #ff3b30;
}

/* 点击交互效果 */
.action-item:active .action-icon {
  transform: scale(1.2);
}
  
/* 点赞动画效果 */
@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes unlikeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}

.like-animation {
  animation: likeAnimation 0.6s ease;
}

.unlike-animation {
  animation: unlikeAnimation 0.6s ease;
}

/* 评论区域样式 */
.comments-section {
  background-color: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
  border-radius: 20rpx;
}

.comment-list-header {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.comment-list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.comment-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.comment-main {
  flex: 1;
}

.comment-user {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-right: 10rpx;
}

.reply-to {
  font-size: 28rpx;
  color: #999;
}

.comment-content {
  display: block;
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  margin-top: 8rpx;
  margin-bottom: 10rpx;
  word-break: break-word;
}

.comment-meta {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.comment-time {
  margin-right: 30rpx;
}

.like-icon {
  margin-right: 30rpx;
  cursor: pointer;
  transition: color 0.2s;
}

.like-icon.liked {
  color: #ff4757;
}

.reply-icon {
  cursor: pointer;
}

.child-comments {
  margin-top: 20rpx;
  padding-left: 40rpx;
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
}

.child-comment-item {
  margin-bottom: 15rpx;
}

.child-comment-item:last-child {
  margin-bottom: 0;
}

.expand-replies {
  margin-top: 15rpx;
  color: #666;
  font-size: 26rpx;
  cursor: pointer;
}

.no-comments {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 底部评论输入框 */
.bottom-comment-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
  z-index: 1000;
}

.comment-input {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
}

.comment-submit {
  margin-left: 20rpx;
  height: 70rpx;
  min-width: 120rpx;
  line-height: 70rpx;
  background-color: #07c160;
  color: #fff;
  font-size: 28rpx;
  border-radius: 35rpx;
  padding: 0;
  border: none;
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
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.publish-btn {
  background-color: #2699fb;
  color: #fff;
  border: none;
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
/* 帖子详情样式 */
.post-detail-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
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
  width: 40rpx;
  height: 40rpx;
}

.detail-title {
  flex: 1;
  text-align: center;
  margin: 0 30rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.delete-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 40rpx;
  height: 40rpx;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 100rpx;
  padding-bottom: 20rpx;
}

.detail-user-info {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 10rpx solid #f5f5f5;
}

.detail-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.detail-user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.detail-post-content {
  padding: 30rpx;
}

.detail-content-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
  word-break: break-word;
}

.detail-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.detail-post-image {
  width: calc((100% - 20rpx) / 3);
  height: calc((100% - 20rpx) / 3);
  border-radius: 10rpx;
  background-color: #f0f0f0;
}

.detail-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.detail-interact {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
  margin-top: auto; /* 确保交互栏始终在内容底部 */
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
  transition: transform 0.3s ease;
}

.detail-icon-item text {
  font-size: 28rpx;
  color: #666;
  transition: color 0.3s ease;
}

/* 详情页已点赞状态样式 */
.detail-icon-item.liked text,
.detail-interact-icon.liked {
  color: #ff3b30;
}

/* 详情页点赞动画效果 */
.detail-icon-item:active .detail-interact-icon {
  transform: scale(1.2);
}

/* 移除旧的active样式，使用liked样式代替 */

/* 删除确认弹窗样式 */
.delete-confirm {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.delete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.delete-content {
  position: relative;
  width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  z-index: 10;
}

.delete-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
}

.delete-message {
  font-size: 30rpx;
  color: #666;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.6;
}

.delete-buttons {
  display: flex;
  border-top: 1rpx solid #eee;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 30rpx 0;
  text-align: center;
  font-size: 32rpx;
}

.cancel-btn {
  color: #666;
  border-right: 1rpx solid #eee;
}

.confirm-btn {
  color: #ff3b30;
  font-weight: 500;
}
</style>