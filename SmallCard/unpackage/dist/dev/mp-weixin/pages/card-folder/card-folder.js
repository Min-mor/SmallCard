"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      collectedCards: []
    };
  },
  onLoad() {
    this.loadCollectedCards();
    this.setupEventListeners();
  },
  onUnload() {
    this.removeEventListeners();
  },
  onShow() {
    this.checkAndRemoveDeletedCards();
  },
  methods: {
    // 获取当前用户ID，与social/index.vue保持一致
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
        common_vendor.index.__f__("error", "at pages/card-folder/card-folder.vue:50", "获取用户ID失败:", e);
        return "default_user";
      }
    },
    // 获取存储前缀
    getStoragePrefix() {
      const currentUserId = this.getCurrentUserId();
      return `user_${currentUserId}_`;
    },
    // 设置事件监听器
    setupEventListeners() {
      common_vendor.index.$on("friendsDataUpdated", this.handleFriendsDataUpdate);
      this.listenToStorageChanges();
    },
    // 移除事件监听器
    removeEventListeners() {
      common_vendor.index.$off("friendsDataUpdated", this.handleFriendsDataUpdate);
      if (this.storageCheckTimer) {
        clearInterval(this.storageCheckTimer);
      }
    },
    // 处理好友数据更新
    handleFriendsDataUpdate() {
      common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:80", "名片夹收到好友数据更新通知");
      this.loadCollectedCards();
    },
    // 监听存储变化（简单实现）
    listenToStorageChanges() {
      this.storageCheckTimer = setInterval(() => {
        this.checkStorageChanges();
      }, 5e3);
    },
    // 检查存储变化
    checkStorageChanges() {
      try {
        const storagePrefix = this.getStoragePrefix();
        const latestCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (latestCards.length !== this.collectedCards.length) {
          this.loadCollectedCards();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-folder/card-folder.vue:101", "检查存储变化失败:", e);
      }
    },
    // 加载名片夹数据
    loadCollectedCards() {
      try {
        const storagePrefix = this.getStoragePrefix();
        let storedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (!storedCards || storedCards.length === 0) {
          common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:114", "名片夹为空，添加默认模拟数据");
          const mockCards = [
            {
              id: "mock_friend_1",
              name: "张三",
              avatar: "/static/photo/张三.jpg",
              signature: "热爱生活，分享快乐",
              desc: "前端开发工程师"
            },
            {
              id: "mock_friend_2",
              name: "李四",
              avatar: "/static/photo/李四.jpg",
              signature: "科技改变世界",
              desc: "后端开发工程师"
            },
            {
              id: "mock_friend_3",
              name: "王五",
              avatar: "/static/photo/王五.jpg",
              signature: "设计让生活更美好",
              desc: "UI设计师"
            },
            {
              id: "mock_friend_4",
              name: "赵六",
              avatar: "/static/photo/赵六.jpg",
              signature: "摄影记录美好瞬间",
              desc: "摄影师"
            }
          ];
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, mockCards);
          storedCards = mockCards;
          common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:150", "已添加默认模拟名片数据");
        }
        this.collectedCards = storedCards;
        this.validateDataConsistency();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-folder/card-folder.vue:158", "加载名片夹数据失败:", e);
        this.collectedCards = [];
      }
    },
    // 验证数据一致性，确保与好友列表数量一致
    validateDataConsistency() {
      try {
        const storagePrefix = this.getStoragePrefix();
        const storedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:170", "名片夹数据一致性验证:");
        common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:171", "- 当前名片夹长度:", this.collectedCards.length);
        common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:172", "- 存储中的名片夹长度:", storedCards.length);
        if (this.collectedCards.length !== storedCards.length) {
          common_vendor.index.__f__("warn", "at pages/card-folder/card-folder.vue:176", "发现数据不一致，正在重新同步名片夹...");
          this.collectedCards = storedCards;
          common_vendor.index.$emit("friendsDataUpdated");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-folder/card-folder.vue:182", "验证数据一致性失败:", e);
      }
    },
    // 检查并移除已删除的名片
    checkAndRemoveDeletedCards() {
      try {
        this.loadCollectedCards();
        const storagePrefix = this.getStoragePrefix();
        const deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (deletedCardIds.length > 0) {
          this.collectedCards = this.collectedCards.filter(
            (card) => !deletedCardIds.includes(card.id)
          );
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, this.collectedCards);
          common_vendor.index.removeStorageSync(`${storagePrefix}deletedCardIds`);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-folder/card-folder.vue:209", "检查删除记录失败:", e);
      }
    },
    goToCardDetail(cardId) {
      common_vendor.index.navigateTo({
        url: "/pages/card-detail/card-detail?id=" + cardId
      });
    },
    // 从列表中删除名片
    deleteCardFromList(cardId) {
      const storagePrefix = this.getStoragePrefix();
      const cardIndex = this.collectedCards.findIndex((c) => c.id === cardId);
      if (cardIndex > -1) {
        this.collectedCards.splice(cardIndex, 1);
        common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, this.collectedCards);
        const mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const updatedMutualFriends = mutualFriends.filter((friend) => friend.id !== cardId);
        common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, updatedMutualFriends);
        let deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (!deletedCardIds.includes(cardId)) {
          deletedCardIds.push(cardId);
          common_vendor.index.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
        }
        common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:240", "已从名片夹删除好友，当前名片数量:", this.collectedCards.length);
        common_vendor.index.$emit("friendsDataUpdated");
      }
    },
    // 添加名片到名片夹（供其他页面调用）
    addCardToFolder(cardData) {
      try {
        const storagePrefix = this.getStoragePrefix();
        const existingIndex = this.collectedCards.findIndex((card) => card.id === cardData.id);
        if (existingIndex === -1) {
          const newCard = {
            id: cardData.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: cardData.name || "未知用户",
            avatar: cardData.avatar || cardData.avatarUrl || "/static/icon/我的.png",
            signature: cardData.signature || "",
            desc: cardData.desc || ""
          };
          this.collectedCards.push(newCard);
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, this.collectedCards);
          common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:270", "已添加新名片到名片夹，当前名片数量:", this.collectedCards.length);
          common_vendor.index.$emit("friendsDataUpdated");
          return true;
        } else {
          common_vendor.index.__f__("log", "at pages/card-folder/card-folder.vue:276", "名片已存在于名片夹中");
          return false;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-folder/card-folder.vue:280", "添加名片到名片夹失败:", e);
        return false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.collectedCards, (card, index, i0) => {
      return {
        a: card.avatar || "/static/icon/我的.png",
        b: common_vendor.t(card.name),
        c: common_vendor.t(card.signature),
        d: card.id,
        e: common_vendor.o(($event) => $options.goToCardDetail(card.id), card.id)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-db7a99af"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/card-folder/card-folder.js.map
