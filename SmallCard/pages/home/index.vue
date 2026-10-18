<template>
  <!-- 添加条件渲染，仅当用户已登录且非游客时才渲染页面内容 -->
  <view v-if="showPageContent" class="home-page">
    <!-- 顶部功能按钮：名片夹 + 设置 -->
    <view class="top-buttons">
      <view class="folder-btn" @click="navigateToCardFolder">
        <text class="icon">📁</text>
        <text class="text">名片夹</text>
      </view>
      <view class="setting-btn" @click="navigateToSetting">
        <text class="icon">⚙️</text>
        <text class="text">设置</text>
      </view>
    </view>

    <!-- 头像及用户信息区域 -->
    <view class="avatar-section">
      <view class="avatar-wrap">
        <image :src="userInfo.avatarUrl || '/static/icon/我的.png'" class="user-avatar" mode="cover"></image>
        <view class="edit-avatar" @click="chooseAvatar">
          <text class="edit-icon">✏️</text>
        </view>
      </view>
      <view class="user-basic">
        <text class="user-name" @click="editUserName">{{ userInfo.userName || '梨鸠晒普' }}</text>
        <text class="user-intro">{{ userInfo.userIntro || '我要浦到天光' }}</text>
        <text class="user-tag" v-if="userInfo.userTag">{{ userInfo.userTag }}</text>
        <text class="user-motto" v-if="userInfo.userMotto">{{ userInfo.userMotto }}</text>
        <button class="tag-btn" @click="addTag">去添加tag</button>
      </view>
    </view>

    <!-- 联系方式与统计栏 -->
      <view class="contact-stats-bar">
        <!-- 修改点：添加点击事件，跳转到联系方式页面 -->
        <button class="contact-btn" @click="goToContactPage">联系方式</button>
        <view class="stats-item" @click="goToFriendList">{{ friendCount }}好友</view>
        <view class="stats-item" @click="goToPraisePage">{{ praiseCount }}夸夸</view>
      </view>

    <!-- 我的动态入口 -->
    <view class="dynamic-btn" @click="viewDynamic">
      我的动态>
    </view>

    <!-- 可能感兴趣的模块 -->
    <view class="interest-section" @touchmove.stop="handleContainerTouchMove">
      <text class="section-title">可能感兴趣的模块</text>
      <view class="module-grid" ref="modulesContainer" :style="{ height: containerHeight + 'px' }">
        <view 
          v-for="(module, index) in modules" 
          :key="module.id"
          :ref="el => setModuleRef(el, module.id)"
          class="module-item"
          :class="{ 
            'editing': isEditMode && editingModuleId === module.id, 
            'resizing': isEditMode && resizingModuleId === module.id,
            'edit-mode': isEditMode
          }"
          :style="{
            left: module.x + 'px',
            top: module.y + 'px',
            width: module.width + 'px',
            height: module.height + 'px'
          }"
          @touchstart="isEditMode && handleTouchStart($event, module, index)"
          @touchmove="isEditMode && handleTouchMove($event, module, index)"
          @touchend="handleTouchEnd"
          @touchcancel="handleTouchEnd"
          catchtap="handleModuleTap(module)"
        >
          <!-- 模块内容 -->
          <view class="module-content" @tap="handleModuleTap(module)" catchtap="handleModuleTap(module)">
            <!-- 社交媒体模块：同时显示图标和链接 -->
            <view v-if="module.type === 'text' && module.icon" class="social-module">
              <image :src="module.icon" class="social-icon" mode="aspectFit"></image>
              <text class="social-link">{{ module.content || (isEditMode ? '点击编辑' : '') }}</text>
            </view>
            <!-- 普通图片模块 -->
            <image v-else-if="module.type === 'image' && module.content" :src="module.content || '/static/icon/社交媒体1.png'" class="content-img" mode="aspectFit"></image>
            <!-- 普通文本或表情模块 -->
            <text v-else-if="module.type === 'text' || module.type === 'emoji'">{{ module.content || (isEditMode ? '点击编辑' : '') }}</text>
            <text v-else-if="isEditMode">点击编辑</text>
          </view>
          
          <!-- 右下角调整大小的控制点 - 只在编辑模式下显示 -->
          <view 
            v-if="isEditMode"
            class="resize-handle"
            @touchstart="handleResizeStart($event, module, index)"
            @touchmove="handleResizeMove($event)"
            @touchend="handleResizeEnd"
            @touchcancel="handleResizeEnd"
          ></view>
        </view>
      </view>
      
      <!-- 编辑模式提示 -->
      <view v-if="isEditMode" class="edit-mode-tip">
        编辑模式：长按模块可拖动，拖动右下角可调整大小，点击可编辑内容
      </view>
    </view>

    <!-- 内容编辑弹窗 -->
    <view class="edit-modal" v-if="showEditModal">
      <view class="edit-header">
        <text class="edit-title">{{ isEditingSocialModule ? '编辑社交媒体' : '编辑模块' }}</text>
        <text class="close-btn" @click="showEditModal = false">×</text>
      </view>
      
      <view class="edit-content">
        <view class="content-type-selector">
          <text 
            class="type-option" 
            :class="{ 'active': editContentType === 'text' }"
            @click="editContentType = 'text'"
          >文字</text>
          <text 
            class="type-option" 
            :class="{ 'active': editContentType === 'image' }"
            @click="editContentType = 'image'"
          >图片</text>
          <text 
            class="type-option" 
            :class="{ 'active': editContentType === 'emoji' }"
            @click="editContentType = 'emoji'"
          >表情</text>
        </view>
        
        <!-- 社交媒体模块编辑（同时编辑链接和图标） -->
        <view v-if="isEditingSocialModule" class="social-edit-section">
          <view class="social-edit-item">
            <text class="social-edit-label">链接地址：</text>
            <input 
              v-model="editContentValue"
              class="social-link-input"
              placeholder="请输入社交媒体链接"
              maxlength="100"
              focus
            />
          </view>
          <view class="social-edit-item">
            <text class="social-edit-label">选择图标：</text>
            <view class="social-icon-selector">
              <view 
                v-for="(icon, index) in socialIcons" 
                :key="index"
                class="social-icon-option"
                :class="{ 'active': editModuleIcon === icon }"
                @click="editModuleIcon = icon"
              >
                <image :src="icon" class="social-icon-preview" mode="aspectFit"></image>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 普通文字输入 -->
        <textarea 
          v-else-if="editContentType === 'text'"
          v-model="editContentValue"
          class="text-input"
          placeholder="请输入文字内容"
          maxlength="50"
          auto-height
          focus
        ></textarea>
        
        <!-- 图片选择 -->
    <view v-else-if="editContentType === 'image'" class="image-selector">
      <button class="select-image-btn" @tap="selectImage">选择图片</button>
      <image v-if="editContentValue" :src="editContentValue" class="preview-img" mode="aspectFit"></image>
    </view>
        
        <!-- 表情选择 -->
        <view v-else-if="editContentType === 'emoji'" class="emoji-selector">
          <view 
            v-for="emoji in emojis" 
            :key="emoji"
            class="emoji-item"
            @click="editContentValue = emoji; console.log('选择表情：', emoji)"
          >
            {{ emoji }}
          </view>
        </view>
        
        <button class="confirm-btn" @tap="confirmEditContent" :disabled="isSavingEdit">
          {{ isSavingEdit ? '保存中...' : '确定' }}
        </button>
      </view>
    </view>

    <!-- 底部置顶副导航条：编辑 + 分享（缩小版） -->
    <view class="fixed-ops-bar">
      <!-- 添加z-index确保按钮在最上层 -->
      <button class="edit-btn" :class="{ 'active': isEditMode }" @click="toggleEditMode" style="z-index: 9999; touch-action: manipulation;">
        {{ isEditMode ? '完成' : '编辑' }}
      </button>
      <button class="share-btn" @click="showShareModal = true" style="z-index: 9999; touch-action: manipulation;">分享</button>
    </view>

    <!-- 分享渠道弹窗 -->
    <view class="share-modal" v-if="showShareModal">
      <view class="share-header">
        <text class="share-title">分享至</text>
        <text class="close-btn" @click="showShareModal = false">×</text>
      </view>
      <view class="share-list">
        <view class="share-item" @click="shareToWechat">
          <image src="/static/icon/wechat.png" class="share-icon" mode="aspectFit"></image>
          <text class="share-name">微信</text>
        </view>
        <view class="share-item" @click="shareToQQ">
          <image src="/static/icon/qq.png" class="share-icon" mode="aspectFit"></image>
          <text class="share-name">QQ</text>
        </view>
        <view class="share-item" @click="shareToMail">
          <image src="/static/icon/mail.png" class="share-icon" mode="aspectFit"></image>
          <text class="share-name">邮件</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏已移除 -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        avatarUrl: '',
        userName: '',
        userIntro: '',
        userTag: '',
        userMotto: ''
      },
      isLoggedIn: false,
      isGuest: false,
      showPageContent: false,
          friendCount: 0, // 好友数量（等于名片夹数量）
      praiseCount: 0, // 夸夸数量
      showShareModal: false, // 分享弹窗显示状态
      // 编辑模式控制
      isEditMode: false, // 是否处于编辑模式
      // 模块相关数据
      modules: [],
      containerHeight: 500, // 模块容器高度
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

      moduleRefs: {}, // 模块DOM引用
      // 编辑内容相关状态
      showEditModal: false,
      currentEditingModule: null,
      editContentType: 'text',
      editContentValue: '',
      editModuleIcon: '',
      isEditingSocialModule: false,
      isSavingEdit: false,
      // 社交媒体图标列表
      socialIcons: [
        '/static/icon/社交媒体1.png',
        '/static/icon/社交媒体2.png',
        '/static/icon/社交媒体3.png',
        '/static/icon/社交媒体4.png',
        '/static/icon/社交媒体5.png',
        '/static/icon/QQ.png',
        '/static/icon/wechat.png'
      ],
      // 表情包列表
      emojis: ['😊', '😂', '😍', '🤔', '😎', '👍', '❤️', '🎉', '🔥', '✨']
    }
  },
  onLoad() {
    // 获取App实例
    const app = getApp();
    
    // 确保全局状态存在
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
    
    // 更新本地状态
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.isGuest = app.globalData.userStatus.isGuest;
    
    // 页面加载时获取本地存储的用户信息
    this.loadUserInfo();
    
    // 监听全局数据变化
    this.listenGlobalDataChange();
    
    // 初始化模块数据
    this.initModules();
  },
  
  mounted() {
    // 初始化容器高度
    this.updateContainerHeight();
    
    // 监听窗口大小变化，更新容器高度
    const that = this;
    window.addEventListener('resize', () => {
      that.updateContainerHeight();
    });
  },
  
  // 合并的onUnload方法
  onUnload() {
    // 移除窗口大小变化监听器
    window.removeEventListener('resize', this.updateContainerHeight);
    // 清除长按计时器
    this.clearLongPressTimer();
    // 移除全局事件监听器
    uni.$off('userInfoUpdated');
    uni.$off('praisesUpdated');
    uni.$off('cardsDataUpdated');
  },
  onShow() {
    const app = getApp();
    
    // 确保全局状态存在
    if (!app.globalData) {
      app.globalData = {};
    }
    if (!app.globalData.userStatus) {
      app.globalData.userStatus = {
        isLoggedIn: true, // 默认允许访问，避免空白页面
        isGuest: false,
        userInfo: {}
      };
    }
    
    // 更新本地状态
    this.isLoggedIn = app.globalData.userStatus.isLoggedIn;
    this.isGuest = app.globalData.userStatus.isGuest;
    
    // 实现游客访问限制：如果是游客，则不显示页面内容
    if (this.isGuest) {
      this.showPageContent = false;
      
      // 使用App中的requireLogin方法处理登录逻辑
      if (app.requireLogin) {
        app.requireLogin();
      } else {
        // 如果没有requireLogin方法，使用备用处理方式
        uni.showToast({
          title: '游客不能访问我的页面，请先登录',
          icon: 'none',
          duration: 2000
        });
        // 延迟跳转到首页（登录入口页）
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          });
        }, 2000);
      }
    } else {
      // 正常用户允许显示页面内容
      this.showPageContent = true;
      
      // 页面显示时重新加载用户信息、好友数量和夸夸数量，确保数据最新
      this.loadUserInfo();
      this.loadFriendCount();
      this.loadPraiseCount();
    }
  },
  // 合并的mounted方法
  mounted() {
    // 初始化容器高度
    this.updateContainerHeight();
    
    // 监听窗口大小变化，更新容器高度
    const that = this;
    window.addEventListener('resize', () => {
      that.updateContainerHeight();
    });
    
    // 监听夸夸数据更新事件，实时更新首页显示的夸夸数量
    // 添加对两种可能的事件名称的监听，确保兼容性
    uni.$on('praisesUpdated', () => {
      console.log('接收到夸夸数据更新事件(praisesUpdated)');
      this.loadPraiseCount();
    });
    
    // 增加对praiseDataUpdated事件的监听，解决夸夸数量需要点击才更新的问题
    uni.$on('praiseDataUpdated', () => {
      console.log('接收到夸夸数据更新事件(praiseDataUpdated)');
      this.loadPraiseCount();
    });
  },
  methods: {
    // 跳转到夸夸页面
    goToPraisePage() {
      uni.navigateTo({
        url: '/pages/home/praise'
      });
    },
    // 加载用户信息
      loadUserInfo() {
        try {
          const userInfoStr = uni.getStorageSync('userInfo');
          let userInfo = null;
          
          // 尝试解析JSON字符串
          if (userInfoStr) {
            if (typeof userInfoStr === 'string') {
              userInfo = JSON.parse(userInfoStr);
            } else {
              userInfo = userInfoStr;
            }
          }
          
          if (userInfo && Object.keys(userInfo).length > 0) {
            // 标准化用户信息字段名，确保兼容
            const normalizedInfo = {
              avatarUrl: userInfo.avatarUrl || userInfo.avatar || '',
              userName: userInfo.userName || userInfo.name || userInfo.nickname || '梨鸠晒普',
              userIntro: userInfo.userIntro || userInfo.intro || '',
              userTag: userInfo.userTag || userInfo.tag || '',
              userMotto: userInfo.userMotto || userInfo.motto || ''
            };
            this.userInfo = {...normalizedInfo}; // 深拷贝避免引用问题
          } else {
            // 无本地存储时使用默认值
            this.userInfo = {
              avatarUrl: '',
              userName: '梨鸠晒普',
              userIntro: '我要浦到天光',
              userTag: '',
              userMotto: ''
            };
          }
          console.log('加载的用户信息:', this.userInfo);
        } catch (error) {
          console.error('加载用户信息失败:', error);
          // 出错时使用默认值
          this.userInfo = {
            avatarUrl: '',
            userName: '梨鸠晒普',
            userIntro: '我要浦到天光',
            userTag: '',
            userMotto: ''
          };
        }
        
        // 加载名片夹数量作为好友数量
        this.loadFriendCount();
        // 加载夸夸数量
        this.loadPraiseCount();
      },
      
      // 加载夸夸数量
      loadPraiseCount() {
        try {
          // 获取当前用户ID和存储前缀，确保夸夸数据按用户隔离
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          // 从用户隔离的存储键获取夸夸数据
          const praises = uni.getStorageSync(`${storagePrefix}praises`);
          if (praises && praises.length > 0) {
            // 统计收到的夸夸总数量
            this.praiseCount = praises.length;
          } else {
            // 如果没有保存的数据，使用默认数量
            this.praiseCount = 0;
          }
          console.log('加载的夸夸总数量:', this.praiseCount);
        } catch (error) {
          console.error('加载夸夸数量失败:', error);
          // 出错时使用默认值
          this.praiseCount = 0;
        }
      },
      
      // 获取当前用户ID
      getCurrentUserId() {
        try {
          // 从全局数据或本地存储获取用户ID
          const app = getApp();
          const userInfo = app.globalData.userStatus?.userInfo;
          if (userInfo && userInfo.userId) {
            return userInfo.userId;
          }
          // 如果没有用户ID，使用游客标识
          const isGuest = uni.getStorageSync('isGuest');
          return isGuest ? 'guest' : 'default_user';
        } catch (e) {
          console.error('获取用户ID失败:', e);
          return 'default_user';
        }
      },
      
      // 加载好友数量（只计算互相关注的好友，使用用户ID隔离的存储键）
      loadFriendCount() {
        try {
          // 获取当前用户ID和存储前缀
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          // 优先从用户隔离的mutualFriends获取互关好友数据
          // mutualFriends直接对应互相关注的好友列表
          let mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          
          // 如果mutualFriends为空，从用户隔离的collectedCards获取
          // 根据业务逻辑，collectedCards只包含互相关注的好友
          if (mutualFriends.length === 0) {
            const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
            mutualFriends = collectedCards;
          }
          
          if (mutualFriends.length > 0) {
            // 使用互关好友的实际数量
            // 注意：只有互相关注的用户才计入好友数量，添加我的用户不计入
            this.friendCount = mutualFriends.length;
          } else {
            // 如果没有保存的数据，使用默认数量
            this.friendCount = 11; // 默认11个互相关注好友
          }
          console.log('加载的互相关注好友数量:', this.friendCount);
          console.log('只有互相关注的用户才显示在好友列表中，添加我的用户不计入好友数量');
        } catch (error) {
          console.error('加载好友数量失败:', error);
          // 出错时使用默认值
          this.friendCount = 11;
        }
      },
    
    // 监听全局数据变化
    listenGlobalDataChange() {
      uni.$on('userInfoUpdated', (data) => {
        this.userInfo = {...this.userInfo, ...data}; // 合并更新数据
        uni.setStorageSync('userInfo', this.userInfo); // 同步本地存储
      });
      
      // 监听夸夸数据更新，重新加载夸夸数量
      uni.$on('praisesUpdated', () => {
        this.loadPraiseCount();
      });
      
      // 监听好友数据更新，重新加载好友数量
      uni.$on('cardsDataUpdated', () => {
        this.loadFriendCount();
      });
    },
    
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatarUrl = res.tempFilePaths[0];
          uni.setStorageSync('userInfo', this.userInfo);
          uni.showToast({ title: '头像更新成功', icon: 'success' });
        }
      });
    },
    
    // 编辑用户名
    editUserName() {
      uni.showModal({
        title: '修改用户名',
        editable: true,
        placeholderText: '请输入新的用户名',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm && res.content) {
            const newUserName = res.content.trim();
            if (newUserName && newUserName.length > 0) {
              // 更新本地用户信息
              this.userInfo.userName = newUserName;
              // 保存到本地存储
              uni.setStorageSync('userInfo', this.userInfo);
              // 触发用户信息更新事件，通知其他组件
              uni.$emit('userInfoUpdated', { userName: newUserName });
              // 显示成功提示
              uni.showToast({ title: '用户名修改成功', icon: 'success' });
            } else {
              uni.showToast({ title: '用户名不能为空', icon: 'none' });
            }
          }
        }
      });
    },
    
    // 跳转到标签编辑页（支持新增/修改）
    addTag() {
      uni.navigateTo({
        url: '/pages/tag-edit/tag-edit'
      });
    },
    
    // 跳转到我的动态页面
    viewDynamic() {
      uni.navigateTo({
        url: '/pages/home/my-dynamic'
      });
    },
    
    toProfile() {},
    toPublish() {},
    toMessage() {},
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 尝试从本地存储读取用户设置的社交媒体链接
      let socialLinks = [];
      try {
        const storedSocialStr = uni.getStorageSync('socialLinks');
        if (storedSocialStr) {
          socialLinks = typeof storedSocialStr === 'string' ? JSON.parse(storedSocialStr) : storedSocialStr;
        }
      } catch (error) {
        console.error('加载社交媒体链接失败:', error);
      }
      
      // 创建社交媒体模块数据
      this.modules = [];
      const positions = [
        { x: 10, y: 10 },
        { x: 180, y: 10 },
        { x: 10, y: 120 },
        { x: 180, y: 120 }
      ];
      
      // 如果有用户设置的社交媒体链接，使用这些链接创建模块
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
              type: 'text', // 使用文本类型显示链接
              content: social.link,
              icon: social.icon // 保存原始图标路径用于显示
            });
          }
        });
      }
      
      // 如果没有足够的模块（可能用户没有设置所有社交媒体或没有设置），添加默认模块
      while (this.modules.length < 4) {
        const index = this.modules.length;
        const position = positions[index];
        const socialIcons = [
          '/static/icon/社交媒体1.png',
          '/static/icon/社交媒体2.png',
          '/static/icon/社交媒体3.png',
          '/static/icon/社交媒体4.png'
        ];
        
        this.modules.push({
          id: Date.now() + index,
          x: position.x,
          y: position.y,
          width: 150,
          height: 100,
          type: 'image',
          content: socialIcons[index]
        });
      }
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 只有在编辑模式下才允许调整大小
      if (!this.isEditMode) return;
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 显示调整大小提示
      uni.showToast({
        title: '开始调整大小',
        icon: 'none',
        duration: 1000
      });
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      try {
        // 如果正在拖拽或调整大小，则不进入编辑
        if (this.isDragging || this.isResizing) {
          console.log('拖拽或调整大小中，无法编辑');
          return;
        }
        
        // 设置当前编辑的模块
        this.currentEditingModule = module;
        this.editContentType = module.type || 'text';
        this.editContentValue = module.content || '';
        // 保存当前图标，用于社交媒体模块
        this.editModuleIcon = module.icon || '';
        
        // 判断是否为社交媒体模块（具有icon属性的文本模块）
        this.isEditingSocialModule = module.type === 'text' && module.icon;
        
        console.log('编辑模块：', module);
        console.log('编辑类型：', this.editContentType);
        console.log('是否社交媒体模块：', this.isEditingSocialModule);
        
        // 显示编辑弹窗
        this.showEditModal = true;
      } catch (error) {
        console.error('编辑模块内容异常：', error);
        uni.showToast({
          title: '编辑失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 选择图片
    selectImage() {
      // 使用try-catch确保错误不会中断功能
      try {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            // 确保有返回的文件路径
            if (res.tempFilePaths && res.tempFilePaths.length > 0) {
              this.editContentValue = res.tempFilePaths[0];
              console.log('选择图片成功：', this.editContentValue);
            }
          },
          fail: (err) => {
            console.error('选择图片失败：', err);
            uni.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('图片选择功能异常：', error);
      }
    },
    
    // 确认编辑内容
    confirmEditContent() {
      try {
        // 防止重复提交
        if (this.isSavingEdit) {
          return;
        }
        
        if (!this.currentEditingModule) {
          console.error('当前无编辑模块');
          return;
        }
        
        // 找到模块索引
        const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
        if (moduleIndex === -1) {
          console.error('未找到模块索引');
          return;
        }
        
        // 设置保存中状态
        this.isSavingEdit = true;
        
        console.log('更新模块内容：', this.editContentType, this.editContentValue);
        
        // 更新模块内容
        this.modules[moduleIndex].type = this.editContentType;
        this.modules[moduleIndex].content = this.editContentValue;
        
        // 如果是社交媒体模块，同时更新icon属性并处理链接格式
        if (this.isEditingSocialModule) {
          this.modules[moduleIndex].icon = this.editModuleIcon;
          // 自动补全http前缀
          let link = this.editContentValue.trim();
          if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
            link = 'http://' + link;
            this.modules[moduleIndex].content = link;
          }
        }
        
        // 保存到本地存储
        this.saveModules();
        
        // 延迟一点显示成功提示，让用户有更好的体验
        setTimeout(() => {
          // 显示成功提示
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 关闭编辑弹窗
          this.showEditModal = false;
          this.isSavingEdit = false;
        }, 300);
        this.currentEditingModule = null;
      } catch (error) {
        console.error('确认编辑内容异常：', error);
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 处理模块点击事件（使用tap替代click，更适合小程序环境）
    handleModuleTap(module) {
      if (this.isEditMode && !this.isDragging && !this.isResizing) {
        this.editModuleContent(module);
      } else if (!this.isEditMode && module.type === 'text' && module.icon && module.content) {
        // 如果是社交媒体模块且包含链接，尝试打开链接
        try {
          // 检查是否是有效的URL格式
          let url = module.content;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url; // 自动添加http://前缀
          }
          
          // 使用uni.openUrl打开链接
          uni.openUrl({
            url: url,
            success: () => {
              console.log('成功打开链接:', url);
            },
            fail: (err) => {
              console.error('打开链接失败:', err);
              // 失败时提示用户
              uni.showToast({
                title: '无法打开链接',
                icon: 'none'
              });
            }
          });
        } catch (error) {
          console.error('处理链接点击异常:', error);
        }
      }
    },
    
    // 切换编辑模式
    toggleEditMode() {
      console.log('编辑按钮被点击，当前isEditMode状态：', this.isEditMode);
      
      // 如果当前正在拖拽或调整大小，先取消
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
      
      // 切换编辑模式状态
      this.isEditMode = !this.isEditMode;
      console.log('切换后isEditMode状态：', this.isEditMode);
      
      // 如果退出编辑模式，显示提示
      if (!this.isEditMode) {
        uni.showToast({ 
          title: '已保存修改', 
          icon: 'success',
          duration: 1500 
        });
        // 保存最终状态
        this.saveModules();
      } else {
        // 进入编辑模式，显示操作提示
        uni.showToast({
          title: '点击模块右下角可直接调整大小',
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    

    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newX = Math.max(0, Math.min(container.offsetWidth - module.width, newX));
        newY = Math.max(0, Math.min(this.containerHeight - module.height, newY));
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, x: newX, y: newY };
      if (!this.checkCollision(moduleCopy, index)) {
        // 没有碰撞，更新位置
        this.modules[index].x = newX;
        this.modules[index].y = newY;
      }
      
      // 阻止默认行为
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
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        newWidth = Math.min(container.offsetWidth - module.x, newWidth);
        newHeight = Math.min(this.containerHeight - module.y, newHeight);
      }
      
      // 检查是否与其他模块碰撞
      const moduleCopy = { ...module, width: newWidth, height: newHeight };
      if (!this.checkCollision(moduleCopy, moduleIndex)) {
        // 没有碰撞，更新尺寸
        this.modules[moduleIndex].width = newWidth;
        this.modules[moduleIndex].height = newHeight;
      }
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 检查模块碰撞
    checkCollision(module, currentIndex) {
      for (let i = 0; i < this.modules.length; i++) {
        // 跳过当前模块
        if (i === currentIndex) continue;
        
        const otherModule = this.modules[i];
        
        // 矩形碰撞检测
        if (!(module.x + module.width <= otherModule.x ||
              module.x >= otherModule.x + otherModule.width ||
              module.y + module.height <= otherModule.y ||
              module.y >= otherModule.y + otherModule.height)) {
          return true; // 发生碰撞
        }
      }
      return false; // 没有碰撞
    },
    
    // 编辑模块内容
    editModuleContent(module) {
      // 如果正在拖拽或调整大小，则不进入编辑
      if (this.isDragging || this.isResizing) return;
      
      // 设置当前编辑的模块
      this.currentEditingModule = module;
      this.editContentType = module.type || 'text';
      this.editContentValue = module.content || '';
      
      // 显示编辑弹窗
      this.showEditModal = true;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editContentValue = res.tempFilePaths[0];
        }
      });
    },
    
    // 确认编辑内容
    confirmEditContent() {
      if (!this.currentEditingModule) return;
      
      // 找到模块索引
      const moduleIndex = this.modules.findIndex(m => m.id === this.currentEditingModule.id);
      if (moduleIndex === -1) return;
      
      // 更新模块内容
      this.modules[moduleIndex].type = this.editContentType;
      this.modules[moduleIndex].content = this.editContentValue;
      
      // 保存到本地存储
      this.saveModules();
      
      // 关闭编辑弹窗
      this.showEditModal = false;
      this.currentEditingModule = null;
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    shareToWechat() {
      uni.showToast({ title: '分享成功！', icon: 'success' });
      this.showShareModal = false;
    },
    
    shareToQQ() {
      uni.showToast({ title: '分享成功！', icon: 'success' });
      this.showShareModal = false;
    },
    
    shareToMail() {
      uni.showToast({ title: '分享成功！', icon: 'success' });
      this.showShareModal = false;
    },
    
    // 跳转到名片夹页面
    navigateToCardFolder() {
      uni.navigateTo({
        url: '/pages/card-folder/card-folder'
      });
    },
    
    // 跳转到设置页面
    navigateToSetting() {
      uni.navigateTo({
        url: '/pages/set/set'
      });
    },
    
    // 新增方法：跳转到联系方式页面
    goToContactPage() {
      uni.navigateTo({
        url: '/pages/contact/contact'
      });
    },
     
     // 导航到好友列表（好友详情页面）
     goToFriendList() {
       uni.navigateTo({
         url: '/pages/friend-detail/friend-detail'
       });
     }
  }
}
</script>

<style scoped>
/* ... (样式部分保持不变) ... */
.home-page {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 30rpx;
}

.top-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  padding: 0 10rpx;
}

