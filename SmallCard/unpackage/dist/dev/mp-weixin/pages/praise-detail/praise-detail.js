"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      praiseContent: "",
      uploadIcon: "",
      canSend: false
    };
  },
  onLoad(options) {
    this.cardId = options.cardId || "";
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    handleInput() {
      this.validateContent();
    },
    validateContent() {
      this.canSend = this.praiseContent.trim().length > 0 || !!this.uploadIcon;
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadIcon = res.tempFilePaths[0];
          this.validateContent();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/praise-detail/praise-detail.vue:80", "选择图片失败:", err);
        }
      });
    },
    sendPraise() {
      this.validateContent();
      if (!this.canSend) {
        common_vendor.index.showToast({
          title: "内容不能为空",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/praise-detail/praise-detail.vue:96", "发送夸夸:", {
        cardId: this.cardId,
        content: this.praiseContent,
        image: this.uploadIcon
      });
      common_vendor.index.showToast({
        title: "夸夸发送成功!",
        icon: "success",
        duration: 2e3,
        success: () => {
          setTimeout(() => {
            common_vendor.index.navigateBack({
              delta: 1,
              success: () => {
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 2];
                if (prevPage) {
                  prevPage.$vm.addPraiseMessage(this.praiseContent, this.uploadIcon);
                }
              }
            });
          }, 2e3);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_assets._imports_1$6,
    d: common_vendor.o([($event) => $data.praiseContent = $event.detail.value, (...args) => $options.handleInput && $options.handleInput(...args)]),
    e: $data.praiseContent,
    f: !$data.uploadIcon
  }, !$data.uploadIcon ? {
    g: common_assets._imports_2$1
  } : {
    h: $data.uploadIcon
  }, {
    i: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    j: !$data.canSend,
    k: common_vendor.o((...args) => $options.sendPraise && $options.sendPraise(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-82c360a2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/praise-detail/praise-detail.js.map
