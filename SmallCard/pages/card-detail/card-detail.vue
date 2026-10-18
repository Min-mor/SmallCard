<template>
  <view class="card-detail">
    <!-- 头部返回 -->
    <view class="header">
      <image src="/static/icon/back.png" class="back-btn" @click="goBack" mode="widthFix"></image>
    </view>

    <!-- 名片主体内容 -->
    <view class="card-container">
      <!-- 用户头像 -->
      <view class="avatar-section">
        <image :src="cardDetail.avatar || '/static/icon/我的.png'" class="user-avatar" mode="cover"></image>
      </view>

      <!-- 用户基本信息 -->
      <view class="user-info">
        <text class="user-name">{{ cardDetail.name }}</text>
        <text class="user-tag">{{ cardDetail.signature }}</text>
      </view>

      <!-- 标签信息 -->
      <view class="tags-section">
        <!-- 直接渲染标签数组 -->
        <text class="tag-text" v-for="(tag, index) in (cardDetail.tags || [])" :key="index">
          {{ tag }}
        </text>
        <!-- 确保总是显示一些标签以便测试 -->
        <text class="tag-text">摄影</text>
        <text class="tag-text">人像</text>
        <text class="tag-text">风光</text>
      </view>

      <!-- 社交信息 -->
      <view class="social-info">
        <text class="social-item">{{ cardDetail.friendCount }}好友</text>
        <text class="social-item">{{ cardDetail.praiseCount }}夸夸</text>
      </view>

      <!-- 互相关注按钮 -->
      <view class="action-section">
        <button class="add-friend-btn" @click="followUser">{{ cardDetail.isFollowing ? '互相关注' : '未关注' }}</button>
      </view>
      
      <!-- 夸夸内容展示区域 -->
      <view class="praise-messages-section" v-if="cardDetail.praiseMessages && cardDetail.praiseMessages.length > 0">
        <view class="section-title">收到的夸夸</view>
        <view class="praise-message" v-for="(message, index) in cardDetail.praiseMessages" :key="index">
          <!-- 支持对象格式的夸夸消息 -->
          <template v-if="typeof message === 'object' && message">
            <!-- 显示文本内容 -->
            <text class="praise-message-text" v-if="message.content">{{ message.content }}</text>
            <!-- 显示图片 -->
            <image v-if="message.image" :src="message.image" class="praise-message-image" mode="aspectFit" @click="previewImage(message.image)"></image>
          </template>
          <!-- 兼容旧的字符串格式 -->
          <template v-else>
            <text class="praise-message-text">{{ message }}</text>
          </template>
        </view>
      </view>
      <!-- 即使没有夸夸内容也显示区域 -->
      <view class="praise-messages-section" v-else>
        <view class="section-title">收到的夸夸</view>
        <view class="praise-message">
          <text class="praise-message-text">暂无夸夸，快来夸夸TA吧！</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <!-- 左下角夸夸TA按钮 -->
      <view class="praise-button" @click="praiseUser">
        <text class="praise-text">夸夸TA</text>
      </view>
      
      <!-- 右下角操作按钮组 -->
      <view class="action-buttons">
        <view class="action-btn" @click="deleteCard">
          <image class="action-icon" src="/static/icon/删除.png" mode="cover"></image>
        </view>
        <view class="action-btn" @click="favoriteCard">
          <image class="action-icon" :src="cardDetail.isFavorite ? '/static/icon/已收藏.png' : '/static/icon/收藏.png'" mode="cover"></image>
        </view>
        <view class="action-btn" @click="shareCard">
          <image class="action-icon" src="/static/icon/分享.png" mode="cover"></image>
        </view>
      </view>
    </view>
    
    <!-- 分享弹窗 -->
    <view class="share-modal" v-if="showShareModal" @click="closeShareModal">
      <view class="share-content" @click.stop>
        <view class="share-title">分享到</view>
        <view class="share-options">
          <view class="share-option" @click="shareToWechat">
            <image class="share-icon" src="/static/icon/wechat.png" mode="cover"></image>
            <text class="share-text">微信</text>
          </view>
          <view class="share-option" @click="shareToQQ">
            <image class="share-icon" src="/static/icon/QQ.png" mode="cover"></image>
            <text class="share-text">QQ</text>
          </view>
          <view class="share-option" @click="shareToMail">
            <image class="share-icon" src="/static/icon/mail.png" mode="cover"></image>
            <text class="share-text">邮箱</text>
          </view>
        </view>
        <view class="share-cancel" @click="closeShareModal">取消</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      cardDetail: {
        id: '',
        avatar: '',
        name: '',
        signature: '',
        tags: [],
        friendCount: 0,
        praiseCount: 0,
        contentImage: '',
        contentText: '',
        praiseMessages: [],
        isFavorite: false,
        isFollowing: false
      },
      showShareModal: false,
      // 模拟名片数据，与card-folder.vue保持一致
      allCards: [
        {          id: 'friend1',
          name: '林一',
          avatar: '/static/photo/林一.jpg',
          signature: '摄影师，记录生活',
          desc: '人像摄影 | 风光摄影',
          tags: ['摄影', '人像', '风光', '旅行', '艺术'],
          friendCount: 39,
          praiseCount: 3,
          contentImage: '/static/photo/landscape.jpg',
          contentText: 'HELLO!',
          praiseMessages: ['摄影技术太棒了！', '构图很专业', '光影处理非常到位']
        },
        {          id: 'friend2',
          name: '涂二',
          avatar: '/static/photo/涂二.jpg',
          signature: '数据分析师，擅长可视化',
          desc: '数据分析 | 商业智能',
          tags: ['数据分析', '可视化', '商业智能', '数据挖掘', '统计学'],
          friendCount: 25,
          praiseCount: 5,
          contentImage: '',
          contentText: '数据分析改变世界！',
          praiseMessages: ['数据能力太强了！', '分析报告做得很专业']
        },
        {          id: 'friend3',
          name: '张三',
          avatar: '/static/photo/张三.jpg',
          signature: '产品经理，5年经验',
          desc: '产品设计 | 用户研究',
          tags: ['产品', '用户研究', '产品设计', '用户体验', '需求分析'],
          friendCount: 45,
          praiseCount: 12,
          contentImage: '',
          contentText: '用户体验至上',
          praiseMessages: ['产品思维很棒', '用户体验设计得很好']
        },
        {          id: 'friend4',
          name: '李四',
          avatar: '/static/photo/李四.jpg',
          signature: 'UI设计师，擅长用户体验',
          desc: 'UI/UX | 交互设计',
          tags: ['UI设计', 'UX设计', '交互设计', '视觉设计', '原型设计'],
          friendCount: 32,
          praiseCount: 8,
          contentImage: '',
          contentText: '设计源于生活',
          praiseMessages: ['设计很精美', '界面很友好']
        },
        {          id: 'friend5',
          name: '王五',
          avatar: '/static/photo/王五.jpg',
          signature: '前端开发，React专家',
          desc: 'Web前端 | React/Vue',
          tags: ['前端开发', 'React', 'Vue', 'JavaScript', 'CSS'],
          friendCount: 50,
          praiseCount: 15,
          contentImage: '',
          contentText: '代码改变世界',
          praiseMessages: ['代码质量很高', '技术很扎实']
        },
        {          id: 'friend6',
          name: '赵六',
          avatar: '/static/photo/赵六.jpg',
          signature: '后端开发，Python/Go',
          desc: '后端架构 | 微服务',
          tags: ['后端开发', 'Python', 'Go', '微服务', '架构设计'],
          friendCount: 28,
          praiseCount: 7,
          contentImage: '',
          contentText: '架构是门艺术'
        },
        {          id: 'friend7',
          name: '陈七',
          avatar: '/static/photo/陈七.jpg',
          signature: '全栈开发，技术负责人',
          desc: '技术管理 | 全栈开发',
          tags: ['全栈开发', '技术管理', '前端', '后端', '团队管理'],
          friendCount: 42,
          praiseCount: 20,
          contentImage: '',
          contentText: '全栈之路'
        },
        {          id: 'friend8',
          name: '刘八',
          avatar: '/static/photo/刘八.jpg',
          signature: '运营经理，内容营销',
          desc: '用户增长 | 内容策略',
          tags: ['运营', '内容营销', '用户增长', '市场推广', '数据分析'],
          friendCount: 36,
          praiseCount: 10,
          contentImage: '',
          contentText: '内容为王'
        },
        {          id: 'friend9',
          name: '梨鸣晒兽',
          avatar: '/static/photo/梨鸣晒兽.jpg',
          signature: '插画师，自由创作',
          desc: '插画设计 | 角色设计',
          tags: ['插画', '角色设计', '美术创作', '自由职业', '艺术'],
          friendCount: 22,
          praiseCount: 18,
          contentImage: '',
          contentText: '用插画表达生活'
        },
        {          id: 'friend10',
          name: 'S.',
          avatar: '/static/photo/S..jpg',
          signature: 'AI时代的探索者',
          desc: '人工智能研究员 | 技术博主',
          tags: ['人工智能', '机器学习', '深度学习', '算法', '技术写作'],
          friendCount: 60,
          praiseCount: 30,
          contentImage: '',
          contentText: '探索AI的无限可能'
        },
        {          id: 'friend11',
          name: 'L.',
          avatar: '/static/photo/L..jpg',
          signature: '前端开发，精益求精',
          desc: '全栈工程师 | 技术讲师',
          tags: ['前端开发', 'JavaScript', 'CSS', '技术培训', '全栈'],
          friendCount: 38,
          praiseCount: 15,
          contentImage: '',
          contentText: '精益求精'
        }
      ]
    }
  },
  onLoad(options) {
    // 合并处理，支持两种参数名：id和cardId
    const cardId = options.id || options.cardId;
    
    if (cardId) {
      const card = this.allCards.find(c => c.id === cardId);
      if (card) {
        // 复制卡片数据到cardDetail，确保包含所有字段
        this.cardDetail = {
          ...this.cardDetail, // 保留默认值
          ...card, // 覆盖所有卡片数据
          // 确保tags字段存在且为数组
          tags: Array.isArray(card.tags) ? card.tags : [],
          // 确保praiseMessages数组存在
          praiseMessages: []
        };
        
        console.log('加载卡片详情:', this.cardDetail);
      } else {
        console.error('未找到对应ID的卡片:', cardId);
        // 未找到时不使用默认卡片，避免显示错误数据
        uni.showToast({
          title: '未找到该名片信息',
          icon: 'error'
        });
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        return;
      }
      
      // 检查是否有来自夸夸页面的新夸夸内容
      if (options.newPraise) {
        this.addPraiseMessage(options.newPraise);
      }
    } else {
      console.warn('没有传入卡片ID');
      // 不使用默认卡片，避免显示错误数据
      uni.showToast({
        title: '参数错误，缺少名片ID',
        icon: 'error'
      });
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
      return;
    }
    
    // 加载夸夸数据
    this.loadPraiseMessages();
    // 检查关注状态
    this.checkIfFollowing();
    // 执行数据清理
    this.cleanupInvalidData();
  },
  
  onShow() {
    // 每次显示页面时重新加载和同步数据
    if (this.cardDetail.id) {
      // 加载夸夸数据
      this.loadPraiseMessages();
      // 同步关注状态
      this.checkIfFollowing();
      this.syncFollowStatus();
      // 执行全面的数据一致性测试
      this.comprehensiveTestDataConsistency();
    }
    // 监听数据更新事件
    uni.$on('cardsDataUpdated', this.handleDataUpdate);
    uni.$on('friendsDataUpdated', this.handleDataUpdate);
    uni.$on('praiseDataUpdated', this.handleDataUpdate);
  },
  onUnload() {
    // 移除事件监听
    uni.$off('cardsDataUpdated', this.handleDataUpdate);
    uni.$off('friendsDataUpdated', this.handleDataUpdate);
    uni.$off('praiseDataUpdated', this.handleDataUpdate);
  },
  
  // 处理数据更新
  handleDataUpdate() {
    console.log('名片详情页收到数据更新通知');
    if (this.cardDetail.id) {
      this.syncFollowStatus();
    }
  },
  methods: {
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
      
      // 图片预览功能
      previewImage(imageUrl) {
        try {
          if (imageUrl && typeof imageUrl === 'string') {
            uni.previewImage({
              urls: [imageUrl],
              current: 0,
              showmenu: true
            });
          } else {
            console.warn('无效的图片地址:', imageUrl);
          }
        } catch (e) {
          console.error('图片预览失败:', e);
        }
      },
      
      // 检查用户是否已关注
      checkIfFollowing() {
        try {
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          // 从本地存储获取互关好友列表和名片夹列表
          const mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          
          // 检查当前用户是否在互关好友列表中
          // 好友必须在互关好友列表中才算已关注
          const isInMutualFriends = mutualFriends.some(friend => friend.id === this.cardDetail.id);
          
          // 更新关注状态
          this.cardDetail.isFollowing = isInMutualFriends;
          console.log('检查关注状态:', this.cardDetail.isFollowing);
        } catch (e) {
          console.error('检查关注状态失败:', e);
          this.cardDetail.isFollowing = false;
        }
      },
      // 返回上一页
      goBack() {
      uni.navigateBack();
    },
    // 关注/取消关注用户
    followUser() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 提前进行数据格式验证
        if (!this.validateCardData(this.cardDetail)) {
          uni.showToast({
            title: '数据格式错误',
            icon: 'error'
          });
          return;
        }
        
        // 数据备份
        this.backupData(storagePrefix);
        
        if (!this.cardDetail.isFollowing) {
          // 关注操作 - 添加到名片夹和互关好友列表
          this.cardDetail.isFollowing = true;
          
          // 更新本地存储和UI
          this.addToCardFolder();
          this.addToMutualFriendsList();
          this.cardDetail.friendCount++;
          
          // 验证数据一致性
          this.validateDataConsistency();
          
          // 发送事件通知数据更新（增强防御性检查）
          try {
            if (typeof uni !== 'undefined' && typeof uni.$emit === 'function' && typeof uni.$emit.apply === 'function') {
              try {
                uni.$emit('cardsDataUpdated');
              } catch (e1) {
                console.error('发送cardsDataUpdated事件失败:', e1);
              }
              try {
                uni.$emit('friendsDataUpdated');
              } catch (e2) {
                console.error('发送friendsDataUpdated事件失败:', e2);
              }
            } else {
              console.warn('uni.$emit方法不可用或不完整，跳过事件通知');
            }
          } catch (emitError) {
            console.error('事件发送整体处理失败:', emitError);
          }
          
          // 显示成功提示
          uni.showToast({
            title: '已关注，现在是互相关注的好友',
            icon: 'success',
            duration: 1500
          });
        } else {
          // 取消关注操作 - 从名片夹和互关好友列表移除
          uni.showModal({
            title: '确认取消关注',
            content: '确定要取消关注该用户吗？取消关注后，该用户将从好友列表移除，并自动从名片夹中删除。',
            success: (res) => {
              if (res.confirm) {
                try {
                  // 更新状态
                  this.cardDetail.isFollowing = false;
                  
                  // 更新本地存储和UI
                  this.removeFromCardFolder();
                  this.removeFromMutualFriendsList();
                  if (this.cardDetail.friendCount > 0) {
                    this.cardDetail.friendCount--;
                  }
                  
                  // 验证数据一致性
                  this.validateDataConsistency();
                  
                  // 发送事件通知数据更新（增强防御性检查）
                  try {
                    if (typeof uni !== 'undefined' && typeof uni.$emit === 'function' && typeof uni.$emit.apply === 'function') {
                      try {
                        uni.$emit('cardsDataUpdated');
                      } catch (e1) {
                        console.error('发送cardsDataUpdated事件失败:', e1);
                      }
                      try {
                        uni.$emit('friendsDataUpdated');
                      } catch (e2) {
                        console.error('发送friendsDataUpdated事件失败:', e2);
                      }
                    } else {
                      console.warn('uni.$emit方法不可用或不完整，跳过事件通知');
                    }
                  } catch (emitError) {
                    console.error('事件发送整体处理失败:', emitError);
                  }
                  
                  // 显示成功提示
                  uni.showToast({
                    title: '已取消关注',
                    icon: 'none',
                    duration: 1500
                  });
                } catch (error) {
                  console.error('取消关注操作失败:', error);
                  // 恢复数据
                  this.restoreData(storagePrefix);
                  uni.showToast({
                    title: '取消关注失败',
                    icon: 'error'
                  });
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('关注/取消关注操作异常:', error);
        // 尝试恢复数据
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        this.restoreData(storagePrefix);
        
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'error'
        });
      }
    },
    // 添加到名片夹
    addToCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 获取已有的名片夹数据
        let folderCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 检查是否已存在
        const exists = folderCards.some(card => card.id === this.cardDetail.id);
        if (!exists) {
          // 添加到名片夹（只保留必要信息）
          const cardToAdd = {
            id: this.cardDetail.id,
            name: this.cardDetail.name,
            avatar: this.cardDetail.avatar,
            signature: this.cardDetail.signature,
            desc: this.cardDetail.desc || ''
          };
          
          folderCards.push(cardToAdd);
          uni.setStorageSync(`${storagePrefix}collectedCards`, folderCards);
          console.log('已添加到名片夹');
        }
        
        // 发送事件通知数据更新（增强防御性检查）
        try {
          if (typeof uni !== 'undefined' && typeof uni.$emit === 'function' && typeof uni.$emit.apply === 'function') {
            try {
              uni.$emit('cardsDataUpdated');
            } catch (e) {
              console.error('发送cardsDataUpdated事件失败:', e);
            }
          } else {
            console.warn('uni.$emit方法不可用或不完整，跳过事件通知');
          }
        } catch (emitError) {
          console.error('事件发送整体处理失败:', emitError);
        }
      } catch (e) {
        console.error('添加到名片夹失败:', e);
      }
    },
    // 从名片夹移除
    removeFromCardFolder() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        let folderCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        folderCards = folderCards.filter(card => card.id !== this.cardDetail.id);
        uni.setStorageSync(`${storagePrefix}collectedCards`, folderCards);
        
        // 添加到删除记录
        let deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (!deletedCardIds.includes(this.cardDetail.id)) {
          deletedCardIds.push(this.cardDetail.id);
          uni.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
        }
        
        console.log('已从名片夹移除');
        
        // 发送事件通知数据更新
        uni.$emit('cardsDataUpdated');
      } catch (e) {
        console.error('从名片夹移除失败:', e);
      }
    },
    // 将用户添加到互关好友列表
    addToMutualFriendsList() {
      try {
        // 检查cardDetail是否有效
        if (!this.cardDetail || !this.cardDetail.id) {
          console.warn('无效的卡片数据，无法添加到互关好友列表');
          return;
        }
        
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 安全获取互关好友列表
        let mutualFriends = [];
        try {
          mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          if (!Array.isArray(mutualFriends)) mutualFriends = [];
        } catch (storageError) {
          console.error('读取互关好友列表失败:', storageError);
          return;
        }
        
        // 检查用户是否已在互关好友列表中
        const exists = mutualFriends.some(friend => friend && friend.id === this.cardDetail.id);
        
        if (!exists) {
          try {
            // 添加到互关好友列表
            mutualFriends.push({
              id: this.cardDetail.id,
              name: this.cardDetail.name || '',
              avatar: this.cardDetail.avatar || '',
              signature: this.cardDetail.signature || ''
            });
            
            // 保存更新后的互关好友列表
            uni.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
            console.log('用户已添加到互关好友列表');
          } catch (saveError) {
            console.error('保存互关好友列表失败:', saveError);
            // 保存失败不影响后续操作
          }
        }
        
        // 从添加我的列表中移除（如果存在）
        try {
          let followers = uni.getStorageSync(`${storagePrefix}followers`) || [];
          if (Array.isArray(followers)) {
            followers = followers.filter(follower => follower && follower.id !== this.cardDetail.id);
            uni.setStorageSync(`${storagePrefix}followers`, followers);
          }
        } catch (followerError) {
          console.error('更新关注者列表失败:', followerError);
          // 忽略错误，继续执行
        }
        
        // 清除该用户的删除记录
        try {
          let deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
          if (Array.isArray(deletedCardIds)) {
            deletedCardIds = deletedCardIds.filter(id => id !== this.cardDetail.id);
            if (deletedCardIds.length > 0) {
              uni.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
            } else {
              try {
                uni.removeStorageSync(`${storagePrefix}deletedCardIds`);
              } catch (removeError) {
                // 忽略删除存储项的错误
                console.error('移除删除记录存储项失败:', removeError);
              }
            }
          }
        } catch (deleteError) {
          console.error('更新删除记录失败:', deleteError);
          // 忽略错误，继续执行
        }
        
        // 发送事件通知数据更新（增强防御性检查）
        try {
          if (typeof uni !== 'undefined' && typeof uni.$emit === 'function' && typeof uni.$emit.apply === 'function') {
            try {
              uni.$emit('friendsDataUpdated');
            } catch (e) {
              console.error('发送friendsDataUpdated事件失败:', e);
            }
          } else {
            console.warn('uni.$emit方法不可用或不完整，跳过事件通知');
          }
        } catch (emitError) {
          console.error('事件发送整体处理失败:', emitError);
        }
      } catch (e) {
        console.error('添加到互关好友列表失败:', e);
        // 捕获所有异常，确保不会影响主流程
      }
    },
    // 从互关好友列表移除
    removeFromMutualFriendsList() {
      try {
        // 检查cardDetail是否有效
        if (!this.cardDetail || !this.cardDetail.id) {
          console.warn('无效的卡片数据，无法从互关好友列表移除');
          return;
        }
        
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 安全获取并更新互关好友列表
        try {
          let mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          if (Array.isArray(mutualFriends)) {
            // 过滤掉当前用户，确保friend对象有效
            mutualFriends = mutualFriends.filter(friend => friend && friend.id !== this.cardDetail.id);
            // 保存更新后的互关好友列表
            uni.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
            console.log('用户已从互关好友列表移除');
          }
        } catch (mutualError) {
          console.error('更新互关好友列表失败:', mutualError);
          // 忽略错误，继续执行
        }
        
        // 将用户添加到"添加我的"列表
        try {
          let followers = uni.getStorageSync(`${storagePrefix}followers`) || [];
          if (Array.isArray(followers)) {
            const existsInFollowers = followers.some(follower => follower && follower.id === this.cardDetail.id);
            if (!existsInFollowers) {
              followers.push({
                id: this.cardDetail.id,
                name: this.cardDetail.name || '',
                avatar: this.cardDetail.avatar || '',
                signature: this.cardDetail.signature || ''
              });
              uni.setStorageSync(`${storagePrefix}followers`, followers);
            }
          }
        } catch (followerError) {
          console.error('更新添加我的列表失败:', followerError);
          // 忽略错误，继续执行
        }
        
        // 发送事件通知社交页面数据已更新
        uni.$emit('friendsDataUpdated');
        
        console.log('用户已从互关好友列表移除并添加到添加我的列表');
      } catch (e) {
        console.error('从互关好友列表移除失败:', e);
        // 捕获所有异常，确保不会影响主流程
      }
    },
    
    // 验证数据一致性
    validateDataConsistency() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 安全获取数据，避免存储异常
        let mutualFriends = [];
        let collectedCards = [];
        
        try {
          mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        } catch (storageError) {
          console.error('读取存储数据失败:', storageError);
          return; // 存储错误时直接返回，避免后续操作
        }
        
        // 确保数据类型正确
        if (!Array.isArray(mutualFriends)) mutualFriends = [];
        if (!Array.isArray(collectedCards)) collectedCards = [];
        
        console.log('验证数据一致性:', {
          mutualFriends: mutualFriends.length,
          collectedCards: collectedCards.length,
          currentCardId: this.cardDetail.id,
          isFollowing: this.cardDetail.isFollowing
        });
        
        // 1. 验证mutualFriends和collectedCards列表的一致性：互关好友必须在名片夹中
        let hasChanges = false;
        
        // 检查所有互关好友是否都在名片夹中
        for (const friend of mutualFriends) {
          // 确保好友对象有效
          if (friend && friend.id) {
            const isInCollectedCards = collectedCards.some(card => card && card.id === friend.id);
            if (!isInCollectedCards) {
              // 如果互关好友不在名片夹中，添加到名片夹
              collectedCards.push({
                id: friend.id,
                name: friend.name || '',
                avatar: friend.avatar || '',
                signature: friend.signature || '',
                desc: ''
              });
              hasChanges = true;
              console.warn(`修复数据不一致：将互关好友${friend.name || '未知'}添加到名片夹`);
            }
          }
        }
        
        // 检查当前卡片的关注状态一致性
        if (this.cardDetail && this.cardDetail.id && this.cardDetail.isFollowing) {
          const isInMutualFriends = mutualFriends.some(f => f && f.id === this.cardDetail.id);
          const isInCollectedCards = collectedCards.some(c => c && c.id === this.cardDetail.id);
          
          // 直接修改数组，避免调用可能导致循环的方法
          if (!isInMutualFriends && this.cardDetail) {
            // 直接添加到互关好友列表
            mutualFriends.push({
              id: this.cardDetail.id,
              name: this.cardDetail.name || '',
              avatar: this.cardDetail.avatar || '',
              signature: this.cardDetail.signature || ''
            });
            hasChanges = true;
          }
          
          if (!isInCollectedCards && this.cardDetail) {
            // 直接添加到名片夹
            collectedCards.push({
              id: this.cardDetail.id,
              name: this.cardDetail.name || '',
              avatar: this.cardDetail.avatar || '',
              signature: this.cardDetail.signature || '',
              desc: this.cardDetail.desc || ''
            });
            hasChanges = true;
          }
        }
        
        // 保存更新后的数据集（如果有变化）
        if (hasChanges) {
          try {
            uni.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
            uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
            console.log('数据一致性修复完成，已保存更新后的数据集');
            
            // 发送事件通知数据更新（增强防御性检查）
            try {
              if (typeof uni !== 'undefined' && typeof uni.$emit === 'function' && typeof uni.$emit.apply === 'function') {
                try {
                  uni.$emit('cardsDataUpdated');
                } catch (e1) {
                  console.error('发送cardsDataUpdated事件失败:', e1);
                }
                try {
                  uni.$emit('friendsDataUpdated');
                } catch (e2) {
                  console.error('发送friendsDataUpdated事件失败:', e2);
                }
              } else {
                console.warn('uni.$emit方法不可用或不完整，跳过事件通知');
              }
            } catch (emitError) {
              console.error('事件发送整体处理失败:', emitError);
            }
          } catch (saveError) {
            console.error('保存数据失败:', saveError);
            // 保存失败时不抛出异常，避免影响主流程
          }
        }
        
      } catch (error) {
        console.error('验证数据一致性失败:', error);
        // 捕获所有异常，确保不会影响主流程
      }
    },
    
    // 同步关注状态
    syncFollowStatus() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 从互关好友列表获取真实的关注状态
        const mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const isActuallyFollowing = mutualFriends.some(f => f.id === this.cardDetail.id);
        
        // 保存之前的状态用于比较
        const previousStatus = this.cardDetail.isFollowing;
        
        // 更新关注状态
        this.cardDetail.isFollowing = isActuallyFollowing;
        console.log('同步关注状态:', this.cardDetail.isFollowing);
        
        // 如果关注状态发生变化，更新好友数量
        if (previousStatus !== isActuallyFollowing) {
          const cardIndex = this.allCards.findIndex(c => c.id === this.cardDetail.id);
          if (cardIndex !== -1) {
            this.allCards[cardIndex].isFollowing = isActuallyFollowing;
            console.log(`更新allCards中的关注状态为: ${isActuallyFollowing}`);
          }
          
          // 触发数据一致性验证
          this.validateDataConsistency();
        }
      } catch (error) {
        console.error('同步关注状态失败:', error);
      }
    },
    // 从本地存储加载夸夸数据
  loadPraiseMessages() {
    try {
      // 确保cardDetail存在
      if (!this.cardDetail || !this.cardDetail.id) {
        console.error('加载夸夸失败：缺少卡片信息');
        return;
      }
      
      const currentUserId = this.getCurrentUserId();
      const storageKey = `user_${currentUserId}_praiseMessages_${this.cardDetail.id}`;
      
      // 获取保存的夸夸数据
      const savedMessages = uni.getStorageSync(storageKey) || [];
      
      // 确保是数组格式
      const messagesArray = Array.isArray(savedMessages) ? savedMessages : [];
      
      // 过滤出有效的夸夸消息
      const validMessages = messagesArray.filter(msg => {
        // 支持字符串格式和对象格式
        if (typeof msg === 'string') {
          return msg.trim().length > 0;
        } else if (typeof msg === 'object' && msg) {
          return (typeof msg.content === 'string' && msg.content.trim().length > 0) || 
                 (typeof msg.image === 'string' && msg.image.trim().length > 0);
        }
        return false;
      });
      
      // 更新卡片详情中的夸夸信息
      this.cardDetail.praiseMessages = validMessages;
      this.cardDetail.praiseCount = validMessages.length;
      
      console.log('从本地存储加载夸夸数据:', validMessages.length, '条');
    } catch (error) {
      console.error('加载夸夸数据失败:', error);
      // 确保praiseMessages是数组
      this.cardDetail.praiseMessages = [];
      this.cardDetail.praiseCount = 0;
    }
  },
  
  // 保存夸夸数据到本地存储
  savePraiseMessages() {
    try {
      // 确保cardDetail和praiseMessages存在
      if (!this.cardDetail || !this.cardDetail.id) {
        console.error('保存夸夸失败：缺少卡片信息');
        return;
      }
      
      const currentUserId = this.getCurrentUserId();
      const storageKey = `user_${currentUserId}_praiseMessages_${this.cardDetail.id}`;
      
      // 确保praiseMessages是数组
      if (!Array.isArray(this.cardDetail.praiseMessages)) {
        this.cardDetail.praiseMessages = [];
      }
      
      // 验证夸夸数据格式（支持对象格式，包含content和image字段）
      const validMessages = this.cardDetail.praiseMessages.filter(msg => {
        // 支持旧的字符串格式和新的对象格式
        if (typeof msg === 'string') {
          return msg.trim().length > 0;
        } else if (typeof msg === 'object' && msg) {
          // 对于对象格式，确保有content字段或者有image字段
          return (typeof msg.content === 'string' && msg.content.trim().length > 0) || 
                 (typeof msg.image === 'string' && msg.image.trim().length > 0);
        }
        return false;
      });
      
      if (validMessages.length !== this.cardDetail.praiseMessages.length) {
        console.warn('过滤了无效的夸夸消息');
        this.cardDetail.praiseMessages = validMessages;
      }
      
      // 更新夸夸数量
      this.cardDetail.praiseCount = validMessages.length;
      
      // 保存到本地存储
      uni.setStorageSync(storageKey, validMessages);
      console.log('夸夸数据已保存到本地存储:', validMessages.length, '条');
      
      // 发送事件通知数据更新
      uni.$emit('praiseDataUpdated');
    } catch (error) {
      console.error('保存夸夸数据失败:', error);
      // 显示错误提示
      uni.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },
  
  // 验证名片数据格式
  validateCardData(card) {
    if (!card || typeof card !== 'object') {
      console.error('无效的卡片数据格式');
      return false;
    }
    
    // 检查必填字段
    const requiredFields = ['id', 'name'];
    for (const field of requiredFields) {
      if (!card[field]) {
        console.error(`卡片缺少必填字段: ${field}`);
        return false;
      }
    }
    
    // 检查数字字段类型
    if (card.friendCount !== undefined && typeof card.friendCount !== 'number') {
      console.error('friendCount必须是数字');
      return false;
    }
    
    return true;
  },
  
  // 备份关键数据
  backupData(storagePrefix) {
    try {
      const mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
      const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
      const praiseMessages = this.cardDetail.praiseMessages || [];
      
      const backupData = {
        mutualFriends,
        collectedCards,
        praiseMessages,
        isFollowing: this.cardDetail.isFollowing,
        friendCount: this.cardDetail.friendCount,
        timestamp: Date.now()
      };
      
      uni.setStorageSync(`${storagePrefix}dataBackup`, backupData);
      console.log('数据备份成功');
    } catch (error) {
      console.error('数据备份失败:', error);
    }
  },
  
  // 恢复数据
  restoreData(storagePrefix) {
    try {
      const backupData = uni.getStorageSync(`${storagePrefix}dataBackup`);
      
      if (backupData && Date.now() - backupData.timestamp < 300000) { // 5分钟内的备份有效
        uni.setStorageSync(`${storagePrefix}mutualFriends`, backupData.mutualFriends || []);
        uni.setStorageSync(`${storagePrefix}collectedCards`, backupData.collectedCards || []);
        
        // 恢复当前卡片状态
        if (typeof backupData.isFollowing === 'boolean') {
          this.cardDetail.isFollowing = backupData.isFollowing;
        }
        if (typeof backupData.friendCount === 'number') {
          this.cardDetail.friendCount = backupData.friendCount;
        }
        if (Array.isArray(backupData.praiseMessages)) {
          this.cardDetail.praiseMessages = backupData.praiseMessages;
          this.savePraiseMessages();
        }
        
        console.log('数据恢复成功');
        
        // 重新同步状态
        this.syncFollowStatus();
        this.validateDataConsistency();
        
        // 发送事件通知数据更新（增强防御性检查）
        try {
          if (typeof uni !== 'undefined' && typeof uni.$emit === 'function' && typeof uni.$emit.apply === 'function') {
            // 逐个发送事件，并为每个事件添加单独的try-catch
            try {
              uni.$emit('cardsDataUpdated');
            } catch (e1) {
              console.error('发送cardsDataUpdated事件失败:', e1);
            }
            
            try {
              uni.$emit('friendsDataUpdated');
            } catch (e2) {
              console.error('发送friendsDataUpdated事件失败:', e2);
            }
            
            try {
              uni.$emit('praiseDataUpdated');
            } catch (e3) {
              console.error('发送praiseDataUpdated事件失败:', e3);
            }
          } else {
            console.warn('uni.$emit方法不可用或不完整，跳过事件通知');
          }
        } catch (emitError) {
          console.error('事件发送整体处理失败:', emitError);
        }
      } else {
        console.warn('没有有效的备份数据可恢复');
      }
    } catch (error) {
      console.error('数据恢复失败:', error);
    }
  },
  
  // 清理无效数据
    cleanupInvalidData() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 清理互关好友列表中的无效数据
        let mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        mutualFriends = mutualFriends.filter(friend => this.validateCardData(friend));
        
        // 清理名片夹中的无效数据
        let collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        collectedCards = collectedCards.filter(card => this.validateCardData(card));
        
        // 清理夸夸数据中的无效消息
        for (const card of this.allCards) {
          const praiseKey = `${storagePrefix}praiseMessages_${card.id}`;
          let praiseMessages = uni.getStorageSync(praiseKey) || [];
          // 支持字符串格式和对象格式的夸夸消息
          const validMessages = praiseMessages.filter(msg => {
            if (typeof msg === 'string') {
              return msg.trim().length > 0;
            } else if (typeof msg === 'object' && msg) {
              return (typeof msg.content === 'string' && msg.content.trim().length > 0) || 
                     (typeof msg.image === 'string' && msg.image.trim().length > 0);
            }
            return false;
          });
          if (validMessages.length !== praiseMessages.length) {
            uni.setStorageSync(praiseKey, validMessages);
            console.log(`清理了卡片 ${card.id} 的无效夸夸消息，保留了 ${validMessages.length} 条有效消息`);
          }
        }
        
        // 保存清理后的数据
        uni.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
        uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
        
        console.log('无效数据清理完成');
      } catch (error) {
        console.error('清理无效数据失败:', error);
      }
    },
    
    // 全面测试数据一致性
    comprehensiveTestDataConsistency() {
      try {
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        console.log('开始执行全面数据一致性测试...');
        
        // 1. 再次执行数据清理
        this.cleanupInvalidData();
        
        // 2. 获取所有数据列表
        const mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 3. 验证互关好友和名片夹的双向一致性
        let hasInconsistencies = false;
        
        // 检查所有互关好友是否都在名片夹中
        for (const friend of mutualFriends) {
          const isInCollectedCards = collectedCards.some(card => card.id === friend.id);
          if (!isInCollectedCards) {
            console.warn(`发现不一致: 互关好友 ${friend.name} 不在名片夹中`);
            // 自动修复：添加到名片夹
            collectedCards.push({
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
              signature: friend.signature || '',
              desc: ''
            });
            hasInconsistencies = true;
          }
        }
        
        // 4. 验证夸夸数量计算
        const praiseKey = `${storagePrefix}praiseMessages_${this.cardDetail.id}`;
        const praiseMessages = uni.getStorageSync(praiseKey) || [];
        const validPraiseCount = praiseMessages.filter(msg => {
          if (typeof msg === 'string') {
            return msg.trim().length > 0;
          } else if (typeof msg === 'object' && msg) {
            return (typeof msg.content === 'string' && msg.content.trim().length > 0) || 
                   (typeof msg.image === 'string' && msg.image.trim().length > 0);
          }
          return false;
        }).length;
        
        if (validPraiseCount !== this.cardDetail.praiseCount) {
          console.warn(`夸夸数量不一致: 显示 ${this.cardDetail.praiseCount}, 实际 ${validPraiseCount}`);
          // 自动修复夸夸数量
          this.cardDetail.praiseCount = validPraiseCount;
          hasInconsistencies = true;
        }
        
        // 5. 保存修复后的数据（如果有不一致）
        if (hasInconsistencies) {
          uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
          console.log('数据一致性测试完成，已修复发现的不一致问题');
          
          // 发送事件通知所有数据更新
          uni.$emit('cardsDataUpdated');
          uni.$emit('friendsDataUpdated');
          uni.$emit('praiseDataUpdated');
        } else {
          console.log('数据一致性测试通过，所有数据保持一致');
        }
        
        // 6. 最后再次验证当前卡片的关注状态
        this.syncFollowStatus();
        this.validateDataConsistency();
        
      } catch (error) {
        console.error('全面数据一致性测试失败:', error);
      }
    },
  
  // 添加新的夸夸内容
  addPraiseMessage(content, image = '') {
    try {
      // 确保praiseMessages是数组
      if (!Array.isArray(this.cardDetail.praiseMessages)) {
        this.cardDetail.praiseMessages = [];
      }
      
      // 创建夸夸消息对象，支持文本和图片
      const newPraise = {
        content: content || '',
        image: image || '',
        timestamp: Date.now()
      };
      
      // 添加新的夸夸内容
      this.cardDetail.praiseMessages.push(newPraise);
      // 更新夸夸数量
      this.cardDetail.praiseCount = this.cardDetail.praiseMessages.length;
      
      // 保存到本地存储
      this.savePraiseMessages();
      
      console.log('添加了新的夸夸，当前总数:', this.cardDetail.praiseCount);
    } catch (error) {
      console.error('添加夸夸内容失败:', error);
      // 显示错误提示
      uni.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },
    praiseUser() {
      // 跳转到夸夸详情页面，并传递卡片ID
      uni.navigateTo({
        url: `/pages/praise-detail/praise-detail?cardId=${this.cardDetail.id}`
      });
    },
    deleteCard() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这张名片吗？删除后无法恢复。',
        success: (res) => {
          if (res.confirm) {
            try {
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              
              // 1. 从当前组件的allCards数组中移除对应的名片
              const cardIndex = this.allCards.findIndex(c => c.id === this.cardDetail.id);
              if (cardIndex > -1) {
                this.allCards.splice(cardIndex, 1);
              }
              
              // 2. 同步从互关好友列表删除
              let mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
              mutualFriends = mutualFriends.filter(friend => friend.id !== this.cardDetail.id);
              uni.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
              
              // 3. 同步从添加我的列表删除
              let followers = uni.getStorageSync(`${storagePrefix}followers`) || [];
              followers = followers.filter(follower => follower.id !== this.cardDetail.id);
              uni.setStorageSync(`${storagePrefix}followers`, followers);
              
              // 4. 添加到删除记录，供其他页面使用
              let deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
              if (!deletedCardIds.includes(this.cardDetail.id)) {
                deletedCardIds.push(this.cardDetail.id);
                uni.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
              }
              
              // 5. 通过uni.navigateBack和页面通信，通知上一页也删除对应的名片
              uni.showToast({ 
                title: '删除成功', 
                icon: 'success',
                duration: 1000,
                success: () => {
                  setTimeout(() => {
                    // 发送事件通知社交页面数据已更新
                    uni.$emit('friendsDataUpdated');
                    
                    const pages = getCurrentPages();
                    const prevPage = pages[pages.length - 2];
                    if (prevPage) {
                      // 传递删除的名片ID给上一页
                      prevPage.$vm.deleteCardFromList(this.cardDetail.id);
                    }
                    uni.navigateBack();
                  }, 1000);
                }
              });
            } catch (e) {
              console.error('删除卡片时出错:', e);
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    favoriteCard() {
      // 切换收藏状态
      this.cardDetail.isFavorite = !this.cardDetail.isFavorite;
      
      // 显示对应的提示信息
      if (this.cardDetail.isFavorite) {
        // 如果是收藏操作
        uni.showToast({ title: '收藏成功', icon: 'success' });
        
        // 收藏和关注是两个独立的功能
        // 收藏不会自动添加到名片夹，需要通过关注按钮操作
      } else {
        // 如果是取消收藏操作
        uni.showToast({ title: '已取消收藏', icon: 'none' });
        
        // 这里可以添加将卡片从名片夹中移除的逻辑
      }
    },
    shareCard() {
      // 显示分享弹窗
      this.showShareModal = true;
    },
    // 关闭分享弹窗
    closeShareModal() {
      this.showShareModal = false;
    },
    // 分享到微信
    shareToWechat() {
      uni.showToast({ 
        title: '已分享到微信', 
        icon: 'success',
        duration: 1500,
        success: () => {
          this.showShareModal = false;
        }
      });
    },
    // 分享到QQ
    shareToQQ() {
      uni.showToast({ 
        title: '已分享到QQ', 
        icon: 'success',
        duration: 1500,
        success: () => {
          this.showShareModal = false;
        }
      });
    },
    // 分享到邮箱
    shareToMail() {
      uni.showToast({ 
        title: '已分享到邮箱', 
        icon: 'success',
        duration: 1500,
        success: () => {
          this.showShareModal = false;
        }
      });
    }
  }
}
</script>

<style scoped>
.card-detail {
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 100rpx; /* 为底部操作按钮留空间 */
}

.header {
  padding: 30rpx;
}
.back-btn {
  width: 40rpx;
  height: 40rpx;
}

.card-container {
  padding: 0 30rpx;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}
.user-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 用户信息 */
.user-info {
  text-align: center;
  margin-bottom: 30rpx;
}
.user-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}
.user-tag {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

/* 标签信息 */
.tags-section {
  margin: 20rpx 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
  padding: 0 20rpx;
}
.tag-text {
  padding: 8rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 50rpx;
  font-size: 26rpx;
  color: #666;
  display: inline-block;
  margin-bottom: 10rpx;
}

/* 社交信息 */
.social-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  gap: 20rpx;
  padding: 0 20rpx;
}
.social-item {
  font-size: 26rpx;
  color: #666;
}
.social-avatar,
.add-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-left: 10rpx;
}
.add-avatar {
  background-color: #f0f0f0;
}

