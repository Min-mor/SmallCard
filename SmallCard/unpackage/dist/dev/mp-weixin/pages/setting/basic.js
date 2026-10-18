"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 用户输入的信息（独立存储）
      userInfo: {
        avatarUrl: "",
        userName: "",
        userIntro: ""
      },
      // 吉梨的默认信息（固定不变）
      defaultInfo: {
        avatarUrl: "",
        userName: "吉梨",
        userIntro: "00后intp 产品设计ios开发 做好产品，交好朋友"
      }
    };
  },
  onLoad() {
    this.loadUserInfo();
    this.checkAndSaveNewUser();
  },
  methods: {
    // 检查并保存新用户到历史账号列表
    checkAndSaveNewUser() {
      try {
        let currentUser = null;
        const storedUser = common_vendor.index.getStorageSync("userInfo");
        if (storedUser) {
          currentUser = typeof storedUser === "string" ? JSON.parse(storedUser) : storedUser;
        }
        if (!currentUser || (!currentUser.id || currentUser.id.startsWith("guest_"))) {
          common_vendor.index.__f__("log", "at pages/setting/basic.vue:104", "检测到新用户或游客，将初始化并保存到历史账号");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/basic.vue:108", "检查新用户状态失败:", error);
      }
    },
    // 加载用户信息
    loadUserInfo() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
          if (this.userInfo.name) {
            this.userInfo.userName = this.userInfo.name;
          }
          this.saveToHistoryAccounts();
        } else {
          this.userInfo = {
            id: `user_${Date.now()}`,
            // 生成唯一ID
            userName: this.defaultInfo.userName,
            userIntro: this.defaultInfo.userIntro,
            avatarUrl: ""
          };
          this.saveToHistoryAccounts();
          common_vendor.index.__f__("log", "at pages/setting/basic.vue:135", "创建了新用户并保存到历史账号列表");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/basic.vue:138", "加载用户信息失败:", error);
        this.userInfo = {
          id: `user_${Date.now()}`,
          userName: this.defaultInfo.userName,
          userIntro: this.defaultInfo.userIntro,
          avatarUrl: ""
        };
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.userInfo.avatarUrl = res.tempFilePaths[0];
        }
      });
    },
    // 保存用户信息到本地存储
    saveUserInfo() {
      try {
        if (!this.userInfo.userName || this.userInfo.userName.trim() === "") {
          common_vendor.index.showToast({
            title: "用户名不能为空",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        const historySaveSuccess = this.saveToHistoryAccounts();
        if (!historySaveSuccess) {
          return;
        }
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(this.userInfo));
        const app = getApp();
        if (app && app.globalData) {
          if (app.globalData.userStatus) {
            app.globalData.userStatus.isLoggedIn = true;
            app.globalData.userStatus.isGuest = false;
            app.globalData.userStatus.userInfo = this.userInfo;
          } else {
            app.globalData.userStatus = {
              isLoggedIn: true,
              isGuest: false,
              userInfo: this.userInfo
            };
          }
        }
        common_vendor.index.$emit("userInfoUpdated", this.userInfo);
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success",
          duration: 800,
          complete: () => {
            common_vendor.index.navigateTo({
              url: "/pages/setting/social",
              success: () => {
                common_vendor.index.__f__("log", "at pages/setting/basic.vue:214", "跳转到社交设置页面成功");
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/setting/basic.vue:217", "跳转失败:", err);
                common_vendor.index.reLaunch({
                  url: "/pages/setting/social"
                });
              }
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/basic.vue:227", "保存用户信息失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    },
    // 复制吉梨的信息
    copyDefaultCard() {
      const { userName, userIntro } = this.defaultInfo;
      common_vendor.index.setClipboardData({
        data: `${userName}
${userIntro}`,
        success: () => {
          common_vendor.index.showToast({
            title: "复制吉梨信息成功",
            icon: "success"
          });
        }
      });
    },
    // 保存到历史账号列表
    saveToHistoryAccounts() {
      try {
        const accountInfo = {
          userId: this.userInfo.id || `user_${Date.now()}`,
          username: this.userInfo.userName || this.defaultInfo.userName,
          nickname: this.userInfo.userName || this.defaultInfo.userName,
          avatar: this.userInfo.avatarUrl || "",
          lastLoginTime: (/* @__PURE__ */ new Date()).toISOString()
        };
        let historyAccounts = [];
        const storedAccounts = common_vendor.index.getStorageSync("historyAccounts");
        if (storedAccounts) {
          historyAccounts = typeof storedAccounts === "string" ? JSON.parse(storedAccounts) : storedAccounts;
          if (!Array.isArray(historyAccounts)) {
            historyAccounts = [];
          }
        }
        const existingUserIdIndex = historyAccounts.findIndex(
          (account) => account.userId === accountInfo.userId
        );
        if (existingUserIdIndex !== -1) {
          historyAccounts[existingUserIdIndex] = accountInfo;
          const updatedAccount = historyAccounts.splice(existingUserIdIndex, 1)[0];
          historyAccounts.unshift(updatedAccount);
        } else {
          const existingUsernameIndex = historyAccounts.findIndex(
            (account) => account.username === accountInfo.username && account.userId !== accountInfo.userId
          );
          if (existingUsernameIndex !== -1) {
            common_vendor.index.showToast({
              title: "该用户名已被其他账号使用，请选择不同的用户名",
              icon: "none",
              duration: 2e3
            });
            return false;
          }
          historyAccounts.unshift(accountInfo);
        }
        if (historyAccounts.length > 5) {
          historyAccounts = historyAccounts.slice(0, 5);
        }
        common_vendor.index.setStorageSync("historyAccounts", JSON.stringify(historyAccounts));
        common_vendor.index.__f__("log", "at pages/setting/basic.vue:309", "保存到历史账号列表成功:", accountInfo);
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/basic.vue:312", "保存到历史账号列表失败:", error);
        return false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatarUrl
  }, $data.userInfo.avatarUrl ? {
    b: $data.userInfo.avatarUrl
  } : {}, {
    c: $data.userInfo.avatarUrl
  }, $data.userInfo.avatarUrl ? {} : {}, {
    d: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args)),
    e: $data.userInfo.userName,
    f: common_vendor.o(($event) => $data.userInfo.userName = $event.detail.value),
    g: $data.userInfo.userIntro,
    h: common_vendor.o(($event) => $data.userInfo.userIntro = $event.detail.value),
    i: $data.defaultInfo.avatarUrl || "/static/icon/我的.png",
    j: common_vendor.t($data.defaultInfo.userName),
    k: common_vendor.t($data.defaultInfo.userIntro),
    l: common_vendor.o((...args) => $options.copyDefaultCard && $options.copyDefaultCard(...args)),
    m: common_vendor.o((...args) => $options.saveUserInfo && $options.saveUserInfo(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-08c11a46"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/basic.js.map
