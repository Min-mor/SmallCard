"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      historyAccounts: []
      // 历史账号列表
    };
  },
  onLoad() {
    this.loadHistoryAccounts();
  },
  methods: {
    // 加载历史账号
    loadHistoryAccounts() {
      try {
        const storedAccounts = common_vendor.index.getStorageSync("historyAccounts");
        if (storedAccounts) {
          this.historyAccounts = typeof storedAccounts === "string" ? JSON.parse(storedAccounts) : storedAccounts;
          if (!Array.isArray(this.historyAccounts)) {
            this.historyAccounts = [];
          }
        }
        if (this.historyAccounts.length === 0) {
          this.addMockAccountsForTest();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/set/switch-account.vue:60", "加载历史账号失败:", error);
        this.historyAccounts = [];
        this.addMockAccountsForTest();
      }
    },
    // 添加模拟账号数据用于测试
    addMockAccountsForTest() {
      const timestamp = Date.now();
      this.historyAccounts = [
        {
          userId: `user_001_${timestamp}`,
          username: `吉梨_${timestamp}`,
          nickname: `吉梨_${timestamp}`,
          // 统一使用avatarUrl字段，同时保留avatar字段以便兼容旧数据
          avatar: "/static/icon/我的.png",
          avatarUrl: "/static/icon/我的.png",
          lastLoginTime: new Date(Date.now() - 864e5).toISOString()
        },
        {
          userId: `user_002_${timestamp}`,
          username: `张三_${timestamp}`,
          nickname: `张三_${timestamp}`,
          // 统一使用avatarUrl字段，同时保留avatar字段以便兼容旧数据
          avatar: "/static/photo/张三.jpg",
          avatarUrl: "/static/photo/张三.jpg",
          lastLoginTime: new Date(Date.now() - 1728e5).toISOString()
        },
        {
          userId: `user_003_${timestamp}`,
          username: `李四_${timestamp}`,
          nickname: `李四_${timestamp}`,
          // 统一使用avatarUrl字段，同时保留avatar字段以便兼容旧数据
          avatar: "/static/photo/李四.jpg",
          avatarUrl: "/static/photo/李四.jpg",
          lastLoginTime: new Date(Date.now() - 2592e5).toISOString()
        }
      ];
      common_vendor.index.__f__("log", "at pages/set/switch-account.vue:100", "添加模拟账号数据用于测试");
    },
    // 删除历史账号
    deleteAccount(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个历史账号吗？",
        success: (res) => {
          if (res.confirm) {
            this.historyAccounts.splice(index, 1);
            this.saveHistoryAccounts();
            common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          }
        }
      });
    },
    // 保存历史账号到本地存储
    saveHistoryAccounts() {
      try {
        const cleanedAccounts = this.ensureUsernameUniqueness(this.historyAccounts);
        common_vendor.index.setStorageSync("historyAccounts", JSON.stringify(cleanedAccounts));
        this.historyAccounts = cleanedAccounts;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/set/switch-account.vue:127", "保存历史账号失败:", error);
      }
    },
    // 确保历史账号列表中的用户名唯一性
    ensureUsernameUniqueness(accounts) {
      const usernameMap = /* @__PURE__ */ new Map();
      const result = [];
      const sortedAccounts = [...accounts].sort((a, b) => {
        const timeA = new Date(a.lastLoginTime || 0).getTime();
        const timeB = new Date(b.lastLoginTime || 0).getTime();
        return timeB - timeA;
      });
      sortedAccounts.forEach((account) => {
        const originalUsername = account.username || account.nickname || "未知用户";
        if (!usernameMap.has(originalUsername)) {
          usernameMap.set(originalUsername, true);
          result.push(account);
        } else {
          const uniqueUsername = `${originalUsername}_${account.userId.substring(0, 4)}`;
          const updatedAccount = {
            ...account,
            username: uniqueUsername,
            nickname: uniqueUsername
          };
          usernameMap.set(uniqueUsername, true);
          result.push(updatedAccount);
        }
      });
      return result;
    },
    // 选择历史账号登录 - 直接点击登录，不再弹出确认框
    selectAccount(account) {
      this.switchToAccount(account);
    },
    // 切换到选中的账号
    switchToAccount(account) {
      try {
        let currentUserInfo = {};
        const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (storedUserInfo) {
          currentUserInfo = typeof storedUserInfo === "string" ? JSON.parse(storedUserInfo) : storedUserInfo;
        }
        if (currentUserInfo.id && currentUserInfo.id !== account.userId) {
          const allAccounts = common_vendor.index.getStorageSync("historyAccounts");
          if (allAccounts) {
            const historyAccounts = typeof allAccounts === "string" ? JSON.parse(allAccounts) : allAccounts;
            if (Array.isArray(historyAccounts)) {
              const conflictingAccounts = historyAccounts.filter(
                (acc) => acc.username === account.username && acc.userId !== account.userId
              );
              if (conflictingAccounts.length > 0) {
                common_vendor.index.__f__("warn", "at pages/set/switch-account.vue:198", "发现用户名冲突:", account.username, conflictingAccounts);
                account.username = `${account.username}_${account.userId.substring(0, 4)}`;
                account.nickname = account.username;
              }
            }
          }
        }
        const userInfo = {
          id: account.userId,
          userName: account.username,
          nickname: account.nickname,
          // 优先使用avatarUrl，若不存在则使用avatar字段，确保头像正确显示
          avatarUrl: account.avatarUrl || account.avatar,
          // 同时保留avatar字段以兼容旧代码
          avatar: account.avatar || account.avatarUrl,
          isGuest: false,
          lastLoginTime: (/* @__PURE__ */ new Date()).toISOString()
        };
        common_vendor.index.removeStorageSync("isGuest");
        try {
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/set/switch-account.vue:227", "保存用户信息失败:", error);
          const simplifiedUserInfo = {
            id: account.userId,
            userName: account.username,
            nickname: account.nickname
          };
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(simplifiedUserInfo));
        }
        const app = getApp();
        if (app && app.globalData) {
          if (app.globalData.userStatus) {
            app.globalData.userStatus.isLoggedIn = true;
            app.globalData.userStatus.isGuest = false;
            app.globalData.userStatus.userInfo = userInfo;
          } else {
            app.globalData.userStatus = {
              isLoggedIn: true,
              isGuest: false,
              userInfo
            };
          }
          if (app.syncUserToDatabase) {
            app.syncUserToDatabase();
          }
        }
        const index = this.historyAccounts.findIndex((acc) => acc.userId === account.userId);
        if (index !== -1) {
          this.historyAccounts[index].lastLoginTime = userInfo.lastLoginTime;
          this.historyAccounts[index].username = userInfo.userName;
          this.historyAccounts[index].nickname = userInfo.userName;
          const loggedAccount = this.historyAccounts.splice(index, 1)[0];
          this.historyAccounts.unshift(loggedAccount);
          this.saveHistoryAccounts();
        }
        common_vendor.index.__f__("log", "at pages/set/switch-account.vue:270", "切换账号成功:", userInfo);
        common_vendor.index.reLaunch({
          url: "/pages/index/index",
          success: () => {
            common_vendor.index.showToast({
              title: "账号切换成功",
              icon: "success"
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/set/switch-account.vue:282", "切换账号后跳转失败:", err);
            common_vendor.index.showToast({
              title: "跳转失败，请重试",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/set/switch-account.vue:290", "切换账号失败:", error);
        common_vendor.index.showToast({
          title: "账号切换失败，请重试",
          icon: "none"
        });
      }
    },
    // 去登录新账号
    gotoLogin() {
      common_vendor.index.removeStorageSync("userToken");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.reLaunch({
        url: "/pages/index/cover",
        success: () => {
          common_vendor.index.showToast({
            title: "请选择账号登录",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.historyAccounts.length > 0
  }, $data.historyAccounts.length > 0 ? {
    b: common_vendor.f($data.historyAccounts, (account, index, i0) => {
      return {
        a: account.avatar || account.avatarUrl || "/static/icon/我的.png",
        b: common_vendor.t(account.username || account.nickname || "未知用户"),
        c: common_vendor.t(account.userId || "N/A"),
        d: common_vendor.o(($event) => $options.selectAccount(account), index),
        e: common_vendor.o(($event) => $options.deleteAccount(index), index),
        f: index
      };
    })
  } : {}, {
    c: common_vendor.o((...args) => $options.gotoLogin && $options.gotoLogin(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d9134ac8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/set/switch-account.js.map
