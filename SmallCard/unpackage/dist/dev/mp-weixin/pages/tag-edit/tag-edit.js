"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userIntro: "",
      currentDo: "",
      role: "",
      region: "",
      pronoun: ""
    };
  },
  onLoad() {
    const userInfo = common_vendor.index.getStorageSync("userInfo");
    if (userInfo) {
      this.userIntro = userInfo.userIntro || "";
      if (userInfo.userTag) {
        const tagArr = userInfo.userTag.split("\n");
        this.currentDo = tagArr[0] || "";
        this.role = tagArr[1] || "";
        this.region = tagArr[2] || "";
        this.pronoun = tagArr[3] || "";
      }
    }
  },
  methods: {
    // 保存标签和简介，按行排列（用换行符连接）
    saveTag() {
      const tagStr = [this.currentDo, this.role, this.region, this.pronoun].filter((item) => item.trim()).join("\n");
      common_vendor.index.$emit("userInfoUpdated", {
        userTag: tagStr,
        userIntro: this.userIntro.trim() || "我要浦到天光"
      });
      common_vendor.index.showToast({ title: "标签与简介已更新", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 800);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userIntro,
    b: common_vendor.o(($event) => $data.userIntro = $event.detail.value),
    c: $data.currentDo,
    d: common_vendor.o(($event) => $data.currentDo = $event.detail.value),
    e: $data.role,
    f: common_vendor.o(($event) => $data.role = $event.detail.value),
    g: $data.region,
    h: common_vendor.o(($event) => $data.region = $event.detail.value),
    i: $data.pronoun,
    j: common_vendor.o(($event) => $data.pronoun = $event.detail.value),
    k: common_vendor.o((...args) => $options.saveTag && $options.saveTag(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6e2db995"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tag-edit/tag-edit.js.map
