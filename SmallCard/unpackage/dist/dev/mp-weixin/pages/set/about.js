"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      appVersion: "1.0.0",
      isCheckingUpdate: false
    };
  },
  onLoad() {
    this.getAppVersion();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 获取应用版本号
    getAppVersion() {
      try {
        this.appVersion = "1.0.0";
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/set/about.vue:71", "获取版本号失败:", error);
      }
    },
    // 检查更新
    checkUpdate() {
      if (this.isCheckingUpdate)
        return;
      this.isCheckingUpdate = true;
      common_vendor.index.showLoading({ title: "检查更新中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        this.isCheckingUpdate = false;
        common_vendor.index.showModal({
          title: "检查结果",
          content: "当前已是最新版本",
          showCancel: false,
          confirmText: "确定"
        });
      }, 1500);
    },
    // 打开隐私政策
    openPrivacyPolicy() {
      common_vendor.index.navigateTo({
        url: "/pages/set/privacy-policy",
        fail: () => {
          common_vendor.index.showToast({ title: "隐私政策页面暂不可用", icon: "none" });
        }
      });
    },
    // 打开用户协议
    openUserAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/set/user-agreement",
        fail: () => {
          common_vendor.index.showToast({ title: "用户协议页面暂不可用", icon: "none" });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_assets._imports_0$3,
    c: common_vendor.t($data.appVersion),
    d: common_assets._imports_1$4,
    e: common_vendor.o((...args) => $options.checkUpdate && $options.checkUpdate(...args)),
    f: common_assets._imports_1$4,
    g: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args)),
    h: common_assets._imports_1$4,
    i: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-60c8d12b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/set/about.js.map
