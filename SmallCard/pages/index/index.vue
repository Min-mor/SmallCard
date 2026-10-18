<template>
  <view class="home-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <input type="text" v-model="searchKeyword" placeholder="请输入友链或者ID" 
               class="search-input" @confirm="handleSearch" @input="handleSearch" 
               @focus="searchInputFocus" @blur="searchInputBlur"/>
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</view>
      </view>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </view>
    
    <!-- 搜索结果展示区域 -->
    <view v-if="showSearchResults" class="search-results">
      <view class="search-header">
        <text class="search-title">搜索结果</text>
        <view class="close-btn" @click="closeSearch">
          <text>✕</text>
        </view>
      </view>
      
      <!-- 搜索中状态 -->
      <view v-if="isSearching" class="search-loading">
        正在搜索中...
      </view>
      
      <!-- 搜索结果列表 -->
      <view v-else-if="searchResults.length > 0">
        <view v-for="friend in searchResults" :key="friend.id" class="friend-item" @click="viewFriendDetail(friend)">
          <image :src="friend.avatar || '/static/icon/default-avatar.png'" mode="aspectFill" class="friend-avatar"></image>
          <view class="friend-info">
            <text class="friend-name">{{ friend.name || '未知用户' }}</text>
            <text class="friend-signature">{{ friend.signature || '暂无个性签名' }}</text>
          </view>
          <view class="friend-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>
      
      <!-- 无搜索结果状态 -->
      <view v-else class="no-results">
        未找到相关好友
      </view>
    </view>
    


    <!-- 轮播区域 -->
    <view class="banner">
      <swiper class="swiper" indicator-dots circular autoplay interval="3000">
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <view class="banner-item">
            <image :src="item.image" class="banner-image" mode="aspectFill" @click="handleBannerImageClick(index)"></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 分类标签 -->
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === '最多点击' }" @click="activeTab = '最多点击'">最多点击</view>
      <view class="tab-item" :class="{ active: activeTab === '最多评论' }" @click="activeTab = '最多评论'">最多评论</view>
      <view class="tab-item" :class="{ active: activeTab === '最多点赞' }" @click="activeTab = '最多点赞'">最多点赞</view>
    </view>

    <!-- 内容容器（可滚动+加载更多） -->
    <view 
      class="content-container"
      @scroll="handleScroll"
      :style="{ height: containerHeight + 'px' }"
    >
      <!-- 内容列表 -->
      <view class="content-list">
        <view class="content-item" v-for="item in getContentList" :key="item.id" @click="goToPostDetail(item)">
          <image :src="item.avatar || '/static/icon/我的.png'" class="user-avatar" mode="cover"></image>
          <view class="content-info">
            <text class="user-name">{{ item.name }}</text>
            <text class="publish-time">{{ item.time }}</text>
            <text class="content-desc">{{ item.desc }}</text>
            <!-- 首页图片展示 -->
            <view class="index-image-container" v-if="item.images && item.images.length > 0">
              <!-- 单张图片 -->
              <image v-if="item.images.length === 1" :src="item.images[0]" class="single-index-image" mode="aspectFill"></image>
              <!-- 多张图片（最多显示3张） -->
              <view class="multi-image-container" v-else>
                <image 
                  v-for="(img, index) in item.images.slice(0, 3)" 
                  :key="index" 
                  :src="img" 
                  class="multi-index-image" 
                  mode="aspectFill"
                ></image>
                <!-- 超过3张显示数量 -->
                <view class="image-count-overlay" v-if="item.images.length > 3">
                  <text class="image-count">+{{ item.images.length - 3 }}</text>
                </view>
              </view>
            </view>
            <view class="interaction-bar">
              <view class="interaction-item" v-if="item.comment" @click="handleCommentClick($event, item)">
                <image src="/static/icon/评论.png" class="interaction-icon" mode="aspectFit"></image>
                <text class="count">{{ item.comment }}</text>
              </view>
              <view class="interaction-item" @click="handleLikeClick($event, item)">
                <image :src="item.liked ? '/static/icon/已点赞.png' : '/static/icon/点赞.png'" class="interaction-icon" mode="aspectFit"></image>
                <text class="count">{{ item.like }}</text>
              </view>
            </view>
            
            <!-- 评论区域 -->
            <view class="comments-section" v-if="item.showComments">
              <view class="comment-item" v-for="comment in getComments(item.id)" :key="comment.id">
                <image :src="comment.avatar" class="comment-avatar" mode="cover"></image>
                <view class="comment-content">
                  <text class="comment-user">{{ comment.user }}：</text>
                  <text class="comment-text">{{ comment.content }}</text>
                </view>
                
                <!-- 子评论（回复） -->
                <view class="child-comments" v-if="comment.replies && comment.replies.length > 0">
                  <view class="comment-item child" v-for="reply in comment.replies" :key="reply.id">
                    <image :src="reply.avatar" class="comment-avatar" mode="cover"></image>
                    <view class="comment-content">
                      <text class="comment-user">{{ reply.user }}：</text>
                      <text class="comment-text">{{ reply.content }}</text>
                    </view>
                  </view>
                </view>
              </view>
              
              <!-- 评论输入框 -->
              <view class="comment-input-area">
                <input type="text" v-model="commentInputs[item.id]" placeholder="写下你的评论..." class="comment-input" @confirm="submitComment(item)" />
                <button class="comment-submit" @click="submitComment(item)">发送</button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态提示 -->
      <view class="load-status">
        <text v-if="isLoading">正在加载...</text>
        <text v-else-if="isNoMoreData">到底了~</text>
        <text v-else class="hidden">加载提示</text>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-buttons" v-if="isLoggedIn">
        <view class="nav-item publish-btn" @click="goToPublish">
          <text class="nav-text">发布</text>
        </view>
        <view class="nav-item message-btn" @click="goToMessage">
          <text class="nav-text">消息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
      return {
        // 轮播图数据
        bannerList: [
          { image: '/static/image/月度报告.png' },
          { image: '/static/image/轮播图2.JPG' },
          { image: '/static/image/轮播图3.JPG' },
          { image: '/static/image/轮播图4.JPG' }
        ],
        // 登录状态
        isLoggedIn: false,
        // 用户信息
        userInfo: {
          userName: '我',
          avatarUrl: '/static/icon/我的.png'
        },
        // 搜索相关数据
        searchKeyword: '',
        searchResults: [],
        showSearchResults: false,
        isSearching: false,
        // 防抖定时器
        searchTimer: null,
        // 分类标签状态
        activeTab: '最多点击',
        // 内容数据 - 按分类存储
        contentData: {
          // 最多点击
          '最多点击': [
            { 
              id: 1,
              avatar: '/static/photo/S..png',
              name: 'S.',
              time: '04-16 15:06',
              desc: '人工智能将极大的改变未来',
              image: '/static/image/S.png',
              images: ['/static/image/S.png'],
              comment: 3,
              like: 6,
              liked: false,
              showComments: false
            },
            { 
              id: 2,
              avatar: '/static/icon/社交媒体1.png',
              name: 'L.',
              time: '04-15 10:30',
              desc: '前端开发的未来趋势分析',
              comment: 5,
              like: 12,
              liked: false,
              showComments: false
            },
            { 
              id: 3,
              avatar: '/static/icon/社交媒体2.png',
              name: 'M.',
              time: '04-14 09:15',
              desc: '如何高效学习编程？',
              comment: 28,
              like: 15,
              liked: false,
              showComments: false
            }
          ],
          // 最多评论
          '最多评论': [
          { 
            id: 4,
            avatar: '/static/icon/社交媒体3.png',
            name: 'K.',
            time: '04-13 16:40',
            desc: '产品经理 vs 程序员，谁更重要？',
            comment: 35,
            like: 20,
            liked: false,
            showComments: false
          },
          { 
            id: 5,
            avatar: '/static/icon/社交媒体4.png',
            name: 'Z.',
            time: '04-12 14:20',
            desc: '最美的10个编程瞬间',
            image: '/static/icon/社交媒体3.png',
            images: ['/static/image/轮播图2.JPG', '/static/image/轮播图3.JPG', '/static/image/轮播图4.JPG'],
            comment: 18,
            like: 56,
            liked: false,
            showComments: false
          }
        ],
        // 最多点赞
        '最多点赞': [
          { 
            id: 6,
            avatar: '/static/icon/社交媒体5.png',
            name: 'H.',
            time: '04-11 08:50',
            desc: '程序员的自我修养',
            comment: 8,
            like: 42,
            liked: false,
            showComments: false
          },
          { 
            id: 7,
            avatar: '/static/photo/S..png',
            name: 'S.',
            time: '04-10 11:20',
            desc: '技术团队协作的10个最佳实践',
            comment: 12,
            like: 78,
            liked: false,
            showComments: false
          }
        ]
      },
      // 评论数据
      commentsData: {},
      // 评论输入框数据
      commentInputs: {},
      // 回复目标
      replyTarget: null,
      // 加载状态管理
      isLoading: false,       // 是否正在加载
      isNoMoreData: false,    // 是否无更多数据
      containerHeight: 0,     // 内容容器高度（用于滚动）
      pageNum: 1,             // 当前页码
      pageSize: 2             // 每页加载数量
    }
  },
  computed: {
    // 根据当前选中的标签返回对应的数据
    getContentList() {
      if (this.activeTab === '最多点击') {
        return this.contentData['最多点击'];
      } else if (this.activeTab === '最多评论') {
        return this.contentData['最多评论'];
      } else if (this.activeTab === '最多点赞') {
        // 对最多点赞的数据按点赞数从高到低排序
        return [...this.contentData['最多点赞']].sort((a, b) => b.like - a.like);
      }
      return [];
    },
    // 计算tabBar高度（用于内容容器高度计算）
    tabBarHeight() {
      return 80; // tabBar高度，单位rpx
    }
  },
  watch: {
    // 监听标签切换，重新计算内容容器高度
    activeTab() {
      this.$nextTick(() => {
        this.updateContainerHeight();
      });
    }
  },
  onLoad() {
    // 检查登录状态
    const app = getApp();
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.getUserInfo();
  },
  onShow() {
    // 每次显示页面都重新检查登录状态
    const app = getApp();
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.getUserInfo();
  },
  mounted() {
    // 初始化内容容器高度（适配不同设备屏幕）
    this.updateContainerHeight();
  },
  onUnload() {
    // 清除定时器，避免内存泄漏
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  },
  methods: {
      // 获取当前用户信息
      getUserInfo() {
      try {
        // 优先从全局获取用户信息
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
          const globalUserInfo = app.globalData.userStatus.userInfo;
          this.userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || '我';
          this.userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || '/static/icon/我的.png';
        } else {
          // 尝试从本地存储获取
          const storedUserInfo = uni.getStorageSync('userInfo');
          if (storedUserInfo) {
            const parsedUserInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
            this.userInfo.userName = parsedUserInfo.userName || parsedUserInfo.nickname || '我';
            this.userInfo.avatarUrl = parsedUserInfo.avatarUrl || parsedUserInfo.avatar_url || '/static/icon/我的.png';
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 出错时保持默认值
      }
    },
    
    // 更新内容容器高度
    updateContainerHeight() {
       const windowInfo = uni.getWindowInfo();
       // 计算固定区域高度（rpx转px：1rpx ≈ 0.5px）
       const bottomNavHeight = 100 / 2;    // 底部导航高度
       const searchBarHeight = 70 / 2;     // 搜索栏高度
       const bannerHeight = 300 / 2;       // 轮播图高度
       const tabBarHeight = this.tabBarHeight / 2; // tabBar高度
       const tabBarMarginTop = 20 / 2;     // tabBar顶部边距
       const padding = 40 / 2;             // 页面内边距
       
       // 内容容器高度 = 屏幕高度 - 所有固定区域高度
       this.containerHeight = windowInfo.windowHeight 
         - bottomNavHeight 
         - searchBarHeight 
         - bannerHeight 
         - tabBarHeight 
         - tabBarMarginTop
         - padding;
     },
    // 处理评论点击事件
    handleCommentClick(e, item) {
      // 阻止事件冒泡到父级的goToPostDetail方法
      e.stopPropagation();
      // 调用showComments方法显示/隐藏评论区
      this.showComments(item);
    },
    
    // 处理点赞点击事件
    handleLikeClick(e, item) {
      // 阻止事件冒泡到父级的goToPostDetail方法
      e.stopPropagation();
      // 调用handleLike方法处理点赞逻辑
      this.handleLike(item);
    },
    
    // 点赞功能
    handleLike(item) {
      // 切换点赞状态
      item.liked = !item.liked;
      item.like = item.liked ? item.like + 1 : Math.max(0, item.like - 1);
      
      // 调用全局方法记录点赞行为
      const app = getApp();
      app.recordPostLike(item.id, item.liked);
      
      // 通知所有已打开的帖子详情页更新点赞状态
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === 'pages/index/post-detail') {
          const detailPage = pages[i];
          if (detailPage.$vm.postId === item.id.toString()) {
            detailPage.$vm.postDetail.liked = item.liked;
            detailPage.$vm.postDetail.like = item.like;
            break;
          }
        }
      }
      
      uni.showToast({
        title: item.liked ? '点赞成功' : '取消点赞',
        icon: 'none'
      });
    },

    // 滚动监听：判断是否触底
    handleScroll(e) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      // 触底条件：滚动距离 + 可视高度 ≥ 总高度 - 50px（缓冲区域）
      // 同时需满足：不在加载中 + 有更多数据
      if (scrollTop + clientHeight >= scrollHeight - 50 
          && !this.isLoading 
          && !this.isNoMoreData) {
        this.loadMoreData();
      }
    },

    // 加载更多数据
    loadMoreData() {
      // 标记为加载中，防止重复请求
      this.isLoading = true;

      // 模拟接口请求延迟（实际项目替换为uni.request）
      setTimeout(() => {
        // 获取当前选中标签对应的数据列表
        const tabKey = this.activeTab === '最多点击' ? '最多点击' : 
                      this.activeTab === '最多评论' ? '最多评论' : '最多点赞';
        const currentList = [...this.contentData[tabKey]];
        
        // 获取当前标签下的最大ID
        const maxId = Math.max(...currentList.map(item => item.id)); 

        // 生成模拟新数据
        const newData = this.generateMockData(maxId);

        // 更新当前标签页数据
        if (newData.length > 0) {
          this.contentData[tabKey] = [...currentList, ...newData];
          this.pageNum += 1; // 页码+1
        } else {
          // 无新数据时标记为到底了
          this.isNoMoreData = true;
        }

        // 结束加载状态
        this.isLoading = false;
      }, 1500); // 模拟1.5秒加载时间
    },

    // 处理轮播图图片点击事件
    handleBannerImageClick(index) {
      // 获取全局登录状态
      const app = getApp();
      
      if (index === 0) {
        // 第一个轮播图是月度报告，检查是否有访问权限
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
          // 正式登录用户可以访问月度报告
          uni.navigateTo({
            url: '/pages/monthly-report/index'
          });
        } else {
          // 游客显示提示
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
        }
      } else {
        // 其他轮播图实现图片预览功能
        const urls = this.bannerList.filter((_, i) => i > 0).map(item => item.image);
        const currentIndex = index - 1; // 减去第一个月度报告轮播图
        
        uni.previewImage({
          current: currentIndex, // 当前预览图片在urls数组中的索引
          urls: urls, // 需要预览的图片链接列表
          showmenu: true // 显示图片操作菜单
        });
      }
    },
    
    // 跳转到帖子详情页
    goToPostDetail(item) {
      // 记录帖子浏览并跳转到详情页
      try {
        // 记录浏览
        const app = getApp();
        app.recordPostView(item.id);
        
        // 跳转到帖子详情页，传递帖子ID和当前分类
        uni.navigateTo({
          url: `/pages/index/post-detail?id=${item.id}&category=${encodeURIComponent(this.activeTab)}`,
          fail: () => {
            // 如果跳转失败，可能是页面不存在，给用户提示
            uni.showToast({
              title: '帖子详情功能暂未开放',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('跳转到帖子详情页失败:', error);
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    },
    
    // 跳转到个人主页
    goToHome() {
      // 检查登录状态，游客不允许跳转到个人主页
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
        uni.switchTab({
          url: '/pages/home/index'
        });
      } else {
        // 显示带选项的模态框
        uni.showModal({
          title: '请先登录',
          content: '登录后可使用更多功能',
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
      }
    },
    
    // 跳转到发布页面
    goToPublish() {
      // 检查登录状态，游客不允许发布
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
        uni.navigateTo({
          url: '/pages/social/publish'
        });
      } else {
        // 显示带选项的模态框
        uni.showModal({
          title: '请先登录',
          content: '登录后可发布内容',
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
      }
    },
    
    // 跳转到消息页面
    goToMessage() {
      // 检查登录状态，游客不允许访问消息页面
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
        // 修改首页消息页面路径，与社交页面区分开
        uni.navigateTo({
          url: '/pages/home-message/index',
          fail: () => {
            uni.showToast({
              title: '首页消息功能暂未开放',
              icon: 'none'
            });
          }
        });
      } else {
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
      }
    },
    
    // 获取随机时间
      getRandomTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        return `${month}-${day} ${hour}:${minute}`;
      },
      
      // 获取随机用户名
      getRandomName() {
        const names = ['张三', '李四', '王五', '赵六', '陈七', '林一', '刘八', '涂二', 'S.', 'L.'];
        return names[Math.floor(Math.random() * names.length)];
      },
      
      // 生成模拟数据
    generateMockData(startId) {
      // 模拟：最多加载3页数据，之后返回空数据
      if (this.pageNum >= 3) {
        return [];
      }

      // 模拟文案
      const mockDesc = [
        'AI技术最新进展：大模型的突破与应用',
        '如何提升APP用户点击转化率？3个实用技巧',
        '用户行为分析：如何通过数据优化产品体验',
        '程序员需要懂产品设计吗？来聊聊你的看法',
        '职场中，沟通能力和技术能力哪个更重要？',
        '分享一次让你印象深刻的项目踩坑经历',
        '程序员必备的5个效率工具，第3个很少人知道',
        '坚持学习编程的3个小技巧，亲测有效',
        '分享一组超好看的技术主题壁纸'
      ];

      // 随机生成用户头像和内容图片
      const avatarIcons = ['社交媒体1.png', '社交媒体2.png', '社交媒体3.png', '社交媒体4.png', '社交媒体5.png', '社交媒体1.png'];
      const randomAvatar = `/static/icon/${avatarIcons[Math.floor(Math.random() * avatarIcons.length)]}`;
      const randomImage = Math.random() > 0.3 ? '/static/icon/社交媒体5.png' : '/static/icon/社交媒体1.png';

      // 生成新数据列表
      return Array.from({ length: this.pageSize }, (_, i) => {
        // 随机决定是否有图片及图片数量（最多9张）
        const hasImage = Math.random() > 0.3;
        let imageUrl = '';
        let imagesList = [];
        
        if (hasImage) {
          const imageCount = Math.floor(Math.random() * 9) + 1; // 1-9张图片
          imageUrl = randomImage; // 保留单张图片的兼容性
          
          // 生成图片列表
          imagesList = [];
          const possibleImages = [
            '/static/image/轮播图2.JPG', 
            '/static/image/轮播图3.JPG', 
            '/static/image/轮播图4.JPG',
            '/static/icon/社交媒体1.png',
            '/static/icon/社交媒体2.png',
            '/static/icon/社交媒体3.png',
            '/static/icon/社交媒体4.png',
            '/static/icon/社交媒体5.png',
            '/static/image/S.png'
          ];
          
          for (let j = 0; j < imageCount; j++) {
            const imgIndex = Math.floor(Math.random() * possibleImages.length);
            imagesList.push(possibleImages[imgIndex]);
          }
        }
        
        return {
          id: startId + i + 1,
          avatar: randomAvatar,
          name: String.fromCharCode(65 + Math.floor(Math.random() * 26)), // 随机字母用户名
          time: `04-${Math.floor(Math.random() * 10) + 10} ${Math.floor(Math.random() * 12) + 10}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
          desc: mockDesc[Math.floor(Math.random() * mockDesc.length)],
          image: imageUrl,
          images: imagesList,
          comment: Math.floor(Math.random() * 50),
          like: Math.floor(Math.random() * 100),
          liked: false,
          showComments: false
        };
      });
    },
    
    // 显示/隐藏评论区
    showComments(item) {
      item.showComments = !item.showComments;
      if (item.showComments && !this.commentsData[item.id]) {
        // 初始化评论数据
        this.initCommentsData(item.id);
      }
    },
    
    // 获取帖子的评论
    getComments(postId) {
      return this.commentsData[postId] || [];
    },
    
    // 初始化评论数据
    initCommentsData(postId) {
      // 模拟评论数据
      const mockUsers = ['张三', '李四', '王五', '赵六', '陈七'];
      const mockAvatars = ['/static/photo/张三.jpg', '/static/photo/李四.jpg', '/static/photo/王五.jpg', '/static/photo/赵六.jpg', '/static/photo/陈七.jpg'];
      const mockComments = [
        '写代码时的灵感进发really美妙！',
        '赞同，特别是解决bug那一刻',
        '确实很有启发',
        '同感，学习了',
        '这个想法太棒了',
        '很实用的建议',
        '感谢分享'
      ];
      
      // 查找对应的帖子，获取评论数
      let postCommentCount = 0;
      // 遍历所有分类的数据
      for (let categoryKey in this.contentData) {
        const categoryData = this.contentData[categoryKey];
        // 确保categoryData是数组再调用find方法
        if (Array.isArray(categoryData)) {
          const post = categoryData.find(item => item.id.toString() === postId.toString());
          if (post) {
            postCommentCount = post.comment || 0;
            break;
          }
        }
      }
      
      const comments = [];
      
      // 如果评论数为0，则返回空数组
      if (postCommentCount === 0) {
        this.$set(this.commentsData, postId, comments);
        return;
      }
      
      // 生成评论数据，确保评论总数与帖子显示的评论数一致
      let totalGenerated = 0;
      let commentIndex = 0;
      
      while (totalGenerated < postCommentCount) {
        // 创建主评论
        const hasReplies = commentIndex > 0 && totalGenerated < postCommentCount - 1 && Math.random() > 0.5;
        const replyCount = hasReplies ? Math.min(1, postCommentCount - totalGenerated - 1) : 0; // 每条主评论最多1条回复
        
        const userIndex = Math.floor(Math.random() * mockUsers.length);
        const mainComment = {
          id: `${postId}_comment_${commentIndex}`,
          user: mockUsers[userIndex],
          avatar: mockAvatars[userIndex],
          content: mockComments[Math.floor(Math.random() * mockComments.length)],
          replies: []
        };
        
        // 添加回复
        if (replyCount > 0) {
          const replyUserIndex = (userIndex + 1) % mockUsers.length;
          mainComment.replies.push({
            id: `${postId}_reply_${commentIndex}`,
            user: mockUsers[replyUserIndex],
            avatar: mockAvatars[replyUserIndex],
            toUser: mainComment.user,
            content: mockComments[Math.floor(Math.random() * mockComments.length)]
          });
          totalGenerated += replyCount;
        }
        
        comments.push(mainComment);
        totalGenerated++;
        commentIndex++;
      }
      
      this.$set(this.commentsData, postId, comments);
    },
    
    // 回复评论
    replyToComment(postItem, comment) {
      this.replyTarget = {
        postId: postItem.id,
        commentId: comment.id,
        userName: comment.user
      };
      // 聚焦到输入框
      setTimeout(() => {
        const input = document.querySelector(`input[placeholder="写下你的评论..."]`);
        if (input) input.focus();
      }, 100);
    },
    
    // 提交评论
      submitComment(postItem) {
        const content = this.commentInputs[postItem.id]?.trim();
        if (!content) {
          uni.showToast({
            title: '评论内容不能为空',
            icon: 'none'
          });
          return;
        }
        
        // 获取当前时间
        const now = new Date();
        const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // 检查是否是回复
        let newComment = null;
        const isReply = this.replyTarget && this.replyTarget.postId === postItem.id;
        
        if (isReply) {
          // 是回复，添加到对应评论的replies数组
          const comment = this.commentsData[postItem.id].find(c => c.id === this.replyTarget.commentId);
          if (comment) {
            if (!comment.replies) {
              comment.replies = [];
            }
            
            newComment = {
              id: `${postItem.id}_reply_${Date.now()}`,
              user: this.userInfo.userName,
              avatar: this.userInfo.avatarUrl,
              toUser: this.replyTarget.userName,
              content: content,
              time: timeStr,
              likeCount: 0,
              liked: false
            };
            
            comment.replies.push(newComment);
          }
          this.replyTarget = null;
        } else {
          // 是新评论，添加到评论列表
          if (!this.commentsData[postItem.id]) {
            this.commentsData[postItem.id] = [];
          }
          
          newComment = {
            id: `${postItem.id}_comment_${Date.now()}`,
            user: this.userInfo.userName,
            avatar: this.userInfo.avatarUrl,
            content: content,
            time: timeStr,
            likeCount: 0,
            liked: false,
            showAllReplies: false,
            replies: []
          };
          
          this.commentsData[postItem.id].push(newComment);
        }
        
        // 更新评论数
        postItem.comment += 1;
        
        // 清空输入框
        this.commentInputs[postItem.id] = '';
        
        // 通知所有已打开的帖子详情页更新评论
        const pages = getCurrentPages();
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].route === 'pages/index/post-detail') {
            const detailPage = pages[i];
            if (detailPage.$vm.postId === postItem.id.toString()) {
              if (isReply) {
                // 如果是回复，需要找到对应的主评论并添加回复
                const mainComment = detailPage.$vm.comments.find(c => c.id === this.replyTarget?.commentId);
                if (mainComment) {
                  if (!mainComment.replies) {
                    mainComment.replies = [];
                  }
                  mainComment.replies.push(newComment);
                }
              } else {
                // 如果是新评论，直接添加到评论列表
                detailPage.$vm.comments.push(newComment);
              }
              // 更新帖子详情页的评论数
              detailPage.$vm.postDetail.comment = postItem.comment;
              break;
            }
          }
        }
        
        uni.showToast({
          title: '评论成功',
          icon: 'success'
        });
      },
      
      // 处理搜索（添加防抖）
      handleSearch() {
        // 清除之前的定时器
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
        
        // 防抖处理
        this.searchTimer = setTimeout(() => {
          this.performSearch();
        }, 300);
      },
      
      // 执行搜索
      performSearch() {
        const keyword = this.searchKeyword.trim();
        
        if (!keyword) {
          this.showSearchResults = false;
          this.searchResults = [];
          return;
        }
        
        this.isSearching = true;
        this.showSearchResults = true;
        
        try {
          // 从本地存储获取好友数据
          const collectedCards = uni.getStorageSync('collectedCards') || [];
          const mutualFriends = uni.getStorageSync('mutualFriends') || [];
          const followers = uni.getStorageSync('followers') || [];
          
          // 合并所有好友数据，去重
          const allFriends = [...new Map([...collectedCards, ...mutualFriends, ...followers]
            .map(friend => [friend.id, friend])).values()];
          
          // 执行搜索（支持按名称、ID和个性签名搜索）
          const searchKeyword = keyword.toLowerCase();
          this.searchResults = allFriends.filter(friend => {
            const name = (friend.name || '').toLowerCase();
            const id = (friend.id || '').toLowerCase();
            const signature = (friend.signature || '').toLowerCase();
            
            return name.includes(searchKeyword) || 
                   id.includes(searchKeyword) ||
                   signature.includes(searchKeyword);
          });
          
          // 按相关性排序（精确匹配优先）
          this.sortSearchResults(searchKeyword);
        } catch (error) {
          console.error('搜索好友失败:', error);
          uni.showToast({
            title: '搜索失败，请重试',
            icon: 'none'
          });
        } finally {
          this.isSearching = false;
        }
      },
      
      // 排序搜索结果
      sortSearchResults(keyword) {
        this.searchResults.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          const idA = (a.id || '').toLowerCase();
          const idB = (b.id || '').toLowerCase();
          
          // 精确匹配优先
          if (nameA === keyword && nameB !== keyword) return -1;
          if (nameA !== keyword && nameB === keyword) return 1;
          if (idA === keyword && idB !== keyword) return -1;
          if (idA !== keyword && idB === keyword) return 1;
          
          // 前缀匹配优先
          if (nameA.startsWith(keyword) && !nameB.startsWith(keyword)) return -1;
          if (!nameA.startsWith(keyword) && nameB.startsWith(keyword)) return 1;
          if (idA.startsWith(keyword) && !idB.startsWith(keyword)) return -1;
          if (!idA.startsWith(keyword) && idB.startsWith(keyword)) return 1;
          
          // 按名称字母顺序
          return nameA.localeCompare(nameB);
        });
      },
      
      // 清空搜索内容
      clearSearch() {
        this.searchKeyword = '';
        this.showSearchResults = false;
        this.searchResults = [];
        
        // 清除定时器
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
      },
      
      // 关闭搜索结果
      closeSearch() {
        this.showSearchResults = false;
        this.searchResults = [];
        
        // 清除定时器
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
      },
      
      // 查看好友详情
      viewFriendDetail(friend) {
        // 导航到好友详情页
        uni.navigateTo({
          url: `/pages/card-detail/card-detail?id=${friend.id}&name=${encodeURIComponent(friend.name)}`,
          fail: () => {
            uni.showToast({
              title: '查看详情失败',
              icon: 'none'
            });
          }
        });
      }
      

  }
}
</script>

<style scoped>
/* 页面基础样式 */
.home-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 120rpx; /* 预留底部导航空间 */
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

/* 搜索输入框容器 */
.search-input-wrapper {
  flex: 1;
  position: relative;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  margin-right: 10rpx;
}

/* 搜索结果样式 */
.search-results {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.search-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn text {
  font-size: 48rpx;
  color: #999;
}

.search-loading {
  padding: 60rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.friend-info {
  flex: 1;
  overflow: hidden;
}

.friend-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-signature {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-arrow {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  width: 36rpx;
  height: 36rpx;
  color: #999;
}

.no-results {
  padding: 80rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.search-input {
  width: 100%;
  height: 70rpx;
  font-size: 28rpx;
  padding: 0 20rpx 0 20rpx;
  background: transparent;
  border: none;
  outline: none;
}

/* 清空按钮 */
.clear-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #ccc;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  transition: all 0.2s;
}

.clear-btn:active {
  background-color: #999;
}
.search-btn {
  width: 120rpx;
  height: 50rpx;
  line-height: 50rpx;
  font-size: 28rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 25rpx;
  transition: background-color 0.2s;
}

.search-btn:active {
  background-color: #0056b3;
}

/* 轮播区域 */
.banner {
  width: 100%;
  height: 300rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}
.swiper {
  width: 100%;
  height: 100%;
}
.banner-item {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 分类标签 */
    .tab-bar {
      display: flex;
      background-color: #fff;
      border-radius: 16rpx;
      margin-top: 20rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
    }
    .tab-item {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      font-size: 28rpx;
      position: relative;
      cursor: pointer;
    }
    .tab-item.active {
      color: #2699fb;
      font-weight: bold;
    }
    .tab-item.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background-color: #2699fb;
      border-radius: 3rpx;
    }
    
    /* 内容容器（可滚动） */
    .content-container {
  overflow-y: auto; /* 允许纵向滚动 */
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

/* 内容列表 */
.content-list {
  margin-bottom: 30rpx;
}
.content-item {
  display: flex;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.content-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 评论区域样式 */
.comments-section {
  margin-top: 15rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 10rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
}

.comment-item.child {
  margin-left: 60rpx;
  background-color: #f9f9f9;
  padding: 10rpx;
  border-radius: 10rpx;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
  flex-shrink: 0;
  background-color: #eee;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.comment-user {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-right: 5rpx;
  flex-shrink: 0;
}

.comment-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  flex: 1;
  word-break: break-all;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
  margin-right: 20rpx;
  margin-top: 10rpx;
  display: block;
  width: 100%;
}

.comment-action {
  display: inline-block;
  margin-top: 10rpx;
}

.reply-text {
  font-size: 24rpx;
  color: #1989fa;
}

.child-comments {
  margin-left: 75rpx;
  margin-top: 10rpx;
}

/* 评论输入框样式 */
.comment-input-area {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.comment-input {
  flex: 1;
  height: 60rpx;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  padding: 0 30rpx 0 20rpx; /* 增加右侧padding，为删除按钮留出空间 */
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.comment-submit {
  margin-left: 10rpx; /* 减小左边距，让按钮更靠近输入框 */
  height: 60rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  line-height: 60rpx;
  background-color: #2699fb;
  color: #fff;
  border: none;
  border-radius: 30rpx;
}
.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.content-info {
  flex: 1;
}
.user-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 10rpx;
}
.publish-time {
  font-size: 24rpx;
  color: #999;
}
.content-desc {
  display: block;
  font-size: 28rpx;
  margin: 10rpx 0;
  line-height: 1.6;
}
.content-image {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

/* 首页图片容器 */
.index-image-container {
  margin: 20rpx 0;
}

/* 首页单张图片 */
.single-index-image {
  width: 100%;
  height: 300rpx;
  border-radius: 20rpx;
}

/* 首页多张图片 */
.multi-image-container {
  display: flex;
  gap: 10rpx;
  position: relative;
}

.multi-index-image {
  width: calc(33.333% - 6.67rpx);
  height: 200rpx;
  border-radius: 12rpx;
}

/* 首页图片数量覆盖层 */
.image-count-overlay {
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}
.interaction-bar {
  display: flex;
  justify-content: flex-end;
  gap: 30rpx;
  margin-top: 10rpx;
}
.interaction-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  cursor: pointer;
}
.iconfont {
  margin-right: 6rpx;
}
.iconfont.active {
  color: #ff4d4f; /* 点赞后变红 */
}
.interaction-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 6rpx;
  transition: all 0.3s ease;
  position: relative;
}
/* 移除点赞的active状态样式，只使用提供的图标 */
.count {
  /* 统计数字样式 */
}

/* 加载状态提示 */
.load-status {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}
.hidden {
  display: none;
}

/* 底部导航栏 */
.bottom-nav {
    position: fixed;
    bottom: 160rpx;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    padding: 10rpx 20rpx;
    border-radius: 25rpx;
    z-index: 100;
}

  .nav-buttons {
    display: flex;
    gap: 20rpx;
    align-items: center;
  }
  
  .publish-btn {
    background-color: #1890ff;
    color: white;
    padding: 10rpx 40rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
    font-weight: bold;
  }
  
  .message-btn {
    background-color: transparent;
    color: #1890ff;
    border: 2rpx solid #1890ff;
    padding: 10rpx 40rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
  }
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

  .publish-btn .nav-text {
    color: white;
  }
  
  .message-btn .nav-text {
    color: #1890ff;
  }
.nav-item .iconfont {
  font-size: 40rpx;
  margin-bottom: 6rpx;
  margin-right: 0;
}
.nav-item .game-icon {
  font-size: 28rpx;
  background-color: #2699fb;
  color: #fff;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}
.nav-item.active {
  color: #2699fb;
}
</style>