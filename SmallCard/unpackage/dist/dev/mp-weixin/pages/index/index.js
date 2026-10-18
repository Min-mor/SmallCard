"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 轮播图数据
      bannerList: [
        { image: "/static/image/月度报告.png" },
        { image: "/static/image/轮播图2.JPG" },
        { image: "/static/image/轮播图3.JPG" },
        { image: "/static/image/轮播图4.JPG" }
      ],
      // 登录状态
      isLoggedIn: false,
      // 用户信息
      userInfo: {
        userName: "我",
        avatarUrl: "/static/icon/我的.png"
      },
      // 搜索相关数据
      searchKeyword: "",
      searchResults: [],
      showSearchResults: false,
      isSearching: false,
      // 防抖定时器
      searchTimer: null,
      // 分类标签状态
      activeTab: "最多点击",
      // 内容数据 - 按分类存储
      contentData: {
        // 最多点击
        "最多点击": [
          {
            id: 1,
            avatar: "/static/photo/S..png",
            name: "S.",
            time: "04-16 15:06",
            desc: "人工智能将极大的改变未来",
            image: "/static/image/S.png",
            images: ["/static/image/S.png"],
            comment: 3,
            like: 6,
            liked: false,
            showComments: false
          },
          {
            id: 2,
            avatar: "/static/icon/社交媒体1.png",
            name: "L.",
            time: "04-15 10:30",
            desc: "前端开发的未来趋势分析",
            comment: 5,
            like: 12,
            liked: false,
            showComments: false
          },
          {
            id: 3,
            avatar: "/static/icon/社交媒体2.png",
            name: "M.",
            time: "04-14 09:15",
            desc: "如何高效学习编程？",
            comment: 28,
            like: 15,
            liked: false,
            showComments: false
          }
        ],
        // 最多评论
        "最多评论": [
          {
            id: 4,
            avatar: "/static/icon/社交媒体3.png",
            name: "K.",
            time: "04-13 16:40",
            desc: "产品经理 vs 程序员，谁更重要？",
            comment: 35,
            like: 20,
            liked: false,
            showComments: false
          },
          {
            id: 5,
            avatar: "/static/icon/社交媒体4.png",
            name: "Z.",
            time: "04-12 14:20",
            desc: "最美的10个编程瞬间",
            image: "/static/icon/社交媒体3.png",
            images: ["/static/image/轮播图2.JPG", "/static/image/轮播图3.JPG", "/static/image/轮播图4.JPG"],
            comment: 18,
            like: 56,
            liked: false,
            showComments: false
          }
        ],
        // 最多点赞
        "最多点赞": [
          {
            id: 6,
            avatar: "/static/icon/社交媒体5.png",
            name: "H.",
            time: "04-11 08:50",
            desc: "程序员的自我修养",
            comment: 8,
            like: 42,
            liked: false,
            showComments: false
          },
          {
            id: 7,
            avatar: "/static/photo/S..png",
            name: "S.",
            time: "04-10 11:20",
            desc: "技术团队协作的10个最佳实践",
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
      isLoading: false,
      // 是否正在加载
      isNoMoreData: false,
      // 是否无更多数据
      containerHeight: 0,
      // 内容容器高度（用于滚动）
      pageNum: 1,
      // 当前页码
      pageSize: 2
      // 每页加载数量
    };
  },
  computed: {
    // 根据当前选中的标签返回对应的数据
    getContentList() {
      if (this.activeTab === "最多点击") {
        return this.contentData["最多点击"];
      } else if (this.activeTab === "最多评论") {
        return this.contentData["最多评论"];
      } else if (this.activeTab === "最多点赞") {
        return [...this.contentData["最多点赞"]].sort((a, b) => b.like - a.like);
      }
      return [];
    },
    // 计算tabBar高度（用于内容容器高度计算）
    tabBarHeight() {
      return 80;
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
    const app = getApp();
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.getUserInfo();
  },
  onShow() {
    const app = getApp();
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.getUserInfo();
  },
  mounted() {
    this.updateContainerHeight();
  },
  onUnload() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  },
  methods: {
    // 获取当前用户信息
    getUserInfo() {
      try {
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
          const globalUserInfo = app.globalData.userStatus.userInfo;
          this.userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || "我";
          this.userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || "/static/icon/我的.png";
        } else {
          const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
          if (storedUserInfo) {
            const parsedUserInfo = typeof storedUserInfo === "string" ? JSON.parse(storedUserInfo) : storedUserInfo;
            this.userInfo.userName = parsedUserInfo.userName || parsedUserInfo.nickname || "我";
            this.userInfo.avatarUrl = parsedUserInfo.avatarUrl || parsedUserInfo.avatar_url || "/static/icon/我的.png";
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:367", "获取用户信息失败:", error);
      }
    },
    // 更新内容容器高度
    updateContainerHeight() {
      const windowInfo = common_vendor.index.getWindowInfo();
      const bottomNavHeight = 100 / 2;
      const searchBarHeight = 70 / 2;
      const bannerHeight = 300 / 2;
      const tabBarHeight = this.tabBarHeight / 2;
      const tabBarMarginTop = 20 / 2;
      const padding = 40 / 2;
      this.containerHeight = windowInfo.windowHeight - bottomNavHeight - searchBarHeight - bannerHeight - tabBarHeight - tabBarMarginTop - padding;
    },
    // 处理评论点击事件
    handleCommentClick(e, item) {
      e.stopPropagation();
      this.showComments(item);
    },
    // 处理点赞点击事件
    handleLikeClick(e, item) {
      e.stopPropagation();
      this.handleLike(item);
    },
    // 点赞功能
    handleLike(item) {
      item.liked = !item.liked;
      item.like = item.liked ? item.like + 1 : Math.max(0, item.like - 1);
      const app = getApp();
      app.recordPostLike(item.id, item.liked);
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === "pages/index/post-detail") {
          const detailPage = pages[i];
          if (detailPage.$vm.postId === item.id.toString()) {
            detailPage.$vm.postDetail.liked = item.liked;
            detailPage.$vm.postDetail.like = item.like;
            break;
          }
        }
      }
      common_vendor.index.showToast({
        title: item.liked ? "点赞成功" : "取消点赞",
        icon: "none"
      });
    },
    // 滚动监听：判断是否触底
    handleScroll(e) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !this.isLoading && !this.isNoMoreData) {
        this.loadMoreData();
      }
    },
    // 加载更多数据
    loadMoreData() {
      this.isLoading = true;
      setTimeout(() => {
        const tabKey = this.activeTab === "最多点击" ? "最多点击" : this.activeTab === "最多评论" ? "最多评论" : "最多点赞";
        const currentList = [...this.contentData[tabKey]];
        const maxId = Math.max(...currentList.map((item) => item.id));
        const newData = this.generateMockData(maxId);
        if (newData.length > 0) {
          this.contentData[tabKey] = [...currentList, ...newData];
          this.pageNum += 1;
        } else {
          this.isNoMoreData = true;
        }
        this.isLoading = false;
      }, 1500);
    },
    // 处理轮播图图片点击事件
    handleBannerImageClick(index) {
      const app = getApp();
      if (index === 0) {
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
          common_vendor.index.navigateTo({
            url: "/pages/monthly-report/index"
          });
        } else {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
        }
      } else {
        const urls = this.bannerList.filter((_, i) => i > 0).map((item) => item.image);
        const currentIndex = index - 1;
        common_vendor.index.previewImage({
          current: currentIndex,
          // 当前预览图片在urls数组中的索引
          urls,
          // 需要预览的图片链接列表
          showmenu: true
          // 显示图片操作菜单
        });
      }
    },
    // 跳转到帖子详情页
    goToPostDetail(item) {
      try {
        const app = getApp();
        app.recordPostView(item.id);
        common_vendor.index.navigateTo({
          url: `/pages/index/post-detail?id=${item.id}&category=${encodeURIComponent(this.activeTab)}`,
          fail: () => {
            common_vendor.index.showToast({
              title: "帖子详情功能暂未开放",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:533", "跳转到帖子详情页失败:", error);
        common_vendor.index.showToast({
          title: "跳转失败",
          icon: "none"
        });
      }
    },
    // 跳转到个人主页
    goToHome() {
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
        common_vendor.index.switchTab({
          url: "/pages/home/index"
        });
      } else {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "登录后可使用更多功能",
          showCancel: true,
          cancelText: "取消",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/setting/basic",
                fail: () => {
                  common_vendor.index.reLaunch({
                    url: "/pages/index/cover"
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
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
        common_vendor.index.navigateTo({
          url: "/pages/social/publish"
        });
      } else {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "登录后可发布内容",
          showCancel: true,
          cancelText: "取消",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/setting/basic",
                fail: () => {
                  common_vendor.index.reLaunch({
                    url: "/pages/index/cover"
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
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.isLoggedIn && !app.globalData.userStatus.isGuest) {
        common_vendor.index.navigateTo({
          url: "/pages/message/index",
          fail: () => {
            common_vendor.index.showToast({
              title: "消息功能暂未开放",
              icon: "none"
            });
          }
        });
      } else {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "登录后可查看消息",
          showCancel: true,
          cancelText: "取消",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/setting/basic",
                fail: () => {
                  common_vendor.index.reLaunch({
                    url: "/pages/index/cover"
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
      const now = /* @__PURE__ */ new Date();
      now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const hour = now.getHours().toString().padStart(2, "0");
      const minute = now.getMinutes().toString().padStart(2, "0");
      return `${month}-${day} ${hour}:${minute}`;
    },
    // 获取随机用户名
    getRandomName() {
      const names = ["张三", "李四", "王五", "赵六", "陈七", "林一", "刘八", "涂二", "S.", "L."];
      return names[Math.floor(Math.random() * names.length)];
    },
    // 生成模拟数据
    generateMockData(startId) {
      if (this.pageNum >= 3) {
        return [];
      }
      const mockDesc = [
        "AI技术最新进展：大模型的突破与应用",
        "如何提升APP用户点击转化率？3个实用技巧",
        "用户行为分析：如何通过数据优化产品体验",
        "程序员需要懂产品设计吗？来聊聊你的看法",
        "职场中，沟通能力和技术能力哪个更重要？",
        "分享一次让你印象深刻的项目踩坑经历",
        "程序员必备的5个效率工具，第3个很少人知道",
        "坚持学习编程的3个小技巧，亲测有效",
        "分享一组超好看的技术主题壁纸"
      ];
      const avatarIcons = ["社交媒体1.png", "社交媒体2.png", "社交媒体3.png", "社交媒体4.png", "社交媒体5.png", "社交媒体1.png"];
      const randomAvatar = `/static/icon/${avatarIcons[Math.floor(Math.random() * avatarIcons.length)]}`;
      const randomImage = Math.random() > 0.3 ? "/static/icon/社交媒体5.png" : "/static/icon/社交媒体1.png";
      return Array.from({ length: this.pageSize }, (_, i) => {
        const hasImage = Math.random() > 0.3;
        let imageUrl = "";
        let imagesList = [];
        if (hasImage) {
          const imageCount = Math.floor(Math.random() * 9) + 1;
          imageUrl = randomImage;
          imagesList = [];
          const possibleImages = [
            "/static/image/轮播图2.JPG",
            "/static/image/轮播图3.JPG",
            "/static/image/轮播图4.JPG",
            "/static/icon/社交媒体1.png",
            "/static/icon/社交媒体2.png",
            "/static/icon/社交媒体3.png",
            "/static/icon/社交媒体4.png",
            "/static/icon/社交媒体5.png",
            "/static/image/S.png"
          ];
          for (let j = 0; j < imageCount; j++) {
            const imgIndex = Math.floor(Math.random() * possibleImages.length);
            imagesList.push(possibleImages[imgIndex]);
          }
        }
        return {
          id: startId + i + 1,
          avatar: randomAvatar,
          name: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          // 随机字母用户名
          time: `04-${Math.floor(Math.random() * 10) + 10} ${Math.floor(Math.random() * 12) + 10}:${Math.floor(Math.random() * 59).toString().padStart(2, "0")}`,
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
        this.initCommentsData(item.id);
      }
    },
    // 获取帖子的评论
    getComments(postId) {
      return this.commentsData[postId] || [];
    },
    // 初始化评论数据
    initCommentsData(postId) {
      const mockUsers = ["张三", "李四", "王五", "赵六", "陈七"];
      const mockAvatars = ["/static/photo/张三.jpg", "/static/photo/李四.jpg", "/static/photo/王五.jpg", "/static/photo/赵六.jpg", "/static/photo/陈七.jpg"];
      const mockComments = [
        "写代码时的灵感进发really美妙！",
        "赞同，特别是解决bug那一刻",
        "确实很有启发",
        "同感，学习了",
        "这个想法太棒了",
        "很实用的建议",
        "感谢分享"
      ];
      let postCommentCount = 0;
      for (let categoryKey in this.contentData) {
        const categoryData = this.contentData[categoryKey];
        if (Array.isArray(categoryData)) {
          const post = categoryData.find((item) => item.id.toString() === postId.toString());
          if (post) {
            postCommentCount = post.comment || 0;
            break;
          }
        }
      }
      const comments = [];
      if (postCommentCount === 0) {
        this.$set(this.commentsData, postId, comments);
        return;
      }
      let totalGenerated = 0;
      let commentIndex = 0;
      while (totalGenerated < postCommentCount) {
        const hasReplies = commentIndex > 0 && totalGenerated < postCommentCount - 1 && Math.random() > 0.5;
        const replyCount = hasReplies ? Math.min(1, postCommentCount - totalGenerated - 1) : 0;
        const userIndex = Math.floor(Math.random() * mockUsers.length);
        const mainComment = {
          id: `${postId}_comment_${commentIndex}`,
          user: mockUsers[userIndex],
          avatar: mockAvatars[userIndex],
          content: mockComments[Math.floor(Math.random() * mockComments.length)],
          replies: []
        };
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
      setTimeout(() => {
        const input = document.querySelector(`input[placeholder="写下你的评论..."]`);
        if (input)
          input.focus();
      }, 100);
    },
    // 提交评论
    submitComment(postItem) {
      var _a;
      const content = (_a = this.commentInputs[postItem.id]) == null ? void 0 : _a.trim();
      if (!content) {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
        return;
      }
      const now = /* @__PURE__ */ new Date();
      const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      let newComment = null;
      const isReply = this.replyTarget && this.replyTarget.postId === postItem.id;
      if (isReply) {
        const comment = this.commentsData[postItem.id].find((c) => c.id === this.replyTarget.commentId);
        if (comment) {
          if (!comment.replies) {
            comment.replies = [];
          }
          newComment = {
            id: `${postItem.id}_reply_${Date.now()}`,
            user: this.userInfo.userName,
            avatar: this.userInfo.avatarUrl,
            toUser: this.replyTarget.userName,
            content,
            time: timeStr,
            likeCount: 0,
            liked: false
          };
          comment.replies.push(newComment);
        }
        this.replyTarget = null;
      } else {
        if (!this.commentsData[postItem.id]) {
          this.commentsData[postItem.id] = [];
        }
        newComment = {
          id: `${postItem.id}_comment_${Date.now()}`,
          user: this.userInfo.userName,
          avatar: this.userInfo.avatarUrl,
          content,
          time: timeStr,
          likeCount: 0,
          liked: false,
          showAllReplies: false,
          replies: []
        };
        this.commentsData[postItem.id].push(newComment);
      }
      postItem.comment += 1;
      this.commentInputs[postItem.id] = "";
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === "pages/index/post-detail") {
          const detailPage = pages[i];
          if (detailPage.$vm.postId === postItem.id.toString()) {
            if (isReply) {
              const mainComment = detailPage.$vm.comments.find((c) => {
                var _a2;
                return c.id === ((_a2 = this.replyTarget) == null ? void 0 : _a2.commentId);
              });
              if (mainComment) {
                if (!mainComment.replies) {
                  mainComment.replies = [];
                }
                mainComment.replies.push(newComment);
              }
            } else {
              detailPage.$vm.comments.push(newComment);
            }
            detailPage.$vm.postDetail.comment = postItem.comment;
            break;
          }
        }
      }
      common_vendor.index.showToast({
        title: "评论成功",
        icon: "success"
      });
    },
    // 处理搜索（添加防抖）
    handleSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
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
        const collectedCards = common_vendor.index.getStorageSync("collectedCards") || [];
        const mutualFriends = common_vendor.index.getStorageSync("mutualFriends") || [];
        const followers = common_vendor.index.getStorageSync("followers") || [];
        const allFriends = [...new Map([...collectedCards, ...mutualFriends, ...followers].map((friend) => [friend.id, friend])).values()];
        const searchKeyword = keyword.toLowerCase();
        this.searchResults = allFriends.filter((friend) => {
          const name = (friend.name || "").toLowerCase();
          const id = (friend.id || "").toLowerCase();
          const signature = (friend.signature || "").toLowerCase();
          return name.includes(searchKeyword) || id.includes(searchKeyword) || signature.includes(searchKeyword);
        });
        this.sortSearchResults(searchKeyword);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:992", "搜索好友失败:", error);
        common_vendor.index.showToast({
          title: "搜索失败，请重试",
          icon: "none"
        });
      } finally {
        this.isSearching = false;
      }
    },
    // 排序搜索结果
    sortSearchResults(keyword) {
      this.searchResults.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        const idA = (a.id || "").toLowerCase();
        const idB = (b.id || "").toLowerCase();
        if (nameA === keyword && nameB !== keyword)
          return -1;
        if (nameA !== keyword && nameB === keyword)
          return 1;
        if (idA === keyword && idB !== keyword)
          return -1;
        if (idA !== keyword && idB === keyword)
          return 1;
        if (nameA.startsWith(keyword) && !nameB.startsWith(keyword))
          return -1;
        if (!nameA.startsWith(keyword) && nameB.startsWith(keyword))
          return 1;
        if (idA.startsWith(keyword) && !idB.startsWith(keyword))
          return -1;
        if (!idA.startsWith(keyword) && idB.startsWith(keyword))
          return 1;
        return nameA.localeCompare(nameB);
      });
    },
    // 清空搜索内容
    clearSearch() {
      this.searchKeyword = "";
      this.showSearchResults = false;
      this.searchResults = [];
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    },
    // 关闭搜索结果
    closeSearch() {
      this.showSearchResults = false;
      this.searchResults = [];
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    },
    // 查看好友详情
    viewFriendDetail(friend) {
      common_vendor.index.navigateTo({
        url: `/pages/card-detail/card-detail?id=${friend.id}&name=${encodeURIComponent(friend.name)}`,
        fail: () => {
          common_vendor.index.showToast({
            title: "查看详情失败",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    b: common_vendor.o([($event) => $data.searchKeyword = $event.detail.value, (...args) => $options.handleSearch && $options.handleSearch(...args)]),
    c: common_vendor.o((...args) => _ctx.searchInputFocus && _ctx.searchInputFocus(...args)),
    d: common_vendor.o((...args) => _ctx.searchInputBlur && _ctx.searchInputBlur(...args)),
    e: $data.searchKeyword,
    f: $data.searchKeyword
  }, $data.searchKeyword ? {
    g: common_vendor.o((...args) => $options.clearSearch && $options.clearSearch(...args))
  } : {}, {
    h: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    i: $data.showSearchResults
  }, $data.showSearchResults ? common_vendor.e({
    j: common_vendor.o((...args) => $options.closeSearch && $options.closeSearch(...args)),
    k: $data.isSearching
  }, $data.isSearching ? {} : $data.searchResults.length > 0 ? {
    m: common_vendor.f($data.searchResults, (friend, k0, i0) => {
      return {
        a: friend.avatar || "/static/icon/default-avatar.png",
        b: common_vendor.t(friend.name || "未知用户"),
        c: common_vendor.t(friend.signature || "暂无个性签名"),
        d: friend.id,
        e: common_vendor.o(($event) => $options.viewFriendDetail(friend), friend.id)
      };
    })
  } : {}, {
    l: $data.searchResults.length > 0
  }) : {}, {
    n: common_vendor.f($data.bannerList, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.o(($event) => $options.handleBannerImageClick(index), index),
        c: index
      };
    }),
    o: $data.activeTab === "最多点击" ? 1 : "",
    p: common_vendor.o(($event) => $data.activeTab = "最多点击"),
    q: $data.activeTab === "最多评论" ? 1 : "",
    r: common_vendor.o(($event) => $data.activeTab = "最多评论"),
    s: $data.activeTab === "最多点赞" ? 1 : "",
    t: common_vendor.o(($event) => $data.activeTab = "最多点赞"),
    v: common_vendor.f($options.getContentList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.avatar || "/static/icon/我的.png",
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.time),
        d: common_vendor.t(item.desc),
        e: item.images && item.images.length > 0
      }, item.images && item.images.length > 0 ? common_vendor.e({
        f: item.images.length === 1
      }, item.images.length === 1 ? {
        g: item.images[0]
      } : common_vendor.e({
        h: common_vendor.f(item.images.slice(0, 3), (img, index, i1) => {
          return {
            a: index,
            b: img
          };
        }),
        i: item.images.length > 3
      }, item.images.length > 3 ? {
        j: common_vendor.t(item.images.length - 3)
      } : {})) : {}, {
        k: item.comment
      }, item.comment ? {
        l: common_assets._imports_0$1,
        m: common_vendor.t(item.comment),
        n: common_vendor.o(($event) => $options.handleCommentClick($event, item), item.id)
      } : {}, {
        o: item.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
        p: common_vendor.t(item.like),
        q: common_vendor.o(($event) => $options.handleLikeClick($event, item), item.id),
        r: item.showComments
      }, item.showComments ? {
        s: common_vendor.f($options.getComments(item.id), (comment, k1, i1) => {
          return common_vendor.e({
            a: comment.avatar,
            b: common_vendor.t(comment.user),
            c: common_vendor.t(comment.content),
            d: comment.replies && comment.replies.length > 0
          }, comment.replies && comment.replies.length > 0 ? {
            e: common_vendor.f(comment.replies, (reply, k2, i2) => {
              return {
                a: reply.avatar,
                b: common_vendor.t(reply.user),
                c: common_vendor.t(reply.content),
                d: reply.id
              };
            })
          } : {}, {
            f: comment.id
          });
        }),
        t: common_vendor.o(($event) => $options.submitComment(item), item.id),
        v: $data.commentInputs[item.id],
        w: common_vendor.o(($event) => $data.commentInputs[item.id] = $event.detail.value, item.id),
        x: common_vendor.o(($event) => $options.submitComment(item), item.id)
      } : {}, {
        y: item.id,
        z: common_vendor.o(($event) => $options.goToPostDetail(item), item.id)
      });
    }),
    w: $data.isLoading
  }, $data.isLoading ? {} : $data.isNoMoreData ? {} : {}, {
    x: $data.isNoMoreData,
    y: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args)),
    z: $data.containerHeight + "px",
    A: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    B: common_vendor.o((...args) => $options.goToPublish && $options.goToPublish(...args)),
    C: common_vendor.o((...args) => $options.goToMessage && $options.goToMessage(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
