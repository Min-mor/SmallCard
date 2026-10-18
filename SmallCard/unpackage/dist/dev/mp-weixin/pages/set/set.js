"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      notificationEnabled: true
    };
  },
  onLoad() {
    try {
      const savedState = common_vendor.index.getStorageSync("notificationEnabled");
      if (typeof savedState === "boolean") {
        this.notificationEnabled = savedState;
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/set/set.vue:94", "读取通知设置失败:", error);
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 切换账号逻辑 - 跳转到切换账号页面
    switchAccount() {
      common_vendor.index.navigateTo({
        url: "/pages/set/switch-account",
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/set/set.vue:107", "跳转到切换账号页面失败:", err);
          common_vendor.index.showToast({ title: "切换账号功能暂不可用", icon: "none" });
        }
      });
    },
    // 跳转到反馈页面
    goToFeedback() {
      common_vendor.index.navigateTo({
        url: "/pages/set/feedback",
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/set/set.vue:117", "跳转失败:", err);
          common_vendor.index.showToast({ title: "反馈页面暂不可用", icon: "none" });
        }
      });
    },
    // 跳转到关于我们页面
    goToAbout() {
      common_vendor.index.navigateTo({
        url: "/pages/set/about",
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/set/set.vue:127", "跳转失败:", err);
          common_vendor.index.showToast({ title: "关于我们页面暂不可用", icon: "none" });
        }
      });
    },
    // 通知开关状态变化
    onNotificationChange(e) {
      this.notificationEnabled = e.detail.value;
      common_vendor.index.setStorageSync("notificationEnabled", this.notificationEnabled);
      common_vendor.index.showToast({
        title: this.notificationEnabled ? "通知已开启" : "通知已关闭",
        icon: "none"
      });
    },
    // 退出登录确认 - 自定义弹窗样式
    showLogoutConfirm() {
      const modal = {
        title: "退出账号",
        content: "退出账号后无法收到任何消息通知",
        buttons: [
          { text: "退出登录", type: "primary" },
          { text: "取消", type: "default" }
        ],
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.removeStorageSync("userToken");
              common_vendor.index.removeStorageSync("userInfo");
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/index/cover",
                  success: () => {
                    common_vendor.index.showToast({
                      title: "已退出登录",
                      icon: "none",
                      duration: 1500
                    });
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/set/set.vue:171", "跳转主页面失败:", err);
                    common_vendor.index.showToast({
                      title: "退出失败，请重试",
                      icon: "none"
                    });
                  }
                });
              }, 100);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/set/set.vue:180", "退出登录出错:", error);
              common_vendor.index.showToast({
                title: "退出失败，请重试",
                icon: "none"
              });
            }
          }
        }
      };
      common_vendor.index.showModal({
        title: modal.title,
        content: modal.content,
        confirmText: modal.buttons[0].text,
        cancelText: modal.buttons[1].text,
        success: (res) => {
          if (res.confirm) {
            modal.success({ confirm: true });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_assets._imports_0$3,
    c: common_assets._imports_1$3,
    d: common_assets._imports_1$4,
    e: common_vendor.o((...args) => $options.switchAccount && $options.switchAccount(...args)),
    f: common_assets._imports_1$2,
    g: $data.notificationEnabled,
    h: common_vendor.o((...args) => $options.onNotificationChange && $options.onNotificationChange(...args)),
    i: common_assets._imports_4,
    j: common_assets._imports_1$4,
    k: common_vendor.o((...args) => $options.goToFeedback && $options.goToFeedback(...args)),
    l: common_assets._imports_5$1,
    m: common_assets._imports_1$4,
    n: common_vendor.o((...args) => $options.goToAbout && $options.goToAbout(...args)),
    o: common_vendor.o((...args) => $options.showLogoutConfirm && $options.showLogoutConfirm(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8936fe0d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/set/set.js.map
