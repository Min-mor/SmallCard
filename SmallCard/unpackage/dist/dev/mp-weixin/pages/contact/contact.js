"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      phoneNumber: "",
      wechatQrUrl: "",
      // 与social页面一致的社交平台配置（id、name、icon对应）
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
    this.loadContactInfo();
    this.loadSocialLinks();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 加载本地存储的联系方式
    loadContactInfo() {
      const contactInfo = common_vendor.index.getStorageSync("contactInfo");
      if (contactInfo) {
        this.phoneNumber = contactInfo.phoneNumber || "";
        this.wechatQrUrl = contactInfo.wechatQrUrl || "";
      }
    },
    // 加载本地存储的社交链接（从social页面保存的缓存中读取）
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
        common_vendor.index.__f__("error", "at pages/contact/contact.vue:109", "加载社交链接失败:", error);
      }
    },
    // 选择微信二维码图片
    chooseQrImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.wechatQrUrl = res.tempFilePaths[0];
        }
      });
    },
    // 清除社交链接输入框内容
    clearSocialInput(index) {
      this.socialList[index].link = "";
    },
    // 保存联系方式和社交链接到本地存储
    saveContactInfo() {
      const contactInfo = {
        phoneNumber: this.phoneNumber.trim(),
        wechatQrUrl: this.wechatQrUrl
      };
      common_vendor.index.setStorageSync("contactInfo", contactInfo);
      common_vendor.index.setStorageSync("socialLinks", this.socialList);
      common_vendor.index.showToast({
        title: "保存成功",
        icon: "success"
      });
      setTimeout(() => {
        this.goBack();
      }, 800);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.phoneNumber,
    c: common_vendor.o(($event) => $data.phoneNumber = $event.detail.value),
    d: $data.wechatQrUrl || "/static/icon/upload.png",
    e: common_vendor.o((...args) => $options.chooseQrImage && $options.chooseQrImage(...args)),
    f: !$data.wechatQrUrl
  }, !$data.wechatQrUrl ? {} : {}, {
    g: common_vendor.f($data.socialList, (item, index, i0) => {
      return {
        a: item.icon,
        b: `请输入${item.name}链接`,
        c: item.link,
        d: common_vendor.o(($event) => item.link = $event.detail.value, index),
        e: common_vendor.o(($event) => $options.clearSocialInput(index), index),
        f: index
      };
    }),
    h: common_vendor.o((...args) => $options.saveContactInfo && $options.saveContactInfo(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6bf5d4b5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/contact/contact.js.map
