"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_userService = require("./utils/userService.js");
if (!Math) {
  "./pages/index/cover.js";
  "./pages/index/index.js";
  "./pages/index/post-detail.js";
  "./pages/home/index.js";
  "./pages/social/index.js";
  "./pages/card-folder/card-folder.js";
  "./pages/setting/basic.js";
  "./pages/setting/social.js";
  "./pages/set/set.js";
  "./pages/set/feedback.js";
  "./pages/set/about.js";
  "./pages/set/switch-account.js";
  "./pages/tag-edit/tag-edit.js";
  "./pages/contact/contact.js";
  "./pages/social/publish.js";
  "./pages/social/message.js";
  "./pages/home/my-dynamic.js";
  "./pages/monthly-report/index.js";
  "./pages/friend-detail/friend-detail.js";
  "./pages/home/praise.js";
  "./pages/card-detail/card-detail.js";
  "./pages/praise-detail/praise-detail.js";
}
const _sfc_main = {
  globalData: {
    // 用户状态
    userStatus: {
      isLoggedIn: false,
      isGuest: false,
      userInfo: null
    },
    // 全局数据统计对象
    userStats: {
      viewedPosts: [],
      // 查看过的帖子ID列表
      likedPosts: [],
      // 点赞过的帖子ID列表
      commentedPosts: [],
      // 评论过的帖子ID列表
      addedFriends: []
      // 新添加的好友ID列表
    },
    // 浏览时长统计
    browseStartTime: null,
    totalBrowseTime: 0
    // 总浏览时长（分钟）
  },
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:24", "App Launch");
    this.initUserStats();
    this.initUserStatus();
    const _this = this;
    common_vendor.index.addInterceptor("navigateTo", {
      invoke: function(options) {
        if (!_this.checkPageAuth(options.url)) {
          throw new Error("无权限访问此页面");
        }
      },
      fail: function(err) {
        if (err && err.message === "无权限访问此页面") {
          common_vendor.index.showToast({
            title: "请先登录才能访问",
            icon: "none"
          });
        }
      }
    });
    function setupNavigationGuards() {
      function canAccessPage(url) {
        if (!_this.globalData) {
          _this.globalData = {};
        }
        if (!_this.globalData.userStatus) {
          _this.globalData.userStatus = {
            isLoggedIn: false,
            isGuest: false,
            userInfo: null
          };
        }
        const path = url.replace(/^\//, "").split("?")[0];
        const allowedPaths = [
          "pages/index/index",
          "pages/index/cover",
          "pages/setting/basic",
          "pages/setting/social",
          "pages/social/index",
          // 允许游客访问社交页面
          "pages/set/switch-account"
          // 允许游客访问切换账号页面
        ];
        if (allowedPaths.includes(path)) {
          return true;
        }
        const isLoggedIn = _this.globalData.userStatus.isLoggedIn;
        const isGuest = _this.globalData.userStatus.isGuest;
        if (!isLoggedIn || isGuest) {
          return false;
        }
        return true;
      }
      function handleUnauthorizedAccess() {
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
            } else if (res.cancel) {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }
          }
        });
      }
      common_vendor.index.addInterceptor("switchTab", {
        invoke: function(options) {
          if (options.url && options.url.includes("/pages/home/index")) {
            const isLoggedIn = _this.globalData.userStatus && _this.globalData.userStatus.isLoggedIn;
            const isGuest = _this.globalData.userStatus && _this.globalData.userStatus.isGuest;
            if (!isLoggedIn || isGuest) {
              common_vendor.index.showModal({
                title: "请先登录",
                content: "登录后可使用更多功能",
                showCancel: true,
                cancelText: "取消",
                confirmText: "去登录",
                success: function(res) {
                  if (res.confirm) {
                    common_vendor.index.navigateTo({
                      url: "/pages/setting/basic",
                      fail: function() {
                        common_vendor.index.reLaunch({
                          url: "/pages/index/cover"
                        });
                      }
                    });
                  } else if (res.cancel) {
                    common_vendor.index.switchTab({
                      url: "/pages/index/index"
                    });
                  }
                }
              });
              return;
            }
          }
          if (!canAccessPage(options.url)) {
            throw new Error("无权限访问此页面");
          }
        },
        fail: function(err) {
          if (err && err.message === "无权限访问此页面") {
            handleUnauthorizedAccess();
          }
        }
      });
      common_vendor.index.addInterceptor("navigateTo", {
        invoke: function(options) {
          if (!canAccessPage(options.url)) {
            throw new Error("无权限访问此页面");
          }
        },
        fail: function(err) {
          if (err && err.message === "无权限访问此页面") {
            handleUnauthorizedAccess();
          }
        }
      });
      common_vendor.index.addInterceptor("reLaunch", {
        invoke: function(options) {
          if (!canAccessPage(options.url)) {
            throw new Error("无权限访问此页面");
          }
        },
        fail: function(err) {
          if (err && err.message === "无权限访问此页面") {
            handleUnauthorizedAccess();
          }
        }
      });
      common_vendor.index.addInterceptor("redirectTo", {
        invoke: function(options) {
          if (!canAccessPage(options.url)) {
            throw new Error("无权限访问此页面");
          }
        },
        fail: function(err) {
          if (err && err.message === "无权限访问此页面") {
            handleUnauthorizedAccess();
          }
        }
      });
    }
    setupNavigationGuards();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:228", "App Show");
    this.globalData.browseStartTime = /* @__PURE__ */ new Date();
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:233", "App Hide");
    this.updateBrowseTime();
  },
  methods: {
    // 初始化用户统计数据
    initUserStats() {
      try {
        const viewedPosts = common_vendor.index.getStorageSync("viewedPosts") || [];
        const likedPosts = common_vendor.index.getStorageSync("likedPosts") || [];
        const commentedPosts = common_vendor.index.getStorageSync("commentedPosts") || [];
        const addedFriends = common_vendor.index.getStorageSync("addedFriends") || [];
        const totalBrowseTime = common_vendor.index.getStorageSync("totalBrowseTime") || 0;
        this.globalData.userStats = {
          viewedPosts,
          likedPosts,
          commentedPosts,
          addedFriends
        };
        this.globalData.totalBrowseTime = totalBrowseTime;
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:257", "初始化统计数据失败:", error);
      }
    },
    // 更新浏览时长
    updateBrowseTime() {
      if (this.globalData.browseStartTime) {
        const now = /* @__PURE__ */ new Date();
        const durationMinutes = (now - this.globalData.browseStartTime) / (1e3 * 60);
        if (durationMinutes > 1) {
          this.globalData.totalBrowseTime += Math.floor(durationMinutes);
          try {
            common_vendor.index.setStorageSync("totalBrowseTime", this.globalData.totalBrowseTime);
          } catch (error) {
            common_vendor.index.__f__("error", "at App.vue:273", "保存浏览时长失败:", error);
          }
        }
        this.globalData.browseStartTime = null;
      }
    },
    // 记录帖子浏览
    recordPostView(postId) {
      if (!this.globalData.userStats.viewedPosts.includes(postId)) {
        this.globalData.userStats.viewedPosts.push(postId);
        try {
          common_vendor.index.setStorageSync("viewedPosts", this.globalData.userStats.viewedPosts);
        } catch (error) {
          common_vendor.index.__f__("error", "at App.vue:288", "保存浏览记录失败:", error);
        }
      }
    },
    // 记录帖子点赞
    recordPostLike(postId, isLike) {
      const index = this.globalData.userStats.likedPosts.indexOf(postId);
      if (isLike && index === -1) {
        this.globalData.userStats.likedPosts.push(postId);
      } else if (!isLike && index > -1) {
        this.globalData.userStats.likedPosts.splice(index, 1);
      }
      try {
        common_vendor.index.setStorageSync("likedPosts", this.globalData.userStats.likedPosts);
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:307", "保存点赞记录失败:", error);
      }
    },
    // 记录帖子评论
    recordPostComment(postId) {
      if (!this.globalData.userStats.commentedPosts.includes(postId)) {
        this.globalData.userStats.commentedPosts.push(postId);
        try {
          common_vendor.index.setStorageSync("commentedPosts", this.globalData.userStats.commentedPosts);
        } catch (error) {
          common_vendor.index.__f__("error", "at App.vue:319", "保存评论记录失败:", error);
        }
      }
    },
    // 记录添加好友
    recordAddFriend(friendId) {
      if (!this.globalData.userStats.addedFriends.includes(friendId)) {
        this.globalData.userStats.addedFriends.push(friendId);
        try {
          common_vendor.index.setStorageSync("addedFriends", this.globalData.userStats.addedFriends);
        } catch (error) {
          common_vendor.index.__f__("error", "at App.vue:332", "保存好友记录失败:", error);
        }
      }
    },
    // 获取用户月度统计数据
    getMonthlyStats() {
      const now = /* @__PURE__ */ new Date();
      now.getFullYear();
      now.getMonth();
      return {
        postViews: this.globalData.userStats.viewedPosts.length,
        postLikes: this.globalData.userStats.likedPosts.length,
        commentCount: this.globalData.userStats.commentedPosts.length,
        friendCount: this.globalData.userStats.addedFriends.length,
        browseTime: this.globalData.totalBrowseTime
      };
    },
    // 初始化用户状态
    initUserStatus() {
      try {
        const isGuest = common_vendor.index.getStorageSync("isGuest");
        let userInfo = null;
        const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (storedUserInfo) {
          userInfo = typeof storedUserInfo === "string" ? JSON.parse(storedUserInfo) : storedUserInfo;
        }
        this.globalData.userStatus = {
          isLoggedIn: !!userInfo,
          isGuest: !!isGuest,
          userInfo
        };
        if (!!userInfo && !isGuest) {
          this.syncUserToDatabase();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:382", "初始化用户状态失败:", error);
        this.globalData.userStatus = {
          isLoggedIn: false,
          isGuest: false,
          userInfo: null
        };
      }
    },
    // 同步用户数据到数据库
    syncUserToDatabase() {
      common_vendor.index.__f__("log", "at App.vue:394", "开始同步用户数据到数据库...");
      utils_userService.userService.syncLocalUserToDatabase().then((result) => {
        if (result.success) {
          common_vendor.index.__f__("log", "at App.vue:398", "用户数据同步成功:", result.message);
          if (result.userId) {
            const userInfo = this.globalData.userStatus.userInfo;
            if (userInfo) {
              userInfo.userId = result.userId;
              this.globalData.userStatus.userInfo = userInfo;
            }
          }
        } else {
          common_vendor.index.__f__("log", "at App.vue:408", "用户数据同步失败:", result.message || result.error);
        }
      }).catch((error) => {
        common_vendor.index.__f__("error", "at App.vue:412", "用户数据同步异常:", error);
      });
    },
    // 检查是否为游客登录
    isGuestLogin() {
      return this.globalData.userStatus.isGuest && this.globalData.userStatus.isLoggedIn;
    },
    // 检查是否为正式登录
    isRegularLogin() {
      return this.globalData.userStatus.isLoggedIn && !this.globalData.userStatus.isGuest;
    },
    // 检查是否需要登录
    requireLogin(showToast = true) {
      if (!this.globalData.userStatus.isLoggedIn) {
        if (showToast) {
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
        return false;
      }
      return true;
    },
    // 检查是否需要正式登录（非游客）
    requireRegularLogin(showToast = true) {
      if (!this.requireLogin(showToast)) {
        return false;
      }
      if (this.isGuestLogin()) {
        if (showToast) {
          common_vendor.index.showModal({
            title: "需要登录账号",
            content: "请先注册登录，再使用此功能",
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
        return false;
      }
      return true;
    },
    // 检查页面访问权限
    checkPageAuth(url) {
      if (!this.globalData || !this.globalData.userStatus) {
        this.globalData = this.globalData || {};
        this.globalData.userStatus = {
          isLoggedIn: false,
          isGuest: false,
          userInfo: null
        };
      }
      const path = url.replace(/^\//, "").split("?")[0];
      const isGuest = this.globalData.userStatus.isGuest;
      const isLoggedIn = this.globalData.userStatus.isLoggedIn;
      const isRegularUser = isLoggedIn && !isGuest;
      if (isRegularUser) {
        return true;
      }
      const allowedPaths = [
        "pages/index/index",
        "pages/index/cover",
        "pages/setting/basic",
        "pages/setting/social",
        "pages/monthly-report/index",
        // 允许游客访问月度报告
        "pages/social/index",
        // 允许游客访问社交页面的为你推荐
        "pages/set/switch-account"
        // 允许游客访问切换账号页面
      ];
      if (allowedPaths.includes(path)) {
        return true;
      }
      if (!isLoggedIn || isGuest) {
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
            } else if (res.cancel) {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }
          }
        });
        return false;
      }
      return true;
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