.folder-btn, .setting-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.top-buttons .icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.top-buttons .text {
  font-size: 24rpx;
  color: #666;
}

.avatar-section {
  margin-bottom: 50rpx;
}

.avatar-wrap {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 25rpx;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2rpx solid #f0f0f0;
}

.edit-avatar {
  position: absolute;
  bottom: -10rpx;
  right: -10rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #2699fb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-icon {
  color: #fff;
  font-size: 28rpx;
}

.user-basic {
  margin-left: 10rpx;
}

.user-name {
  font-size: 38rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
}

.user-intro {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.user-tag, .user-motto {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.tag-btn {
  margin-top: 16rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid #2699fb;
  color: #2699fb;
  background-color: #fff;
}

.contact-stats-bar {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 25rpx 0;
  border-top: 1rpx solid #eee;
  border-bottom: 1rpx solid #eee;
}

.contact-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  border-radius: 44rpx;
  border: 1rpx solid #e5e5e5;
  background-color: #fff;
  color: #333;
  margin: 0 20rpx;
}

.stats-item {
  width: 140rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.dynamic-btn {
  text-align: center;
  margin-bottom: 40rpx;
  color: #888;
  font-size: 28rpx;
  padding: 25rpx 0;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  cursor: pointer;
}

.interest-section {
  margin-bottom: 40rpx;
  position: relative;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.module-grid {
  position: relative;
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  overflow: hidden;
  touch-action: none; /* 禁止默认触摸行为 */
}

.module-item {
  position: absolute;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  background-color: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;
  overflow: hidden;
  touch-action: none; /* 禁止默认触摸行为 */
}

.module-item.editing {
  border-color: #2699fb;
  box-shadow: 0 0 10rpx rgba(38, 153, 251, 0.3);
}

.module-item.resizing {
  border-color: #2699fb;
}

.module-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx;
  box-sizing: border-box;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
}

.content-img {
  max-width: 100%;
  max-height: 100%;
}

.resize-handle {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  background-color: #2699fb;
  border-radius: 50%;
  bottom: -10rpx;
  right: -10rpx;
  z-index: 10;
  box-shadow: 0 0 5rpx rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s, transform 0.2s;
}

/* 长按状态的样式 */
.resize-handle:active {
  transform: scale(1.2);
  background-color: #1a84e8;
}

/* 调整大小过程中的样式 */
.module-item.resizing .resize-handle {
  background-color: #ff6b6b;
  transform: scale(1.3);
}

/* 编辑弹窗样式 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* 添加触摸事件控制 */
  touch-action: none;
  -webkit-overflow-scrolling: touch;
}

.edit-modal > view {
  width: 80%;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.edit-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.edit-content {
  padding: 30rpx;
}

.content-type-selector {
  display: flex;
  margin-bottom: 30rpx;
}

.type-option {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  border-bottom: 2rpx solid transparent;
  font-size: 28rpx;
  color: #666;
}

.type-option.active {
  color: #2699fb;
  border-bottom-color: #2699fb;
}

.text-input {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 20rpx;
  box-sizing: border-box;
  margin-bottom: 30rpx;
  font-size: 28rpx;
}

.image-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.select-image-btn {
  width: 100%;
  margin-bottom: 20rpx;
  background-color: #f5f5f5;
  color: #333;
  border: 1rpx solid #ddd;
}

.preview-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
}

.emoji-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.emoji-item {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  border-radius: 10rpx;
  background-color: #f5f5f5;
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.edit-modal .edit-content {
  background-color: #fff;
  width: 80%;
  border-radius: 20rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

/* 社交媒体模块编辑样式 */
.social-edit-section {
  margin-bottom: 30rpx;
}

.social-edit-item {
  margin-bottom: 20rpx;
}

.social-edit-label {
  display: block;
  margin-bottom: 10rpx;
  color: #666;
  font-size: 28rpx;
}

.social-link-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.social-icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 15rpx;
}

.social-icon-option {
  width: 100rpx;
  height: 100rpx;
  padding: 10rpx;
  border: 2rpx solid transparent;
  border-radius: 15rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon-option.active {
  border-color: #007aff;
  background-color: #e6f2ff;
}

.social-icon-preview {
  width: 80rpx;
  height: 80rpx;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.edit-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 44rpx;
  color: #999;
  cursor: pointer;
}

.content-type-selector {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.type-option {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  color: #666;
  font-size: 28rpx;
}

.type-option.active {
  background-color: #2699fb;
  color: #fff;
}

.text-input {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  margin-bottom: 30rpx;
}

.image-selector {
  text-align: center;
  margin-bottom: 30rpx;
}

.select-image-btn {
  background-color: #2699fb;
  color: #fff;
  border: none;
  margin-bottom: 20rpx;
}

.preview-img {
  width: 100%;
  height: 200rpx;
  border-radius: 10rpx;
}

.emoji-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.emoji-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  border-radius: 10rpx;
  background-color: #f5f5f5;
}

.confirm-btn {
  background-color: #2699fb;
  color: #fff;
  border: none;
  margin-top: 30rpx;
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 32rpx;
}

.fixed-ops-bar {
  position: fixed;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15rpx;
  padding: 10rpx 20rpx;
  background-color: #fff;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
  z-index: 9999; /* 确保副导航栏在最上层 */
}

.edit-btn, .share-btn {
  width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 24rpx;
  border-radius: 30rpx;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #2699fb;
  color: #fff;
  border: none;
}

.edit-btn.active {
  background-color: #ff6b6b;
}

.share-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1rpx solid #ddd;
}

.share-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  box-sizing: border-box;
  z-index: 10000;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.share-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
}

.share-list {
  display: flex;
  justify-content: space-around;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
}

.share-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 15rpx;
}

.share-name {
  font-size: 26rpx;
  color: #666;
}

/* 社交媒体模块样式 */
.social-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.social-icon {
  width: 50%;
  height: 50%;
  margin-bottom: 5px;
}

.social-link {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>