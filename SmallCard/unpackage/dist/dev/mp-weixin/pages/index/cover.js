"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isPageReady: false,
      preloadAssets: [
        "/static/image/登录注册.png",
        "/static/icon/default-avatar.png"
      ],
      preloadCount: 0
    };
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/index/cover.vue:27", "封面页加载开始");
    this.preloadResources();
    try {
      common_vendor.index.removeStorageSync("tempCacheKey");
    } catch (e) {
      common_vendor.index.__f__("log", "at pages/index/cover.vue:35", "清除缓存失败:", e);
    }
    this.isPageReady = true;
  },
  methods: {
    // 预加载关键资源
    preloadResources() {
      common_vendor.index.__f__("log", "at pages/index/cover.vue:44", "开始预加载资源");
      this.preloadCount = 0;
      this.preloadAssets.forEach((asset) => {
        common_vendor.index.getImageInfo({
          src: asset,
          success: () => {
            common_vendor.index.__f__("log", "at pages/index/cover.vue:51", "成功预加载资源:", asset);
            this.preloadCount++;
          },
          fail: (err) => {
            common_vendor.index.__f__("warn", "at pages/index/cover.vue:55", "预加载资源失败:", asset, err);
          }
        });
      });
    },
    // 重试加载页面
    retryPageLoad() {
      common_vendor.index.__f__("log", "at pages/index/cover.vue:63", "尝试重新加载页面");
      common_vendor.index.hideLoading();
      common_vendor.index.reLaunch({
        url: "/pages/index/cover"
      });
    },
    goToSetting() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/basic"
      });
    },
    goToLoginExistingAccount() {
      common_vendor.index.navigateTo({
        url: "/pages/set/switch-account",
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/cover.vue:78", "跳转到登录已有账号页面失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败，请重试",
            icon: "none"
          });
        }
      });
    },
    guestLogin() {
      try {
        common_vendor.index.setStorageSync("isGuest", true);
        common_vendor.index.setStorageSync("userInfo", JSON.stringify({
          nickname: "游客",
          // 同时设置avatar和avatarUrl字段，确保字段命名一致性
          avatar: "",
          avatarUrl: "",
          isGuest: true
        }));
        common_vendor.index.switchTab({
          url: "/pages/index/index",
          success: () => {
            common_vendor.index.__f__("log", "at pages/index/cover.vue:102", "游客登录成功，跳转到首页");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/index/cover.vue:105", "游客登录跳转失败:", err);
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/cover.vue:113", "游客登录出错:", error);
        common_vendor.index.showToast({
          title: "游客登录失败，请重试",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $options.goToSetting && $options.goToSetting(...args)),
    c: common_vendor.o((...args) => $options.goToLoginExistingAccount && $options.goToLoginExistingAccount(...args)),
    d: common_vendor.o((...args) => $options.guestLogin && $options.guestLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-06cb2e30"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/cover.js.map
