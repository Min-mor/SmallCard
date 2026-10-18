<template>
  <view class="friend-detail-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="navigateBack">
        <image src="/static/icon/back.png" class="back-icon" mode="aspectFit"></image>
      </view>
      <view class="title">好友</view>
      <view class="more-btn" @click="showMoreOptions">
        <text class="more-icon">...</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 我互关的好友列表 -->
      <view class="section">
        <view class="section-header" @click="navigateToMutualFriends">
          <text class="section-title">我互关的</text>
          <view class="section-action">
            <text class="count">{{ mutualFriendCount }}条</text>
            <image src="/static/icon/arrow-right.png" class="arrow-icon" mode="aspectFit"></image>
          </view>
        </view>

        <!-- 互关好友卡片 -->
        <view class="friend-card" v-for="(friend, index) in mutualFriends" :key="friend.id">
          <image :src="friend.avatar || '/static/icon/我的.png'" class="friend-avatar" mode="aspectFill" @click="viewFriendCard(friend.id)"></image>
          <view class="friend-info">
            <view class="friend-name">{{ friend.name }}</view>
            <view class="friend-signature">{{ friend.signature || 'TA 还没有任何介绍' }}</view>
          </view>
          <view class="follow-btn mutual-follow" @click="unfollowUser(friend.id)">互相关注</view>
        </view>
      </view>

      <!-- 添加我的好友列表 -->
      <view class="section">
        <view class="section-header" @click="navigateToFollowers">
          <text class="section-title">添加我的</text>
          <view class="section-action">
            <text class="count">{{ followerCount }}条</text>
            <image src="/static/icon/arrow-right.png" class="arrow-icon" mode="aspectFit"></image>
          </view>
        </view>

        <!-- 添加我的好友卡片 -->
        <view class="friend-card" v-for="(follower, index) in followers" :key="follower.id">
          <image :src="follower.avatar || '/static/icon/我的.png'" class="friend-avatar" mode="aspectFill" @click="viewFriendCard(follower.id)"></image>
          <view class="friend-info">
            <view class="friend-name">{{ follower.name }}</view>
            <view class="friend-signature">{{ follower.signature || 'TA 还没有任何介绍' }}</view>
          </view>
          <view class="follow-btn" @click="followUser(follower.id)">关注</view>
        </view>
      </view>
    </view>

    <!-- 底部添加好友按钮 -->
    <view class="bottom-section">
      <button class="add-friend-btn" @click="navigateToAddFriend">添加好友</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
    return {
      mutualFriends: [],
      followers: [],
      // 定时器ID，用于定期更新夸夸数量
      updateTimer: null
    }
  },
  onLoad() {
    // 页面加载时从本地存储获取好友数据
    this.loadFriendData();
  },
  onShow() {
      // 再次加载数据，确保数据是最新的
      this.loadFriendData();
      
      // 检查删除记录
      this.checkAndRemoveDeletedFriends();
      
      // 监听数据更新事件
      uni.$on('cardsDataUpdated', this.handleDataUpdate);
      // 添加监听夸夸数据更新事件
      uni.$on('praiseDataUpdated', this.handlePraiseDataUpdate);
      
      // 使用定时器每5秒检查一次存储变化
      this.updateTimer = setInterval(() => {
        // 只重新加载夸夸数据，而不是全部好友数据，减少性能消耗
        this.reloadAllPraiseData();
      }, 5000);
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
      // 可以根据传入的参数初始化数据
      if (options.friendId) {
        console.log('查看特定好友:', options.friendId);
        // 这里可以根据friendId加载特定好友的数据
      }
      
      // 监听数据更新事件
      this.setupEventListeners();
    },
    onUnload() {
      // 移除事件监听，避免内存泄漏
      this.removeEventListeners();
      
      // 清除定时器
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
      }
    },
    methods: {
      // 设置事件监听器
      setupEventListeners() {
        // 监听名片夹数据更新事件
        uni.$on('cardsDataUpdated', this.handleCardsDataUpdate);
        // 监听存储变化
        this.listenToStorageChanges();
      },
      
      // 移除事件监听器
      removeEventListeners() {
        uni.$off('cardsDataUpdated', this.handleDataUpdate);
        uni.$off('praiseDataUpdated', this.handlePraiseDataUpdate);
        // 清除定时器
        if (this.storageCheckTimer) {
          clearInterval(this.storageCheckTimer);
        }
      },
      
      // 处理数据更新
      handleDataUpdate() {
        console.log('收到数据更新通知，重新加载好友数据');
        this.loadFriendData();
      },
      
      // 处理夸夸数据更新
      handlePraiseDataUpdate() {
        console.log('收到夸夸数据更新通知，重新加载夸夸数据');
        this.reloadAllPraiseData();
      },
      
      // 监听存储变化
      listenToStorageChanges() {
        this.storageCheckTimer = setInterval(() => {
          this.checkStorageChanges();
        }, 5000);
      },
      
      // 检查存储变化
      checkStorageChanges() {
        try {
          // 获取当前用户ID
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          const latestCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          const currentCards = this.mutualFriends;
          if (latestCards.length !== currentCards.length) {
            this.loadFriendData();
          }
        } catch (e) {
          console.error('检查存储变化失败:', e);
        }
      },
      
      // 广播数据更新事件
      broadcastDataUpdate() {
        uni.$emit('cardsDataUpdated');
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
      
      // 添加默认好友数据
      addDefaultFriends() {
        const defaultFriends = [
          { id: 'friend1', name: '林一', avatar: '/static/photo/林一.jpg', signature: '摄影师，记录生活' },
          { id: 'friend2', name: '涂二', avatar: '/static/photo/涂二.jpg', signature: '数据分析师，擅长可视化' },
          { id: 'friend3', name: '张三', avatar: '/static/photo/张三.jpg', signature: '产品经理，5年经验' },
          { id: 'friend4', name: '李四', avatar: '/static/photo/李四.jpg', signature: '前端工程师，热爱新技术' },
          { id: 'friend5', name: '王五', avatar: '/static/photo/王五.jpg', signature: '设计师，UI/UX全能' },
          { id: 'friend6', name: '赵六', avatar: '/static/photo/赵六.jpg', signature: '后端工程师，专注性能优化' },
          { id: 'friend7', name: '陈七', avatar: '/static/photo/陈七.jpg', signature: '移动开发工程师，全栈思维' },
          { id: 'friend8', name: '刘八', avatar: '/static/photo/刘八.jpg', signature: 'DevOps工程师，自动化运维' },
          { id: 'friend9', name: 'L.', avatar: '/static/photo/L..jpg', signature: '项目经理，敏捷实践者' },
          { id: 'friend10', name: '梨鸣晒兽', avatar: '/static/photo/梨鸣晒兽.jpg', signature: '数据科学家，机器学习爱好者' },
          { id: 'friend11', name: 'S.', avatar: '/static/photo/S..jpg', signature: '测试工程师，质量保障专家' }
        ];
        return defaultFriends;
      },
      
      // 加载好友数据
      loadFriendData() {
        try {
          // 获取当前用户ID和存储前缀
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          console.log('当前用户ID:', currentUserId);
          
          // 从本地存储获取名片夹数据（互关好友）
          let collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          
          // 安全检查：确保数据是数组格式
          if (!Array.isArray(collectedCards)) {
            collectedCards = [];
          }
          
          // 关键修改：不管是什么用户ID，如果没有名片夹数据，都初始化默认好友
          if (collectedCards.length === 0) {
            console.log('未找到名片夹数据，为用户', currentUserId, '初始化默认好友');
            const defaultFriends = this.addDefaultFriends();
            collectedCards = defaultFriends;
            uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
            console.log('已为用户', currentUserId, '初始化默认好友数据');
          }
          
          // 将名片夹数据转换为互关好友格式
          this.mutualFriends = collectedCards.map(card => {
            // 创建好友对象
            const friendObj = {
              id: card.id,
              name: card.name,
              avatar: card.avatar,
              signature: card.signature,
              friendCount: card.friendCount || 0,
              praiseCount: 0 // 初始化为0，稍后会更新
            };
            
            // 加载该好友的夸夸数据
            this.loadFriendPraiseData(friendObj);
            
            return friendObj;
          });
          
          // 保存到本地存储
          uni.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
          
          // 从本地存储获取添加我的好友数据
          let storedFollowers = uni.getStorageSync(`${storagePrefix}followers`) || [];
          
          // 安全检查：确保数据是数组格式
          if (!Array.isArray(storedFollowers)) {
            storedFollowers = [];
          }
          
          // 过滤掉已经在名片夹中的用户
          storedFollowers = storedFollowers.filter(follower => 
            !collectedCards.some(card => card.id === follower.id)
          );
          
          // 关键修改：同样，无论什么用户ID，如果没有添加我的好友数据，都初始化默认数据
          if (storedFollowers.length === 0) {
            console.log('未找到添加我的好友数据，为用户', currentUserId, '初始化默认新朋友');
            const defaultFollowers = [
              {
                id: 'new_friend1',
                name: '新朋友',
                avatar: '/static/photo/王五.jpg',
                signature: '这是一个新用户'
              }
            ];
            
            this.followers = defaultFollowers;
            uni.setStorageSync(`${storagePrefix}followers`, defaultFollowers);
            console.log('已为用户', currentUserId, '初始化默认添加我的好友数据');
          } else {
            this.followers = storedFollowers;
            uni.setStorageSync(`${storagePrefix}followers`, storedFollowers);
          }
          
          console.log('用户', currentUserId, '的互关好友数量:', this.mutualFriends.length);
          console.log('用户', currentUserId, '的添加我的好友数量:', this.followers.length);
          
        } catch (e) {
          console.error('加载好友数据失败:', e);
          
          // 出错时尝试重新初始化默认数据
          try {
            const currentUserId = this.getCurrentUserId();
            const storagePrefix = `user_${currentUserId}_`;
            console.log('加载失败，尝试重新初始化好友数据');
            
            // 重新初始化基本默认好友数据
            const basicDefaultFriends = this.addDefaultFriends().slice(0, 3);
            uni.setStorageSync(`${storagePrefix}collectedCards`, basicDefaultFriends);
            
            // 转换并保存互关好友数据
            this.mutualFriends = basicDefaultFriends.map(card => ({
              id: card.id,
              name: card.name,
              avatar: card.avatar,
              signature: card.signature,
              friendCount: card.friendCount || 0,
              praiseCount: 0
            }));
            uni.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
            
            // 初始化添加我的好友为空
            this.followers = [];
            uni.setStorageSync(`${storagePrefix}followers`, []);
            
            console.log('错误恢复：已初始化基本好友数据');
          } catch (retryError) {
            console.error('错误恢复失败:', retryError);
          }
        }
      },
      
      // 加载单个好友的夸夸数据
      loadFriendPraiseData(friend) {
        try {
          const currentUserId = this.getCurrentUserId();
          const storageKey = `user_${currentUserId}_praiseMessages_${friend.id}`;
          const savedMessages = uni.getStorageSync(storageKey) || [];
          
          // 计算有效的夸夸消息数量
          const validMessages = savedMessages.filter(msg => 
            typeof msg === 'string' && msg.trim().length > 0
          );
          
          // 更新好友的夸夸数量
          friend.praiseCount = validMessages.length;
          
          console.log(`加载好友 ${friend.name} 的夸夸数据: ${friend.praiseCount} 条`);
        } catch (error) {
          console.error(`加载好友 ${friend.name} 的夸夸数据失败:`, error);
          friend.praiseCount = 0;
        }
      },
      
      // 重新加载所有好友的夸夸数据
      reloadAllPraiseData() {
        try {
          this.mutualFriends.forEach(friend => {
            this.loadFriendPraiseData(friend);
          });
          console.log('所有好友夸夸数据重新加载完成');
        } catch (error) {
          console.error('重新加载夸夸数据失败:', error);
        }
      },
      
      // 返回上一页
      navigateBack() {
        uni.navigateBack();
      },
      // 显示更多选项
      showMoreOptions() {
        // 实现更多选项的逻辑
        uni.showActionSheet({
          itemList: ['刷新', '排序', '设置'],
          success: (res) => {
            console.log('选择了:', res.tapIndex);
          }
        });
      },
      // 导航到互关好友列表
      navigateToMutualFriends() {
        // 实现导航到互关好友列表的逻辑
        console.log('导航到互关好友列表');
      },
      // 导航到关注者列表
      navigateToFollowers() {
        // 实现导航到关注者列表的逻辑
        console.log('导航到关注者列表');
      },
      // 关注用户（实现互相关注关系）
    followUser(userId) {
      try {
        // 获取当前用户ID和存储前缀
        const currentUserId = this.getCurrentUserId();
        const storagePrefix = `user_${currentUserId}_`;
        
        // 确保数据数组存在且为数组类型
        this.mutualFriends = Array.isArray(this.mutualFriends) ? this.mutualFriends : [];
        this.followers = Array.isArray(this.followers) ? this.followers : [];
        
        // 检查用户是否已在互关列表
        if (this.mutualFriends.some(friend => friend.id === userId)) {
          uni.showToast({
            title: '已经是互相关注了',
            icon: 'none'
          });
          return;
        }
        
        // 从添加我的列表中找到该用户（表示对方已经关注了我）
        const follower = this.followers.find(f => f.id === userId);
        if (!follower) {
          uni.showToast({
            title: '用户不存在',
            icon: 'none'
          });
          return;
        }
        
        // 核心关注逻辑 - 使用事务性操作
        // 1. 从添加我的列表中移除 - 创建新数组触发UI更新
        this.followers = this.followers.filter(friend => friend.id !== userId);
        
        // 2. 添加到互关好友列表（建立互相关注关系）
        this.mutualFriends = [...this.mutualFriends, follower];
        
        // 3. 更新本地存储（用户隔离）
        uni.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
        uni.setStorageSync(`${storagePrefix}followers`, this.followers);
        
        // 4. 同步更新名片夹数据 - 只有互相关注的用户才会被添加到名片夹
        let collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        collectedCards = Array.isArray(collectedCards) ? collectedCards : [];
        const cardIndex = collectedCards.findIndex(card => card.id === userId);
        
        if (cardIndex > -1) {
          // 如果已经存在，更新数据以确保一致性
          collectedCards[cardIndex] = {
            ...collectedCards[cardIndex],
            name: follower.name,
            avatar: follower.avatar,
            signature: follower.signature
          };
        } else {
          // 如果不存在，创建新的名片数据
          const newCard = {
            id: follower.id,
            name: follower.name,
            avatar: follower.avatar,
            signature: follower.signature,
            desc: follower.desc || ''
          };
          collectedCards.push(newCard);
        }
        
        // 更新名片夹存储（用户隔离）
        uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
        
        // 5. 清除该用户的删除记录（如果有）
        let deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        deletedCardIds = deletedCardIds.filter(id => id !== userId);
        if (deletedCardIds.length > 0) {
          uni.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
        } else {
          uni.removeStorageSync(`${storagePrefix}deletedCardIds`);
        }
        
        // 发送事件通知数据更新
        uni.$emit('cardsDataUpdated');
        
        // 核心关注操作成功后立即显示成功提示
        uni.showToast({
          title: '已关注，现在是互相关注的好友',
          icon: 'success',
          duration: 1500
        });
        
        console.log('关注操作成功完成，用户ID:', userId);
        
        // 核心操作成功后，使用较长延迟执行后续操作，确保成功提示完全显示
        setTimeout(() => {
          try {
            // 数据一致性验证
            this.validateDataConsistency();
          } catch (validationError) {
            console.error('数据一致性验证失败:', validationError);
          }
          
          try {
            // 重新加载夸夸数据以确保数量准确
            this.reloadAllPraiseData();
          } catch (praiseError) {
            console.error('重新加载夸夸数据失败:', praiseError);
          }
          
          try {
            // 最后重新加载好友数据以确保UI完全一致
            this.loadFriendData();
          } catch (loadError) {
            console.error('重新加载好友数据失败:', loadError);
          }
        }, 1000); // 增加延迟到1秒，确保成功提示有足够时间显示
        
      } catch (e) {
        // 只在核心操作失败时显示错误提示
        console.error('关注用户失败:', e);
        uni.showToast({
          title: '关注失败，请重试',
          icon: 'none'
        });
      }
    },
      // 导航到添加好友页面
      navigateToAddFriend() {
        // 弹出输入框收集好友信息
        uni.showModal({
          title: '添加好友',
          content: '请输入好友信息',
          editable: true,
          placeholderText: '请输入好友ID或名称',
          success: (res) => {
            if (res.confirm && res.content.trim()) {
              const friendName = res.content.trim();
              
              // 获取当前用户ID和存储前缀
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              
              // 生成唯一ID
              const newId = 'new_friend_' + Date.now();
              
              // 创建新好友对象
              const newFriend = {
                id: newId,
                name: friendName,
                avatar: '/static/icon/我的.png', // 默认头像
                signature: '新添加的好友'
              };
              
              // 添加到添加我的列表（用户隔离）
              let followers = uni.getStorageSync(`${storagePrefix}followers`) || [];
              
              // 检查是否已存在
              const exists = followers.some(f => f.name === friendName || f.id === newId);
              if (!exists) {
                followers.push(newFriend);
                uni.setStorageSync(`${storagePrefix}followers`, followers);
                this.followers = followers;
                
                uni.showToast({
                  title: '好友添加成功，请等待对方通过',
                  icon: 'success'
                });
              } else {
                uni.showToast({
                  title: '该好友已存在',
                  icon: 'none'
                });
              }
            }
          }
        });
      },
      // 查看好友名片
      viewFriendCard(userId) {
        // 跳转到名片详情页
        uni.navigateTo({
          url: `/pages/card-detail/card-detail?id=${userId}`
        });
      },
      
      // 取消关注用户 - 优化版，添加详细调试和错误处理
    unfollowUser(userId) {
      console.log('开始取消关注流程，用户ID:', userId);
      
      uni.showModal({
        title: '确认取消关注',
        content: '确定要取消关注该用户吗？取消关注后，该用户将从好友列表移除，并自动从名片夹中删除。',
        success: (res) => {
          if (res.confirm) {
            // 安全检查：确保mutualFriends是数组
            if (!Array.isArray(this.mutualFriends)) {
              console.error('mutualFriends不是数组，重新加载数据');
              this.loadFriendData();
              uni.showToast({
                title: '数据加载中，请稍后再试',
                icon: 'none'
              });
              return;
            }
            
            console.log('当前互关好友列表:', JSON.stringify(this.mutualFriends.map(f => ({id: f.id, name: f.name}))));
            
            // 增强的用户查找逻辑，特别针对名片夹场景
            let unfollowedUser = null;
            let targetIndex = -1;
            
            // 1. 尝试精确匹配ID（最优先）
            unfollowedUser = this.mutualFriends.find((f, index) => {
              if (f.id === userId) {
                targetIndex = index;
                return true;
              }
              return false;
            });
            
            // 2. 如果ID匹配失败，同时从名片夹中查找（针对名片夹场景）
            if (!unfollowedUser) {
              console.log(`尝试从名片夹中查找ID为${userId}的用户`);
              // 获取名片夹数据
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
              
              // 从名片夹中查找匹配的用户
              const cardUser = collectedCards.find(card => card.id === userId);
              if (cardUser) {
                console.log('从名片夹中找到匹配用户');
                unfollowedUser = cardUser;
                // 再尝试从互关好友中查找同名用户
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
            
            // 3. 如果以上都失败，尝试通过名称匹配
            if (!unfollowedUser) {
              console.warn(`未找到ID为${userId}的匹配用户，尝试按名称匹配`);
              unfollowedUser = this.mutualFriends.find((f, index) => {
                if (f.name === userId || f.userName === userId) {
                  targetIndex = index;
                  return true;
                }
                return false;
              });
            }
            
            // 4. 如果仍然失败，记录详细日志并尝试修复
            if (!unfollowedUser) {
              console.error(`无法找到ID或名称为${userId}的用户，正在记录详细信息...`);
              console.log('当前互关好友列表:', JSON.stringify(this.mutualFriends.map(f => ({id: f.id, name: f.name})), null, 2));
              
              // 尝试获取页面路由参数，看是否有其他用户标识
              const pages = getCurrentPages();
              const currentPage = pages[pages.length - 1];
              console.log('页面参数:', currentPage.options);
            }
            
            // 记录实际用于删除的用户ID
            const actualUserId = unfollowedUser ? unfollowedUser.id : userId;
            console.log('实际将删除的用户ID:', actualUserId, '目标索引:', targetIndex);
            
            // 数据操作部分 - 事务性处理和增强错误处理
            try {
              // 获取当前用户ID和存储前缀
              const currentUserId = this.getCurrentUserId();
              const storagePrefix = `user_${currentUserId}_`;
              
              console.log('当前用户ID:', currentUserId, '存储前缀:', storagePrefix);
              
              // 预先加载所有需要的数据，避免重复读取
              const [collectedCards, deletedCardIds] = this.preloadUserData(storagePrefix);
              
              // 1. 从互关好友列表中移除 - 使用实际用户ID进行过滤
              const updatedMutualFriends = this.mutualFriends.filter(f => f.id !== actualUserId);
              console.log(`移除前好友数: ${this.mutualFriends.length}, 移除后好友数: ${updatedMutualFriends.length}`);
              
              // 2. 从名片夹中移除
              const updatedCollectedCards = collectedCards.filter(card => card.id !== actualUserId);
              
              // 3. 准备更新添加我的列表
              let updatedFollowers = [...this.followers];
              const existsInFollowers = this.followers.some(f => f.id === actualUserId);
              if (!existsInFollowers && unfollowedUser) {
                updatedFollowers.push(unfollowedUser);
              }
              
              // 4. 准备更新删除记录
              const updatedDeletedCardIds = [...deletedCardIds];
              if (!deletedCardIds.includes(actualUserId)) {
                updatedDeletedCardIds.push(actualUserId);
              }
              
              // 批量执行存储操作，确保数据一致性
              this.batchUpdateStorage(storagePrefix, {
                mutualFriends: updatedMutualFriends,
                collectedCards: updatedCollectedCards,
                followers: updatedFollowers,
                deletedCardIds: updatedDeletedCardIds
              });
              
              // 确保内存中的数据与存储一致（优化UI即时反馈）
              this.mutualFriends = [...updatedMutualFriends]; // 创建新数组触发UI更新
              if (updatedFollowers) {
                this.followers = [...updatedFollowers]; // 创建新数组触发UI更新
              }
              
              // 立即从mutualFriends数组中移除该用户（确保UI立即更新）
              if (targetIndex !== -1 && targetIndex >= 0 && targetIndex < this.mutualFriends.length) {
                this.mutualFriends.splice(targetIndex, 1);
                console.log(`已从mutualFriends数组中移除索引${targetIndex}的用户`);
              } else {
                // 如果没有找到准确索引，使用ID过滤重建数组
                this.mutualFriends = this.mutualFriends.filter(f => f.id !== actualUserId);
                console.log(`已通过ID过滤重建mutualFriends数组`);
              }
              
              // 确保this.isFollowing和this.isMutual存在并设置为false
              if (this.hasOwnProperty('isFollowing')) {
                this.isFollowing = false;
              }
              if (this.hasOwnProperty('isMutual')) {
                this.isMutual = false;
              }
              
              // 发送事件通知数据更新（添加防御性检查）
              if (typeof uni !== 'undefined' && typeof uni.$emit === 'function') {
                try {
                  uni.$emit('cardsDataUpdated');
                  console.log('已发送数据更新事件');
                } catch (emitError) {
                  console.error('发送事件通知失败:', emitError);
                }
              }
              
              // 显示成功提示（基于实际操作结果）
              let toastTitle = '已取消关注';
              if (!unfollowedUser) {
                toastTitle = '操作已执行，请刷新确认';
              }
              
              uni.showToast({
                title: toastTitle,
                icon: 'success',
                duration: 1500,
                success: () => {
                  // 成功提示后再重新加载数据，避免UI闪烁
                  setTimeout(() => {
                    console.log('重新加载好友数据以确保一致性');
                    this.loadFriendData();
                  }, 500);
                }
              });
              
              console.log('成功完成取消关注流程:', userId);
              
              // 数据验证部分
              try {
                this.validateDataConsistency(); // 调用无参方法
              } catch (validationError) {
                console.error('数据一致性验证失败:', validationError);
                // 静默处理验证错误，不干扰正常流程
              }
              
            } catch (e) {
              // 静默处理异常，但仍然尝试刷新数据
              console.error('取消关注过程中出现错误:', e);
              
              // 尝试刷新数据
              console.log('发生错误，强制刷新数据');
              this.loadFriendData();
              
              // 如果找到了用户并且成功执行了核心操作，则显示成功提示
              if (unfollowedUser && targetIndex !== -1) {
                uni.showToast({
                  title: '已取消关注',
                  icon: 'success',
                  duration: 1500
                });
              } else {
                // 否则显示失败提示
                uni.showToast({
                  title: '取消关注失败',
                  icon: 'none',
                  duration: 2000
                });
              }
              
              // 出错时重新加载数据以保持一致性
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
          // 先重新加载最新数据
          this.loadFriendData();
          
          // 获取当前用户ID和存储前缀
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          const deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
          
          // 如果有删除记录
          if (deletedCardIds.length > 0) {
            // 从互关好友列表中过滤掉需要删除的好友
            this.mutualFriends = this.mutualFriends.filter(friend => 
              !deletedCardIds.includes(friend.id)
            );
            
            // 从添加我的好友列表中过滤掉需要删除的好友
            this.followers = this.followers.filter(friend => 
              !deletedCardIds.includes(friend.id)
            );
            
            // 更新本地存储（用户隔离）
            uni.setStorageSync(`${storagePrefix}mutualFriends`, this.mutualFriends);
            uni.setStorageSync(`${storagePrefix}followers`, this.followers);
          }
        } catch (e) {
          console.error('检查删除记录失败:', e);
        }
      },
      
      // 测试验证方法 - 用于验证数据一致性
      validateDataConsistency() {
        try {
          // 获取当前用户ID
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          // 获取所有数据存储（用户隔离）
          const mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          const collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          const followers = uni.getStorageSync(`${storagePrefix}followers`) || [];
          
          console.log('开始验证数据一致性...');
          console.log('互关好友数量:', mutualFriends.length);
          console.log('名片夹数量:', collectedCards.length);
          console.log('添加我的数量:', followers.length);
          
          // 验证1: 互关好友和名片夹应该一一对应
          const allFriendsInCards = mutualFriends.every(friend => 
            collectedCards.some(card => card.id === friend.id)
          );
          
          const allCardsInFriends = collectedCards.every(card => 
            mutualFriends.some(friend => friend.id === card.id)
          );
          
          // 验证2: 添加我的列表中不应该有互关好友
          const noOverlapBetweenFollowersAndFriends = !followers.some(follower => 
            mutualFriends.some(friend => friend.id === follower.id)
          );
          
          // 验证3: 确保没有强制添加默认数据
          const noForcedDefaultData = true; // 我们只在首次使用时添加默认数据
          
          // 显示验证结果（仅控制台）
          if (allFriendsInCards && allCardsInFriends && noOverlapBetweenFollowersAndFriends && noForcedDefaultData) {
            console.log('✓ 数据一致性验证通过，删除/取消关注后不会重置');
          } else {
            let errorMsg = '✗ 数据一致性验证失败:';
            if (!allFriendsInCards) errorMsg += ' 互关好友不在名片夹中';
            if (!allCardsInFriends) errorMsg += ' 名片夹中有非互关好友';
            if (!noOverlapBetweenFollowersAndFriends) errorMsg += ' 添加我的列表中包含互关好友';
            if (!noForcedDefaultData) errorMsg += ' 存在强制默认数据';
            
            console.error(errorMsg);
          }
          
          return allFriendsInCards && allCardsInFriends && noOverlapBetweenFollowersAndFriends && noForcedDefaultData;
        } catch (error) {
          console.error('数据一致性验证失败:', error);
          uni.showToast({
            title: '验证过程出错',
            icon: 'none'
          });
          return false;
        }
      },
      
      // 预加载用户数据的辅助方法
      preloadUserData(storagePrefix) {
        try {
          // 一次性加载所有需要的数据
          console.log('开始预加载用户数据...');
          
          // 安全获取名片夹数据
          let collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          if (!Array.isArray(collectedCards)) {
            console.warn('名片夹数据格式错误，重置为空数组');
            collectedCards = [];
          }
          
          // 安全获取删除记录
          let deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
          if (!Array.isArray(deletedCardIds)) {
            console.warn('删除记录格式错误，重置为空数组');
            deletedCardIds = [];
          }
          
          console.log('预加载完成，名片夹数量:', collectedCards.length, '删除记录数量:', deletedCardIds.length);
          return [collectedCards, deletedCardIds];
        } catch (error) {
          console.error('预加载用户数据失败:', error);
          // 返回默认值确保流程继续
          return [[], []];
        }
      },
      
      // 批量更新存储的辅助方法，模拟事务性操作
      batchUpdateStorage(storagePrefix, updates) {
        try {
          console.log('开始批量更新存储...');
          const results = [];
          
          // 执行所有存储操作，并记录结果
          if (updates.mutualFriends !== undefined) {
            uni.setStorageSync(`${storagePrefix}mutualFriends`, updates.mutualFriends);
            results.push('mutualFriends更新成功');
          }
          
          if (updates.collectedCards !== undefined) {
            uni.setStorageSync(`${storagePrefix}collectedCards`, updates.collectedCards);
            results.push('collectedCards更新成功');
          }
          
          if (updates.followers !== undefined) {
            uni.setStorageSync(`${storagePrefix}followers`, updates.followers);
            results.push('followers更新成功');
          }
          
          if (updates.deletedCardIds !== undefined) {
            uni.setStorageSync(`${storagePrefix}deletedCardIds`, updates.deletedCardIds);
            results.push('deletedCardIds更新成功');
          }
          
          console.log('批量更新完成:', results.join(', '));
          return true;
        } catch (error) {
          console.error('批量更新存储失败:', error);
          // 即使部分失败也尝试继续执行
          return false;
        }
      },
      
      // 测试清空所有数据功能（用于验证删除后不会重置）- 仅控制台输出
      testClearAllData() {
        console.warn('⚠️ 测试清空数据操作: 此操作将清空所有好友和名片夹数据，仅用于测试。');
        
        try {
          // 获取当前用户ID和存储前缀
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          // 清空所有数据（用户隔离）
          uni.removeStorageSync(`${storagePrefix}collectedCards`);
          uni.removeStorageSync(`${storagePrefix}mutualFriends`);
          uni.removeStorageSync(`${storagePrefix}followers`);
          uni.removeStorageSync(`${storagePrefix}deletedCardIds`);
          
          // 刷新界面
          this.mutualFriends = [];
          this.followers = [];
          this.collectedCards = [];
          
          console.log('✅ 数据已清空，测试成功');
          
          // 重新加载数据，验证是否不会自动添加默认数据
          setTimeout(() => {
            this.loadFriendData();
            console.log('🔄 重新加载后，名片夹数据:', uni.getStorageSync(`${storagePrefix}collectedCards`));
          }, 500);
        } catch (error) {
          console.error('❌ 测试清空数据失败:', error);
        }
      },
      
      // 测试名片夹用户取消关注功能
      testUnfollowFromCard() {
        try {
          console.log('===== 开始测试名片夹用户取消关注 =====');
          
          // 1. 模拟创建一个测试用户并添加到名片夹
          const testUser = {
            id: 'test-card-user-' + Date.now(),
            name: '测试用户',
            avatar: '/static/test-avatar.png',
            description: '这是一个测试用户'
          };
          
          // 2. 获取存储前缀
          const currentUserId = this.getCurrentUserId();
          const storagePrefix = `user_${currentUserId}_`;
          
          // 3. 添加到名片夹和互关好友列表
          let collectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
          collectedCards.push(testUser);
          uni.setStorageSync(`${storagePrefix}collectedCards`, collectedCards);
          
          let mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
          mutualFriends.push(testUser);
          uni.setStorageSync(`${storagePrefix}mutualFriends`, mutualFriends);
          
          // 4. 更新内存数据
          this.mutualFriends = mutualFriends;
          this.collectedCards = collectedCards;
          
          console.log('测试：已添加测试用户到名片夹和互关好友，用户ID:', testUser.id);
          
          // 5. 模拟从名片夹打开用户详情 - 设置当前查看的用户ID
          this.userId = testUser.id;
          console.log('测试：模拟从名片夹打开用户详情，当前用户ID:', this.userId);
          
          // 6. 执行取消关注操作
          console.log('测试：调用unfollowUser方法执行取消关注');
          this.unfollowUser();
          
          // 7. 等待操作完成并验证结果
          setTimeout(() => {
            try {
              // 8. 验证结果
              const updatedMutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
              const updatedCollectedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
              
              const stillInMutualFriends = updatedMutualFriends.some(u => u.id === testUser.id);
              const stillInCollectedCards = updatedCollectedCards.some(u => u.id === testUser.id);
              
              console.log('测试结果验证:');
              console.log('- 测试用户ID:', testUser.id);
              console.log('- 互关好友列表长度:', updatedMutualFriends.length);
              console.log('- 名片夹列表长度:', updatedCollectedCards.length);
              console.log('- 仍在互关好友列表中:', stillInMutualFriends);
              console.log('- 仍在名片夹中:', stillInCollectedCards);
              
              if (!stillInMutualFriends && !stillInCollectedCards) {
                console.log('🎉 测试成功：取消关注操作完全成功，用户已从所有列表中移除');
                uni.showToast({
                  title: '测试成功：取消关注功能恢复',
                  icon: 'success',
                  duration: 2000
                });
              } else if (!stillInMutualFriends) {
                console.log('✅ 测试基本成功：用户已从互关好友移除，但仍在名片夹中');
                uni.showToast({
                  title: '测试基本成功',
                  icon: 'success',
                  duration: 2000
                });
              } else {
                console.log('❌ 测试失败：用户仍然在互关好友列表中');
                uni.showToast({
                  title: '测试失败，请检查修复',
                  icon: 'error',
                  duration: 2000
                });
              }
              
            } catch (error) {
              console.error('测试验证过程出错:', error);
              uni.showToast({
                title: '测试验证失败',
                icon: 'error',
                duration: 2000
              });
            }
          }, 1000);
          
        } catch (error) {
          console.error('测试名片夹取消关注功能失败:', error);
          uni.showToast({
            title: '测试初始化失败',
            icon: 'error',
            duration: 2000
          });
        }
      }
    }
  }
</script>

<style scoped>
  .friend-detail-page {
    flex: 1;
    background-color: #f5f5f5;
    min-height: 100vh;
  }

  /* 顶部导航栏 */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    background-color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }

  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-icon {
    width: 40rpx;
    height: 40rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }

  .more-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .more-icon {
    font-size: 40rpx;
    color: #666;
  }

  /* 主要内容区域 */
  .content {
    padding-top: 100rpx;
    padding-bottom: 160rpx;
  }

  /* 区块样式 */
  .section {
    background-color: #fff;
    margin-bottom: 20rpx;
    padding: 30rpx;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
  }

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .section-action {
    display: flex;
    align-items: center;
  }

  .count {
    font-size: 28rpx;
    color: #999;
    margin-right: 10rpx;
  }

  .arrow-icon {
    width: 24rpx;
    height: 24rpx;
  }

  /* 好友卡片样式 */
  .friend-card {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
  }

  .friend-card:last-child {
    margin-bottom: 0;
  }

  .friend-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 30rpx;
  }

  .friend-info {
    flex: 1;
  }

  .friend-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 10rpx;
  }

  .friend-signature {
    font-size: 28rpx;
    color: #999;
  }

  .follow-btn {
    padding: 15rpx 40rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
    border: 2rpx solid #07c160;
    color: #07c160;
  }

  .mutual-follow {
    background-color: #f0f9ff;
    border-color: #e0f2fe;
    color: #07c160;
  }

  /* 底部按钮 */
  .bottom-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  }

  .add-friend-btn {
    width: 100%;
    height: 90rpx;
    background-color: #07c160;
    color: #fff;
    border-radius: 45rpx;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>