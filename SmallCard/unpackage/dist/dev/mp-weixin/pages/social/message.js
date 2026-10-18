"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "MessagePage",
  setup() {
    const router = common_vendor.useRouter();
    const messageList = common_vendor.ref([]);
    const goBack = () => {
      router.back();
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const now = Date.now();
      const diff = now - timestamp;
      if (diff < 60 * 1e3) {
        return "刚刚";
      } else if (diff < 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 1e3)) + "分钟前";
      } else if (diff < 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 60 * 1e3)) + "小时前";
      } else if (diff < 7 * 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (24 * 60 * 60 * 1e3)) + "天前";
      } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
    };
    const loadMessages = () => {
      try {
        const storedMessages = common_vendor.index.getStorageSync("userMessages") || [];
        messageList.value = storedMessages.sort((a, b) => b.createTime - a.createTime);
        if (messageList.value.length === 0) {
          messageList.value = [
            {
              id: "1",
              userId: "1001",
              type: "like",
              userName: "张三",
              avatar: "/static/photo/张三.jpg",
              postId: "post1",
              postContent: "今天天气真好，适合出去走走！",
              createTime: Date.now() - 30 * 60 * 1e3
              // 30分钟前
            },
            {
              id: "2",
              userId: "1002",
              type: "comment",
              userName: "李四",
              avatar: "/static/photo/李四.jpg",
              postId: "post2",
              postContent: "分享一个我最近学到的新技能",
              commentContent: "太棒了，学到了！",
              createTime: Date.now() - 2 * 60 * 60 * 1e3
              // 2小时前
            },
            {
              id: "3",
              userId: "1003",
              type: "like",
              userName: "王五",
              avatar: "/static/photo/王五.jpg",
              postId: "post1",
              postContent: "今天天气真好，适合出去走走！",
              createTime: Date.now() - 1 * 24 * 60 * 60 * 1e3
              // 1天前
            }
          ];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/message.vue:136", "加载消息失败:", error);
        common_vendor.index.showToast({ title: "加载消息失败", icon: "none" });
      }
    };
    const handleMessageClick = (message) => {
      if (message.postId || message.id) {
        if (!message.userId) {
          message.userId = message.id;
        }
        message.isRead = true;
        common_vendor.index.setStorageSync("userMessages", messageList.value);
        updateMessageBadge();
        common_vendor.index.navigateTo({
          url: `/pages/social/notification-detail?messageData=${encodeURIComponent(JSON.stringify(message))}`,
          success: () => {
            common_vendor.index.__f__("log", "at pages/social/message.vue:162", "成功跳转到通知详情页面");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/social/message.vue:165", "跳转失败:", err);
            common_vendor.index.showToast({
              title: "加载通知详情失败",
              icon: "none",
              duration: 1500
            });
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: `/pages/social/index?postId=${message.postId || message.id}&fromMessage=true&createPlaceholder=true&messageData=${encodeURIComponent(JSON.stringify(message))}`
              });
            }, 500);
          }
        });
      }
    };
    const deleteMessage = (messageId) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条消息吗？",
        success: (res) => {
          if (res.confirm) {
            const index = messageList.value.findIndex((msg) => msg.id === messageId);
            if (index > -1) {
              messageList.value.splice(index, 1);
              common_vendor.index.setStorageSync("userMessages", messageList.value);
              updateMessageBadge();
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success",
                duration: 1500
              });
            }
          }
        }
      });
    };
    const updateMessageBadge = () => {
      try {
        const userMessages = common_vendor.index.getStorageSync("userMessages") || [];
        const unreadCount = userMessages.filter((msg) => !msg.isRead).length;
        if (unreadCount > 0) {
          common_vendor.index.setTabBarBadge({
            index: 2,
            // 假设消息页面在tabBar的第3位（索引为2）
            text: String(unreadCount > 99 ? "99+" : unreadCount)
          });
        } else {
          common_vendor.index.removeTabBarBadge({
            index: 2
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/message.vue:230", "更新消息角标失败:", error);
      }
    };
    common_vendor.onMounted(() => {
      loadMessages();
      updateMessageBadge();
    });
    return {
      messageList,
      goBack,
      formatTime,
      handleMessageClick,
      deleteMessage
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $setup.goBack && $setup.goBack(...args)),
    c: common_vendor.f($setup.messageList, (msg, index, i0) => {
      return common_vendor.e({
        a: msg.avatar || "/static/icon/我的.png",
        b: !msg.isRead
      }, !msg.isRead ? {} : {}, {
        c: common_vendor.t(msg.userName || "用户"),
        d: common_vendor.t(msg.type === "like" ? "点赞了你的帖子" : "评论了你的帖子"),
        e: msg.type === "like" ? 1 : "",
        f: msg.type === "comment" ? 1 : "",
        g: msg.postContent
      }, msg.postContent ? {
        h: common_vendor.t(msg.postContent)
      } : {}, {
        i: msg.commentContent && msg.type === "comment"
      }, msg.commentContent && msg.type === "comment" ? {
        j: common_vendor.t(msg.commentContent)
      } : {}, {
        k: common_vendor.t($setup.formatTime(msg.createTime)),
        l: common_vendor.o(($event) => $setup.deleteMessage(msg.id), index),
        m: index,
        n: !msg.isRead ? 1 : "",
        o: common_vendor.o(($event) => $setup.handleMessageClick(msg), index)
      });
    }),
    d: $setup.messageList.length === 0
  }, $setup.messageList.length === 0 ? {
    e: common_assets._imports_1$2
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-df03d2f4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/social/message.js.map
