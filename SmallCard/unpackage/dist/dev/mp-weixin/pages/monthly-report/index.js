"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      stats: {
        postViews: 0,
        postLikes: 0,
        friendCount: 0,
        commentCount: 0,
        browseTime: 0
      },
      interactionRanking: [],
      monthlySummary: "",
      currentMonth: (/* @__PURE__ */ new Date()).getMonth() + 1,
      reportDate: "",
      // 添加全局应用实例引用
      app: null,
      isLoggedIn: false,
      isGuest: false
    };
  },
  onLoad() {
    this.app = getApp();
    if (this.app.globalData && this.app.globalData.userStatus) {
      this.isLoggedIn = this.app.globalData.userStatus.isLoggedIn || false;
      this.isGuest = this.app.globalData.userStatus.isGuest || false;
    } else {
      this.isLoggedIn = false;
      this.isGuest = false;
    }
    this.initReportData();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 初始化报告数据
    initReportData() {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      this.currentMonth = month;
      this.reportDate = `${year}年${month}月1日 - ${year}年${month}月${this.getDaysInMonth(year, month)}日`;
      this.loadGlobalStatsData();
      this.generateSummary();
    },
    // 获取指定月份的天数
    getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    },
    // 从全局应用实例加载统计数据
    loadGlobalStatsData() {
      try {
        const app = getApp();
        const monthlyStats = app.getMonthlyStats();
        this.stats = {
          postViews: monthlyStats.postViews > 0 ? monthlyStats.postViews : 42,
          postLikes: monthlyStats.postLikes > 0 ? monthlyStats.postLikes : 18,
          friendCount: monthlyStats.friendCount > 0 ? monthlyStats.friendCount : 11,
          commentCount: monthlyStats.commentCount > 0 ? monthlyStats.commentCount : 6,
          browseTime: monthlyStats.browseTime > 0 ? monthlyStats.browseTime : 345
        };
        this.generateRankingData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/monthly-report/index.vue:179", "加载全局统计数据失败:", error);
        this.stats = {
          postViews: 42,
          postLikes: 18,
          friendCount: 11,
          commentCount: 6,
          browseTime: 345
        };
        this.generateRankingData();
      }
    },
    // 生成互动排行榜数据
    generateRankingData() {
      const friends = [
        { name: "李四", avatar: "/static/photo/李四.jpg", desc: "前端工程师", interactCount: 12 },
        { name: "张三", avatar: "/static/photo/张三.jpg", desc: "旅行博主", interactCount: 10 },
        { name: "王五", avatar: "/static/photo/王五.jpg", desc: "摄影师", interactCount: 8 },
        { name: "赵六", avatar: "/static/photo/赵六.jpg", desc: "UI设计师", interactCount: 6 },
        { name: "陈七", avatar: "/static/photo/陈七.jpg", desc: "数据分析师", interactCount: 5 }
      ];
      this.interactionRanking = friends.sort((a, b) => b.interactCount - a.interactCount);
    },
    // 生成月度总结
    generateSummary() {
      const { postViews, postLikes, friendCount, commentCount } = this.stats;
      let summary = `${this.currentMonth}月，你在社区中表现活跃！`;
      if (postViews > 50) {
        summary += ` 你浏览了${postViews}篇精彩帖子，知识量up！`;
      } else if (postViews > 20) {
        summary += ` 你浏览了${postViews}篇帖子，继续保持！`;
      }
      if (postLikes > 20) {
        summary += ` 你为${postLikes}位创作者点赞，传递了不少正能量！`;
      }
      if (friendCount > 10) {
        summary += ` 你目前有${friendCount}位好友，社交圈很活跃哦！`;
      }
      if (commentCount > 10) {
        summary += ` 你发表了${commentCount}条评论，积极参与社区讨论！`;
      }
      summary += ` 期待你下个月有更精彩的表现！`;
      this.monthlySummary = summary;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.currentMonth),
    c: common_vendor.t($data.reportDate),
    d: common_vendor.t($data.stats.postViews),
    e: common_vendor.t($data.stats.postLikes),
    f: common_vendor.t($data.stats.friendCount),
    g: common_vendor.t($data.stats.postViews),
    h: common_vendor.t($data.stats.postLikes),
    i: common_vendor.t($data.stats.friendCount),
    j: common_vendor.t($data.stats.commentCount),
    k: common_vendor.t($data.stats.browseTime),
    l: $data.interactionRanking.length > 0
  }, $data.interactionRanking.length > 0 ? {
    m: common_vendor.f($data.interactionRanking, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: item.avatar,
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.desc),
        e: common_vendor.t(item.interactCount),
        f: index
      };
    })
  } : {}, {
    n: common_vendor.t($data.monthlySummary)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8ef1369b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/monthly-report/index.js.map
