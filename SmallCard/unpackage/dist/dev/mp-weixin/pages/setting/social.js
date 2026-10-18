"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 给每个社交平台添加唯一标识，便于在contact页面对应展示
      socialList: [
        { id: "social1", name: "社交平台1", icon: "/static/icon/社交媒体1.png", link: "" },
        { id: "social2", name: "社交平台2", icon: "/static/icon/社交媒体2.png", link: "" },
        { id: "social3", name: "社交平台3", icon: "/static/icon/社交媒体3.png", link: "" },
        { id: "social4", name: "社交平台4", icon: "/static/icon/社交媒体4.png", link: "" },
        { id: "social5", name: "社交平台5", icon: "/static/icon/社交媒体5.png", link: "" }
      ]
    };
  },
  onLoad() {
    this.loadSocialLinks();
  },
  methods: {
    // 加载本地存储的社交链接
    loadSocialLinks() {
      try {
        const storedSocialStr = common_vendor.index.getStorageSync("socialLinks");
        let storedSocial = [];
        if (storedSocialStr) {
          storedSocial = typeof storedSocialStr === "string" ? JSON.parse(storedSocialStr) : storedSocialStr;
        }
        if (storedSocial && Array.isArray(storedSocial) && storedSocial.length) {
          this.socialList = this.socialList.map((item) => {
            const storedItem = storedSocial.find((s) => s.id === item.id);
            return storedItem ? { ...item, link: storedItem.link } : item;
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/social.vue:58", "加载社交链接失败:", error);
      }
    },
    // 清除输入框内容的方法
    clearInput(index) {
      this.socialList[index].link = "";
    },
    goToNext() {
      try {
        common_vendor.index.setStorageSync("socialLinks", JSON.stringify(this.socialList));
        this.updateUserStatus();
        const app = getApp();
        if (app && app.syncUserToDatabase) {
          app.syncUserToDatabase();
        }
        common_vendor.index.__f__("log", "at pages/setting/social.vue:81", "保存的链接:", this.socialList);
        common_vendor.index.showToast({
          title: "注册成功",
          icon: "success",
          duration: 1500,
          complete: () => {
            common_vendor.index.switchTab({
              url: "/pages/home/index",
              success: () => {
                common_vendor.index.__f__("log", "at pages/setting/social.vue:93", '跳转到"我的"页面成功');
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/setting/social.vue:96", "跳转失败:", err);
                common_vendor.index.reLaunch({
                  url: "/pages/home/index"
                });
              }
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/social.vue:106", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    },
    goToHome() {
      try {
        common_vendor.index.setStorageSync("socialLinks", JSON.stringify(this.socialList));
        this.updateUserStatus();
        common_vendor.index.switchTab({
          url: "/pages/home/index",
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/setting/social.vue:126", "跳转失败:", err);
            common_vendor.index.reLaunch({
              url: "/pages/home/index"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/social.vue:134", "操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    },
    // 更新用户状态为正式登录
    updateUserStatus() {
      try {
        const userInfoData = common_vendor.index.getStorageSync("userInfo");
        let userInfo = {};
        if (userInfoData) {
          if (typeof userInfoData === "string") {
            try {
              userInfo = JSON.parse(userInfoData);
            } catch (e) {
              userInfo = userInfoData;
            }
          } else {
            userInfo = userInfoData;
          }
        }
        userInfo.isGuest = false;
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
        common_vendor.index.removeStorageSync("isGuest");
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus) {
          app.globalData.userStatus.isLoggedIn = true;
          app.globalData.userStatus.isGuest = false;
          app.globalData.userStatus.userInfo = userInfo;
        }
        common_vendor.index.__f__("log", "at pages/setting/social.vue:178", "用户状态已更新为正式登录");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/setting/social.vue:180", "更新用户状态失败:", error);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.socialList, (item, index, i0) => {
      return {
        a: item.icon,
        b: item.link,
        c: common_vendor.o(($event) => item.link = $event.detail.value, index),
        d: common_vendor.o(($event) => $options.clearInput(index), index),
        e: index
      };
    }),
    b: common_vendor.o((...args) => $options.goToNext && $options.goToNext(...args)),
    c: common_vendor.o((...args) => $options.goToHome && $options.goToHome(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f1ad5840"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/social.js.map