/* 加好友按钮 */
.action-section {
  margin-bottom: 30rpx;
  display: flex;
  justify-content: center;
  padding: 0 20rpx;
}
.add-friend-btn {
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  color: #333;
  border: 2rpx solid #ddd;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.add-friend-btn::after {
  border: none;
}

/* 内容展示区域 */
.content-section {
  margin-bottom: 20rpx;
  padding: 0 20rpx;
}
.content-card {
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
.content-image {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}
.content-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  text-align: center;
}

/* 夸夸内容展示区域 */
.praise-messages-section {
  margin: 30rpx 20rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  min-height: 100rpx; /* 确保有足够高度显示内容 */
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}
.praise-message {
  padding: 16rpx 0;
  display: block;
  width: 100%;
  word-break: break-all; /* 确保长文本能正确换行 */
}
.praise-message-text {
  font-size: 28rpx;
  color: #666;
  display: inline-block;
  width: 100%;
}

/* 夸夸消息中的图片样式 */
.praise-message-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  margin-top: 16rpx;
  object-fit: cover;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 左下角夸夸TA按钮 */
.praise-button {
  display: flex;
  align-items: center;
  background-color: #1E90FF;
  padding: 16rpx 32rpx;
  border-radius: 50rpx;
}
.praise-icon {
  width: 56rpx;
  height: 56rpx;
  margin-right: 12rpx;
}
.praise-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

/* 右下角操作按钮组 */
.action-buttons {
  display: flex;
  gap: 40rpx;
}
.action-btn {
  width: 90rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
}
.action-btn .action-icon {
    width: 60rpx;
    height: 60rpx;
    margin-bottom: 0;
  }
  
  /* 分享弹窗样式 */
  .share-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 999;
  }
  
  .share-content {
    background-color: #fff;
    width: 100%;
    border-top-left-radius: 30rpx;
    border-top-right-radius: 30rpx;
    padding: 30rpx;
  }
  
  .share-title {
    font-size: 32rpx;
    text-align: center;
    margin-bottom: 40rpx;
    color: #333;
  }
  
  .share-options {
    display: flex;
    justify-content: space-around;
    margin-bottom: 40rpx;
  }
  
  .share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .share-icon {
    width: 100rpx;
    height: 100rpx;
    margin-bottom: 20rpx;
  }
  
  .share-text {
    font-size: 28rpx;
    color: #666;
  }
  
  .share-cancel {
    text-align: center;
    font-size: 32rpx;
    padding: 24rpx 0;
    background-color: #f5f5f5;
    border-radius: 16rpx;
    color: #333;
  }
</style>