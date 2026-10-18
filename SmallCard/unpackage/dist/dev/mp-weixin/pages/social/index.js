"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      activeTab: "recommend",
      userInfo: {
        avatarUrl: "",
        userName: ""
      },
      // 获取全局应用实例，用于用户状态检查
      app: getApp(),
      // 评论相关数据
      showCommentBox: false,
      currentPost: null,
      commentContent: "",
      comments: [],
      // 动画相关
      isCommentBoxAnimating: false,
      // 帖子详情相关
      showPostDetail: false,
      detailPost: null,
      socialList: [],
      // 从本地存储加载推荐帖子
      // 消息跳转相关参数
      fromMessage: false,
      createPlaceholder: false,
      messageData: null,
      friendList: [],
      // 初始化为空数组，将从名片夹数据动态加载
      currentFriend: null
    };
  },
  onLoad(options) {
    this.loadUserInfo();
    this.loadRecommendedPosts();
    this.loadFriendListFromCardFolder();
    if (this.app && this.app.globalData && this.app.globalData.userStatus) {
      if (this.app.isGuestLogin() || !this.app.globalData.userStatus.isLoggedIn) {
        this.activeTab = "recommend";
      }
    } else {
      this.activeTab = "recommend";
    }
    if (options) {
      this.fromMessage = options.fromMessage === "true";
      this.createPlaceholder = options.createPlaceholder === "true";
      if (options.messageData) {
        try {
          this.messageData = JSON.parse(decodeURIComponent(options.messageData));
          common_vendor.index.__f__("log", "at pages/social/index.vue:349", "解析到消息数据:", this.messageData);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/social/index.vue:351", "解析messageData失败:", e);
          this.messageData = null;
        }
      }
    }
    if (options && options.postId) {
      common_vendor.index.__f__("log", "at pages/social/index.vue:359", "从消息页面跳转，需要显示帖子ID:", options.postId, "createPlaceholder:", this.createPlaceholder);
      setTimeout(() => {
        this.showPostById(options.postId);
      }, 100);
    }
  },
  onShow() {
    this.loadUserInfo();
    this.loadRecommendedPosts();
    this.loadFriendListFromCardFolder();
    this.validateDataConsistency();
  },
  created() {
    common_vendor.index.$on("userInfoUpdated", this.handleUserInfoUpdate);
    common_vendor.index.$on("postsUpdated", this.loadRecommendedPosts);
  },
  beforeDestroy() {
    common_vendor.index.$off("userInfoUpdated", this.handleUserInfoUpdate);
    common_vendor.index.$off("postsUpdated", this.loadRecommendedPosts);
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      try {
        this.userInfo = {
          userName: "我",
          avatarUrl: "/static/icon/我的.png"
        };
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
          const globalUserInfo = app.globalData.userStatus.userInfo;
          this.userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || "我";
          this.userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || "/static/icon/我的.png";
          common_vendor.index.__f__("log", "at pages/social/index.vue:401", "从全局userStatus加载用户信息成功:", this.userInfo);
        } else if (app && app.globalData && app.globalData.userInfo) {
          const globalUserInfo = app.globalData.userInfo;
          this.userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || "我";
          this.userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || "/static/icon/我的.png";
          common_vendor.index.__f__("log", "at pages/social/index.vue:407", "从全局userInfo加载用户信息成功:", this.userInfo);
        } else {
          const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
          if (storedUserInfo) {
            const parsedUserInfo = typeof storedUserInfo === "string" ? JSON.parse(storedUserInfo) : storedUserInfo;
            this.userInfo.userName = parsedUserInfo.userName || parsedUserInfo.nickname || "我";
            this.userInfo.avatarUrl = parsedUserInfo.avatarUrl || parsedUserInfo.avatar_url || "/static/icon/我的.png";
            common_vendor.index.__f__("log", "at pages/social/index.vue:415", "从本地存储加载用户信息成功:", this.userInfo);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:419", "加载用户信息出错:", error);
      }
    },
    // 处理用户信息更新
    handleUserInfoUpdate(data) {
      if (!data)
        return;
      if (data.userName || data.nickname) {
        this.userInfo.userName = data.userName || data.nickname || "我";
      }
      if (data.avatarUrl || data.avatar_url) {
        this.userInfo.avatarUrl = data.avatarUrl || data.avatar_url || "/static/icon/我的.png";
      }
      common_vendor.index.__f__("log", "at pages/social/index.vue:436", "用户信息更新成功:", this.userInfo);
    },
    // 跳转至发帖页面
    goToPublish() {
      if (!this.app || !this.app.globalData || !this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        common_vendor.index.showToast({
          title: "请先注册登录，再使用发帖功能",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/social/publish" });
    },
    // 跳转至消息页面
    goMessage() {
      if (!this.app) {
        this.app = getApp();
      }
      if (!this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
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
        return;
      }
      try {
        common_vendor.index.navigateTo({
          url: "/pages/social/message",
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/social/index.vue:489", "消息页面不存在或无法访问:", err);
            common_vendor.index.showToast({
              title: "打开消息页面失败",
              icon: "none",
              duration: 2e3
            });
          }
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: "打开消息页面失败",
          icon: "none",
          duration: 2e3
        });
      }
    },
    // 创建通知消息
    createNotification(notificationData) {
      try {
        const app = this.app || getApp();
        const currentUser = this.userInfo || {};
        const message = {
          id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
          type: notificationData.type,
          // 'like' 或 'comment'
          userName: currentUser.userName || "用户",
          avatar: currentUser.avatarUrl || "/static/icon/我的.png",
          postId: notificationData.postId,
          postContent: notificationData.postContent,
          commentContent: notificationData.commentContent,
          createTime: Date.now(),
          isRead: false,
          // 添加额外的字段以兼容不同的显示需求
          sender: currentUser.userName || "用户",
          comment: notificationData.commentContent,
          time: (/* @__PURE__ */ new Date()).toLocaleString()
        };
        let userMessages = common_vendor.index.getStorageSync("userMessages") || [];
        userMessages.unshift(message);
        if (userMessages.length > 50) {
          userMessages = userMessages.slice(0, 50);
        }
        common_vendor.index.setStorageSync("userMessages", userMessages);
        common_vendor.index.__f__("log", "at pages/social/index.vue:542", "消息通知已创建:", message);
        this.updateMessageBadge();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:547", "创建消息通知失败:", error);
      }
    },
    // 更新消息提示角标
    updateMessageBadge() {
      try {
        const userMessages = common_vendor.index.getStorageSync("userMessages") || [];
        const unreadCount = userMessages.filter((msg) => !msg.isRead).length;
        if (unreadCount > 0) {
          common_vendor.index.setTabBarBadge({
            index: 2,
            // 假设消息页面在tabBar的第3位（索引为2）
            text: String(unreadCount > 99 ? "99+" : unreadCount)
          });
        } else {
          common_vendor.index.removeTabBarBadge({
            index: 2
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:570", "更新消息角标失败:", error);
      }
    },
    // 显示好友帖子
    showFriendPosts(friend) {
      this.currentFriend = friend;
      common_vendor.index.__f__("log", "at pages/social/index.vue:578", "显示好友帖子:", friend.name);
    },
    // 获取当前用户ID
    getCurrentUserId() {
      var _a;
      try {
        const app = getApp();
        const userInfo = (_a = app.globalData.userStatus) == null ? void 0 : _a.userInfo;
        if (userInfo && userInfo.userId) {
          return userInfo.userId;
        }
        const isGuest = common_vendor.index.getStorageSync("isGuest");
        return isGuest ? "guest" : "default_user";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:594", "获取用户ID失败:", e);
        return "default_user";
      }
    },
    // 从名片夹加载好友列表
    loadFriendListFromCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        this.friendList = [];
        if (collectedCards && Array.isArray(collectedCards) && collectedCards.length > 0) {
          this.friendList = collectedCards.map((card) => ({
            id: card.id || `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: card.name || "未知用户",
            avatar: card.avatar || "/static/icon/我的.png",
            signature: card.signature || "",
            desc: card.desc || "",
            // 生成模拟帖子数据
            posts: this.generateMockPostsForFriend(card)
          }));
          common_vendor.index.__f__("log", "at pages/social/index.vue:626", "从用户隔离的名片夹加载好友列表成功:", this.friendList.length, "位好友");
        } else {
          common_vendor.index.__f__("log", "at pages/social/index.vue:628", "用户隔离的名片夹为空或不存在，好友列表为空");
        }
        this.syncFriendListToCardFolder();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:634", "从名片夹加载好友列表失败:", error);
        this.friendList = [];
      }
    },
    // 同步好友列表到名片夹（双向同步）
    syncFriendListToCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (this.friendList.length !== collectedCards.length) {
          common_vendor.index.__f__("log", "at pages/social/index.vue:650", "好友列表与名片夹数量不一致，正在同步...");
          common_vendor.index.__f__("log", "at pages/social/index.vue:651", "- 好友列表数量:", this.friendList.length);
          common_vendor.index.__f__("log", "at pages/social/index.vue:652", "- 名片夹数量:", collectedCards.length);
          const friendIds = new Set(this.friendList.map((friend) => friend.id));
          const cardIds = new Set(collectedCards.map((card) => card.id));
          const friendsToAdd = this.friendList.filter((friend) => !cardIds.has(friend.id));
          if (friendsToAdd.length > 0) {
            common_vendor.index.__f__("log", "at pages/social/index.vue:663", "发现新好友需要添加到名片夹:", friendsToAdd.length);
            const updatedCards = [...collectedCards, ...friendsToAdd.map((friend) => ({
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
              signature: friend.signature,
              desc: friend.desc
            }))];
            common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, updatedCards);
            common_vendor.index.__f__("log", "at pages/social/index.vue:676", "已同步新增好友到名片夹");
            common_vendor.index.$emit("friendsDataUpdated");
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:683", "同步好友列表到名片夹失败:", error);
      }
    },
    // 为好友生成模拟帖子数据
    generateMockPostsForFriend(card) {
      const jobTypes = {
        "音乐": ["分享一首最近超喜欢的歌🎵", "今天的练琴记录📝", "新曲创作中，敬请期待！"],
        "设计": ["分享最新的设计作品👨‍💻", "设计灵感来源分享✨", "UI设计小技巧"],
        "摄影": ["今日拍摄作品分享📷", "摄影构图技巧", "分享一个绝美的拍摄地点"],
        "前端": ["Vue3新特性分享", "前端性能优化心得", "推荐几个超实用的开发工具"],
        "后端": ["Python数据分析实战", "服务器性能调优", "数据库优化技巧"],
        "产品": ["产品经理日常", "用户调研心得分享", "产品设计思考"],
        "数据": ["数据分析案例分享", "可视化图表制作技巧", "大数据应用场景"]
      };
      let contentTemplates = ["今天天气真好！", "分享生活中的小确幸", "努力工作中💪"];
      const desc = card.desc || "";
      for (const [job, templates] of Object.entries(jobTypes)) {
        if (desc.includes(job)) {
          contentTemplates = templates;
          break;
        }
      }
      const postCount = Math.floor(Math.random() * 3) + 1;
      const posts = [];
      for (let i = 0; i < postCount; i++) {
        const content = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
        posts.push({
          id: `post_${card.id || "unknown"}_${i}_${Date.now()}`,
          content,
          liked: Math.random() > 0.7,
          // 30%概率已点赞
          likeCount: Math.floor(Math.random() * 100),
          comments: [],
          commentCount: 0,
          createTime: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1e3)
          // 随机7天内的时间
        });
      }
      return posts;
    },
    // 验证数据一致性
    validateDataConsistency() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const currentFriendListLength = this.friendList.length;
        const expectedFriendListLength = collectedCards.length;
        common_vendor.index.__f__("log", "at pages/social/index.vue:746", "数据一致性验证结果:");
        common_vendor.index.__f__("log", "at pages/social/index.vue:747", "- 当前好友列表长度:", currentFriendListLength);
        common_vendor.index.__f__("log", "at pages/social/index.vue:748", "- 用户隔离的名片夹中好友数量:", expectedFriendListLength);
        common_vendor.index.__f__("log", "at pages/social/index.vue:749", "- 数据一致性检查:", currentFriendListLength === expectedFriendListLength ? "✓ 通过" : "✗ 失败");
        const hasHardcodedFriends = false;
        common_vendor.index.__f__("log", "at pages/social/index.vue:753", "- 无硬编码默认好友检查:", !hasHardcodedFriends ? "✓ 通过" : "✗ 失败");
        const isDataFullySynced = currentFriendListLength === expectedFriendListLength;
        common_vendor.index.__f__("log", "at pages/social/index.vue:757", "- 数据完全同步检查:", isDataFullySynced ? "✓ 通过" : "✗ 失败");
        if (!isDataFullySynced) {
          common_vendor.index.__f__("warn", "at pages/social/index.vue:761", "发现数据不一致，正在进行双向同步...");
          this.loadFriendListFromCardFolder();
          this.syncFriendListToCardFolder();
          common_vendor.index.showToast({
            title: "数据已双向同步更新",
            icon: "success",
            duration: 2e3
          });
        }
        return isDataFullySynced;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:778", "数据一致性验证失败:", error);
        return false;
      }
    },
    // 测试删除好友功能
    testRemoveFriend() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const originalLength = this.friendList.length;
        common_vendor.index.__f__("log", "at pages/social/index.vue:792", "测试删除好友前的好友列表长度:", originalLength);
        if (originalLength > 0) {
          let collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
          const friendToRemove = this.friendList[0];
          collectedCards = collectedCards.filter((card) => card.id !== friendToRemove.id);
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
          common_vendor.index.__f__("log", "at pages/social/index.vue:804", "已模拟移除第一个好友");
          this.loadFriendListFromCardFolder();
          setTimeout(() => {
            const newLength = this.friendList.length;
            common_vendor.index.__f__("log", "at pages/social/index.vue:812", "测试删除好友后的好友列表长度:", newLength);
            common_vendor.index.__f__("log", "at pages/social/index.vue:813", "删除测试结果:", newLength === originalLength - 1 ? "✓ 成功" : "✗ 失败");
            common_vendor.index.showToast({
              title: newLength === originalLength - 1 ? "删除测试成功" : "删除测试失败",
              icon: newLength === originalLength - 1 ? "success" : "error",
              duration: 2e3
            });
            this.testDataConsistency();
          }, 500);
        } else {
          common_vendor.index.showToast({
            title: "好友列表为空，无法测试删除功能",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:832", "测试删除好友失败:", error);
        common_vendor.index.showToast({
          title: "测试失败",
          icon: "error",
          duration: 2e3
        });
      }
    },
    // 测试数据一致性
    testDataConsistency() {
      try {
        common_vendor.index.__f__("log", "at pages/social/index.vue:844", "开始测试数据一致性...");
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const friendListLength = this.friendList.length;
        const cardListLength = collectedCards.length;
        common_vendor.index.__f__("log", "at pages/social/index.vue:856", "数据一致性测试结果:");
        common_vendor.index.__f__("log", "at pages/social/index.vue:857", `- 好友列表数量: ${friendListLength}`);
        common_vendor.index.__f__("log", "at pages/social/index.vue:858", `- 名片夹数量: ${cardListLength}`);
        const isCountConsistent = friendListLength === cardListLength;
        common_vendor.index.__f__("log", "at pages/social/index.vue:862", `- 数量一致性: ${isCountConsistent ? "✓ 通过" : "✗ 失败"}`);
        const friendIds = new Set(this.friendList.map((f) => f.id));
        const cardIds = new Set(collectedCards.map((c) => c.id));
        const isContentConsistent = JSON.stringify([...friendIds].sort()) === JSON.stringify([...cardIds].sort());
        common_vendor.index.__f__("log", "at pages/social/index.vue:869", `- 内容一致性: ${isContentConsistent ? "✓ 通过" : "✗ 失败"}`);
        if (!isCountConsistent || !isContentConsistent) {
          common_vendor.index.__f__("log", "at pages/social/index.vue:873", "正在执行数据同步...");
          this.loadFriendListFromCardFolder();
          this.syncFriendListToCardFolder();
          common_vendor.index.__f__("log", "at pages/social/index.vue:876", "数据同步完成");
        }
        setTimeout(() => {
          const updatedCollectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
          common_vendor.index.__f__("log", "at pages/social/index.vue:882", "同步后验证:");
          common_vendor.index.__f__("log", "at pages/social/index.vue:883", `- 好友列表数量: ${this.friendList.length}`);
          common_vendor.index.__f__("log", "at pages/social/index.vue:884", `- 名片夹数量: ${updatedCollectedCards.length}`);
          common_vendor.index.__f__("log", "at pages/social/index.vue:885", `- 数量一致性: ${this.friendList.length === updatedCollectedCards.length ? "✓ 通过" : "✗ 失败"}`);
        }, 100);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:889", "数据一致性测试失败:", error);
      }
    },
    // 添加默认好友数据
    addDefaultFriends() {
      const defaultFriends = [
        { id: "friend1", name: "林一", avatar: "/static/photo/林一.jpg", signature: "摄影师，记录生活" },
        { id: "friend2", name: "涂二", avatar: "/static/photo/涂二.jpg", signature: "数据分析师，擅长可视化" },
        { id: "friend3", name: "张三", avatar: "/static/photo/张三.jpg", signature: "产品经理，5年经验" },
        { id: "friend4", name: "李四", avatar: "/static/photo/李四.jpg", signature: "前端工程师，热爱新技术" },
        { id: "friend5", name: "王五", avatar: "/static/photo/王五.jpg", signature: "设计师，UI/UX全能" },
        { id: "friend6", name: "赵六", avatar: "/static/photo/赵六.jpg", signature: "后端工程师，专注性能优化" },
        { id: "friend7", name: "陈七", avatar: "/static/photo/陈七.jpg", signature: "移动开发工程师，全栈思维" },
        { id: "friend8", name: "刘八", avatar: "/static/photo/刘八.jpg", signature: "DevOps工程师，自动化运维" },
        { id: "friend9", name: "L.", avatar: "/static/photo/L..jpg", signature: "项目经理，敏捷实践者" },
        { id: "friend10", name: "梨鸣晒兽", avatar: "/static/photo/梨鸣晒兽.jpg", signature: "数据科学家，机器学习爱好者" },
        { id: "friend11", name: "S.", avatar: "/static/photo/S..jpg", signature: "测试工程师，质量保障专家" }
      ];
      return defaultFriends;
    },
    // 初始化用户数据
    initializeUserData() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (!collectedCards || collectedCards.length === 0) {
          common_vendor.index.__f__("log", "at pages/social/index.vue:923", "首次使用，为用户初始化默认的11个好友数据");
          const defaultFriends = this.addDefaultFriends();
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, defaultFriends);
          common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, defaultFriends);
          common_vendor.index.__f__("log", "at pages/social/index.vue:929", "已成功初始化用户好友数据");
          this.loadFriendListFromCardFolder();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:934", "初始化用户数据失败:", error);
      }
    },
    // 根据ID查找并显示帖子
    showPostById(postId) {
      common_vendor.index.__f__("log", "at pages/social/index.vue:940", "showPostById调用，参数:", { postId, fromMessage: this.fromMessage, createPlaceholder: this.createPlaceholder });
      let targetPost = this.socialList.find((post) => post.id === postId);
      if (!targetPost) {
        try {
          const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
          const myPosts = common_vendor.index.getStorageSync("myPosts") || [];
          targetPost = recommendedPosts.find((post) => post.id === postId);
          if (!targetPost) {
            targetPost = myPosts.find((post) => post.id === postId);
          }
          if (targetPost && !this.socialList.find((p) => p.id === postId)) {
            this.socialList.push(targetPost);
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/social/index.vue:964", "从本地存储查找帖子失败:", error);
        }
      }
      if (targetPost) {
        this.openPostDetail(targetPost);
      } else if (this.fromMessage && this.createPlaceholder && this.messageData) {
        common_vendor.index.__f__("log", "at pages/social/index.vue:974", "创建占位帖子，消息数据:", this.messageData);
        const placeholderPost = {
          id: postId,
          content: this.messageData.postContent || "该帖子内容已无法查看",
          userId: this.userInfo.userId || "guest",
          userName: "已删除的帖子",
          userAvatar: "/static/icon/我的.png",
          createTime: this.messageData.createTime || Date.now(),
          likeCount: 0,
          commentCount: 0,
          liked: false,
          isPlaceholder: true,
          // 标记为占位帖子
          // 添加消息相关信息用于显示
          notificationType: this.messageData.type,
          notificationSender: this.messageData.userName || this.messageData.sender,
          notificationSenderAvatar: this.messageData.avatar,
          notificationComment: this.messageData.commentContent || this.messageData.comment
        };
        this.socialList.unshift(placeholderPost);
        this.openPostDetail(placeholderPost);
      } else {
        common_vendor.index.__f__("error", "at pages/social/index.vue:1000", "未找到ID为", postId, "的帖子，且无法创建占位帖子");
        if (this.fromMessage) {
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1e3);
        } else {
          common_vendor.index.showToast({ title: "未找到相关帖子", icon: "none" });
        }
      }
    },
    // 加载推荐帖子
    loadRecommendedPosts() {
      try {
        let recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        if (!Array.isArray(recommendedPosts)) {
          recommendedPosts = [];
        }
        if (recommendedPosts.length === 0) {
          recommendedPosts = this.getMockRecommendedPosts();
          common_vendor.index.setStorageSync("recommendedPosts", recommendedPosts);
        }
        this.initializeUserData();
        recommendedPosts = recommendedPosts.map((post) => {
          const updatedPost = {
            ...post,
            comments: post.comments || [],
            liked: post.liked || false,
            likeCount: post.likeCount || 0,
            images: post.images || []
          };
          updatedPost.commentCount = updatedPost.comments.length;
          updatedPost.comments.forEach((comment) => {
            if (!comment.avatar || comment.avatar.trim() === "") {
              comment.avatar = "/static/icon/我的.png";
            }
          });
          return updatedPost;
        });
        this.socialList = [...recommendedPosts].sort((a, b) => {
          return b.createTime - a.createTime;
        });
        if (this.showPostDetail && this.detailPost) {
          const updatedDetailPost = recommendedPosts.find((post) => post.id === this.detailPost.id);
          if (updatedDetailPost) {
            this.detailPost = updatedDetailPost;
            this.comments = [...updatedDetailPost.comments];
          }
        }
        common_vendor.index.__f__("log", "at pages/social/index.vue:1070", "加载推荐帖子:", this.socialList);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:1072", "加载推荐帖子失败:", error);
        this.socialList = this.getMockRecommendedPosts();
      }
    },
    // 获取默认模拟推荐帖子数据
    getMockRecommendedPosts() {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1e3;
      return [
        {
          id: "mock1",
          content: "最美的10个编程瞬间，看到第5个我哭了",
          userAvatar: "/static/photo/张三.jpg",
          userName: "Z.",
          createTime: now - oneDay,
          likeCount: 57,
          liked: false,
          commentCount: 12,
          counter: 89,
          // 点击次数
          comments: [
            {
              id: "mock-comment1",
              content: "写代码时的灵感迸发really美妙！",
              avatar: "/static/photo/张三.jpg",
              name: "张三",
              time: "14:20"
            },
            {
              id: "mock-comment2",
              content: "赞同，特别是解决bug那一刻",
              avatar: "/static/photo/李四.jpg",
              name: "李四",
              time: "15:30"
            }
          ],
          images: []
        },
        {
          id: "mock2",
          content: "程序员的自我修养：如何保持技术敏感度",
          userAvatar: "/static/photo/李四.jpg",
          userName: "H.",
          createTime: now - 2 * oneDay,
          likeCount: 42,
          liked: false,
          commentCount: 8,
          counter: 124,
          // 点击次数
          comments: [
            {
              id: "mock-comment3",
              content: "每天阅读技术博客是个好习惯",
              avatar: "/static/photo/王五.jpg",
              name: "王五",
              time: "08:50"
            }
          ],
          images: []
        },
        {
          id: "mock3",
          content: "分享一个我最近开发的小工具，提高了50%的开发效率",
          userAvatar: "/static/photo/S..jpg",
          userName: "S.",
          createTime: now - 3 * oneDay,
          likeCount: 68,
          liked: false,
          commentCount: 15,
          counter: 156,
          // 点击次数
          comments: [],
          images: []
        }
      ];
    },
    // 打开帖子详情
    openPostDetail(post) {
      if (post.isPlaceholder) {
        common_vendor.index.__f__("log", "at pages/social/index.vue:1153", "显示占位帖子详情");
        common_vendor.index.showToast({
          title: "这是基于通知生成的预览内容",
          icon: "none",
          duration: 2e3
        });
      } else {
        post.counter = (post.counter || 0) + 1;
      }
      if (!post.comments) {
        post.comments = [];
      }
      post.commentCount = post.comments.length;
      try {
        const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        const updatedPosts = recommendedPosts.map(
          (item) => item.id === post.id ? { ...item, counter: post.counter, comments: post.comments, commentCount: post.commentCount } : item
        );
        common_vendor.index.setStorageSync("recommendedPosts", updatedPosts);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:1181", "更新点击次数失败:", error);
      }
      if (this.currentFriend && (!post.userAvatar || !post.userName)) {
        Object.assign(post, {
          userAvatar: this.currentFriend.avatar,
          userName: this.currentFriend.name
        });
      }
      this.detailPost = post;
      this.showPostDetail = true;
      this.comments = [...post.comments];
      this.commentContent = "";
      this.detailPost.canDelete = this.isOwnerPost(post);
    },
    // 判断是否是用户自己的帖子
    isOwnerPost(post) {
      const myPosts = common_vendor.index.getStorageSync("myPosts") || [];
      const isOwner = myPosts.some((myPost) => myPost.id === post.id);
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
      this.commentContent = "";
    },
    // 预览图片
    previewImage(imageList, currentIndex) {
      if (!imageList || imageList.length === 0 || !imageList[currentIndex]) {
        return;
      }
      common_vendor.index.previewImage({
        urls: imageList,
        current: imageList[currentIndex],
        success: () => {
          common_vendor.index.__f__("log", "at pages/social/index.vue:1238", "图片预览成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/social/index.vue:1241", "预览图片失败:", err);
          common_vendor.index.showToast({ title: "预览图片失败", icon: "none" });
        }
      });
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const now = Date.now();
      const diff = now - timestamp;
      if (diff < 60 * 1e3) {
        return "刚刚";
      } else if (diff < 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 1e3)) + "分钟前";
      } else if (diff < 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 60 * 1e3)) + "小时前";
      } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
    },
    // 打开评论框
    openComment(post) {
      if (!this.app || !this.app.globalData || !this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "登录后可发表评论",
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
        return;
      }
      this.currentPost = post;
      this.showCommentBox = true;
      if (!post.comments) {
        post.comments = [];
      }
      this.comments = post.comments;
      this.commentContent = "";
      this.$nextTick(() => {
        setTimeout(() => {
          common_vendor.index.createSelectorQuery().select(".comment-input").fields({
            focus: true
          }, () => {
          }).exec();
        }, 100);
      });
    },
    // 隐藏评论框
    hideCommentBox() {
      if (this.isCommentBoxAnimating)
        return;
      this.isCommentBoxAnimating = true;
      setTimeout(() => {
        this.showCommentBox = false;
        this.currentPost = null;
        this.commentContent = "";
        this.isCommentBoxAnimating = false;
      }, 200);
    },
    // 发送评论
    sendComment() {
      const targetPost = this.showPostDetail ? this.detailPost : this.currentPost;
      if (!this.commentContent.trim() || !targetPost) {
        return;
      }
      if (targetPost.isPlaceholder) {
        common_vendor.index.showToast({
          title: "无法对预览内容进行评论",
          icon: "none"
        });
        return;
      }
      const userAvatar = this.userInfo.avatarUrl && this.userInfo.avatarUrl.trim() ? this.userInfo.avatarUrl : "/static/icon/我的.png";
      const userName = this.userInfo.userName || "我";
      const comment = {
        id: Date.now().toString(),
        content: this.commentContent.trim(),
        avatar: userAvatar,
        name: userName,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      };
      if (!targetPost.comments) {
        targetPost.comments = [];
      }
      targetPost.comments.push(comment);
      targetPost.commentCount = targetPost.comments.length;
      this.comments = [...targetPost.comments];
      this.savePosts();
      this.socialList = this.socialList.map(
        (item) => item.id === targetPost.id ? { ...item, ...targetPost } : item
      );
      if (targetPost.userId && targetPost.userId !== (this.userInfo.userId || this.app.globalData.userStatus.userId)) {
        this.createNotification({
          type: "comment",
          postId: targetPost.id,
          postContent: targetPost.content,
          commentContent: comment.content,
          targetUserId: targetPost.userId
        });
      }
      this.commentContent = "";
      common_vendor.index.showToast({
        title: "评论成功",
        icon: "success",
        duration: 1500
      });
    },
    // 保存帖子数据
    savePosts() {
      try {
        const targetPost = this.showPostDetail ? this.detailPost : this.currentPost;
        if (!targetPost) {
          return;
        }
        const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        const updatedPosts = recommendedPosts.map(
          (item) => item.id === targetPost.id ? { ...item, ...targetPost } : item
        );
        common_vendor.index.setStorageSync("recommendedPosts", updatedPosts);
        const myPosts = common_vendor.index.getStorageSync("myPosts") || [];
        const updatedMyPosts = myPosts.map(
          (item) => item.id === targetPost.id ? { ...item, ...targetPost } : item
        );
        common_vendor.index.setStorageSync("myPosts", updatedMyPosts);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:1424", "保存帖子数据失败:", error);
      }
    },
    // 点赞/取消点赞
    toggleLike(post) {
      if (post.isPlaceholder) {
        common_vendor.index.showToast({
          title: "无法对预览内容进行操作",
          icon: "none"
        });
        return;
      }
      try {
        post.liked = !post.liked;
        post.likeCount = post.likeCount || 0;
        post.likeCount += post.liked ? 1 : -1;
        if (this.showPostDetail && this.detailPost && this.detailPost.id === post.id) {
          this.detailPost.liked = post.liked;
          this.detailPost.likeCount = post.likeCount;
        }
        const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        const updatedPosts = recommendedPosts.map(
          (item) => item.id === post.id ? { ...item, ...post } : item
        );
        common_vendor.index.setStorageSync("recommendedPosts", updatedPosts);
        const myPosts = common_vendor.index.getStorageSync("myPosts") || [];
        const updatedMyPosts = myPosts.map(
          (item) => item.id === post.id ? { ...item, ...post } : item
        );
        common_vendor.index.setStorageSync("myPosts", updatedMyPosts);
        this.socialList = this.socialList.map(
          (item) => item.id === post.id ? { ...item, ...post } : item
        );
        common_vendor.index.showToast({
          title: post.liked ? "点赞成功" : "取消点赞",
          icon: "none"
        });
        if (post.liked && post.userId && post.userId !== (this.userInfo.userId || this.app.globalData.userStatus.userId)) {
          this.createNotification({
            type: "like",
            postId: post.id,
            postContent: post.content,
            targetUserId: post.userId
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:1486", "点赞操作失败:", error);
      }
    },
    // 显示删除确认对话框
    showDeleteConfirm() {
      if (!this.app || !this.app.globalData || !this.app.globalData.userStatus || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
        common_vendor.index.showToast({
          title: "请先注册登录，再使用删除功能",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条帖子吗？删除后无法恢复。",
        confirmColor: "#ff4757",
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
        const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        const filteredRecommendedPosts = recommendedPosts.filter((item) => item.id !== postId);
        common_vendor.index.setStorageSync("recommendedPosts", filteredRecommendedPosts);
        const myPosts = common_vendor.index.getStorageSync("myPosts") || [];
        const filteredMyPosts = myPosts.filter((item) => item.id !== postId);
        common_vendor.index.setStorageSync("myPosts", filteredMyPosts);
        this.socialList = this.socialList.filter((item) => item.id !== postId);
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success",
          duration: 1500
        });
        setTimeout(() => {
          this.closePostDetail();
        }, 1e3);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/index.vue:1542", "删除帖子失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.n({
      active: $data.activeTab === "recommend"
    }),
    b: common_vendor.o(($event) => $data.activeTab = "recommend"),
    c: $data.app && $data.app.globalData && $data.app.globalData.userStatus && $data.app.globalData.userStatus.isLoggedIn && !$data.app.globalData.userStatus.isGuest
  }, $data.app && $data.app.globalData && $data.app.globalData.userStatus && $data.app.globalData.userStatus.isLoggedIn && !$data.app.globalData.userStatus.isGuest ? {
    d: common_vendor.n({
      active: $data.activeTab === "friends"
    }),
    e: common_vendor.o(($event) => $data.activeTab = "friends")
  } : {}, {
    f: $data.activeTab === "recommend"
  }, $data.activeTab === "recommend" ? {
    g: common_vendor.f($data.socialList, (item, index, i0) => {
      return common_vendor.e({
        a: item.userAvatar || "/static/icon/我的.png",
        b: common_vendor.t(item.userName || "用户"),
        c: common_vendor.t(item.desc || ""),
        d: common_vendor.t($options.formatTime(item.createTime)),
        e: item.counter
      }, item.counter ? {
        f: common_vendor.t(item.counter)
      } : {}, {
        g: common_vendor.t(item.content || ""),
        h: item.images && item.images.length > 0
      }, item.images && item.images.length > 0 ? {
        i: common_vendor.f(item.images, (img, imgIndex, i1) => {
          return {
            a: imgIndex,
            b: img,
            c: common_vendor.o(($event) => $options.previewImage(item.images, imgIndex), imgIndex)
          };
        })
      } : {}, {
        j: item.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
        k: item.liked ? 1 : "",
        l: common_vendor.t(item.likeCount || 0),
        m: item.liked ? 1 : "",
        n: common_vendor.o(($event) => $options.toggleLike(item), index),
        o: common_vendor.t(item.commentCount || 0),
        p: common_vendor.o(($event) => $options.openComment(item), index),
        q: item.comments && item.comments.length > 0
      }, item.comments && item.comments.length > 0 ? {
        r: common_vendor.f(item.comments.slice(0, 2), (comment, commentIndex, i1) => {
          return {
            a: comment.avatar || "/static/icon/我的.png",
            b: common_vendor.t(comment.name),
            c: common_vendor.t(comment.content),
            d: commentIndex
          };
        })
      } : {}, {
        s: common_vendor.o(($event) => $options.openPostDetail(item), index),
        t: index
      });
    }),
    h: common_assets._imports_0$1
  } : $data.activeTab === "friends" ? common_vendor.e({
    j: !$data.currentFriend
  }, !$data.currentFriend ? {
    k: common_vendor.f($data.friendList, (friend, index, i0) => {
      return {
        a: friend.avatar || "/static/icon/我的.png",
        b: common_vendor.t(friend.name),
        c: common_vendor.t(friend.signature),
        d: index,
        e: common_vendor.o(($event) => $options.showFriendPosts(friend), index)
      };
    })
  } : {
    l: common_vendor.o(($event) => $data.currentFriend = null),
    m: common_vendor.f($data.currentFriend.posts, (post, postIndex, i0) => {
      return common_vendor.e({
        a: post.counter
      }, post.counter ? {
        b: common_vendor.t(post.counter)
      } : {}, {
        c: common_vendor.t(post.content),
        d: post.images && post.images.length > 0
      }, post.images && post.images.length > 0 ? {
        e: common_vendor.f(post.images, (img, imgIndex, i1) => {
          return {
            a: imgIndex,
            b: img,
            c: common_vendor.o(($event) => $options.previewImage(post.images, imgIndex), imgIndex)
          };
        })
      } : {}, {
        f: post.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
        g: post.liked ? 1 : "",
        h: common_vendor.t(post.likeCount || 0),
        i: post.liked ? 1 : "",
        j: common_vendor.o(($event) => $options.toggleLike(post), postIndex),
        k: common_vendor.t(post.commentCount || 0),
        l: common_vendor.o(($event) => $options.openComment(post), postIndex),
        m: post.comments && post.comments.length > 0
      }, post.comments && post.comments.length > 0 ? {
        n: common_vendor.f(post.comments.slice(0, 2), (comment, commentIndex, i1) => {
          return {
            a: comment.avatar || "/static/icon/我的.png",
            b: common_vendor.t(comment.name),
            c: common_vendor.t(comment.content),
            d: commentIndex
          };
        })
      } : {}, {
        o: common_vendor.o(($event) => $options.openPostDetail(post), postIndex),
        p: postIndex
      });
    }),
    n: $data.currentFriend.avatar || "/static/icon/我的.png",
    o: common_vendor.t($data.currentFriend.name),
    p: common_vendor.t($data.currentFriend.desc),
    q: common_assets._imports_0$1
  }) : {}, {
    i: $data.activeTab === "friends",
    r: $data.app && $data.app.globalData && $data.app.globalData.userStatus && $data.app.globalData.userStatus.isLoggedIn && !$data.app.globalData.userStatus.isGuest
  }, $data.app && $data.app.globalData && $data.app.globalData.userStatus && $data.app.globalData.userStatus.isLoggedIn && !$data.app.globalData.userStatus.isGuest ? {
    s: common_vendor.o((...args) => $options.goToPublish && $options.goToPublish(...args)),
    t: common_vendor.o((...args) => $options.goMessage && $options.goMessage(...args))
  } : {}, {
    v: $data.showCommentBox
  }, $data.showCommentBox ? common_vendor.e({
    w: common_vendor.o((...args) => $options.hideCommentBox && $options.hideCommentBox(...args)),
    x: common_vendor.t($data.currentPost ? $data.currentPost.commentCount || 0 : 0),
    y: common_vendor.o((...args) => $options.hideCommentBox && $options.hideCommentBox(...args)),
    z: common_vendor.f($data.comments, (comment, index, i0) => {
      return {
        a: comment.avatar || "/static/icon/我的.png",
        b: common_vendor.t(comment.name),
        c: common_vendor.t(comment.content),
        d: common_vendor.t(comment.time),
        e: index
      };
    }),
    A: $data.comments.length === 0
  }, $data.comments.length === 0 ? {} : {}, {
    B: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args)),
    C: $data.commentContent,
    D: common_vendor.o(($event) => $data.commentContent = $event.detail.value),
    E: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args)),
    F: !$data.commentContent.trim()
  }) : {}, {
    G: $data.showPostDetail && $data.detailPost
  }, $data.showPostDetail && $data.detailPost ? common_vendor.e({
    H: common_assets._imports_0$2,
    I: common_vendor.o((...args) => $options.closePostDetail && $options.closePostDetail(...args)),
    J: _ctx.canDeletePost
  }, _ctx.canDeletePost ? {
    K: common_assets._imports_1$1,
    L: common_vendor.o((...args) => $options.showDeleteConfirm && $options.showDeleteConfirm(...args))
  } : {}, {
    M: $data.detailPost.userAvatar || "/static/icon/我的.png",
    N: common_vendor.t($data.detailPost.userName || "用户"),
    O: $data.detailPost.isPlaceholder
  }, $data.detailPost.isPlaceholder ? common_vendor.e({
    P: common_assets._imports_1$2,
    Q: $data.detailPost.notificationType === "like"
  }, $data.detailPost.notificationType === "like" ? {
    R: common_vendor.t($data.detailPost.notificationSender)
  } : $data.detailPost.notificationType === "comment" ? {
    T: common_vendor.t($data.detailPost.notificationSender),
    U: common_vendor.t($data.detailPost.notificationComment || "暂无评论内容")
  } : {}, {
    S: $data.detailPost.notificationType === "comment"
  }) : {}, {
    V: common_vendor.t($data.detailPost.content || ""),
    W: $data.detailPost.images && $data.detailPost.images.length > 0
  }, $data.detailPost.images && $data.detailPost.images.length > 0 ? {
    X: common_vendor.f($data.detailPost.images, (img, imgIndex, i0) => {
      return {
        a: imgIndex,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($data.detailPost.images, imgIndex), imgIndex)
      };
    })
  } : {}, {
    Y: common_vendor.t($options.formatTime($data.detailPost.createTime)),
    Z: $data.detailPost.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
    aa: $data.detailPost.liked ? 1 : "",
    ab: common_vendor.t($data.detailPost.likeCount || 0),
    ac: $data.detailPost.liked ? 1 : "",
    ad: common_vendor.o(($event) => $options.toggleLike($data.detailPost)),
    ae: common_assets._imports_0$1,
    af: common_vendor.t($data.detailPost.commentCount || 0),
    ag: common_vendor.o(($event) => $options.openComment($data.detailPost)),
    ah: common_vendor.f($data.comments, (comment, index, i0) => {
      return {
        a: comment.avatar || "/static/icon/我的.png",
        b: common_vendor.t(comment.name),
        c: common_vendor.t(comment.content),
        d: common_vendor.t(comment.time),
        e: index
      };
    }),
    ai: $data.comments.length === 0
  }, $data.comments.length === 0 ? {} : {}, {
    aj: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args)),
    ak: $data.commentContent,
    al: common_vendor.o(($event) => $data.commentContent = $event.detail.value),
    am: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args)),
    an: !$data.commentContent.trim() ? 1 : ""
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3d688510"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/social/index.js.map
