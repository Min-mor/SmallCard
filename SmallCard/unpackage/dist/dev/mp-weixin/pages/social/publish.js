"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const postContent = common_vendor.ref("");
    const selectedImages = common_vendor.ref([]);
    const isSubmitting = common_vendor.ref(false);
    const currentWordCount = common_vendor.ref(0);
    const userAvatar = common_vendor.ref("/static/icon/我的.png");
    const userName = common_vendor.ref("梨鸣唱兽");
    const router = common_vendor.useRouter();
    const canSubmit = common_vendor.computed(() => {
      return postContent.value.trim() !== "" || selectedImages.value.length > 0;
    });
    const loadUserInfo = () => {
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
        const globalUserInfo = app.globalData.userStatus.userInfo;
        userAvatar.value = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || "/static/icon/我的.png";
        userName.value = globalUserInfo.userName || globalUserInfo.nickname || "梨鸣唱兽";
      } else {
        const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (storedUserInfo) {
          userAvatar.value = storedUserInfo.avatarUrl || storedUserInfo.avatar_url || "/static/icon/我的.png";
          userName.value = storedUserInfo.userName || storedUserInfo.nickname || "梨鸣唱兽";
        } else {
          userAvatar.value = "/static/icon/我的.png";
          userName.value = "梨鸣晒兽";
        }
      }
    };
    const handleUserInfoUpdate = (updatedData) => {
      if (updatedData) {
        if (updatedData.avatarUrl) {
          userAvatar.value = updatedData.avatarUrl;
        }
        if (updatedData.userName) {
          userName.value = updatedData.userName;
        }
      }
    };
    const goBack = () => {
      router.back();
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 9 - selectedImages.value.length,
        sourceType: ["album", "camera"],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            selectedImages.value = [...selectedImages.value, ...res.tempFilePaths];
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/social/publish.vue:126", "选择图片失败:", err);
          common_vendor.index.showToast({ title: "图片选择失败", icon: "none" });
        }
      });
    };
    const deleteImage = (index) => {
      selectedImages.value.splice(index, 1);
    };
    const handleAvatarError = (e) => {
      e.target.src = "/static/icon/我的.png";
    };
    const handleInput = (e) => {
      const value = e.detail.value || "";
      currentWordCount.value = value.length;
      if (currentWordCount.value > 200) {
        postContent.value = value.slice(0, 200);
        currentWordCount.value = 200;
      }
    };
    const uploadImages = async (tempPaths) => {
      if (!tempPaths || tempPaths.length === 0)
        return [];
      return tempPaths;
    };
    const submitPost = async () => {
      var _a;
      const app = getApp();
      if (!app.globalData.userStatus.isLoggedIn) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (!canSubmit.value) {
        common_vendor.index.showToast({ title: "内容或图片不能为空", icon: "none" });
        return;
      }
      isSubmitting.value = true;
      common_vendor.index.showLoading({ title: "发布中..." });
      try {
        const uploadedImages = await uploadImages(selectedImages.value);
        const newPost = {
          id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
          content: postContent.value,
          images: uploadedImages,
          userId: ((_a = app.globalData.userStatus.userInfo) == null ? void 0 : _a.userId) || app.globalData.userStatus.userId || "current_user",
          // 修复：从userInfo对象获取正确的userId
          userName: userName.value,
          userAvatar: userAvatar.value,
          createTime: Date.now(),
          likeCount: 0,
          commentCount: 0,
          liked: false
        };
        const savedPosts = common_vendor.index.getStorageSync("myPosts") || [];
        savedPosts.unshift(newPost);
        common_vendor.index.setStorageSync("myPosts", savedPosts);
        const recommendedPosts = common_vendor.index.getStorageSync("recommendedPosts") || [];
        recommendedPosts.unshift(newPost);
        if (recommendedPosts.length > 50) {
          recommendedPosts.splice(50);
        }
        common_vendor.index.setStorageSync("recommendedPosts", recommendedPosts);
        common_vendor.index.__f__("log", "at pages/social/publish.vue:213", "开始提交数据:", newPost);
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        common_vendor.index.showToast({ title: "发布成功", icon: "success" });
        common_vendor.index.$emit("postsUpdated");
        setTimeout(() => {
          postContent.value = "";
          selectedImages.value = [];
          currentWordCount.value = 0;
          goBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/social/publish.vue:230", "发布失败:", error);
        common_vendor.index.showToast({ title: "发布失败，请稍后重试", icon: "none" });
      } finally {
        isSubmitting.value = false;
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onMounted(() => {
      const app = getApp();
      if (!app.globalData.userStatus.isLoggedIn) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => {
          goBack();
        }, 1500);
        return;
      }
      loadUserInfo();
      common_vendor.index.$on("userInfoUpdated", handleUserInfoUpdate);
    });
    common_vendor.onShow(() => {
      loadUserInfo();
    });
    common_vendor.onBeforeUnmount(() => {
      common_vendor.index.$off("userInfoUpdated", handleUserInfoUpdate);
    });
    return {
      postContent,
      selectedImages,
      isSubmitting,
      currentWordCount,
      userAvatar,
      userName,
      canSubmit,
      goBack,
      chooseImage,
      deleteImage,
      handleAvatarError,
      handleInput,
      submitPost
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.userAvatar,
    b: common_vendor.o((...args) => $setup.handleAvatarError && $setup.handleAvatarError(...args)),
    c: common_vendor.t($setup.userName),
    d: common_vendor.o([($event) => $setup.postContent = $event.detail.value, (...args) => $setup.handleInput && $setup.handleInput(...args)]),
    e: $setup.postContent,
    f: common_vendor.f($setup.selectedImages, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $setup.deleteImage(index), index),
        c: index
      };
    }),
    g: $setup.selectedImages.length < 9
  }, $setup.selectedImages.length < 9 ? {
    h: common_assets._imports_0$4,
    i: common_vendor.o((...args) => $setup.chooseImage && $setup.chooseImage(...args))
  } : {}, {
    j: common_vendor.t($setup.currentWordCount),
    k: common_vendor.t($setup.isSubmitting ? "发布中..." : "发布"),
    l: common_vendor.o((...args) => $setup.submitPost && $setup.submitPost(...args)),
    m: $setup.isSubmitting || !$setup.canSubmit
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-55c4bc3e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/social/publish.js.map
