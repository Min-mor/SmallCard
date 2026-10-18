"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      feedbackContent: "",
      // 反馈内容
      fileName: "",
      // 选中的文件名
      fileTempPath: ""
      // 文件临时路径
    };
  },
  methods: {
    // 返回上一页（设置页面）
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 选择文件（支持图片/文档）
    chooseFile() {
      common_vendor.index.chooseFile({
        count: 11,
        // 仅允许选择1个文件
        type: "all",
        // 允许所有类型文件
        success: (res) => {
          this.fileTempPath = res.tempFilePaths[0];
          this.fileName = res.tempFilePaths[0].split("/").pop();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/set/feedback.vue:65", "选择文件失败", err);
        }
      });
    },
    // 提交反馈
    submitFeedback() {
      if (!this.feedbackContent.trim()) {
        common_vendor.index.showToast({
          title: "请输入反馈内容",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "反馈发送成功，感谢您的支持！",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => {
          this.goBack();
        }, 2e3);
      }, 1500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_assets._imports_0$3,
    c: $data.feedbackContent,
    d: common_vendor.o(($event) => $data.feedbackContent = $event.detail.value),
    e: common_vendor.o((...args) => $options.chooseFile && $options.chooseFile(...args)),
    f: $data.fileName
  }, $data.fileName ? {
    g: common_vendor.t($data.fileName)
  } : {}, {
    h: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-58d78baa"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/set/feedback.js.map
