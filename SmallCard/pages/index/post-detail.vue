<template>
  <view class="post-detail-container">
    <!-- 头部导航栏 -->
    <view class="header">
      <view class="back-button" @click="goBack">
        <image src="/static/icon/back.png" class="back-icon"></image>
      </view>
      <view class="header-title">帖子详情</view>
      <view class="header-right">
        <image src="/static/icon/分享.png" class="share-icon"></image>
      </view>
    </view>
    
    <!-- 帖子内容 -->
    <view class="post-content" v-if="postDetail">
      <!-- 用户信息 -->
      <view class="user-info">
        <image :src="postDetail.avatar || '/static/icon/我的.png'" class="user-avatar" mode="cover"></image>
        <view class="user-meta">
          <text class="user-name">{{ postDetail.name }}</text>
          <text class="publish-time">{{ postDetail.time }}</text>
        </view>
      </view>
      
      <!-- 帖子正文 -->
      <text class="post-desc">{{ postDetail.desc }}</text>
      
      <!-- 图片展示区域 -->
      <view class="image-container" v-if="postDetail.images && postDetail.images.length > 0">
        <!-- 单张图片 -->
        <view class="image-wrapper single" v-if="postDetail.images.length === 1" @click="previewImage(0)">
          <image :src="postDetail.images[0]" class="single-image" mode="aspectFill"></image>
        </view>
        
        <!-- 两张图片 -->
        <view class="image-row two-images" v-else-if="postDetail.images.length === 2">
          <view class="image-wrapper two" v-for="(img, index) in postDetail.images" :key="index" @click="previewImage(index)">
            <image :src="img" class="two-image" mode="aspectFill"></image>
          </view>
        </view>
        
        <!-- 三张图片 -->
        <view class="image-row three-images" v-else-if="postDetail.images.length === 3">
          <view class="image-wrapper three large" @click="previewImage(0)">
            <image :src="postDetail.images[0]" class="three-large-image" mode="aspectFill"></image>
          </view>
          <view class="image-column">
            <view class="image-wrapper three" v-for="(img, index) in postDetail.images.slice(1)" :key="index+1" @click="previewImage(index+1)">
              <image :src="img" class="three-image" mode="aspectFill"></image>
            </view>
          </view>
        </view>
        
        <!-- 四张图片 -->
        <view class="image-grid two-columns" v-else-if="postDetail.images.length === 4">
          <view class="image-wrapper four" v-for="(img, index) in postDetail.images" :key="index" @click="previewImage(index)">
            <image :src="img" class="four-image" mode="aspectFill"></image>
          </view>
        </view>
        
        <!-- 五张及以上图片（最多9张） -->
        <view class="image-grid three-columns" v-else>
          <view class="image-wrapper grid" v-for="(img, index) in postDetail.images.slice(0, 9)" :key="index" @click="previewImage(index)">
            <image :src="img" class="grid-image" mode="aspectFill"></image>
            <!-- 超过9张图片时显示省略 -->
            <view class="image-overlay" v-if="index === 8 && postDetail.images.length > 9">
              <text class="overlay-text">+{{ postDetail.images.length - 9 }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 互动区域 -->
      <view class="interaction-bar">
        <view class="interaction-item">
          <image src="/static/icon/评论.png" class="interaction-icon" mode="aspectFit"></image>
          <text class="count">{{ postDetail.comment || 0 }}</text>
        </view>
        <view class="interaction-item" @click="handleLike">
          <image :src="postDetail.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" class="interaction-icon" mode="aspectFit"></image>
          <text class="count">{{ postDetail.like || 0 }}</text>
        </view>
      </view>
      
      <!-- 评论区域 -->
      <view class="comments-section">
        <!-- 评论列表 -->
        <view class="comment-list">
          <view class="comment-item" v-for="comment in comments" :key="comment.id">
            <!-- 评论主体 -->
            <image :src="comment.avatar" class="comment-avatar" mode="cover"></image>
            <view class="comment-main">
              <text class="comment-user">{{ comment.user }}</text>
              <text class="comment-content">{{ comment.content }}</text>
              <view class="comment-meta">
                    <text class="comment-time">{{ comment.time || '刚刚' }}</text>
                    <text class="like-icon" :class="{ 'liked': comment.liked }" @click="likeComment(comment)">❤️ {{ comment.likeCount || 0 }}</text>
                    <text class="reply-icon" @click="replyToComment(comment)">回复</text>
                  </view>
              
              <!-- 子评论（回复） -->
              <view class="child-comments" v-if="comment.replies && comment.replies.length > 0">
                <view class="child-comment-item" v-for="reply in comment.replies" :key="reply.id">
                  <text class="comment-user">{{ reply.user }}</text>
                  <text v-if="reply.toUser" class="reply-to"> 回复 @{{ reply.toUser }}</text>
                  <text class="comment-content">{{ reply.content }}</text>
                  <view class="comment-meta">
                    <text class="comment-time">{{ reply.time || '刚刚' }}</text>
                    <text class="reply-icon" @click="replyToComment(comment, reply)">回复</text>
                  </view>
                </view>
              </view>
              
              <!-- 展开/收起回复 -->
              <view class="expand-replies" v-if="comment.replies && comment.replies.length > 1" @click="toggleReplies(comment)">
                <text>{{ comment.showAllReplies ? '收起' : '展开' }} 1条回复</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading" v-else>
      <text>加载中...</text>
    </view>
    
    <!-- 底部评论输入框 -->
    <view class="bottom-comment-input" v-if="postDetail">
      <input type="text" v-model="commentInput" placeholder="说点什么" class="comment-input" @confirm="submitComment" />
      <button class="comment-submit" @click="submitComment">发送</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      postDetail: null,
      postId: '',
      category: '',
      comments: [],
      commentInput: '',
      replyTarget: null
    }
  },
  onLoad(options) {
    // 获取传递的参数
    this.postId = options.id || '';
    this.category = options.category || '';
    
    // 加载帖子详情
    this.loadPostDetail();
    // 初始化评论数据
    this.initCommentsData();
    
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
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 加载帖子详情
    loadPostDetail() {
      // 尝试从首页获取数据
      const pages = getCurrentPages();
      let homePage = null;
      
      // 查找首页页面实例
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === 'pages/index/index') {
          homePage = pages[i];
          break;
        }
      }
      
      if (homePage) {
        // 根据分类和ID查找帖子
        let postData = [];
        
        // 使用category作为键名访问contentData对象，而不是使用数组索引
        postData = homePage.$vm.contentData[this.category] || [];
        
        // 查找对应ID的帖子
        const post = postData.find(item => item.id.toString() === this.postId);
        
        if (post) {
          // 深拷贝帖子数据
          this.postDetail = JSON.parse(JSON.stringify(post));
          
          // 处理图片数据：如果有单个image字段，转换为images数组
          if (this.postDetail.image && !this.postDetail.images) {
            this.postDetail.images = [this.postDetail.image];
          } else if (!this.postDetail.images) {
            this.postDetail.images = [];
          }
        } else {
          uni.showToast({
            title: '找不到该帖子，显示默认内容',
            icon: 'none'
          });
          // 显示默认内容，确保页面不为空白
          this.postDetail = {
            id: this.postId,
            avatar: '/static/icon/社交媒体1.png',
            name: '用户',
            time: '刚刚',
            desc: '该帖子内容暂时无法显示，可能已被删除或移动',
            image: '',
            images: [],
            comment: 0,
            like: 0,
            liked: false
          };
        }
      } else {
        // 当找不到首页页面实例时，显示模拟数据
        this.postDetail = {
          id: this.postId,
          avatar: '/static/icon/社交媒体1.png',
          name: '示例用户',
          time: '刚刚',
          desc: '这是一个示例帖子内容，当无法获取实际数据时显示',
          image: '',
          images: ['/static/image/轮播图2.JPG', '/static/image/轮播图3.JPG', '/static/image/轮播图4.JPG'],
          comment: 5,
          like: 1,
          liked: false
        };
      }
    },
    
    // 处理点赞
    handleLike() {
      if (!this.postDetail) return;
      
      // 切换点赞状态
      this.postDetail.liked = !this.postDetail.liked;
      this.postDetail.like = this.postDetail.liked ? this.postDetail.like + 1 : Math.max(0, this.postDetail.like - 1);
      
      // 发送全局点赞状态变更事件
      uni.$emit('likeStatusChanged', {
        postId: this.postId,
        likes: this.postDetail.like,
        isLiked: this.postDetail.liked
      });
      
      // 通知首页更新点赞状态
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === 'pages/index/index') {
          const homePage = pages[i];
          // 根据分类找到对应的帖子并更新
          let targetList;
          if (this.category === '最多点击') {
            targetList = homePage.$vm.contentData[0];
          } else if (this.category === '最多评论') {
            targetList = homePage.$vm.contentData[1];
          } else if (this.category === '最多点赞') {
            targetList = homePage.$vm.contentData[2];
          }
          
          if (targetList) {
            const post = targetList.find(item => item.id.toString() === this.postId);
            if (post) {
              post.liked = this.postDetail.liked;
              post.like = this.postDetail.like;
            }
          }
          break;
        }
      }
      
      uni.showToast({
        title: this.postDetail.liked ? '点赞成功' : '取消点赞',
        icon: 'none'
      });
    },
    
    // 初始化评论数据
    initCommentsData() {
      if (!this.postDetail) return;
      
      const postId = this.postId;
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
          const commentCount = this.postDetail.comment || 0;
          
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
            const replyCount = hasReplies ? Math.min(1, commentCount - totalGenerated - 1) : 0; // 每条主评论最多1条回复
            
            const userIndex = Math.floor(Math.random() * mockUsers.length);
            const mainComment = {
              id: `${commentIndex + 1}`,
              user: mockUsers[userIndex],
              avatar: mockAvatars[userIndex],
              content: mockContents[Math.floor(Math.random() * mockContents.length)],
              time: `${this.getRandomTime()}`,
              likeCount: 0,
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
                likeCount: 0
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
      if (content.startsWith('@')) {
        const spaceIndex = content.indexOf(' ');
        if (spaceIndex > 0) {
          content = content.substring(spaceIndex + 1).trim();
        }
      }
      
      // 获取当前时间，保持与首页一致的格式
      const now = new Date();
      const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // 获取当前用户信息
      const userInfo = this.getUserInfo();
      
      // 判断是回复评论还是新评论
      let mainCommentId = null;
      let newComment = null;
      
      if (this.replyTarget) {
        const replyId = `${Date.now()}`;
        newComment = {
          id: replyId,
          user: userInfo.userName,
          avatar: userInfo.avatarUrl,
          toUser: this.replyTarget.user,
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
            mainCommentId = parentComment.id;
          }
        } else {
          // 回复的是主评论
          this.replyTarget.replies.push(newComment);
          mainCommentId = this.replyTarget.id;
        }
        // 重置回复目标
        this.replyTarget = null;
      } else {
        // 添加新评论
        mainCommentId = `${Date.now()}`;
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
        this.comments.push(newComment);
      }
      
      // 更新评论数
      if (this.postDetail) {
        this.postDetail.comment = (this.postDetail.comment || 0) + 1;
      }
      
      // 通知首页更新评论
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === 'pages/index/index') {
          const homePage = pages[i];
          // 更新首页中的评论数
          let targetPost = null;
          // 遍历所有分类找到对应的帖子
          for (let categoryData of homePage.$vm.contentData) {
            targetPost = categoryData.find(item => item.id.toString() === this.postId);
            if (targetPost) break;
          }
          
          if (targetPost) {
            targetPost.comment = this.postDetail.comment;
            
            // 初始化首页的评论数据（如果不存在）
            if (!homePage.$vm.commentsData) {
              homePage.$vm.commentsData = {};
            }
            if (!homePage.$vm.commentsData[this.postId]) {
              homePage.$vm.commentsData[this.postId] = [];
            }
            
            // 如果是新评论，添加到首页的评论列表
            if (!this.replyTarget) {
              homePage.$vm.commentsData[this.postId].push(newComment);
            } else {
              // 如果是回复，找到对应的主评论并添加回复
              const mainComment = homePage.$vm.commentsData[this.postId].find(c => c.id === mainCommentId);
              if (mainComment) {
                if (!mainComment.replies) {
                  mainComment.replies = [];
                }
                mainComment.replies.push(newComment);
              }
            }
          }
          break;
        }
      }
      
      // 清空输入框
      this.commentInput = '';
      
      // 保存评论数据到本地存储，确保跨页面同步
      try {
        // 获取现有的评论数据
        let postComments = uni.getStorageSync('postComments') || {};
        
        const postId = this.postId;
        let targetPostId = postId;
        
        // 检查是否已经存在相似的postId
        for (let storedPostId in postComments) {
          if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
            targetPostId = storedPostId;
            console.log('发现相似的postId，使用已存在的键:', targetPostId);
            break;
          }
        }
        
        // 更新本地存储中的评论数据
        postComments[targetPostId] = this.comments;
        
        // 保存回本地存储
        uni.setStorageSync('postComments', postComments);
        
        // 输出日志，用于调试
        console.log('评论已保存到本地存储:', targetPostId, this.comments.length);
      } catch (error) {
        console.error('保存评论数据到本地存储失败:', error);
      }
      
      // 发送全局评论添加事件
      uni.$emit('commentAdded', {
        postId: this.postId,
        comment: newComment
      });
      
      // 提示成功
      uni.showToast({
        title: '评论成功',
        icon: 'success'
      });
    },
    
    // 预览图片
    previewImage(index) {
      if (this.postDetail && this.postDetail.images && this.postDetail.images.length > 0) {
        uni.previewImage({
          current: index,
          urls: this.postDetail.images.slice(0, 9), // 最多显示9张
          showmenu: true
        });
      }
    },
    
    // 查找子评论对应的父评论
    findParentComment(replyId) {
      for (const comment of this.comments) {
        if (comment.replies && comment.replies.some(reply => reply.id === replyId)) {
          return comment;
        }
      }
      return null;
    },
    
    // 全局数据更新处理
    handlePostDataUpdated(data) {
      if (data && data.postId === this.postId) {
        this.postDetail = { ...this.postDetail, ...data.updatedData };
      }
    },
    
    // 评论添加处理
    handleCommentAdded(data) {
      if (data && data.postId === this.postId) {
        // 重新初始化评论数据以包含新评论
        this.initCommentsData();
        // 更新评论数
        if (this.postDetail) {
          this.postDetail.comment = (this.postDetail.comment || 0) + 1;
        }
      }
    },
    
    // 点赞状态变更处理
    handleLikeStatusChanged(data) {
      if (data && data.postId === this.postId) {
        this.postDetail.like = data.likes;
        this.postDetail.liked = data.isLiked;
      }
    },
    
    // 获取当前用户信息
    getUserInfo() {
      // 默认用户信息
      let userInfo = {
        userName: '我',
        avatarUrl: '/static/icon/我的.png'
      };
      
      try {
        // 优先从全局获取用户信息
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
          const globalUserInfo = app.globalData.userStatus.userInfo;
          userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || '我';
          userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || '/static/icon/我的.png';
        } else {
          // 尝试从本地存储获取
          const storedUserInfo = uni.getStorageSync('userInfo');
          if (storedUserInfo) {
            const parsedUserInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
            userInfo.userName = parsedUserInfo.userName || parsedUserInfo.nickname || '我';
            userInfo.avatarUrl = parsedUserInfo.avatarUrl || parsedUserInfo.avatar_url || '/static/icon/我的.png';
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 出错时使用默认值
      }
      
      return userInfo;
    }
  }
}
</script>

