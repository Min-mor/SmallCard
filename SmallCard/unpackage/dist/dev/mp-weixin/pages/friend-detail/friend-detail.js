"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      mutualFriends: [],
      followers: [],
      // 定时器ID，用于定期更新夸夸数量
      updateTimer: null
    };
  },
  onLoad() {
    this.loadFriendData();
  },
  onShow() {
    this.loadFriendData();
    this.checkAndRemoveDeletedFriends();
    common_vendor.index.$on("cardsDataUpdated", this.handleDataUpdate);
    common_vendor.index.$on("praiseDataUpdated", this.handlePraiseDataUpdate);
    this.updateTimer = setInterval(() => {
      this.reloadAllPraiseData();
    }, 5e3);
  },
  computed: {
    // 计算互关好友数量
    mutualFriendCount() {
      return this.mutualFriends.length;
    },
    // 计算关注者数量
    followerCount() {
      return this.followers.length;
    }
  },
  onLoad(options) {
    if (options.friendId) {
      common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:111", "查看特定好友:", options.friendId);
    }
    this.setupEventListeners();
  },
  onUnload() {
    this.removeEventListeners();
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  },
  methods: {
    // 设置事件监听器
    setupEventListeners() {
      common_vendor.index.$on("cardsDataUpdated", this.handleCardsDataUpdate);
      this.listenToStorageChanges();
    },
    // 移除事件监听器
    removeEventListeners() {
      common_vendor.index.$off("cardsDataUpdated", this.handleDataUpdate);
      common_vendor.index.$off("praiseDataUpdated", this.handlePraiseDataUpdate);
      if (this.storageCheckTimer) {
        clearInterval(this.storageCheckTimer);
      }
    },
    // 处理数据更新
    handleDataUpdate() {
      common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:148", "收到数据更新通知，重新加载好友数据");
      this.loadFriendData();
    },
    // 处理夸夸数据更新
    handlePraiseDataUpdate() {
      common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:154", "收到夸夸数据更新通知，重新加载夸夸数据");
      this.reloadAllPraiseData();
    },
    // 监听存储变化
    listenToStorageChanges() {
      this.storageCheckTimer = setInterval(() => {
        this.checkStorageChanges();
      }, 5e3);
    },
    // 检查存储变化
    checkStorageChanges() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const latestCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const currentCards = this.mutualFriends;
        if (latestCards.length !== currentCards.length) {
          this.loadFriendData();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:178", "检查存储变化失败:", e);
      }
    },
    // 广播数据更新事件
    broadcastDataUpdate() {
      common_vendor.index.$emit("cardsDataUpdated");
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
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:200", "获取用户ID失败:", e);
        return "default_user";
      }
    },
    // 添加默认好友数据
    addDefaultFriends() {
      const defaultFriends = [
        { id: "friend1", name: "林一", avatar: "/static/photo/林一.jpg", signature: "摄影师，记录生活" },
        { id: "friend2", name: "涂二", avatar: "/static/photo/涂二.jpg", signature: "数据分析师，擅长可视化" },
        { id: "friend3", name: "张三", avatar: "/static/photo/张三.jpg", signature: "产品经理，5年经验" },
        { id: "friend4", name: "李四", avatar: "/static/photo/李四.jpg", signature: "前端工程师，热爱新技术" },
        { id: "friend5", name: "王五", avatar: "/static/photo/王五.jpg", signature: "设计师，UI/UX全能" },
        { id: "friend6", name: "赵六", avatar: "/static/photo/赵六.jpg", signature: "后端工程师，专注性能优化" },
        { id: "friend7", name: "陈七", avatar: "/static/photo/陈七.jpg", signature: "移动开发工程师，全栈思维" },
        { id: "friend8", name: "刘八", avatar: "/static/photo/刘八.jpg", signature: "DevOps工程师，自动化运维" },
        { id: "friend9", name: "L.", avatar: "/static/photo/L..jpg", signature: "项目经理，敏捷实践者" },
        { id: "friend10", name: "梨鸣晒兽", avatar: "/static/photo/梨鸣晒兽.jpg", signature: "数据科学家，机器学习爱好者" },
        { id: "friend11", name: "S.", avatar: "/static/photo/S..jpg", signature: "测试工程师，质量保障专家" }
      ];
      return defaultFriends;
    },
    // 加载好友数据
    loadFriendData() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:230", "当前用户ID:", currentUserId);
        let collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (!Array.isArray(collectedCards)) {
          collectedCards = [];
        }
        if (collectedCards.length === 0) {
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:242", "未找到名片夹数据，为用户", currentUserId, "初始化默认好友");
          const defaultFriends = this.addDefaultFriends();
          collectedCards = defaultFriends;
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:246", "已为用户", currentUserId, "初始化默认好友数据");
        }
        this.mutualFriends = collectedCards.map((card) => {
          const friendObj = {
            id: card.id,
            name: card.name,
            avatar: card.avatar,
            signature: card.signature,
            friendCount: card.friendCount || 0,
            praiseCount: 0
            // 初始化为0，稍后会更新
          };
          this.loadFriendPraiseData(friendObj);
          return friendObj;
        });
        common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
        let storedFollowers = common_vendor.index.getStorageSync(`${storagePrefix}followers`) || [];
        if (!Array.isArray(storedFollowers)) {
          storedFollowers = [];
        }
        storedFollowers = storedFollowers.filter(
          (follower) => !collectedCards.some((card) => card.id === follower.id)
        );
        if (storedFollowers.length === 0) {
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:285", "未找到添加我的好友数据，为用户", currentUserId, "初始化默认新朋友");
          const defaultFollowers = [
            {
              id: "new_friend1",
              name: "新朋友",
              avatar: "/static/photo/王五.jpg",
              signature: "这是一个新用户"
            }
          ];
          this.followers = defaultFollowers;
          common_vendor.index.setStorageSync(`${storagePrefix}followers`, defaultFollowers);
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:297", "已为用户", currentUserId, "初始化默认添加我的好友数据");
        } else {
          this.followers = storedFollowers;
          common_vendor.index.setStorageSync(`${storagePrefix}followers`, storedFollowers);
        }
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:303", "用户", currentUserId, "的互关好友数量:", this.mutualFriends.length);
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:304", "用户", currentUserId, "的添加我的好友数量:", this.followers.length);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:307", "加载好友数据失败:", e);
        try {
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:313", "加载失败，尝试重新初始化好友数据");
          const basicDefaultFriends = this.addDefaultFriends().slice(0, 3);
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, basicDefaultFriends);
          this.mutualFriends = basicDefaultFriends.map((card) => ({
            id: card.id,
            name: card.name,
            avatar: card.avatar,
            signature: card.signature,
            friendCount: card.friendCount || 0,
            praiseCount: 0
          }));
          common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
          this.followers = [];
          common_vendor.index.setStorageSync(`${storagePrefix}followers`, []);
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:334", "错误恢复：已初始化基本好友数据");
        } catch (retryError) {
          common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:336", "错误恢复失败:", retryError);
        }
      }
    },
    // 加载单个好友的夸夸数据
    loadFriendPraiseData(friend) {
      try {
        const currentUserId = this.getCurrentUserId();
        const storageKey = `user_${currentUserId}_praiseMessages_${friend.id}`;
        const savedMessages = common_vendor.index.getStorageSync(storageKey) || [];
        const validMessages = savedMessages.filter(
          (msg) => typeof msg === "string" && msg.trim().length > 0
        );
        friend.praiseCount = validMessages.length;
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:356", `加载好友 ${friend.name} 的夸夸数据: ${friend.praiseCount} 条`);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:358", `加载好友 ${friend.name} 的夸夸数据失败:`, error);
        friend.praiseCount = 0;
      }
    },
    // 重新加载所有好友的夸夸数据
    reloadAllPraiseData() {
      try {
        this.mutualFriends.forEach((friend) => {
          this.loadFriendPraiseData(friend);
        });
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:369", "所有好友夸夸数据重新加载完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:371", "重新加载夸夸数据失败:", error);
      }
    },
    // 返回上一页
    navigateBack() {
      common_vendor.index.navigateBack();
    },
    // 显示更多选项
    showMoreOptions() {
      common_vendor.index.showActionSheet({
        itemList: ["刷新", "排序", "设置"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:385", "选择了:", res.tapIndex);
        }
      });
    },
    // 导航到互关好友列表
    navigateToMutualFriends() {
      common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:392", "导航到互关好友列表");
    },
    // 导航到关注者列表
    navigateToFollowers() {
      common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:397", "导航到关注者列表");
    },
    // 关注用户（实现互相关注关系）
    followUser(userId) {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        if (!this.mutualFriends.some((friend) => friend.id === userId)) {
          const follower = this.followers.find((f) => f.id === userId);
          if (follower) {
            this.followers = this.followers.filter((friend) => friend.id !== userId);
            this.mutualFriends.push(follower);
            common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
            common_vendor.index.setStorageSync(`${storagePrefix}followers`, this.followers);
            let collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
            const cardIndex = collectedCards.findIndex((card) => card.id === userId);
            if (cardIndex > -1) {
              collectedCards[cardIndex] = {
                ...collectedCards[cardIndex],
                name: follower.name,
                // 确保姓名一致
                avatar: follower.avatar,
                signature: follower.signature
              };
            } else {
              const newCard = {
                id: follower.id,
                name: follower.name,
                avatar: follower.avatar,
                signature: follower.signature,
                desc: follower.desc || ""
              };
              collectedCards.push(newCard);
            }
            common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
            let deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
            deletedCardIds = deletedCardIds.filter((id) => id !== userId);
            if (deletedCardIds.length > 0) {
              common_vendor.index.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
            } else {
              common_vendor.index.removeStorageSync(`${storagePrefix}deletedCardIds`);
            }
            common_vendor.index.$emit("cardsDataUpdated");
            this.validateDataConsistency();
            this.reloadAllPraiseData();
            common_vendor.index.showToast({
              title: "已关注，现在是互相关注的好友",
              icon: "success",
              duration: 1500
            });
          } else {
            common_vendor.index.showToast({
              title: "用户不存在",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: "已经是互相关注了",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:487", "关注用户失败:", e);
        common_vendor.index.showToast({
          title: "关注失败，请重试",
          icon: "none"
        });
        setTimeout(() => {
          this.loadFriendData();
        }, 500);
      }
    },
    // 导航到添加好友页面
    navigateToAddFriend() {
      common_vendor.index.showModal({
        title: "添加好友",
        content: "请输入好友信息",
        editable: true,
        placeholderText: "请输入好友ID或名称",
        success: (res) => {
          if (res.confirm && res.content.trim()) {
            const friendName = res.content.trim();
            const currentUserId = this.getCurrentUserId();
            const storagePrefix = `user_${currentUserId}_`;
            const newId = "new_friend_" + Date.now();
            const newFriend = {
              id: newId,
              name: friendName,
              avatar: "/static/icon/我的.png",
              // 默认头像
              signature: "新添加的好友"
            };
            let followers = common_vendor.index.getStorageSync(`${storagePrefix}followers`) || [];
            const exists = followers.some((f) => f.name === friendName || f.id === newId);
            if (!exists) {
              followers.push(newFriend);
              common_vendor.index.setStorageSync(`${storagePrefix}followers`, followers);
              this.followers = followers;
              common_vendor.index.showToast({
                title: "好友添加成功，请等待对方通过",
                icon: "success"
              });
            } else {
              common_vendor.index.showToast({
                title: "该好友已存在",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 查看好友名片
    viewFriendCard(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/card-detail/card-detail?id=${userId}`
      });
    },
    // 取消关注用户 - 优化版，添加详细调试和错误处理
    unfollowUser(userId) {
      common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:559", "开始取消关注流程，用户ID:", userId);
      common_vendor.index.showModal({
        title: "确认取消关注",
        content: "确定要取消关注该用户吗？取消关注后，该用户将从好友列表移除，并自动从名片夹中删除。",
        success: (res) => {
          if (res.confirm) {
            if (!Array.isArray(this.mutualFriends)) {
              common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:568", "mutualFriends不是数组，重新加载数据");
              this.loadFriendData();
              common_vendor.index.showToast({
                title: "数据加载中，请稍后再试",
                icon: "none"
              });
              return;
            }
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:577", "当前互关好友列表:", JSON.stringify(this.mutualFriends.map((f) => ({ id: f.id, name: f.name }))));
            let unfollowedUser = null;
            let targetIndex = -1;
            unfollowedUser = this.mutualFriends.find((f, index) => {
              if (f.id === userId) {
                targetIndex = index;
                return true;
              }
              return false;
            });
            if (!unfollowedUser) {
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:594", `尝试从名片夹中查找ID为${userId}的用户`);
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
              const cardUser = collectedCards.find((card) => card.id === userId);
              if (cardUser) {
                common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:603", "从名片夹中找到匹配用户");
                unfollowedUser = cardUser;
                const friendMatch = this.mutualFriends.find((f, index) => {
                  if (f.id === cardUser.id || f.name === cardUser.name) {
                    targetIndex = index;
                    return true;
                  }
                  return false;
                });
                if (friendMatch) {
                  unfollowedUser = friendMatch;
                }
              }
            }
            if (!unfollowedUser) {
              common_vendor.index.__f__("warn", "at pages/friend-detail/friend-detail.vue:621", `未找到ID为${userId}的匹配用户，尝试按名称匹配`);
              unfollowedUser = this.mutualFriends.find((f, index) => {
                if (f.name === userId || f.userName === userId) {
                  targetIndex = index;
                  return true;
                }
                return false;
              });
            }
            if (!unfollowedUser) {
              common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:633", `无法找到ID或名称为${userId}的用户，正在记录详细信息...`);
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:634", "当前互关好友列表:", JSON.stringify(this.mutualFriends.map((f) => ({ id: f.id, name: f.name })), null, 2));
              const pages = getCurrentPages();
              const currentPage = pages[pages.length - 1];
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:639", "页面参数:", currentPage.options);
            }
            const actualUserId = unfollowedUser ? unfollowedUser.id : userId;
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:644", "实际将删除的用户ID:", actualUserId, "目标索引:", targetIndex);
            try {
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:652", "当前用户ID:", currentUserId, "存储前缀:", storagePrefix);
              const [collectedCards, deletedCardIds] = this.preloadUserData(storagePrefix);
              const updatedMutualFriends = this.mutualFriends.filter((f) => f.id !== actualUserId);
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:659", `移除前好友数: ${this.mutualFriends.length}, 移除后好友数: ${updatedMutualFriends.length}`);
              const updatedCollectedCards = collectedCards.filter((card) => card.id !== actualUserId);
              let updatedFollowers = [...this.followers];
              const existsInFollowers = this.followers.some((f) => f.id === actualUserId);
              if (!existsInFollowers && unfollowedUser) {
                updatedFollowers.push(unfollowedUser);
              }
              const updatedDeletedCardIds = [...deletedCardIds];
              if (!deletedCardIds.includes(actualUserId)) {
                updatedDeletedCardIds.push(actualUserId);
              }
              this.batchUpdateStorage(storagePrefix, {
                mutualFriends: updatedMutualFriends,
                collectedCards: updatedCollectedCards,
                followers: updatedFollowers,
                deletedCardIds: updatedDeletedCardIds
              });
              this.mutualFriends = [...updatedMutualFriends];
              if (updatedFollowers) {
                this.followers = [...updatedFollowers];
              }
              if (targetIndex !== -1 && targetIndex >= 0 && targetIndex < this.mutualFriends.length) {
                this.mutualFriends.splice(targetIndex, 1);
                common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:694", `已从mutualFriends数组中移除索引${targetIndex}的用户`);
              } else {
                this.mutualFriends = this.mutualFriends.filter((f) => f.id !== actualUserId);
                common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:698", `已通过ID过滤重建mutualFriends数组`);
              }
              if (this.hasOwnProperty("isFollowing")) {
                this.isFollowing = false;
              }
              if (this.hasOwnProperty("isMutual")) {
                this.isMutual = false;
              }
              if (typeof common_vendor.index !== "undefined" && typeof common_vendor.index.$emit === "function") {
                try {
                  common_vendor.index.$emit("cardsDataUpdated");
                  common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:713", "已发送数据更新事件");
                } catch (emitError) {
                  common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:715", "发送事件通知失败:", emitError);
                }
              }
              let toastTitle = "已取消关注";
              if (!unfollowedUser) {
                toastTitle = "操作已执行，请刷新确认";
              }
              common_vendor.index.showToast({
                title: toastTitle,
                icon: "success",
                duration: 1500,
                success: () => {
                  setTimeout(() => {
                    common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:732", "重新加载好友数据以确保一致性");
                    this.loadFriendData();
                  }, 500);
                }
              });
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:738", "成功完成取消关注流程:", userId);
              try {
                this.validateDataConsistency();
              } catch (validationError) {
                common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:744", "数据一致性验证失败:", validationError);
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:750", "取消关注过程中出现错误:", e);
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:753", "发生错误，强制刷新数据");
              this.loadFriendData();
              if (unfollowedUser && targetIndex !== -1) {
                common_vendor.index.showToast({
                  title: "已取消关注",
                  icon: "success",
                  duration: 1500
                });
              } else {
                common_vendor.index.showToast({
                  title: "取消关注失败",
                  icon: "none",
                  duration: 2e3
                });
              }
              setTimeout(() => {
                this.loadFriendData();
              }, 500);
            }
          }
        }
      });
    },
    // 检查并移除已删除的好友
    checkAndRemoveDeletedFriends() {
      try {
        this.loadFriendData();
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (deletedCardIds.length > 0) {
          this.mutualFriends = this.mutualFriends.filter(
            (friend) => !deletedCardIds.includes(friend.id)
          );
          this.followers = this.followers.filter(
            (friend) => !deletedCardIds.includes(friend.id)
          );
          common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
          common_vendor.index.setStorageSync(`${storagePrefix}followers`, this.followers);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:811", "检查删除记录失败:", e);
      }
    },
    // 测试验证方法 - 用于验证数据一致性
    validateDataConsistency() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        const followers = common_vendor.index.getStorageSync(`${storagePrefix}followers`) || [];
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:827", "开始验证数据一致性...");
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:828", "互关好友数量:", mutualFriends.length);
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:829", "名片夹数量:", collectedCards.length);
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:830", "添加我的数量:", followers.length);
        const allFriendsInCards = mutualFriends.every(
          (friend) => collectedCards.some((card) => card.id === friend.id)
        );
        const allCardsInFriends = collectedCards.every(
          (card) => mutualFriends.some((friend) => friend.id === card.id)
        );
        const noOverlapBetweenFollowersAndFriends = !followers.some(
          (follower) => mutualFriends.some((friend) => friend.id === follower.id)
        );
        const noForcedDefaultData = true;
        if (allFriendsInCards && allCardsInFriends && noOverlapBetweenFollowersAndFriends && noForcedDefaultData) {
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:851", "✓ 数据一致性验证通过，删除/取消关注后不会重置");
        } else {
          let errorMsg = "✗ 数据一致性验证失败:";
          if (!allFriendsInCards)
            errorMsg += " 互关好友不在名片夹中";
          if (!allCardsInFriends)
            errorMsg += " 名片夹中有非互关好友";
          if (!noOverlapBetweenFollowersAndFriends)
            errorMsg += " 添加我的列表中包含互关好友";
          if (!noForcedDefaultData)
            ;
          common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:859", errorMsg);
        }
        return allFriendsInCards && allCardsInFriends && noOverlapBetweenFollowersAndFriends && noForcedDefaultData;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:864", "数据一致性验证失败:", error);
        common_vendor.index.showToast({
          title: "验证过程出错",
          icon: "none"
        });
        return false;
      }
    },
    // 预加载用户数据的辅助方法
    preloadUserData(storagePrefix) {
      try {
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:877", "开始预加载用户数据...");
        let collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (!Array.isArray(collectedCards)) {
          common_vendor.index.__f__("warn", "at pages/friend-detail/friend-detail.vue:882", "名片夹数据格式错误，重置为空数组");
          collectedCards = [];
        }
        let deletedCardIds = common_vendor.index.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (!Array.isArray(deletedCardIds)) {
          common_vendor.index.__f__("warn", "at pages/friend-detail/friend-detail.vue:889", "删除记录格式错误，重置为空数组");
          deletedCardIds = [];
        }
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:893", "预加载完成，名片夹数量:", collectedCards.length, "删除记录数量:", deletedCardIds.length);
        return [collectedCards, deletedCardIds];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:896", "预加载用户数据失败:", error);
        return [[], []];
      }
    },
    // 批量更新存储的辅助方法，模拟事务性操作
    batchUpdateStorage(storagePrefix, updates) {
      try {
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:905", "开始批量更新存储...");
        const results = [];
        if (updates.mutualFriends !== void 0) {
          common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, updates.mutualFriends);
          results.push("mutualFriends更新成功");
        }
        if (updates.collectedCards !== void 0) {
          common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, updates.collectedCards);
          results.push("collectedCards更新成功");
        }
        if (updates.followers !== void 0) {
          common_vendor.index.setStorageSync(`${storagePrefix}followers`, updates.followers);
          results.push("followers更新成功");
        }
        if (updates.deletedCardIds !== void 0) {
          common_vendor.index.setStorageSync(`${storagePrefix}deletedCardIds`, updates.deletedCardIds);
          results.push("deletedCardIds更新成功");
        }
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:929", "批量更新完成:", results.join(", "));
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:932", "批量更新存储失败:", error);
        return false;
      }
    },
    // 测试清空所有数据功能（用于验证删除后不会重置）- 仅控制台输出
    testClearAllData() {
      common_vendor.index.__f__("warn", "at pages/friend-detail/friend-detail.vue:940", "⚠️ 测试清空数据操作: 此操作将清空所有好友和名片夹数据，仅用于测试。");
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        common_vendor.index.removeStorageSync(`${storagePrefix}collectedCards`);
        common_vendor.index.removeStorageSync(`${storagePrefix}mutualFriends`);
        common_vendor.index.removeStorageSync(`${storagePrefix}followers`);
        common_vendor.index.removeStorageSync(`${storagePrefix}deletedCardIds`);
        this.mutualFriends = [];
        this.followers = [];
        this.collectedCards = [];
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:958", "✅ 数据已清空，测试成功");
        setTimeout(() => {
          this.loadFriendData();
          common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:963", "🔄 重新加载后，名片夹数据:", common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`));
        }, 500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:966", "❌ 测试清空数据失败:", error);
      }
    },
    // 测试名片夹用户取消关注功能
    testUnfollowFromCard() {
      try {
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:973", "===== 开始测试名片夹用户取消关注 =====");
        const testUser = {
          id: "test-card-user-" + Date.now(),
          name: "测试用户",
          avatar: "/static/test-avatar.png",
          description: "这是一个测试用户"
        };
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
        collectedCards.push(testUser);
        common_vendor.index.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
        let mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        mutualFriends.push(testUser);
        common_vendor.index.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
        this.mutualFriends = mutualFriends;
        this.collectedCards = collectedCards;
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1000", "测试：已添加测试用户到名片夹和互关好友，用户ID:", testUser.id);
        this.userId = testUser.id;
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1004", "测试：模拟从名片夹打开用户详情，当前用户ID:", this.userId);
        common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1007", "测试：调用unfollowUser方法执行取消关注");
        this.unfollowUser();
        setTimeout(() => {
          try {
            const updatedMutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
            const updatedCollectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
            const stillInMutualFriends = updatedMutualFriends.some((u) => u.id === testUser.id);
            const stillInCollectedCards = updatedCollectedCards.some((u) => u.id === testUser.id);
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1020", "测试结果验证:");
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1021", "- 测试用户ID:", testUser.id);
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1022", "- 互关好友列表长度:", updatedMutualFriends.length);
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1023", "- 名片夹列表长度:", updatedCollectedCards.length);
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1024", "- 仍在互关好友列表中:", stillInMutualFriends);
            common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1025", "- 仍在名片夹中:", stillInCollectedCards);
            if (!stillInMutualFriends && !stillInCollectedCards) {
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1028", "🎉 测试成功：取消关注操作完全成功，用户已从所有列表中移除");
              common_vendor.index.showToast({
                title: "测试成功：取消关注功能恢复",
                icon: "success",
                duration: 2e3
              });
            } else if (!stillInMutualFriends) {
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1035", "✅ 测试基本成功：用户已从互关好友移除，但仍在名片夹中");
              common_vendor.index.showToast({
                title: "测试基本成功",
                icon: "success",
                duration: 2e3
              });
            } else {
              common_vendor.index.__f__("log", "at pages/friend-detail/friend-detail.vue:1042", "❌ 测试失败：用户仍然在互关好友列表中");
              common_vendor.index.showToast({
                title: "测试失败，请检查修复",
                icon: "error",
                duration: 2e3
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:1051", "测试验证过程出错:", error);
            common_vendor.index.showToast({
              title: "测试验证失败",
              icon: "error",
              duration: 2e3
            });
          }
        }, 1e3);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/friend-detail/friend-detail.vue:1061", "测试名片夹取消关注功能失败:", error);
        common_vendor.index.showToast({
          title: "测试初始化失败",
          icon: "error",
          duration: 2e3
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.navigateBack && $options.navigateBack(...args)),
    c: common_vendor.o((...args) => $options.showMoreOptions && $options.showMoreOptions(...args)),
    d: common_vendor.t($options.mutualFriendCount),
    e: common_assets._imports_1$4,
    f: common_vendor.o((...args) => $options.navigateToMutualFriends && $options.navigateToMutualFriends(...args)),
    g: common_vendor.f($data.mutualFriends, (friend, index, i0) => {
      return {
        a: friend.avatar || "/static/icon/我的.png",
        b: common_vendor.o(($event) => $options.viewFriendCard(friend.id), friend.id),
        c: common_vendor.t(friend.name),
        d: common_vendor.t(friend.signature || "TA 还没有任何介绍"),
        e: common_vendor.o(($event) => $options.unfollowUser(friend.id), friend.id),
        f: friend.id
      };
    }),
    h: common_vendor.t($options.followerCount),
    i: common_assets._imports_1$4,
    j: common_vendor.o((...args) => $options.navigateToFollowers && $options.navigateToFollowers(...args)),
    k: common_vendor.f($data.followers, (follower, index, i0) => {
      return {
        a: follower.avatar || "/static/icon/我的.png",
        b: common_vendor.o(($event) => $options.viewFriendCard(follower.id), follower.id),
        c: common_vendor.t(follower.name),
        d: common_vendor.t(follower.signature || "TA 还没有任何介绍"),
        e: common_vendor.o(($event) => $options.followUser(follower.id), follower.id),
        f: follower.id
      };
    }),
    l: common_vendor.o((...args) => $options.navigateToAddFriend && $options.navigateToAddFriend(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c7ff6d1e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/friend-detail/friend-detail.js.map
