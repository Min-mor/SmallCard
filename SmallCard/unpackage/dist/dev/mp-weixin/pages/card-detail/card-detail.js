"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      cardDetail: {
        id: "",
        avatar: "",
        name: "",
        signature: "",
        tags: [],
        friendCount: 0,
        praiseCount: 0,
        contentImage: "",
        contentText: "",
        praiseMessages: [],
        isFavorite: false,
        isFollowing: false
      },
      showShareModal: false,
      // 模拟名片数据，与card-folder.vue保持一致
      allCards: [
        {
          id: "friend1",
          name: "林一",
          avatar: "/static/photo/林一.jpg",
          signature: "摄影师，记录生活",
          desc: "人像摄影 | 风光摄影",
          tags: ["摄影", "人像", "风光", "旅行", "艺术"],
          friendCount: 39,
          praiseCount: 3,
          contentImage: "/static/photo/landscape.jpg",
          contentText: "HELLO!",
          praiseMessages: ["摄影技术太棒了！", "构图很专业", "光影处理非常到位"]
        },
        {
          id: "friend2",
          name: "涂二",
          avatar: "/static/photo/涂二.jpg",
          signature: "数据分析师，擅长可视化",
          desc: "数据分析 | 商业智能",
          tags: ["数据分析", "可视化", "商业智能", "数据挖掘", "统计学"],
          friendCount: 25,
          praiseCount: 5,
          contentImage: "",
          contentText: "数据分析改变世界！",
          praiseMessages: ["数据能力太强了！", "分析报告做得很专业"]
        },
        {
          id: "friend3",
          name: "张三",
          avatar: "/static/photo/张三.jpg",
          signature: "产品经理，5年经验",
          desc: "产品设计 | 用户研究",
          tags: ["产品", "用户研究", "产品设计", "用户体验", "需求分析"],
          friendCount: 45,
          praiseCount: 12,
          contentImage: "",
          contentText: "用户体验至上",
          praiseMessages: ["产品思维很棒", "用户体验设计得很好"]
        },
        {
          id: "friend4",
          name: "李四",
          avatar: "/static/photo/李四.jpg",
          signature: "UI设计师，擅长用户体验",
          desc: "UI/UX | 交互设计",
          tags: ["UI设计", "UX设计", "交互设计", "视觉设计", "原型设计"],
          friendCount: 32,
          praiseCount: 8,
          contentImage: "",
          contentText: "设计源于生活",
          praiseMessages: ["设计很精美", "界面很友好"]
        },
        {
          id: "friend5",
          name: "王五",
          avatar: "/static/photo/王五.jpg",
          signature: "前端开发，React专家",
          desc: "Web前端 | React/Vue",
          tags: ["前端开发", "React", "Vue", "JavaScript", "CSS"],
          friendCount: 50,
          praiseCount: 15,
          contentImage: "",
          contentText: "代码改变世界",
          praiseMessages: ["代码质量很高", "技术很扎实"]
        },
        {
          id: "friend6",
          name: "赵六",
          avatar: "/static/photo/赵六.jpg",
          signature: "后端开发，Python/Go",
          desc: "后端架构 | 微服务",
          tags: ["后端开发", "Python", "Go", "微服务", "架构设计"],
          friendCount: 28,
          praiseCount: 7,
          contentImage: "",
          contentText: "架构是门艺术"
        },
        {
          id: "friend7",
          name: "陈七",
          avatar: "/static/photo/陈七.jpg",
          signature: "全栈开发，技术负责人",
          desc: "技术管理 | 全栈开发",
          tags: ["全栈开发", "技术管理", "前端", "后端", "团队管理"],
          friendCount: 42,
          praiseCount: 20,
          contentImage: "",
          contentText: "全栈之路"
        },
        {
          id: "friend8",
          name: "刘八",
          avatar: "/static/photo/刘八.jpg",
          signature: "运营经理，内容营销",
          desc: "用户增长 | 内容策略",
          tags: ["运营", "内容营销", "用户增长", "市场推广", "数据分析"],
          friendCount: 36,
          praiseCount: 10,
          contentImage: "",
          contentText: "内容为王"
        },
        {
          id: "friend9",
          name: "梨鸣晒兽",
          avatar: "/static/photo/梨鸣晒兽.jpg",
          signature: "插画师，自由创作",
          desc: "插画设计 | 角色设计",
          tags: ["插画", "角色设计", "美术创作", "自由职业", "艺术"],
          friendCount: 22,
          praiseCount: 18,
          contentImage: "",
          contentText: "用插画表达生活"
        },
        {
          id: "friend10",
          name: "S.",
          avatar: "/static/photo/S..jpg",
          signature: "AI时代的探索者",
          desc: "人工智能研究员 | 技术博主",
          tags: ["人工智能", "机器学习", "深度学习", "算法", "技术写作"],
          friendCount: 60,
          praiseCount: 30,
          contentImage: "",
          contentText: "探索AI的无限可能"
        },
        {
          id: "friend11",
          name: "L.",
          avatar: "/static/photo/L..jpg",
          signature: "前端开发，精益求精",
          desc: "全栈工程师 | 技术讲师",
          tags: ["前端开发", "JavaScript", "CSS", "技术培训", "全栈"],
          friendCount: 38,
          praiseCount: 15,
          contentImage: "",
          contentText: "精益求精"
        }
      ]
    };
  },
  onLoad(options) {
    const cardId = options.id || options.cardId;
    if (cardId) {
      const card = this.allCards.find((c) => c.id === cardId);
      if (card) {
        this.cardDetail = {
          ...this.cardDetail,
          // 保留默认值
          ...card,
          // 覆盖所有卡片数据
          // 确保tags字段存在且为数组
          tags: Array.isArray(card.tags) ? card.tags : [],
          // 确保praiseMessages数组存在
          praiseMessages: []
        };
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:282", "加载卡片详情:", this.cardDetail);
      } else {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:284", "未找到对应ID的卡片:", cardId);
        common_vendor.index.showToast({
          title: "未找到该名片信息",
          icon: "error"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return;
      }
      if (options.newPraise) {
        this.addPraiseMessage(options.newPraise);
      }
    } else {
      common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:302", "没有传入卡片ID");
      common_vendor.index.showToast({
        title: "参数错误，缺少名片ID",
        icon: "error"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
      return;
    }
    this.loadPraiseMessages();
    this.checkIfFollowing();
    this.cleanupInvalidData();
  },
  onShow() {
    if (this.cardDetail.id) {
      this.loadPraiseMessages();
      this.checkIfFollowing();
      this.syncFollowStatus();
      this.comprehensiveTestDataConsistency();
    }
    common_vendor.index.$on("cardsDataUpdated", this.handleDataUpdate);
    common_vendor.index.$on("friendsDataUpdated", this.handleDataUpdate);
    common_vendor.index.$on("praiseDataUpdated", this.handleDataUpdate);
  },
  onUnload() {
    common_vendor.index.$off("cardsDataUpdated", this.handleDataUpdate);
    common_vendor.index.$off("friendsDataUpdated", this.handleDataUpdate);
    common_vendor.index.$off("praiseDataUpdated", this.handleDataUpdate);
  },
  // 处理数据更新
  handleDataUpdate() {
    common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:348", "名片详情页收到数据更新通知");
    if (this.cardDetail.id) {
      this.syncFollowStatus();
    }
  },
  methods: {
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
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:367", "获取用户ID失败:", e);
        return "default_user";
      }
    },
    // 图片预览功能
    previewImage(imageUrl) {
      try {
        if (imageUrl && typeof imageUrl === "string") {
          common_vendor.index.previewImage({
            urls: [imageUrl],
            current: 0,
            showmenu: true
          });
        } else {
          common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:382", "无效的图片地址:", imageUrl);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:385", "图片预览失败:", e);
      }
    },
    // 检查用户是否已关注
    checkIfFollowing() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const isInMutualFriends = mutualFriends.some((friend) => friend.id === this.cardDetail.id);
        this.cardDetail.isFollowing = isInMutualFriends;
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:405", "检查关注状态:", this.cardDetail.isFollowing);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:407", "检查关注状态失败:", e);
        this.cardDetail.isFollowing = false;
      }
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 关注/取消关注用户
    followUser() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        if (!this.validateCardData(this.cardDetail)) {
          common_vendor.index.showToast({
            title: "数据格式错误",
            icon: "error"
          });
          return;
        }
        this.backupData(storagePrefix);
        if (!this.cardDetail.isFollowing) {
          this.cardDetail.isFollowing = true;
          this.addToCardFolder();
          this.addToMutualFriendsList();
          this.cardDetail.friendCount++;
          this.validateDataConsistency();
          common_vendor.index.$emit("cardsDataUpdated");
          common_vendor.index.$emit("friendsDataUpdated");
          common_vendor.index.showToast({
            title: "已关注，现在是互相关注的好友",
            icon: "success",
            duration: 1500
          });
        } else {
          common_vendor.index.showModal({
            title: "确认取消关注",
            content: "确定要取消关注该用户吗？取消关注后，该用户将从好友列表移除，并自动从名片夹中删除。",
            success: (res) => {
              if (res.confirm) {
                try {
                  this.cardDetail.isFollowing = false;
                  this.removeFromCardFolder();
                  this.removeFromMutualFriendsList();
                  if (this.cardDetail.friendCount > 0) {
                    this.cardDetail.friendCount--;
                  }
                  this.validateDataConsistency();
                  common_vendor.index.$emit("cardsDataUpdated");
                  common_vendor.index.$emit("friendsDataUpdated");
                  common_vendor.index.showToast({
                    title: "已取消关注",
                    icon: "none",
                    duration: 1500
                  });
                } catch (error) {
                  common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:487", "取消关注操作失败:", error);
                  this.restoreData(storagePrefix);
                  common_vendor.index.showToast({
                    title: "取消关注失败",
                    icon: "error"
                  });
                }
              }
            }
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:500", "关注/取消关注操作异常:", error);
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        this.restoreData(storagePrefix);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "error"
        });
      }
    },
    // 添加到名片夹
    addToCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let folderCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const exists = folderCards.some((card) => card.id === this.cardDetail.id);
        if (!exists) {
          const cardToAdd = {
            id: this.cardDetail.id,
            name: this.cardDetail.name,
            avatar: this.cardDetail.avatar,
            signature: this.cardDetail.signature,
            desc: this.cardDetail.desc || ""
          };
          folderCards.push(cardToAdd);
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, folderCards);
          common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:535", "已添加到名片夹");
        }
        common_vendor.index.$emit("cardsDataUpdated");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:541", "添加到名片夹失败:", e);
      }
    },
    // 从名片夹移除
    removeFromCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let folderCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        folderCards = folderCards.filter((card) => card.id !== this.cardDetail.id);
        common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, folderCards);
        let deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (!deletedCardIds.includes(this.cardDetail.id)) {
          deletedCardIds.push(this.cardDetail.id);
          common_vendor.index.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
        }
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:561", "已从名片夹移除");
        common_vendor.index.$emit("cardsDataUpdated");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:566", "从名片夹移除失败:", e);
      }
    },
    // 将用户添加到互关好友列表
    addToMutualFriendsList() {
      try {
        if (!this.cardDetail || !this.cardDetail.id) {
          common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:574", "无效的卡片数据，无法添加到互关好友列表");
          return;
        }
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let mutualFriends = [];
        try {
          mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          if (!Array.isArray(mutualFriends))
            mutualFriends = [];
        } catch (storageError) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:587", "读取互关好友列表失败:", storageError);
          return;
        }
        const exists = mutualFriends.some((friend) => friend && friend.id === this.cardDetail.id);
        if (!exists) {
          try {
            mutualFriends.push({
              id: this.cardDetail.id,
              name: this.cardDetail.name || "",
              avatar: this.cardDetail.avatar || "",
              signature: this.cardDetail.signature || ""
            });
            common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
            common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:606", "用户已添加到互关好友列表");
          } catch (saveError) {
            common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:608", "保存互关好友列表失败:", saveError);
          }
        }
        try {
          let followers = common_vendor.index.getStorageSync(`${storagePrefix}followers`) || [];
          if (Array.isArray(followers)) {
            followers = followers.filter((follower) => follower && follower.id !== this.cardDetail.id);
            common_vendor.index.setStorageSync(`${storagePrefix}followers`, followers);
          }
        } catch (followerError) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:621", "更新关注者列表失败:", followerError);
        }
        try {
          let deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
          if (Array.isArray(deletedCardIds)) {
            deletedCardIds = deletedCardIds.filter((id) => id !== this.cardDetail.id);
            if (deletedCardIds.length > 0) {
              common_vendor.index.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
            } else {
              try {
                common_vendor.index.removeStorageSync(`${storagePrefix}deletedCardIds`);
              } catch (removeError) {
                common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:637", "移除删除记录存储项失败:", removeError);
              }
            }
          }
        } catch (deleteError) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:642", "更新删除记录失败:", deleteError);
        }
        common_vendor.index.$emit("friendsDataUpdated");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:649", "添加到互关好友列表失败:", e);
      }
    },
    // 从互关好友列表移除
    removeFromMutualFriendsList() {
      try {
        if (!this.cardDetail || !this.cardDetail.id) {
          common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:658", "无效的卡片数据，无法从互关好友列表移除");
          return;
        }
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        try {
          let mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          if (Array.isArray(mutualFriends)) {
            mutualFriends = mutualFriends.filter((friend) => friend && friend.id !== this.cardDetail.id);
            common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
            common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:673", "用户已从互关好友列表移除");
          }
        } catch (mutualError) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:676", "更新互关好友列表失败:", mutualError);
        }
        try {
          let followers = common_vendor.index.getStorageSync(`${storagePrefix}followers`) || [];
          if (Array.isArray(followers)) {
            const existsInFollowers = followers.some((follower) => follower && follower.id === this.cardDetail.id);
            if (!existsInFollowers) {
              followers.push({
                id: this.cardDetail.id,
                name: this.cardDetail.name || "",
                avatar: this.cardDetail.avatar || "",
                signature: this.cardDetail.signature || ""
              });
              common_vendor.index.setStorageSync(`${storagePrefix}followers`, followers);
            }
          }
        } catch (followerError) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:696", "更新添加我的列表失败:", followerError);
        }
        common_vendor.index.$emit("friendsDataUpdated");
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:703", "用户已从互关好友列表移除并添加到添加我的列表");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:705", "从互关好友列表移除失败:", e);
      }
    },
    // 验证数据一致性
    validateDataConsistency() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let mutualFriends = [];
        let collectedCards = [];
        try {
          mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        } catch (storageError) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:724", "读取存储数据失败:", storageError);
          return;
        }
        if (!Array.isArray(mutualFriends))
          mutualFriends = [];
        if (!Array.isArray(collectedCards))
          collectedCards = [];
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:732", "验证数据一致性:", {
          mutualFriends: mutualFriends.length,
          collectedCards: collectedCards.length,
          currentCardId: this.cardDetail.id,
          isFollowing: this.cardDetail.isFollowing
        });
        let hasChanges = false;
        for (const friend of mutualFriends) {
          if (friend && friend.id) {
            const isInCollectedCards = collectedCards.some((card) => card && card.id === friend.id);
            if (!isInCollectedCards) {
              collectedCards.push({
                id: friend.id,
                name: friend.name || "",
                avatar: friend.avatar || "",
                signature: friend.signature || "",
                desc: ""
              });
              hasChanges = true;
              common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:757", `修复数据不一致：将互关好友${friend.name || "未知"}添加到名片夹`);
            }
          }
        }
        if (this.cardDetail && this.cardDetail.id && this.cardDetail.isFollowing) {
          const isInMutualFriends = mutualFriends.some((f) => f && f.id === this.cardDetail.id);
          const isInCollectedCards = collectedCards.some((c) => c && c.id === this.cardDetail.id);
          if (!isInMutualFriends && this.cardDetail) {
            mutualFriends.push({
              id: this.cardDetail.id,
              name: this.cardDetail.name || "",
              avatar: this.cardDetail.avatar || "",
              signature: this.cardDetail.signature || ""
            });
            hasChanges = true;
          }
          if (!isInCollectedCards && this.cardDetail) {
            collectedCards.push({
              id: this.cardDetail.id,
              name: this.cardDetail.name || "",
              avatar: this.cardDetail.avatar || "",
              signature: this.cardDetail.signature || "",
              desc: this.cardDetail.desc || ""
            });
            hasChanges = true;
          }
        }
        if (hasChanges) {
          try {
            common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
            common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
            common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:797", "数据一致性修复完成，已保存更新后的数据集");
            if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.$emit === "function") {
              try {
                common_vendor.index.$emit("cardsDataUpdated");
                common_vendor.index.$emit("friendsDataUpdated");
              } catch (emitError) {
                common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:805", "发送事件通知失败:", emitError);
              }
            } else {
              common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:808", "uni.$emit方法不可用，跳过事件通知");
            }
          } catch (saveError) {
            common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:811", "保存数据失败:", saveError);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:817", "验证数据一致性失败:", error);
      }
    },
    // 同步关注状态
    syncFollowStatus() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const isActuallyFollowing = mutualFriends.some((f) => f.id === this.cardDetail.id);
        const previousStatus = this.cardDetail.isFollowing;
        this.cardDetail.isFollowing = isActuallyFollowing;
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:837", "同步关注状态:", this.cardDetail.isFollowing);
        if (previousStatus !== isActuallyFollowing) {
          const cardIndex = this.allCards.findIndex((c) => c.id === this.cardDetail.id);
          if (cardIndex !== -1) {
            this.allCards[cardIndex].isFollowing = isActuallyFollowing;
            common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:844", `更新allCards中的关注状态为: ${isActuallyFollowing}`);
          }
          this.validateDataConsistency();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:851", "同步关注状态失败:", error);
      }
    },
    // 从本地存储加载夸夸数据
    loadPraiseMessages() {
      try {
        if (!this.cardDetail || !this.cardDetail.id) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:859", "加载夸夸失败：缺少卡片信息");
          return;
        }
        const currentUserId = this.getCurrentUserId();
        const storageKey = `user_${currentUserId}_praiseMessages_${this.cardDetail.id}`;
        const savedMessages = common_vendor.index.getStorageSync(storageKey) || [];
        const messagesArray = Array.isArray(savedMessages) ? savedMessages : [];
        const validMessages = messagesArray.filter((msg) => {
          if (typeof msg === "string") {
            return msg.trim().length > 0;
          } else if (typeof msg === "object" && msg) {
            return typeof msg.content === "string" && msg.content.trim().length > 0 || typeof msg.image === "string" && msg.image.trim().length > 0;
          }
          return false;
        });
        this.cardDetail.praiseMessages = validMessages;
        this.cardDetail.praiseCount = validMessages.length;
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:888", "从本地存储加载夸夸数据:", validMessages.length, "条");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:890", "加载夸夸数据失败:", error);
        this.cardDetail.praiseMessages = [];
        this.cardDetail.praiseCount = 0;
      }
    },
    // 保存夸夸数据到本地存储
    savePraiseMessages() {
      try {
        if (!this.cardDetail || !this.cardDetail.id) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:902", "保存夸夸失败：缺少卡片信息");
          return;
        }
        const currentUserId = this.getCurrentUserId();
        const storageKey = `user_${currentUserId}_praiseMessages_${this.cardDetail.id}`;
        if (!Array.isArray(this.cardDetail.praiseMessages)) {
          this.cardDetail.praiseMessages = [];
        }
        const validMessages = this.cardDetail.praiseMessages.filter((msg) => {
          if (typeof msg === "string") {
            return msg.trim().length > 0;
          } else if (typeof msg === "object" && msg) {
            return typeof msg.content === "string" && msg.content.trim().length > 0 || typeof msg.image === "string" && msg.image.trim().length > 0;
          }
          return false;
        });
        if (validMessages.length !== this.cardDetail.praiseMessages.length) {
          common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:928", "过滤了无效的夸夸消息");
          this.cardDetail.praiseMessages = validMessages;
        }
        this.cardDetail.praiseCount = validMessages.length;
        common_vendor.index.setStorageSync(storageKey, validMessages);
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:937", "夸夸数据已保存到本地存储:", validMessages.length, "条");
        common_vendor.index.$emit("praiseDataUpdated");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:942", "保存夸夸数据失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "error"
        });
      }
    },
    // 验证名片数据格式
    validateCardData(card) {
      if (!card || typeof card !== "object") {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:954", "无效的卡片数据格式");
        return false;
      }
      const requiredFields = ["id", "name"];
      for (const field of requiredFields) {
        if (!card[field]) {
          common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:962", `卡片缺少必填字段: ${field}`);
          return false;
        }
      }
      if (card.friendCount !== void 0 && typeof card.friendCount !== "number") {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:969", "friendCount必须是数字");
        return false;
      }
      return true;
    },
    // 备份关键数据
    backupData(storagePrefix) {
      try {
        const mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const praiseMessages = this.cardDetail.praiseMessages || [];
        const backupData = {
          mutualFriends,
          collectedCards,
          praiseMessages,
          isFollowing: this.cardDetail.isFollowing,
          friendCount: this.cardDetail.friendCount,
          timestamp: Date.now()
        };
        common_vendor.index.setStorageSync(`${storagePrefix}dataBackup`, backupData);
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:993", "数据备份成功");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:995", "数据备份失败:", error);
      }
    },
    // 恢复数据
    restoreData(storagePrefix) {
      try {
        const backupData = common_vendor.index.getStorageSync(`${storagePrefix}dataBackup`);
        if (backupData && Date.now() - backupData.timestamp < 3e5) {
          common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, backupData.mutualFriends || []);
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, backupData.collectedCards || []);
          if (typeof backupData.isFollowing === "boolean") {
            this.cardDetail.isFollowing = backupData.isFollowing;
          }
          if (typeof backupData.friendCount === "number") {
            this.cardDetail.friendCount = backupData.friendCount;
          }
          if (Array.isArray(backupData.praiseMessages)) {
            this.cardDetail.praiseMessages = backupData.praiseMessages;
            this.savePraiseMessages();
          }
          common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1020", "数据恢复成功");
          this.syncFollowStatus();
          this.validateDataConsistency();
          if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.$emit === "function") {
            try {
              common_vendor.index.$emit("cardsDataUpdated");
              common_vendor.index.$emit("friendsDataUpdated");
              common_vendor.index.$emit("praiseDataUpdated");
            } catch (emitError) {
              common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:1033", "发送事件通知失败:", emitError);
            }
          } else {
            common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:1036", "uni.$emit方法不可用，跳过事件通知");
          }
        } else {
          common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:1039", "没有有效的备份数据可恢复");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:1042", "数据恢复失败:", error);
      }
    },
    // 清理无效数据
    cleanupInvalidData() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        mutualFriends = mutualFriends.filter((friend) => this.validateCardData(friend));
        let collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        collectedCards = collectedCards.filter((card) => this.validateCardData(card));
        for (const card of this.allCards) {
          const praiseKey = `${storagePrefix}praiseMessages_${card.id}`;
          let praiseMessages = common_vendor.index.getStorageSync(praiseKey) || [];
          const validMessages = praiseMessages.filter((msg) => {
            if (typeof msg === "string") {
              return msg.trim().length > 0;
            } else if (typeof msg === "object" && msg) {
              return typeof msg.content === "string" && msg.content.trim().length > 0 || typeof msg.image === "string" && msg.image.trim().length > 0;
            }
            return false;
          });
          if (validMessages.length !== praiseMessages.length) {
            common_vendor.index.setStorageSync(praiseKey, validMessages);
            common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1076", `清理了卡片 ${card.id} 的无效夸夸消息，保留了 ${validMessages.length} 条有效消息`);
          }
        }
        common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
        common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1084", "无效数据清理完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:1086", "清理无效数据失败:", error);
      }
    },
    // 全面测试数据一致性
    comprehensiveTestDataConsistency() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1096", "开始执行全面数据一致性测试...");
        this.cleanupInvalidData();
        const mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        let hasInconsistencies = false;
        for (const friend of mutualFriends) {
          const isInCollectedCards = collectedCards.some((card) => card.id === friend.id);
          if (!isInCollectedCards) {
            common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:1112", `发现不一致: 互关好友 ${friend.name} 不在名片夹中`);
            collectedCards.push({
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
              signature: friend.signature || "",
              desc: ""
            });
            hasInconsistencies = true;
          }
        }
        const praiseKey = `${storagePrefix}praiseMessages_${this.cardDetail.id}`;
        const praiseMessages = common_vendor.index.getStorageSync(praiseKey) || [];
        const validPraiseCount = praiseMessages.filter((msg) => {
          if (typeof msg === "string") {
            return msg.trim().length > 0;
          } else if (typeof msg === "object" && msg) {
            return typeof msg.content === "string" && msg.content.trim().length > 0 || typeof msg.image === "string" && msg.image.trim().length > 0;
          }
          return false;
        }).length;
        if (validPraiseCount !== this.cardDetail.praiseCount) {
          common_vendor.index.__f__("warn", "at pages/card-detail/card-detail.vue:1139", `夸夸数量不一致: 显示 ${this.cardDetail.praiseCount}, 实际 ${validPraiseCount}`);
          this.cardDetail.praiseCount = validPraiseCount;
          hasInconsistencies = true;
        }
        if (hasInconsistencies) {
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
          common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1148", "数据一致性测试完成，已修复发现的不一致问题");
          common_vendor.index.$emit("cardsDataUpdated");
          common_vendor.index.$emit("friendsDataUpdated");
          common_vendor.index.$emit("praiseDataUpdated");
        } else {
          common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1155", "数据一致性测试通过，所有数据保持一致");
        }
        this.syncFollowStatus();
        this.validateDataConsistency();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:1163", "全面数据一致性测试失败:", error);
      }
    },
    // 添加新的夸夸内容
    addPraiseMessage(content, image = "") {
      try {
        if (!Array.isArray(this.cardDetail.praiseMessages)) {
          this.cardDetail.praiseMessages = [];
        }
        const newPraise = {
          content: content || "",
          image: image || "",
          timestamp: Date.now()
        };
        this.cardDetail.praiseMessages.push(newPraise);
        this.cardDetail.praiseCount = this.cardDetail.praiseMessages.length;
        this.savePraiseMessages();
        common_vendor.index.__f__("log", "at pages/card-detail/card-detail.vue:1190", "添加了新的夸夸，当前总数:", this.cardDetail.praiseCount);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:1192", "添加夸夸内容失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      }
    },
    praiseUser() {
      common_vendor.index.navigateTo({
        url: `/pages/praise-detail/praise-detail?cardId=${this.cardDetail.id}`
      });
    },
    deleteCard() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这张名片吗？删除后无法恢复。",
        success: (res) => {
          if (res.confirm) {
            try {
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              const cardIndex = this.allCards.findIndex((c) => c.id === this.cardDetail.id);
              if (cardIndex > -1) {
                this.allCards.splice(cardIndex, 1);
              }
              let mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
              mutualFriends = mutualFriends.filter((friend) => friend.id !== this.cardDetail.id);
              common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
              let followers = common_vendor.index.getStorageSync(`${storagePrefix}followers`) || [];
              followers = followers.filter((follower) => follower.id !== this.cardDetail.id);
              common_vendor.index.setStorageSync(`${storagePrefix}followers`, followers);
              let deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
              if (!deletedCardIds.includes(this.cardDetail.id)) {
                deletedCardIds.push(this.cardDetail.id);
                common_vendor.index.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
              }
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success",
                duration: 1e3,
                success: () => {
                  setTimeout(() => {
                    common_vendor.index.$emit("friendsDataUpdated");
                    const pages = getCurrentPages();
                    const prevPage = pages[pages.length - 2];
                    if (prevPage) {
                      prevPage.$vm.deleteCardFromList(this.cardDetail.id);
                    }
                    common_vendor.index.navigateBack();
                  }, 1e3);
                }
              });
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/card-detail/card-detail.vue:1260", "删除卡片时出错:", e);
              common_vendor.index.showToast({
                title: "删除失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    },
    favoriteCard() {
      this.cardDetail.isFavorite = !this.cardDetail.isFavorite;
      if (this.cardDetail.isFavorite) {
        common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
      } else {
        common_vendor.index.showToast({ title: "已取消收藏", icon: "none" });
      }
    },
    shareCard() {
      this.showShareModal = true;
    },
    // 关闭分享弹窗
    closeShareModal() {
      this.showShareModal = false;
    },
    // 分享到微信
    shareToWechat() {
      common_vendor.index.showToast({
        title: "已分享到微信",
        icon: "success",
        duration: 1500,
        success: () => {
          this.showShareModal = false;
        }
      });
    },
    // 分享到QQ
    shareToQQ() {
      common_vendor.index.showToast({
        title: "已分享到QQ",
        icon: "success",
        duration: 1500,
        success: () => {
          this.showShareModal = false;
        }
      });
    },
    // 分享到邮箱
    shareToMail() {
      common_vendor.index.showToast({
        title: "已分享到邮箱",
        icon: "success",
        duration: 1500,
        success: () => {
          this.showShareModal = false;
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.cardDetail.avatar || "/static/icon/我的.png",
    d: common_vendor.t($data.cardDetail.name),
    e: common_vendor.t($data.cardDetail.signature),
    f: common_vendor.f($data.cardDetail.tags || [], (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    }),
    g: common_vendor.t($data.cardDetail.friendCount),
    h: common_vendor.t($data.cardDetail.praiseCount),
    i: common_vendor.t($data.cardDetail.isFollowing ? "互相关注" : "未关注"),
    j: common_vendor.o((...args) => $options.followUser && $options.followUser(...args)),
    k: $data.cardDetail.praiseMessages && $data.cardDetail.praiseMessages.length > 0
  }, $data.cardDetail.praiseMessages && $data.cardDetail.praiseMessages.length > 0 ? {
    l: common_vendor.f($data.cardDetail.praiseMessages, (message, index, i0) => {
      return common_vendor.e({
        a: typeof message === "object" && message
      }, typeof message === "object" && message ? common_vendor.e({
        b: message.content
      }, message.content ? {
        c: common_vendor.t(message.content)
      } : {}, {
        d: message.image
      }, message.image ? {
        e: message.image,
        f: common_vendor.o(($event) => $options.previewImage(message.image), index)
      } : {}) : {
        g: common_vendor.t(message)
      }, {
        h: index
      });
    })
  } : {}, {
    m: common_vendor.o((...args) => $options.praiseUser && $options.praiseUser(...args)),
    n: common_assets._imports_1$1,
    o: common_vendor.o((...args) => $options.deleteCard && $options.deleteCard(...args)),
    p: $data.cardDetail.isFavorite ? "/static/icon/已收藏.png" : "/static/icon/收藏.png",
    q: common_vendor.o((...args) => $options.favoriteCard && $options.favoriteCard(...args)),
    r: common_assets._imports_2,
    s: common_vendor.o((...args) => $options.shareCard && $options.shareCard(...args)),
    t: $data.showShareModal
  }, $data.showShareModal ? {
    v: common_assets._imports_3,
    w: common_vendor.o((...args) => $options.shareToWechat && $options.shareToWechat(...args)),
    x: common_assets._imports_4$1,
    y: common_vendor.o((...args) => $options.shareToQQ && $options.shareToQQ(...args)),
    z: common_assets._imports_5,
    A: common_vendor.o((...args) => $options.shareToMail && $options.shareToMail(...args)),
    B: common_vendor.o((...args) => $options.closeShareModal && $options.closeShareModal(...args)),
    C: common_vendor.o(() => {
    }),
    D: common_vendor.o((...args) => $options.closeShareModal && $options.closeShareModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ca7809bb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/card-detail/card-detail.js.map
