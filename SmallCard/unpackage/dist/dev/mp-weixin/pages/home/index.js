"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {
        avatarUrl: "",
        userName: "",
        userIntro: "",
        userTag: "",
        userMotto: ""
      },
      isLoggedIn: false,
      isGuest: false,
      showPageContent: false,
      friendCount: 0,
      // 好友数量（等于名片夹数量）
      praiseCount: 0,
      // 夸夸数量
      showShareModal: false,
      // 分享弹窗显示状态
      // 编辑模式控制
      isEditMode: false,
      // 是否处于编辑模式
      // 模块相关数据
      modules: [],
      containerHeight: 500,
      // 模块容器高度
      // 拖拽相关状态
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      moduleStartX: 0,
      moduleStartY: 0,
      editingModuleId: null,
      // 调整大小相关状态
      isResizing: false,
      resizingModuleId: null,
      resizeStartX: 0,
      resizeStartY: 0,
      resizeStartWidth: 0,
      resizeStartHeight: 0,
      moduleRefs: {},
      // 模块DOM引用
      // 编辑内容相关状态
      showEditModal: false,
      currentEditingModule: null,
      editContentType: "text",
      editContentValue: "",
      editModuleIcon: "",
      isEditingSocialModule: false,
      isSavingEdit: false,
      // 社交媒体图标列表
      socialIcons: [
        "/static/icon/社交媒体1.png",
        "/static/icon/社交媒体2.png",
        "/static/icon/社交媒体3.png",
        "/static/icon/社交媒体4.png",
        "/static/icon/社交媒体5.png",
        "/static/icon/QQ.png",
        "/static/icon/wechat.png"
      ],
      // 表情包列表
      emojis: ["😊", "😂", "😍", "🤔", "😎", "👍", "❤️", "🎉", "🔥", "✨"]
    };
  },
  onLoad() {
    const app = getApp();
    if (!app.globalData) {
      app.globalData = {};
    }
    if (!app.globalData.userStatus) {
      app.globalData.userStatus = {
        isLoggedIn: false,
        isGuest: false,
        userInfo: null
      };
    }
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.isGuest = app.globalData.userStatus.isGuest;
    this.loadUserInfo();
    this.listenGlobalDataChange();
    this.initModules();
  },
  mounted() {
    this.updateContainerHeight();
    const that = this;
    window.addEventListener("resize", () => {
      that.updateContainerHeight();
    });
  },
  // 合并的onUnload方法
  onUnload() {
    window.removeEventListener("resize", this.updateContainerHeight);
    this.clearLongPressTimer();
    common_vendor.index.$off("userInfoUpdated");
    common_vendor.index.$off("praisesUpdated");
    common_vendor.index.$off("cardsDataUpdated");
  },
  onShow() {
    const app = getApp();
    if (!app.globalData) {
      app.globalData = {};
    }
    if (!app.globalData.userStatus) {
      app.globalData.userStatus = {
        isLoggedIn: true,
        // 默认允许访问，避免空白页面
        isGuest: false,
        userInfo: {}
      };
    }
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.isGuest = app.globalData.userStatus.isGuest;
    if (this.isGuest) {
      this.showPageContent = false;
      if (app.requireLogin) {
        app.requireLogin();
      } else {
        common_vendor.index.showToast({
          title: "游客不能访问我的页面，请先登录",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/index/index"
          });
        }, 2e3);
      }
    } else {
      this.showPageContent = true;
      this.loadUserInfo();
      this.loadFriendCount();
      this.loadPraiseCount();
    }
  },
  // 合并的mounted方法
  mounted() {
    this.updateContainerHeight();
    const that = this;
    window.addEventListener("resize", () => {
      that.updateContainerHeight();
    });
    common_vendor.index.$on("praisesUpdated", () => {
      common_vendor.index.__f__("log", "at pages/home/index.vue:404", "接收到夸夸数据更新事件(praisesUpdated)");
      this.loadPraiseCount();
    });
    common_vendor.index.$on("praiseDataUpdated", () => {
      common_vendor.index.__f__("log", "at pages/home/index.vue:410", "接收到夸夸数据更新事件(praiseDataUpdated)");
      this.loadPraiseCount();
    });
  },
  methods: {
    // 跳转到夸夸页面
    goToPraisePage() {
      common_vendor.index.navigateTo({
        url: "/pages/home/praise"
      });
    },
    // 加载用户信息
    loadUserInfo() {
      try {
        const userInfoStr = common_vendor.index.getStorageSync("userInfo");
        let userInfo = null;
        if (userInfoStr) {
          if (typeof userInfoStr === "string") {
            userInfo = JSON.parse(userInfoStr);
          } else {
            userInfo = userInfoStr;
          }
        }
        if (userInfo && Object.keys(userInfo).length > 0) {
          const normalizedInfo = {
            avatarUrl: userInfo.avatarUrl || userInfo.avatar || "",
            userName: userInfo.userName || userInfo.name || userInfo.nickname || "梨鸠晒普",
            userIntro: userInfo.userIntro || userInfo.intro || "",
            userTag: userInfo.userTag || userInfo.tag || "",
            userMotto: userInfo.userMotto || userInfo.motto || ""
          };
          this.userInfo = { ...normalizedInfo };
        } else {
          this.userInfo = {
            avatarUrl: "",
            userName: "梨鸠晒普",
            userIntro: "我要浦到天光",
            userTag: "",
            userMotto: ""
          };
        }
        common_vendor.index.__f__("log", "at pages/home/index.vue:456", "加载的用户信息:", this.userInfo);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:458", "加载用户信息失败:", error);
        this.userInfo = {
          avatarUrl: "",
          userName: "梨鸠晒普",
          userIntro: "我要浦到天光",
          userTag: "",
          userMotto: ""
        };
      }
      this.loadFriendCount();
      this.loadPraiseCount();
    },
    // 加载夸夸数量
    loadPraiseCount() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        const praises = common_vendor.index.getStorageSync(`${storagePrefix}praises`);
        if (praises && praises.length > 0) {
          this.praiseCount = praises.length;
        } else {
          this.praiseCount = 0;
        }
        common_vendor.index.__f__("log", "at pages/home/index.vue:491", "加载的夸夸总数量:", this.praiseCount);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:493", "加载夸夸数量失败:", error);
        this.praiseCount = 0;
      }
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
        common_vendor.index.__f__("error", "at pages/home/index.vue:512", "获取用户ID失败:", e);
        return "default_user";
      }
    },
    // 加载好友数量（只计算互相关注的好友，使用用户ID隔离的存储键）
    loadFriendCount() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        let mutualFriends = common_vendor.index.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        if (mutualFriends.length === 0) {
          const collectedCards = common_vendor.index.getStorageSync(`${storagePrefix}collectedCards`) || [];
          mutualFriends = collectedCards;
        }
        if (mutualFriends.length > 0) {
          this.friendCount = mutualFriends.length;
        } else {
          this.friendCount = 11;
        }
        common_vendor.index.__f__("log", "at pages/home/index.vue:543", "加载的互相关注好友数量:", this.friendCount);
        common_vendor.index.__f__("log", "at pages/home/index.vue:544", "只有互相关注的用户才显示在好友列表中，添加我的用户不计入好友数量");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:546", "加载好友数量失败:", error);
        this.friendCount = 11;
      }
    },
    // 监听全局数据变化
    listenGlobalDataChange() {
      common_vendor.index.$on("userInfoUpdated", (data) => {
        this.userInfo = { ...this.userInfo, ...data };
        common_vendor.index.setStorageSync("userInfo", this.userInfo);
      });
      common_vendor.index.$on("praisesUpdated", () => {
        this.loadPraiseCount();
      });
      common_vendor.index.$on("cardsDataUpdated", () => {
        this.loadFriendCount();
      });
    },
    chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.userInfo.avatarUrl = res.tempFilePaths[0];
          common_vendor.index.setStorageSync("userInfo", this.userInfo);
          common_vendor.index.showToast({ title: "头像更新成功", icon: "success" });
        }
      });
    },
    // 编辑用户名
    editUserName() {
      common_vendor.index.showModal({
        title: "修改用户名",
        editable: true,
        placeholderText: "请输入新的用户名",
        confirmText: "确定",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm && res.content) {
            const newUserName = res.content.trim();
            if (newUserName && newUserName.length > 0) {
              this.userInfo.userName = newUserName;
              common_vendor.index.setStorageSync("userInfo", this.userInfo);
              common_vendor.index.$emit("userInfoUpdated", { userName: newUserName });
              common_vendor.index.showToast({ title: "用户名修改成功", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: "用户名不能为空", icon: "none" });
            }
          }
        }
      });
    },
    // 跳转到标签编辑页（支持新增/修改）
    addTag() {
      common_vendor.index.navigateTo({
        url: "/pages/tag-edit/tag-edit"
      });
    },
    // 跳转到我的动态页面
    viewDynamic() {
      common_vendor.index.navigateTo({
        url: "/pages/home/my-dynamic"
      });
    },
    toProfile() {
    },
    toPublish() {
    },
    toMessage() {
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      let socialLinks = [];
      try {
        const storedSocialStr = common_vendor.index.getStorageSync("socialLinks");
        if (storedSocialStr) {
          socialLinks = typeof storedSocialStr === "string" ? JSON.parse(storedSocialStr) : storedSocialStr;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:646", "加载社交媒体链接失败:", error);
      }
      this.modules = [];
      const positions = [
        { x: 10, y: 10 },
        { x: 180, y: 10 },
        { x: 10, y: 120 },
        { x: 180, y: 120 }
      ];
      if (socialLinks && socialLinks.length > 0) {
        socialLinks.forEach((social, index) => {
          if (social.link && index < positions.length) {
            const position = positions[index];
            this.modules.push({
              id: Date.now() + index,
              x: position.x,
              y: position.y,
              width: 150,
              height: 100,
              type: "text",
              // 使用文本类型显示链接
              content: social.link,
              icon: social.icon
              // 保存原始图标路径用于显示
            });
          }
        });
      }
      while (this.modules.length < 4) {
        const index = this.modules.length;
        const position = positions[index];
        const socialIcons = [
          "/static/icon/社交媒体1.png",
          "/static/icon/社交媒体2.png",
          "/static/icon/社交媒体3.png",
          "/static/icon/社交媒体4.png"
        ];
        this.modules.push({
          id: Date.now() + index,
          x: position.x,
          y: position.y,
          width: 150,
          height: 100,
          type: "image",
          content: socialIcons[index]
        });
      }
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      if (!this.isEditMode)
        return;
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      common_vendor.index.showToast({
        title: "开始调整大小",
        icon: "none",
        duration: 1e3
      });
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      try {
        if (this.isDragging || this.isResizing) {
          common_vendor.index.__f__("log", "at pages/home/index.vue:898", "拖拽或调整大小中，无法编辑");
          return;
        }
        this.currentEditingModule = module;
        this.editContentType = module.type || "text";
        this.editContentValue = module.content || "";
        this.editModuleIcon = module.icon || "";
        this.isEditingSocialModule = module.type === "text" && module.icon;
        common_vendor.index.__f__("log", "at pages/home/index.vue:912", "编辑模块：", module);
        common_vendor.index.__f__("log", "at pages/home/index.vue:913", "编辑类型：", this.editContentType);
        common_vendor.index.__f__("log", "at pages/home/index.vue:914", "是否社交媒体模块：", this.isEditingSocialModule);
        this.showEditModal = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:919", "编辑模块内容异常：", error);
        common_vendor.index.showToast({
          title: "编辑失败，请重试",
          icon: "none"
        });
      }
    },
    // 选择图片
    selectImage() {
      try {
        common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            if (res.tempFilePaths && res.tempFilePaths.length > 0) {
              this.editContentValue = res.tempFilePaths[0];
              common_vendor.index.__f__("log", "at pages/home/index.vue:939", "选择图片成功：", this.editContentValue);
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/home/index.vue:943", "选择图片失败：", err);
            common_vendor.index.showToast({
              title: "选择图片失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:951", "图片选择功能异常：", error);
      }
    },
    // 确认编辑内容
    confirmEditContent() {
      try {
        if (this.isSavingEdit) {
          return;
        }
        if (!this.currentEditingModule) {
          common_vendor.index.__f__("error", "at pages/home/index.vue:964", "当前无编辑模块");
          return;
        }
        const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
        if (moduleIndex === -1) {
          common_vendor.index.__f__("error", "at pages/home/index.vue:971", "未找到模块索引");
          return;
        }
        this.isSavingEdit = true;
        common_vendor.index.__f__("log", "at pages/home/index.vue:978", "更新模块内容：", this.editContentType, this.editContentValue);
        this.modules[moduleIndex].type = this.editContentType;
        this.modules[moduleIndex].content = this.editContentValue;
        if (this.isEditingSocialModule) {
          this.modules[moduleIndex].icon = this.editModuleIcon;
          let link = this.editContentValue.trim();
          if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
            link = "http://" + link;
            this.modules[moduleIndex].content = link;
          }
        }
        this.saveModules();
        setTimeout(() => {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          this.showEditModal = false;
          this.isSavingEdit = false;
        }, 300);
        this.currentEditingModule = null;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:1012", "确认编辑内容异常：", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 处理模块点击事件（使用tap替代click，更适合小程序环境）
    handleModuleTap(module) {
      if (this.isEditMode && !this.isDragging && !this.isResizing) {
        this.editModuleContent(module);
      } else if (!this.isEditMode && module.type === "text" && module.icon && module.content) {
        try {
          let url = module.content;
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "http://" + url;
          }
          common_vendor.index.openUrl({
            url,
            success: () => {
              common_vendor.index.__f__("log", "at pages/home/index.vue:1042", "成功打开链接:", url);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/home/index.vue:1045", "打开链接失败:", err);
              common_vendor.index.showToast({
                title: "无法打开链接",
                icon: "none"
              });
            }
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/home/index.vue:1054", "处理链接点击异常:", error);
        }
      }
    },
    // 切换编辑模式
    toggleEditMode() {
      common_vendor.index.__f__("log", "at pages/home/index.vue:1061", "编辑按钮被点击，当前isEditMode状态：", this.isEditMode);
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
      this.isEditMode = !this.isEditMode;
      common_vendor.index.__f__("log", "at pages/home/index.vue:1073", "切换后isEditMode状态：", this.isEditMode);
      if (!this.isEditMode) {
        common_vendor.index.showToast({
          title: "已保存修改",
          icon: "success",
          duration: 1500
        });
        this.saveModules();
      } else {
        common_vendor.index.showToast({
          title: "点击模块右下角可直接调整大小",
          icon: "none",
          duration: 2e3
        });
      }
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    // 初始化模块
    initModules() {
      const savedModules = common_vendor.index.getStorageSync("interestModules");
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体1.png"
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体2.png"
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体3.png"
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: "image",
          content: "/static/icon/社交媒体4.png"
        }
      ];
      this.saveModules();
    },
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        this.containerHeight = containerWidth * 1.2;
      }
    },
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs)
          this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      event.stopPropagation();
      if (this.isResizing)
        return;
      this.isDragging = true;
      this.editingModuleId = module.id;
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      event.preventDefault();
    },
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      if (!this.isDragging || this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      event.preventDefault();
    },
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        this.saveModules();
      }
    },
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      event.stopPropagation();
      this.isResizing = true;
      this.resizingModuleId = module.id;
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      event.preventDefault();
    },
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing)
        return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      const moduleIndex = this.modules.findIndex((m) => m.id === this.resizingModuleId);
      if (moduleIndex === -1)
        return;
      const module = this.modules[moduleIndex];
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      event.preventDefault();
    },
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        this.saveModules();
      }
    },
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        if (i === currentIndex)
          continue;
        const otherModule = this.modules[i];
        if (!(module.x + module.width <= otherModule.x || module.x >= otherModule.x + otherModule.width || module.y + module.height <= otherModule.y || module.y >= otherModule.y + otherModule.height)) {
          return true;
        }
      }
      return false;
    },
    // 编辑模块内容
    editModuleContent(module) {
      if (this.isDragging || this.isResizing)
        return;
      this.currentEditingModule = module;
      this.editContentType = module.type || "text";
      this.editContentValue = module.content || "";
      this.showEditModal = true;
    },
    // 选择图片
    selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule)
        return;
      const moduleIndex = this.modules.findIndex((m) => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1)
        return;
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      this.saveModules();
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    // 保存模块数据到本地存储
    saveModules() {
      common_vendor.index.setStorageSync("interestModules", this.modules);
    },
    shareToWechat() {
      common_vendor.index.showToast({ title: "分享成功！", icon: "success" });
      this.showShareModal = false;
    },
    shareToQQ() {
      common_vendor.index.showToast({ title: "分享成功！", icon: "success" });
      this.showShareModal = false;
    },
    shareToMail() {
      common_vendor.index.showToast({ title: "分享成功！", icon: "success" });
      this.showShareModal = false;
    },
    // 跳转到名片夹页面
    navigateToCardFolder() {
      common_vendor.index.navigateTo({
        url: "/pages/card-folder/card-folder"
      });
    },
    // 跳转到设置页面
    navigateToSetting() {
      common_vendor.index.navigateTo({
        url: "/pages/set/set"
      });
    },
    // 新增方法：跳转到联系方式页面
    goToContactPage() {
      common_vendor.index.navigateTo({
        url: "/pages/contact/contact"
      });
    },
    // 导航到好友列表（好友详情页面）
    goToFriendList() {
      common_vendor.index.navigateTo({
        url: "/pages/friend-detail/friend-detail"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showPageContent
  }, $data.showPageContent ? common_vendor.e({
    b: common_vendor.o((...args) => $options.navigateToCardFolder && $options.navigateToCardFolder(...args)),
    c: common_vendor.o((...args) => $options.navigateToSetting && $options.navigateToSetting(...args)),
    d: $data.userInfo.avatarUrl || "/static/icon/我的.png",
    e: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args)),
    f: common_vendor.t($data.userInfo.userName || "梨鸠晒普"),
    g: common_vendor.o((...args) => $options.editUserName && $options.editUserName(...args)),
    h: common_vendor.t($data.userInfo.userIntro || "我要浦到天光"),
    i: $data.userInfo.userTag
  }, $data.userInfo.userTag ? {
    j: common_vendor.t($data.userInfo.userTag)
  } : {}, {
    k: $data.userInfo.userMotto
  }, $data.userInfo.userMotto ? {
    l: common_vendor.t($data.userInfo.userMotto)
  } : {}, {
    m: common_vendor.o((...args) => $options.addTag && $options.addTag(...args)),
    n: common_vendor.o((...args) => $options.goToContactPage && $options.goToContactPage(...args)),
    o: common_vendor.t($data.friendCount),
    p: common_vendor.o((...args) => $options.goToFriendList && $options.goToFriendList(...args)),
    q: common_vendor.t($data.praiseCount),
    r: common_vendor.o((...args) => $options.goToPraisePage && $options.goToPraisePage(...args)),
    s: common_vendor.o((...args) => $options.viewDynamic && $options.viewDynamic(...args)),
    t: common_vendor.f($data.modules, (module, index, i0) => {
      return common_vendor.e({
        a: module.type === "text" && module.icon
      }, module.type === "text" && module.icon ? {
        b: module.icon,
        c: common_vendor.t(module.content || ($data.isEditMode ? "点击编辑" : ""))
      } : module.type === "image" && module.content ? {
        e: module.content || "/static/icon/社交媒体1.png"
      } : module.type === "text" || module.type === "emoji" ? {
        g: common_vendor.t(module.content || ($data.isEditMode ? "点击编辑" : ""))
      } : $data.isEditMode ? {} : {}, {
        d: module.type === "image" && module.content,
        f: module.type === "text" || module.type === "emoji",
        h: common_vendor.o(($event) => $options.handleModuleTap(module), module.id)
      }, $data.isEditMode ? {
        i: common_vendor.o(($event) => $options.handleResizeStart($event, module, index), module.id),
        j: common_vendor.o(($event) => $options.handleResizeMove($event), module.id),
        k: common_vendor.o((...args) => $options.handleResizeEnd && $options.handleResizeEnd(...args), module.id),
        l: common_vendor.o((...args) => $options.handleResizeEnd && $options.handleResizeEnd(...args), module.id)
      } : {}, {
        m: module.id,
        n: (el) => $options.setModuleRef(el, module.id),
        o: $data.isEditMode && $data.editingModuleId === module.id ? 1 : "",
        p: $data.isEditMode && $data.resizingModuleId === module.id ? 1 : "",
        q: module.x + "px",
        r: module.y + "px",
        s: module.width + "px",
        t: module.height + "px",
        v: common_vendor.o(($event) => $data.isEditMode && $options.handleTouchStart($event, module, index), module.id),
        w: common_vendor.o(($event) => $data.isEditMode && $options.handleTouchMove($event, module, index), module.id),
        x: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args), module.id),
        y: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args), module.id)
      });
    }),
    v: $data.isEditMode,
    w: $data.isEditMode,
    x: $data.isEditMode ? 1 : "",
    y: $data.containerHeight + "px",
    z: $data.isEditMode
  }, $data.isEditMode ? {} : {}, {
    A: common_vendor.o((...args) => $options.handleContainerTouchMove && $options.handleContainerTouchMove(...args)),
    B: $data.showEditModal
  }, $data.showEditModal ? common_vendor.e({
    C: common_vendor.t($data.isEditingSocialModule ? "编辑社交媒体" : "编辑模块"),
    D: common_vendor.o(($event) => $data.showEditModal = false),
    E: $data.editContentType === "text" ? 1 : "",
    F: common_vendor.o(($event) => $data.editContentType = "text"),
    G: $data.editContentType === "image" ? 1 : "",
    H: common_vendor.o(($event) => $data.editContentType = "image"),
    I: $data.editContentType === "emoji" ? 1 : "",
    J: common_vendor.o(($event) => $data.editContentType = "emoji"),
    K: $data.isEditingSocialModule
  }, $data.isEditingSocialModule ? {
    L: $data.editContentValue,
    M: common_vendor.o(($event) => $data.editContentValue = $event.detail.value),
    N: common_vendor.f($data.socialIcons, (icon, index, i0) => {
      return {
        a: icon,
        b: index,
        c: $data.editModuleIcon === icon ? 1 : "",
        d: common_vendor.o(($event) => $data.editModuleIcon = icon, index)
      };
    })
  } : $data.editContentType === "text" ? {
    P: $data.editContentValue,
    Q: common_vendor.o(($event) => $data.editContentValue = $event.detail.value)
  } : $data.editContentType === "image" ? common_vendor.e({
    S: common_vendor.o((...args) => $options.selectImage && $options.selectImage(...args)),
    T: $data.editContentValue
  }, $data.editContentValue ? {
    U: $data.editContentValue
  } : {}) : $data.editContentType === "emoji" ? {
    W: common_vendor.f($data.emojis, (emoji, k0, i0) => {
      return {
        a: common_vendor.t(emoji),
        b: emoji,
        c: common_vendor.o(($event) => {
          $data.editContentValue = emoji;
          common_vendor.index.__f__("log", "at pages/home/index.vue:181", "选择表情：", emoji);
        }, emoji)
      };
    })
  } : {}, {
    O: $data.editContentType === "text",
    R: $data.editContentType === "image",
    V: $data.editContentType === "emoji",
    X: common_vendor.t($data.isSavingEdit ? "保存中..." : "确定"),
    Y: common_vendor.o((...args) => $options.confirmEditContent && $options.confirmEditContent(...args)),
    Z: $data.isSavingEdit
  }) : {}, {
    aa: common_vendor.t($data.isEditMode ? "完成" : "编辑"),
    ab: $data.isEditMode ? 1 : "",
    ac: common_vendor.o((...args) => $options.toggleEditMode && $options.toggleEditMode(...args)),
    ad: common_vendor.o(($event) => $data.showShareModal = true),
    ae: $data.showShareModal
  }, $data.showShareModal ? {
    af: common_vendor.o(($event) => $data.showShareModal = false),
    ag: common_assets._imports_3,
    ah: common_vendor.o((...args) => $options.shareToWechat && $options.shareToWechat(...args)),
    ai: common_assets._imports_1,
    aj: common_vendor.o((...args) => $options.shareToQQ && $options.shareToQQ(...args)),
    ak: common_assets._imports_5,
    al: common_vendor.o((...args) => $options.shareToMail && $options.shareToMail(...args))
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
