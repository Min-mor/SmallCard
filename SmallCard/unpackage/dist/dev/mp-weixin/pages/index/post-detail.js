"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      postDetail: null,
      postId: "",
      category: "",
      comments: [],
      commentInput: "",
      replyTarget: null
    };
  },
  onLoad(options) {
    this.postId = options.id || "";
    this.category = options.category || "";
    this.loadPostDetail();
    this.initCommentsData();
    common_vendor.index.$on("postDataUpdated", this.handlePostDataUpdated);
    common_vendor.index.$on("commentAdded", this.handleCommentAdded);
    common_vendor.index.$on("likeStatusChanged", this.handleLikeStatusChanged);
  },
  onUnload() {
    common_vendor.index.$off("postDataUpdated", this.handlePostDataUpdated);
    common_vendor.index.$off("commentAdded", this.handleCommentAdded);
    common_vendor.index.$off("likeStatusChanged", this.handleLikeStatusChanged);
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 加载帖子详情
    loadPostDetail() {
      const pages = getCurrentPages();
      let homePage = null;
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === "pages/index/index") {
          homePage = pages[i];
          break;
        }
      }
      if (homePage) {
        let postData = [];
        if (this.category === "最多点击") {
          postData = homePage.$vm.contentData[0];
        } else if (this.category === "最多评论") {
          postData = homePage.$vm.contentData[1];
        } else if (this.category === "最多点赞") {
          postData = homePage.$vm.contentData[2];
        }
        const post = postData.find((item) => item.id.toString() === this.postId);
        if (post) {
          this.postDetail = JSON.parse(JSON.stringify(post));
          if (this.postDetail.image && !this.postDetail.images) {
            this.postDetail.images = [this.postDetail.image];
          } else if (!this.postDetail.images) {
            this.postDetail.images = [];
          }
        } else {
          common_vendor.index.showToast({
            title: "找不到该帖子",
            icon: "none"
          });
        }
      } else {
        this.postDetail = {
          id: this.postId,
          avatar: "/static/icon/社交媒体1.png",
          name: "11:21:220",
          time: "明天考试人工智能，根本复习不进去",
          desc: "明天考试人工智能，根本复习不进去",
          image: "",
          images: ["/static/image/轮播图2.JPG", "/static/image/轮播图3.JPG", "/static/image/轮播图4.JPG"],
          comment: 5,
          like: 1,
          liked: false
        };
      }
    },
    // 处理点赞
    handleLike() {
      if (!this.postDetail)
        return;
      this.postDetail.liked = !this.postDetail.liked;
      this.postDetail.like = this.postDetail.liked ? this.postDetail.like + 1 : Math.max(0, this.postDetail.like - 1);
      common_vendor.index.$emit("likeStatusChanged", {
        postId: this.postId,
        likes: this.postDetail.like,
        isLiked: this.postDetail.liked
      });
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === "pages/index/index") {
          const homePage = pages[i];
          let targetList;
          if (this.category === "最多点击") {
            targetList = homePage.$vm.contentData[0];
          } else if (this.category === "最多评论") {
            targetList = homePage.$vm.contentData[1];
          } else if (this.category === "最多点赞") {
            targetList = homePage.$vm.contentData[2];
          }
          if (targetList) {
            const post = targetList.find((item) => item.id.toString() === this.postId);
            if (post) {
              post.liked = this.postDetail.liked;
              post.like = this.postDetail.like;
            }
          }
          break;
        }
      }
      common_vendor.index.showToast({
        title: this.postDetail.liked ? "点赞成功" : "取消点赞",
        icon: "none"
      });
    },
    // 初始化评论数据
    initCommentsData() {
      if (!this.postDetail)
        return;
      const postId = this.postId;
      let comments = [];
      try {
        const allComments = common_vendor.index.getStorageSync("postComments") || {};
        let foundComments = false;
        if (allComments[postId] && Array.isArray(allComments[postId]) && allComments[postId].length > 0) {
          comments = allComments[postId];
          foundComments = true;
          common_vendor.index.__f__("log", "at pages/index/post-detail.vue:304", "从存储中精确匹配获取评论:", postId, comments.length, "条");
        } else if (Object.keys(allComments).length > 0) {
          for (let storedPostId in allComments) {
            if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
              comments = allComments[storedPostId];
              foundComments = true;
              common_vendor.index.__f__("log", "at pages/index/post-detail.vue:312", "从存储中宽松匹配获取评论:", postId, "匹配到", storedPostId, comments.length, "条");
              break;
            }
          }
        }
        if (!foundComments) {
          const commentCount = this.postDetail.comment || 0;
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
                likeCount: 0
              });
              totalGenerated += replyCount;
            }
            comments.push(mainComment);
            totalGenerated++;
            commentIndex++;
          }
          common_vendor.index.__f__("log", "at pages/index/post-detail.vue:381", "生成模拟评论:", postId, comments.length, "条");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/post-detail.vue:384", "加载评论数据失败:", error);
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
      if (content.startsWith("@")) {
        const spaceIndex = content.indexOf(" ");
        if (spaceIndex > 0) {
          content = content.substring(spaceIndex + 1).trim();
        }
      }
      const now = /* @__PURE__ */ new Date();
      const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const userInfo = this.getUserInfo();
      let mainCommentId = null;
      let newComment = null;
      if (this.replyTarget) {
        const replyId = `${Date.now()}`;
        newComment = {
          id: replyId,
          user: userInfo.userName,
          avatar: userInfo.avatarUrl,
          toUser: this.replyTarget.user,
          content,
          time: timeStr,
          likeCount: 0,
          liked: false
        };
        if (this.replyTarget.replies === void 0) {
          const parentComment = this.findParentComment(this.replyTarget.id);
          if (parentComment) {
            parentComment.replies.push(newComment);
            mainCommentId = parentComment.id;
          }
        } else {
          this.replyTarget.replies.push(newComment);
          mainCommentId = this.replyTarget.id;
        }
        this.replyTarget = null;
      } else {
        mainCommentId = `${Date.now()}`;
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
        this.comments.push(newComment);
      }
      if (this.postDetail) {
        this.postDetail.comment = (this.postDetail.comment || 0) + 1;
      }
      const pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === "pages/index/index") {
          const homePage = pages[i];
          let targetPost = null;
          for (let categoryData of homePage.$vm.contentData) {
            targetPost = categoryData.find((item) => item.id.toString() === this.postId);
            if (targetPost)
              break;
          }
          if (targetPost) {
            targetPost.comment = this.postDetail.comment;
            if (!homePage.$vm.commentsData) {
              homePage.$vm.commentsData = {};
            }
            if (!homePage.$vm.commentsData[this.postId]) {
              homePage.$vm.commentsData[this.postId] = [];
            }
            if (!this.replyTarget) {
              homePage.$vm.commentsData[this.postId].push(newComment);
            } else {
              const mainComment = homePage.$vm.commentsData[this.postId].find((c) => c.id === mainCommentId);
              if (mainComment) {
                if (!mainComment.replies) {
                  mainComment.replies = [];
                }
                mainComment.replies.push(newComment);
              }
            }
          }
          break;
        }
      }
      this.commentInput = "";
      try {
        let postComments = common_vendor.index.getStorageSync("postComments") || {};
        const postId = this.postId;
        let targetPostId = postId;
        for (let storedPostId in postComments) {
          if (storedPostId.toString().includes(postId.toString()) || postId.toString().includes(storedPostId.toString())) {
            targetPostId = storedPostId;
            common_vendor.index.__f__("log", "at pages/index/post-detail.vue:581", "发现相似的postId，使用已存在的键:", targetPostId);
            break;
          }
        }
        postComments[targetPostId] = this.comments;
        common_vendor.index.setStorageSync("postComments", postComments);
        common_vendor.index.__f__("log", "at pages/index/post-detail.vue:593", "评论已保存到本地存储:", targetPostId, this.comments.length);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/post-detail.vue:595", "保存评论数据到本地存储失败:", error);
      }
      common_vendor.index.$emit("commentAdded", {
        postId: this.postId,
        comment: newComment
      });
      common_vendor.index.showToast({
        title: "评论成功",
        icon: "success"
      });
    },
    // 预览图片
    previewImage(index) {
      if (this.postDetail && this.postDetail.images && this.postDetail.images.length > 0) {
        common_vendor.index.previewImage({
          current: index,
          urls: this.postDetail.images.slice(0, 9),
          // 最多显示9张
          showmenu: true
        });
      }
    },
    // 查找子评论对应的父评论
    findParentComment(replyId) {
      for (const comment of this.comments) {
        if (comment.replies && comment.replies.some((reply) => reply.id === replyId)) {
          return comment;
        }
      }
      return null;
    },
    // 全局数据更新处理
    handlePostDataUpdated(data) {
      if (data && data.postId === this.postId) {
        this.postDetail = { ...this.postDetail, ...data.updatedData };
      }
    },
    // 评论添加处理
    handleCommentAdded(data) {
      if (data && data.postId === this.postId) {
        this.initCommentsData();
        if (this.postDetail) {
          this.postDetail.comment = (this.postDetail.comment || 0) + 1;
        }
      }
    },
    // 点赞状态变更处理
    handleLikeStatusChanged(data) {
      if (data && data.postId === this.postId) {
        this.postDetail.like = data.likes;
        this.postDetail.liked = data.isLiked;
      }
    },
    // 获取当前用户信息
    getUserInfo() {
      let userInfo = {
        userName: "我",
        avatarUrl: "/static/icon/我的.png"
      };
      try {
        const app = getApp();
        if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
          const globalUserInfo = app.globalData.userStatus.userInfo;
          userInfo.userName = globalUserInfo.userName || globalUserInfo.nickname || "我";
          userInfo.avatarUrl = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || "/static/icon/我的.png";
        } else {
          const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
          if (storedUserInfo) {
            const parsedUserInfo = typeof storedUserInfo === "string" ? JSON.parse(storedUserInfo) : storedUserInfo;
            userInfo.userName = parsedUserInfo.userName || parsedUserInfo.nickname || "我";
            userInfo.avatarUrl = parsedUserInfo.avatarUrl || parsedUserInfo.avatar_url || "/static/icon/我的.png";
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/post-detail.vue:684", "获取用户信息失败:", error);
      }
      return userInfo;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_assets._imports_2,
    d: $data.postDetail
  }, $data.postDetail ? common_vendor.e({
    e: $data.postDetail.avatar || "/static/icon/我的.png",
    f: common_vendor.t($data.postDetail.name),
    g: common_vendor.t($data.postDetail.time),
    h: common_vendor.t($data.postDetail.desc),
    i: $data.postDetail.images && $data.postDetail.images.length > 0
  }, $data.postDetail.images && $data.postDetail.images.length > 0 ? common_vendor.e({
    j: $data.postDetail.images.length === 1
  }, $data.postDetail.images.length === 1 ? {
    k: $data.postDetail.images[0],
    l: common_vendor.o(($event) => $options.previewImage(0))
  } : $data.postDetail.images.length === 2 ? {
    n: common_vendor.f($data.postDetail.images, (img, index, i0) => {
      return {
        a: img,
        b: index,
        c: common_vendor.o(($event) => $options.previewImage(index), index)
      };
    })
  } : $data.postDetail.images.length === 3 ? {
    p: $data.postDetail.images[0],
    q: common_vendor.o(($event) => $options.previewImage(0)),
    r: common_vendor.f($data.postDetail.images.slice(1), (img, index, i0) => {
      return {
        a: img,
        b: index + 1,
        c: common_vendor.o(($event) => $options.previewImage(index + 1), index + 1)
      };
    })
  } : $data.postDetail.images.length === 4 ? {
    t: common_vendor.f($data.postDetail.images, (img, index, i0) => {
      return {
        a: img,
        b: index,
        c: common_vendor.o(($event) => $options.previewImage(index), index)
      };
    })
  } : {
    v: common_vendor.f($data.postDetail.images.slice(0, 9), (img, index, i0) => {
      return common_vendor.e({
        a: img,
        b: index === 8 && $data.postDetail.images.length > 9
      }, index === 8 && $data.postDetail.images.length > 9 ? {
        c: common_vendor.t($data.postDetail.images.length - 9)
      } : {}, {
        d: index,
        e: common_vendor.o(($event) => $options.previewImage(index), index)
      });
    })
  }, {
    m: $data.postDetail.images.length === 2,
    o: $data.postDetail.images.length === 3,
    s: $data.postDetail.images.length === 4
  }) : {}, {
    w: common_assets._imports_0$1,
    x: common_vendor.t($data.postDetail.comment || 0),
    y: $data.postDetail.liked ? "/static/icon/已点赞.png" : "/static/icon/点赞.png",
    z: common_vendor.t($data.postDetail.like || 0),
    A: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    B: common_vendor.f($data.comments, (comment, k0, i0) => {
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
        j: common_vendor.f(comment.replies, (reply, k1, i1) => {
          return common_vendor.e({
            a: common_vendor.t(reply.user),
            b: reply.toUser
          }, reply.toUser ? {
            c: common_vendor.t(reply.toUser)
          } : {}, {
            d: common_vendor.t(reply.content),
            e: common_vendor.t(reply.time || "刚刚"),
            f: common_vendor.o(($event) => $options.replyToComment(comment, reply), reply.id),
            g: reply.id
          });
        })
      } : {}, {
        k: comment.replies && comment.replies.length > 1
      }, comment.replies && comment.replies.length > 1 ? {
        l: common_vendor.t(comment.showAllReplies ? "收起" : "展开"),
        m: common_vendor.o(($event) => $options.toggleReplies(comment), comment.id)
      } : {}, {
        n: comment.id
      });
    })
  }) : {}, {
    C: $data.postDetail
  }, $data.postDetail ? {
    D: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    E: $data.commentInput,
    F: common_vendor.o(($event) => $data.commentInput = $event.detail.value),
    G: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f9898ac1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/post-detail.js.map
