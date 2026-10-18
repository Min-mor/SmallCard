"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 模拟夸夸数据
      praises: []
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 切换点赞状态
    toggleLike(index) {
      this.praises[index].isLiked = !this.praises[index].isLiked;
      this.savePraisesToStorage();
      common_vendor.index.$emit("praisesUpdated");
    },
    // 添加新的夸夸消息（从夸夸详情页调用）
    addPraiseMessage(content, image = "") {
      const newPraise = {
        avatar: "/static/photo/S..jpg",
        // 使用默认头像
        username: "S.",
        // 使用默认用户名
        level: "大神",
        // 使用默认等级
        content,
        image,
        isLiked: false
      };
      this.praises.unshift(newPraise);
      this.savePraisesToStorage();
      common_vendor.index.$emit("praisesUpdated");
    },
    // 获取当前用户ID
    getCurrentUserId() {
      var _a;
      try {
        const app = getApp();
        const userInfo = (_a = app.globalData.userStatus) == null ? void 0 : _a.userInfo;
        if (userInfo && userInfo.userId) {
          return userInfo.userId;
        }
        const isGuest = common_vendor.index.getStorageSync("isGuest");
        return isGuest ? "guest" : "default_user";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/praise.vue:104", "获取用户ID失败:", e);
        return "default_user";
      }
    },
    // 保存夸夸数据到本地存储
    savePraisesToStorage() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        common_vendor.index.setStorageSync(`${storagePrefix}praises`, this.praises);
        common_vendor.index.__f__("log", "at pages/home/praise.vue:117", "夸夸数据已保存到本地存储");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/praise.vue:119", "保存夸夸数据失败:", error);
      }
    }
  },
  mounted() {
    try {
      const currentUserId = this.getCurrentUserId();
      const storagePrefix = `user_${currentUserId}_`;
      const savedPraises = common_vendor.index.getStorageSync(`${storagePrefix}praises`);
      if (savedPraises && savedPraises.length > 0) {
        this.praises = savedPraises;
      } else {
        this.praises = [
          {
            avatar: "/static/photo/S..jpg",
            username: "S.",
            level: "大神",
            content: "棒!",
            isLiked: false
          },
          {
            avatar: "/static/photo/S..jpg",
            username: "S.",
            level: "大神",
            content: "棒!",
            isLiked: false
          },
          {
            avatar: "/static/photo/S..jpg",
            username: "S.",
            level: "大神",
            content: "棒!",
            isLiked: false
          }
        ];
        this.savePraisesToStorage();
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/home/praise.vue:163", "加载夸夸数据失败:", error);
      this.praises = [
        {
          avatar: "/static/photo/S..jpg",
          username: "S.",
          level: "大神",
          content: "棒!",
          isLiked: false
        },
        {
          avatar: "/static/photo/S..jpg",
          username: "S.",
          level: "大神",
          content: "棒!",
          isLiked: false
        },
        {
          avatar: "/static/photo/S..jpg",
          username: "S.",
          level: "大神",
          content: "棒!",
          isLiked: false
        }
      ];
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.f($data.praises, (praise, index, i0) => {
      return common_vendor.e({
        a: praise.avatar,
        b: common_vendor.t(praise.username),
        c: common_vendor.t(praise.level),
        d: praise.isLiked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
        e: common_vendor.o(($event) => $options.toggleLike(index), index),
        f: common_vendor.t(praise.content),
        g: praise.image
      }, praise.image ? {
        h: praise.image
      } : {}, {
        i: index
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7a94c73d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/praise.js.map
