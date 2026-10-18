"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      myPosts: [],
      showPostDetail: false,
      detailPost: null,
      showDeleteBox: false,
      app: null,
      comments: [],
      commentInput: "",
      replyTarget: null,
      showComments: true
    };
  },
  onLoad() {
    this.app = getApp();
    if (!this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
      common_vendor.index.showModal({
        title: "请先登录",
        content: "登录后可查看动态",
        showCancel: true,
        cancelText: "取消",
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/pages/setting/basic",
              fail: () => {
                common_vendor.index.reLaunch({
                  url: "/pages/index/cover"
                });
              }
            });
          }
        }
      });
      return;
    }
    this.loadMyPosts();
    common_vendor.index.$on("postDataUpdated", this.handlePostDataUpdated);
    common_vendor.index.$on("commentAdded", this.handleCommentAdded);
    common_vendor.index.$on("likeStatusChanged", this.handleLikeStatusChanged);
  },
  onUnload() {
    common_vendor.index.$off("postDataUpdated", this.handlePostDataUpdated);
    common_vendor.index.$off("commentAdded", this.handleCommentAdded);
    common_vendor.index.$off("likeStatusChanged", this.handleLikeStatusChanged);
  },
  onShow() {
    if (!this.app || !this.app.globalData.userStatus.isLoggedIn || this.app.globalData.userStatus.isGuest) {
      common_vendor.index.showModal({
        title: "请先登录",
        content: "登录后可查看动态",
        showCancel: true,
        cancelText: "取消",
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/pages/setting/basic",
              fail: () => {
                common_vendor.index.reLaunch({
                  url: "/pages/index/cover"
                });
              }
            });
          }
        }
      });
      return;
    }
    this.loadMyPosts();
  },
  created() {
    common_vendor.index.$on("postsUpdated", this.loadMyPosts);
  },
  beforeDestroy() {
    common_vendor.index.$off("postsUpdated", this.loadMyPosts);
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 跳转到发布页面
    goToPublish() {
      common_vendor.index.navigateTo({
        url: "/pages/social/publish"
      });
    },
    // 全局数据更新处理
    handlePostDataUpdated(data) {
      if (data && data.postId) {
        const postIndex = this.myPosts.findIndex((p) => p.id === data.postId);
        if (postIndex !== -1) {
          this.myPosts[postIndex] = { ...this.myPosts[postIndex], ...data.updatedData };
          if (this.detailPost && this.detailPost.id === data.postId) {
            this.detailPost = { ...this.detailPost, ...data.updatedData };
          }
          this.updatePostsToStorage();
        }
      }
    },
    // 评论添加处理
    handleCommentAdded(data) {
      if (data && data.postId) {
        if (this.detailPost && this.detailPost.id === data.postId) {
          this.initCommentsData();
          if (this.detailPost) {
            this.detailPost.commentCount = (this.detailPost.commentCount || 0) + 1;
          }
        }
        let postIndex = this.myPosts.findIndex((p) => p.id === data.postId);
        if (postIndex === -1) {
          postIndex = this.myPosts.findIndex(
            (p) => String(p.id).includes(String(data.postId)) || String(data.postId).includes(String(p.id))
          );
        }
        if (postIndex !== -1) {
          this.myPosts[postIndex].commentCount = (this.myPosts[postIndex].commentCount || 0) + 1;
          this.updatePostsToStorage();
          if (this.detailPost && this.detailPost.id === this.myPosts[postIndex].id) {
            this.initCommentsData();
          }
        } else {
          common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:381", "未找到匹配的帖子:", data.postId, "在", this.myPosts.map((p) => p.id));
        }
      }
    },
    // 点赞状态变更处理
    handleLikeStatusChanged(data) {
      if (data && data.postId) {
        const postIndex = this.myPosts.findIndex((p) => p.id === data.postId);
        if (postIndex !== -1) {
          this.myPosts[postIndex].likeCount = data.likeCount;
          this.myPosts[postIndex].liked = data.liked;
          this.updatePostsToStorage();
        }
        if (this.detailPost && this.detailPost.id === data.postId) {
          this.detailPost.likeCount = data.likeCount;
          this.detailPost.liked = data.liked;
        }
      }
    },
    // 发送全局数据更新事件
    emitGlobalUpdate(type, data) {
      common_vendor.index.$emit(type, data);
    },
    // 加载我的动态
    loadMyPosts() {
      var _a, _b, _c;
      try {
        const savedPosts = common_vendor.index.getStorageSync("myPosts") || [];
        const currentUserId = ((_a = this.app.globalData.userStatus.userInfo) == null ? void 0 : _a.userId) || this.app.globalData.userStatus.userId || "current_user";
        const myUserPosts = savedPosts.filter((post) => post.userId === currentUserId);
        if (myUserPosts.length === 0) {
          const currentUserName = ((_b = this.app.globalData.userStatus.userInfo) == null ? void 0 : _b.userName) || this.app.globalData.userStatus.userName || "我的昵称";
          const currentUserAvatar = ((_c = this.app.globalData.userStatus.userInfo) == null ? void 0 : _c.userAvatar) || this.app.globalData.userStatus.userAvatar || "/static/icon/用户.png";
          const mockPosts = [
            {
              id: "mock-post-1",
              userId: currentUserId,
              userName: currentUserName,
              userAvatar: currentUserAvatar,
              content: "这是一条测试动态，用于展示帖子详情功能。",
              images: ["/static/image/1.png", "/static/image/2.png", "/static/image/3.png"],
              createTime: (/* @__PURE__ */ new Date()).toISOString(),
              likeCount: 12,
              commentCount: 3,
              liked: false
            },
            {
              id: "mock-post-2",
              userId: currentUserId,
              userName: currentUserName,
              userAvatar: currentUserAvatar,
              content: "这条动态只有文字内容，可以测试文字详情的展示效果。",
              images: [],
              createTime: new Date(Date.now() - 36e5).toISOString(),
              likeCount: 5,
              commentCount: 1,
              liked: true
            },
            {
              id: "mock-post-3",
              userId: currentUserId,
              userName: currentUserName,
              userAvatar: currentUserAvatar,
              content: "这条动态有9张图片，可以测试图片网格布局和点击预览功能。",
              images: [
                "/static/image/1.png",
                "/static/image/2.png",
                "/static/image/3.png",
                "/static/image/1.png",
                "/static/image/2.png",
                "/static/image/3.png",
                "/static/image/1.png",
                "/static/image/2.png",
                "/static/image/3.png"
              ],
              createTime: new Date(Date.now() - 72e5).toISOString(),
              likeCount: 23,
              commentCount: 8,
              liked: false
            }
          ];
          const allPosts = [...mockPosts, ...savedPosts];
          common_vendor.index.setStorageSync("myPosts", allPosts);
          this.myPosts = mockPosts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        } else {
          this.myPosts = myUserPosts.sort((a, b) => b.createTime - a.createTime);
        }
        common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:474", "加载我的动态:", this.myPosts);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:476", "加载动态失败:", error);
      }
    },
    // 格式化时间
    formatTime(timestamp) {
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
    },
    // 点赞/取消点赞
    toggleLike(post, event) {
      if (!this.app.globalData.userStatus.isLoggedIn) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      const wasLiked = post.liked;
      post.liked = !wasLiked;
      post.likeCount = post.likeCount || 0;
      post.likeCount += post.liked ? 1 : -1;
      if (event && event.currentTarget && event.currentTarget.classList) {
        const likeIcon = event.currentTarget;
        const animationClass = post.liked ? "like-animation" : "unlike-animation";
        try {
          likeIcon.classList.add(animationClass);
          setTimeout(() => {
            if (likeIcon && likeIcon.classList) {
              likeIcon.classList.remove(animationClass);
            }
          }, 600);
        } catch (e) {
          common_vendor.index.__f__("warn", "at pages/home/my-dynamic.vue:540", "动画应用失败:", e);
        }
      }
      if (this.detailPost && this.detailPost.id === post.id) {
        const index = this.myPosts.findIndex((p) => p.id === post.id);
        if (index !== -1) {
          this.myPosts[index].liked = post.liked;
          this.myPosts[index].likeCount = post.likeCount;
        }
      }
      this.updatePostsToStorage();
      this.emitGlobalUpdate("likeStatusChanged", {
        postId: post.id,
        likeCount: post.likeCount,
        liked: post.liked
      });
      common_vendor.index.showToast({
        title: post.liked ? "点赞成功" : "已取消点赞",
        icon: "success",
        duration: 1200
      });
    },
    // 更新帖子到本地存储
    updatePostsToStorage() {
      try {
        if (!Array.isArray(this.myPosts)) {
          common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:576", "myPosts数据格式错误");
          return;
        }
        common_vendor.index.setStorageSync("myPosts", this.myPosts);
        let recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        if (Array.isArray(recommendedPosts)) {
          this.myPosts.forEach((myPost) => {
            const index = recommendedPosts.findIndex((post) => post.id === myPost.id);
            if (index !== -1) {
              recommendedPosts[index].liked = myPost.liked;
              recommendedPosts[index].likeCount = myPost.likeCount;
            }
          });
          common_vendor.index.setStorageSync("recommendedPosts", recommendedPosts);
        }
        common_vendor.index.$emit("postsUpdated");
        common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:601", "点赞状态已成功保存到本地存储");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:603", "保存帖子失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none",
          duration: 2e3
        });
      }
    },
    // 预览图片
    previewImage(imageList, currentIndex) {
      if (!imageList || imageList.length === 0) {
        return;
      }
      common_vendor.index.previewImage({
        urls: imageList,
        current: currentIndex,
        success: () => {
          common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:623", "图片预览成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:626", "预览图片失败:", err);
          common_vendor.index.showToast({ title: "预览图片失败", icon: "none" });
        }
      });
    },
    // 打开帖子详情
    openPostDetail(post) {
      this.detailPost = post;
      this.showPostDetail = true;
      this.initCommentsData();
    },
    // 关闭帖子详情
    closePostDetail() {
      this.showPostDetail = false;
      this.detailPost = null;
      this.comments = [];
      this.commentInput = "";
      this.replyTarget = null;
    },
    // 初始化评论数据
    initCommentsData() {
      if (!this.detailPost)
        return;
      const postId = this.detailPost.id;
      let comments = [];
      try {
        const allComments = common_vendor.index.getStorageSync("postComments") || {};
        let foundComments = false;
        if (allComments[postId] && Array.isArray(allComments[postId]) && allComments[postId].length > 0) {
          comments = allComments[postId];
          foundComments = true;
          common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:668", "从存储中精确匹配获取评论:", postId, comments.length, "条");
        } else if (Object.keys(allComments).length > 0) {
          for (let storedPostId in allComments) {
            if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
              comments = allComments[storedPostId];
              foundComments = true;
              common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:676", "从存储中宽松匹配获取评论:", postId, "匹配到", storedPostId, comments.length, "条");
              break;
            }
          }
        }
        if (!foundComments) {
          const commentCount = this.detailPost.commentCount || 0;
          if (commentCount === 0) {
            this.comments = [];
            return;
          }
          const mockUsers = ["张三", "李四", "王五", "赵六", "陈七"];
          const mockAvatars = ["/static/photo/张三.jpg", "/static/photo/李四.jpg", "/static/photo/王五.jpg", "/static/photo/赵六.jpg", "/static/photo/陈七.jpg"];
          const mockContents = [
            "写代码时的灵感进发really美妙！",
            "赞同，特别是解决bug那一刻",
            "确实很有启发",
            "同感，学习了",
            "这个想法太棒了",
            "很实用的建议",
            "感谢分享"
          ];
          let totalGenerated = 0;
          let commentIndex = 0;
          while (totalGenerated < commentCount) {
            const hasReplies = commentIndex > 0 && totalGenerated < commentCount - 1 && Math.random() > 0.5;
            const replyCount = hasReplies ? Math.min(1, commentCount - totalGenerated - 1) : 0;
            const userIndex = Math.floor(Math.random() * mockUsers.length);
            const mainComment = {
              id: `${commentIndex + 1}`,
              user: mockUsers[userIndex],
              avatar: mockAvatars[userIndex],
              content: mockContents[Math.floor(Math.random() * mockContents.length)],
              time: `${this.getRandomTime()}`,
              likeCount: 0,
              liked: false,
              showAllReplies: false,
              replies: []
            };
            if (replyCount > 0) {
              const replyUserIndex = (userIndex + 1) % mockUsers.length;
              mainComment.replies.push({
                id: `${commentIndex + 1}_1`,
                user: mockUsers[replyUserIndex],
                avatar: mockAvatars[replyUserIndex],
                toUser: mainComment.user,
                content: mockContents[Math.floor(Math.random() * mockContents.length)],
                time: `${this.getRandomTime()}`,
                likeCount: 0,
                liked: false
              });
              totalGenerated += replyCount;
            }
            comments.push(mainComment);
            totalGenerated++;
            commentIndex++;
          }
          common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:747", "生成模拟评论:", postId, comments.length, "条");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:750", "加载评论数据失败:", error);
      }
      this.comments = comments.map((comment) => ({
        ...comment,
        replies: comment.replies || [],
        showAllReplies: comment.showAllReplies || false
      }));
    },
    // 生成随机时间
    getRandomTime() {
      const hour = Math.floor(Math.random() * 24).toString().padStart(2, "0");
      const minute = Math.floor(Math.random() * 60).toString().padStart(2, "0");
      return `11-13 ${hour}:${minute}`;
    },
    // 点赞评论（切换点赞状态）
    likeComment(comment) {
      if (comment.liked) {
        comment.liked = false;
        comment.likeCount = Math.max(0, comment.likeCount - 1);
      } else {
        comment.liked = true;
        comment.likeCount++;
      }
    },
    // 回复评论
    replyToComment(comment, reply = null) {
      this.replyTarget = reply || comment;
      const targetUser = reply ? reply.user : comment.user;
      this.commentInput = `@${targetUser} `;
      this.$nextTick(() => {
        setTimeout(() => {
          common_vendor.index.createSelectorQuery().select(".comment-input").fields({ node: true }).exec((res) => {
            if (res && res[0] && res[0].node) {
              res[0].node.focus();
            }
          });
        }, 100);
      });
    },
    // 展开/收起回复
    toggleReplies(comment) {
      comment.showAllReplies = !comment.showAllReplies;
    },
    // 提交评论
    submitComment() {
      let content = this.commentInput;
      if (!content || content.trim() === "") {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
        return;
      }
      content = content.trim();
      let toUser = null;
      if (content.startsWith("@")) {
        const spaceIndex = content.indexOf(" ");
        if (spaceIndex > 0) {
          toUser = content.substring(1, spaceIndex);
          content = content.substring(spaceIndex + 1).trim();
        }
      }
      const now = /* @__PURE__ */ new Date();
      const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const userInfo = this.getUserInfo();
      let newComment;
      if (this.replyTarget) {
        const replyId = `${Date.now()}`;
        newComment = {
          id: replyId,
          user: userInfo.userName,
          avatar: userInfo.avatarUrl,
          toUser,
          content,
          time: timeStr,
          likeCount: 0,
          liked: false
        };
        if (this.replyTarget.replies === void 0) {
          const parentComment = this.findParentComment(this.replyTarget.id);
          if (parentComment) {
            parentComment.replies.push(newComment);
          }
        } else {
          this.replyTarget.replies.push(newComment);
        }
        this.replyTarget = null;
      } else {
        const mainCommentId = `${Date.now()}`;
        newComment = {
          id: mainCommentId,
          user: userInfo.userName,
          avatar: userInfo.avatarUrl,
          content,
          time: timeStr,
          likeCount: 0,
          liked: false,
          showAllReplies: false,
          replies: []
        };
        this.comments.unshift(newComment);
      }
      this.detailPost.commentCount = (this.detailPost.commentCount || 0) + 1;
      const index = this.myPosts.findIndex((p) => p.id === this.detailPost.id);
      if (index !== -1) {
        this.myPosts[index].commentCount = this.detailPost.commentCount;
      }
      this.updatePostsToStorage();
      this.emitGlobalUpdate("commentAdded", {
        postId: this.detailPost.id,
        comment: newComment
      });
      this.commentInput = "";
      try {
        const postId = this.detailPost.id;
        const allComments = common_vendor.index.getStorageSync("postComments") || {};
        let targetPostId = postId;
        for (let storedPostId in allComments) {
          if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
            targetPostId = storedPostId;
            common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:918", "发现相似的postId，使用已存在的键:", targetPostId);
            break;
          }
        }
        allComments[targetPostId] = this.comments;
        common_vendor.index.setStorageSync("postComments", allComments);
        common_vendor.index.__f__("log", "at pages/home/my-dynamic.vue:927", "评论已保存到本地存储:", targetPostId, this.comments.length, "条");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:929", "保存评论到本地存储失败:", error);
      }
      common_vendor.index.showToast({
        title: "评论成功",
        icon: "success"
      });
    },
    // 获取当前用户信息
    getUserInfo() {
      const currentUser = this.app.globalData.userStatus || {};
      return {
        userName: currentUser.userName || "当前用户",
        avatarUrl: currentUser.userAvatar || "/static/icon/我的.png"
      };
    },
    // 查找父评论
    findParentComment(replyId) {
      for (const comment of this.comments) {
        if (comment.replies) {
          for (const reply of comment.replies) {
            if (reply.id === replyId) {
              return comment;
            }
          }
        }
      }
      return null;
    },
    // 切换评论显示
    toggleComment() {
      this.showComments = !this.showComments;
    },
    // 关闭帖子详情
    closePostDetail() {
      this.showPostDetail = false;
      this.detailPost = null;
    },
    // 显示删除确认对话框
    showDeleteConfirm() {
      this.showDeleteBox = true;
    },
    // 执行删除帖子操作
    deletePost() {
      if (!this.app.globalData.userStatus.isLoggedIn) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        this.showDeleteBox = false;
        return;
      }
      try {
        const postId = this.detailPost.id;
        this.myPosts = this.myPosts.filter((item) => item.id !== postId);
        common_vendor.index.setStorageSync("myPosts", this.myPosts);
        const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        const filteredRecommendedPosts = recommendedPosts.filter((item) => item.id !== postId);
        common_vendor.index.setStorageSync("recommendedPosts", filteredRecommendedPosts);
        common_vendor.index.$emit("postsUpdated");
        this.showDeleteBox = false;
        this.closePostDetail();
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/my-dynamic.vue:1016", "删除帖子失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.myPosts, (post, index, i0) => {
      return common_vendor.e({
        a: post.userAvatar,
        b: common_vendor.t(post.userName),
        c: common_vendor.t($options.formatTime(post.createTime)),
        d: common_vendor.t(post.content),
        e: post.images && post.images.length > 0
      }, post.images && post.images.length > 0 ? {
        f: common_vendor.f(post.images, (img, imgIndex, i1) => {
          return {
            a: imgIndex,
            b: img,
            c: common_vendor.o(($event) => $options.previewImage(post.images, imgIndex), imgIndex)
          };
        })
      } : {}, {
        g: post.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
        h: common_vendor.t(post.likeCount || 0),
        i: post.liked ? 1 : "",
        j: common_vendor.o(($event) => $options.toggleLike(post, $event), post.id),
        k: post.liked ? 1 : "",
        l: common_vendor.t(post.commentCount || 0),
        m: post.id,
        n: common_vendor.o(($event) => $options.openPostDetail(post), post.id)
      });
    }),
    b: common_assets._imports_0$1,
    c: $data.myPosts.length === 0
  }, $data.myPosts.length === 0 ? {
    d: common_assets._imports_1$5,
    e: common_vendor.o((...args) => $options.goToPublish && $options.goToPublish(...args))
  } : {}, {
    f: $data.showPostDetail && $data.detailPost
  }, $data.showPostDetail && $data.detailPost ? common_vendor.e({
    g: common_assets._imports_0$2,
    h: common_vendor.o((...args) => $options.closePostDetail && $options.closePostDetail(...args)),
    i: common_assets._imports_1$1,
    j: common_vendor.o((...args) => $options.showDeleteConfirm && $options.showDeleteConfirm(...args)),
    k: $data.detailPost.userAvatar,
    l: common_vendor.t($data.detailPost.userName),
    m: common_vendor.t($data.detailPost.content || ""),
    n: $data.detailPost.images && $data.detailPost.images.length > 0
  }, $data.detailPost.images && $data.detailPost.images.length > 0 ? {
    o: common_vendor.f($data.detailPost.images, (img, imgIndex, i0) => {
      return {
        a: imgIndex,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage($data.detailPost.images, imgIndex), imgIndex)
      };
    })
  } : {}, {
    p: common_vendor.t($options.formatTime($data.detailPost.createTime)),
    q: $data.detailPost.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
    r: $data.detailPost.liked ? 1 : "",
    s: common_vendor.t($data.detailPost.likeCount || 0),
    t: $data.detailPost.liked ? 1 : "",
    v: common_vendor.o(($event) => $options.toggleLike($data.detailPost, $event)),
    w: $data.detailPost.liked ? 1 : "",
    x: common_assets._imports_0$1,
    y: common_vendor.t($data.detailPost.commentCount || 0),
    z: common_vendor.o((...args) => $options.toggleComment && $options.toggleComment(...args))
  }) : {}, {
    A: $data.showDeleteBox
  }, $data.showDeleteBox ? {
    B: common_vendor.o(($event) => $data.showDeleteBox = false),
    C: common_vendor.o(($event) => $data.showDeleteBox = false),
    D: common_vendor.o((...args) => $options.deletePost && $options.deletePost(...args))
  } : {}, {
    E: $data.showComments
  }, $data.showComments ? common_vendor.e({
    F: common_vendor.t($data.comments.length),
    G: common_vendor.t($data.comments.length),
    H: common_vendor.t($data.showComments ? "收起" : "展开"),
    I: common_vendor.o((...args) => $options.toggleComment && $options.toggleComment(...args)),
    J: $data.showComments
  }, $data.showComments ? common_vendor.e({
    K: common_vendor.f($data.comments, (comment, k0, i0) => {
      return common_vendor.e({
        a: comment.avatar,
        b: common_vendor.t(comment.user),
        c: common_vendor.t(comment.content),
        d: common_vendor.t(comment.time || "刚刚"),
        e: common_vendor.t(comment.likeCount || 0),
        f: comment.liked ? 1 : "",
        g: common_vendor.o(($event) => $options.likeComment(comment), comment.id),
        h: common_vendor.o(($event) => $options.replyToComment(comment), comment.id),
        i: comment.replies && comment.replies.length > 0
      }, comment.replies && comment.replies.length > 0 ? {
        j: common_vendor.f(comment.showAllReplies ? comment.replies : comment.replies.slice(0, 1), (reply, k1, i1) => {
          return common_vendor.e({
            a: common_vendor.t(reply.user),
            b: reply.toUser
          }, reply.toUser ? {
            c: common_vendor.t(reply.toUser)
          } : {}, {
            d: common_vendor.t(reply.content),
            e: common_vendor.t(reply.time || "刚刚"),
            f: common_vendor.t(reply.likeCount || 0),
            g: reply.liked ? 1 : "",
            h: common_vendor.o(($event) => $options.likeComment(reply), reply.id),
            i: common_vendor.o(($event) => $options.replyToComment(comment, reply), reply.id),
            j: reply.id
          });
        })
      } : {}, {
        k: comment.replies && comment.replies.length > 1
      }, comment.replies && comment.replies.length > 1 ? {
        l: common_vendor.t(comment.showAllReplies ? "收起" : "展开"),
        m: common_vendor.t(comment.replies.length - 1),
        n: common_vendor.o(($event) => $options.toggleReplies(comment), comment.id)
      } : {}, {
        o: comment.id
      });
    }),
    L: $data.comments.length === 0
  }, $data.comments.length === 0 ? {} : {}) : {}) : {}, {
    M: $data.showComments
  }, $data.showComments ? {
    N: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    O: $data.commentInput,
    P: common_vendor.o(($event) => $data.commentInput = $event.detail.value),
    Q: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args))
  } : {}, {
    R: $data.showDeleteBox
  }, $data.showDeleteBox ? {
    S: common_vendor.o(($event) => $data.showDeleteBox = false),
    T: common_vendor.o(($event) => $data.showDeleteBox = false),
    U: common_vendor.o((...args) => $options.deletePost && $options.deletePost(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bc87964f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/my-dynamic.js.map