<style scoped>
/* 帖子详情容器 - 白色主题 */
.post-detail-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  color: #000;
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
.header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.back-button {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  width: 88rpx;
}

.post-content {
  flex: 1;
  padding: 120rpx 30rpx 30rpx;
  background-color: #fff;
  margin-bottom: 10rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-meta {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.publish-time {
  font-size: 24rpx;
  color: #999999;
}

.post-desc {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
  word-break: break-all;
}

.post-image {
  width: 100%;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

/* 图片容器样式 */
.image-container {
  margin-bottom: 30rpx;
}

/* 图片行和列布局 */
.image-row {
  display: flex;
  margin-bottom: 10rpx;
  gap: 10rpx;
}

.image-column {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  flex: 1;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.two-columns {
  /* 两列布局 */
}

.three-columns {
  /* 三列布局 */
}

/* 图片包装器 */
.image-wrapper {
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
}

/* 单张图片 */
.image-wrapper.single {
  width: 100%;
  height: auto;
  max-height: 600rpx;
}

.single-image {
  width: 100%;
  height: auto;
  border-radius: 12rpx;
}

/* 两张图片 */
.image-row.two-images .image-wrapper.two {
  flex: 1;
  height: 280rpx;
}

.two-image {
  width: 100%;
  height: 100%;
}

/* 三张图片 */
.image-row.three-images {
  height: 400rpx;
}

.image-wrapper.three.large {
  flex: 2;
  height: 100%;
}

.three-large-image {
  width: 100%;
  height: 100%;
}

.image-wrapper.three {
  flex: 1;
  height: calc(50% - 5rpx);
}

.three-image {
  width: 100%;
  height: 100%;
}

/* 四张图片 */
.image-grid.two-columns .image-wrapper.four {
  width: calc(50% - 5rpx);
  height: 280rpx;
}

.four-image {
  width: 100%;
  height: 100%;
}

/* 五张及以上图片 */
.image-grid.three-columns .image-wrapper.grid {
  width: calc(33.333% - 6.67rpx);
  height: 200rpx;
}

.grid-image {
  width: 100%;
  height: 100%;
}

/* 图片数量超过9张时的覆盖层 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-text {
  color: white;
  font-size: 40rpx;
  font-weight: bold;
}

.interaction-bar {
  display: flex;
  padding-top: 30rpx;
  border-top: 1rpx solid #eee;
  background-color: #fff;
  margin-bottom: 10rpx;
}

.interaction-item {
  display: flex;
  align-items: center;
  margin-right: 60rpx;
  gap: 8rpx;
  font-size: 28rpx;
  color: #666;
}

.interaction-icon {
  width: 40rpx;
  height: 40rpx;
}

.count {
  font-size: 28rpx;
  color: #666;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999999;
}

/* 评论区域样式 */
.comments-section {
  margin-top: 0;
  padding: 20rpx 30rpx 120rpx;
  background-color: #fff;
}

/* 评论标题栏 */
.comments-header {
  display: flex;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 20rpx;
}

.comments-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-right: 30rpx;
}

.likes-count {
  font-size: 28rpx;
  color: #999999;
}

/* 评论列表 */
.comment-list {
  width: 100%;
}

.comment-item {
  display: flex;
  margin-bottom: 30rpx;
  width: 100%;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
  flex-shrink: 0;
}

.comment-main {
  flex: 1;
}

/* 评论元信息 */
.comment-meta {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.comment-user {
  font-size: 28rpx;
  font-weight: 500;
  color: #1677ff;
  margin-right: 15rpx;
}

.comment-time {
  font-size: 24rpx;
  color: #999999;
}

.like-icon, .reply-icon {
  color: #666;
  font-size: 24rpx;
  margin-left: 10rpx;
  cursor: pointer;
}

.like-icon:active {
  opacity: 0.7;
}

.like-icon.liked {
  color: #e74c3c; /* 点赞后的红色 */
}

.reply-icon {
  cursor: pointer;
}

.reply-icon:active {
  color: #333;
}

/* 评论内容 */
.comment-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10rpx;
  word-break: break-all;
}

/* 评论操作按钮 */
.comment-actions {
  display: flex;
  align-items: center;
}

.comment-action {
  font-size: 26rpx;
  color: #999999;
  margin-right: 30rpx;
}

.action-count {
  font-size: 24rpx;
  margin-left: 4rpx;
}

/* 子评论区域 */
.child-comments {
  margin-top: 20rpx;
  padding-left: 75rpx;
}

.child-comment-list {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
}

.child-comments .comment-item {
  margin-bottom: 20rpx;
  display: block;
  padding: 0;
  border-bottom: none;
}

.child-comments .comment-avatar {
  display: none;
}

.child-comments .comment-main {
  width: 100%;
}

.child-comments .comment-content {
  margin-bottom: 6rpx;
}

/* 展开/收起回复 */
.expand-replies {
  margin-top: 15rpx;
  padding-left: 15rpx;
}

.expand-replies text {
  font-size: 26rpx;
  color: #1677ff;
}

.bottom-comment-input {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
}

.comment-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 35rpx;
  padding: 0 40rpx 0 30rpx; /* 增加右侧padding，为删除按钮留出空间 */
  font-size: 28rpx;
  background-color: #f5f5f5;
  color: #333;
}

.comment-input::placeholder {
  color: #999;
}

.comment-submit {
  width: 100rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background-color: #1677ff;
  color: #ffffff;
  border-radius: 35rpx;
  font-size: 28rpx;
  margin-left: 10rpx; /* 减小左边距，让按钮更靠近输入框 */
  padding: 0;
}
</style>