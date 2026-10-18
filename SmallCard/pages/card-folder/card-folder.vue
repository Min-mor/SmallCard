<template>
  <view class="card-folder-page">
    <view class="header"></view>
    <view class="card-list">
      <view class="card-item" v-for="(card, index) in collectedCards" :key="card.id" @click="goToCardDetail(card.id)">
        <image :src="card.avatar || '/static/icon/我的.png'" class="card-avatar" mode="cover"></image>
        <text class="card-name">{{ card.name }}</text>
        <text class="card-tag">{{ card.signature }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      collectedCards: []
    }
  },
  onLoad() {
    // 页面加载时从本地存储获取名片数据
    this.loadCollectedCards();
    
    // 监听数据更新事件
    this.setupEventListeners();
  },
  onUnload() {
    // 移除事件监听，避免内存泄漏
    this.removeEventListeners();
  },
  onShow() {
    // 组件每次显示时检查是否有待删除的名片
    this.checkAndRemoveDeletedCards();
  },
  methods: {
    // 获取当前用户ID，与social/index.vue保持一致
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
    
    // 获取存储前缀
    getStoragePrefix() {
      const currentUserId = this.getCurrentUserId();
      return `user_${currentUserId}_`;
    },
    
    // 设置事件监听器
    setupEventListeners() {
      // 监听好友数据更新事件
      uni.$on('friendsDataUpdated', this.handleFriendsDataUpdate);
      // 监听存储变化
      this.listenToStorageChanges();
    },
    
    // 移除事件监听器
    removeEventListeners() {
      uni.$off('friendsDataUpdated', this.handleFriendsDataUpdate);
      // 清除定时器
      if (this.storageCheckTimer) {
        clearInterval(this.storageCheckTimer);
      }
    },
    
    // 处理好友数据更新
    handleFriendsDataUpdate() {
      console.log('名片夹收到好友数据更新通知');
      this.loadCollectedCards();
    },
    
    // 监听存储变化（简单实现）
    listenToStorageChanges() {
      // 这里使用定时器轮询检查，实际应用中可以使用更高级的方案
      this.storageCheckTimer = setInterval(() => {
        this.checkStorageChanges();
      }, 5000); // 每5秒检查一次
    },
    
    // 检查存储变化
    checkStorageChanges() {
      try {
        const storagePrefix = this.getStoragePrefix();
        const latestCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        if (latestCards.length !== this.collectedCards.length) {
          this.loadCollectedCards();
        }
      } catch (e) {
        console.error('检查存储变化失败:', e);
      }
    },
    
    // 加载名片夹数据
    loadCollectedCards() {
      try {
        const storagePrefix = this.getStoragePrefix();
        // 从本地存储获取名片数据
        let storedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        // 如果名片夹为空，添加一些默认的模拟名片数据
        if (!storedCards || storedCards.length === 0) {
          console.log('名片夹为空，添加默认模拟数据');
          // 默认模拟名片数据
          const mockCards = [
            {
              id: 'mock_friend_1',
              name: '张三',
              avatar: '/static/photo/张三.jpg',
              signature: '热爱生活，分享快乐',
              desc: '前端开发工程师'
            },
            {
              id: 'mock_friend_2', 
              name: '李四',
              avatar: '/static/photo/李四.jpg',
              signature: '科技改变世界',
              desc: '后端开发工程师'
            },
            {
              id: 'mock_friend_3',
              name: '王五',
              avatar: '/static/photo/王五.jpg',
              signature: '设计让生活更美好',
              desc: 'UI设计师'
            },
            {
              id: 'mock_friend_4',
              name: '赵六',
              avatar: '/static/photo/赵六.jpg',
              signature: '摄影记录美好瞬间',
              desc: '摄影师'
            }
          ];
          
          // 将模拟数据保存到本地存储
          uni.setStorageSync(`${storagePrefix}collectedCards`, mockCards);
          storedCards = mockCards;
          console.log('已添加默认模拟名片数据');
        }
        
        this.collectedCards = storedCards;
        
        // 验证数据一致性
        this.validateDataConsistency();
      } catch (e) {
        console.error('加载名片夹数据失败:', e);
        // 出错时使用空数组
        this.collectedCards = [];
      }
    },
    
    // 验证数据一致性，确保与好友列表数量一致
    validateDataConsistency() {
      try {
        const storagePrefix = this.getStoragePrefix();
        const storedCards = uni.getStorageSync(`${storagePrefix}collectedCards`) || [];
        
        console.log('名片夹数据一致性验证:');
        console.log('- 当前名片夹长度:', this.collectedCards.length);
        console.log('- 存储中的名片夹长度:', storedCards.length);
        
        // 如果内存中的数据与存储中的数据不一致，重新加载
        if (this.collectedCards.length !== storedCards.length) {
          console.warn('发现数据不一致，正在重新同步名片夹...');
          this.collectedCards = storedCards;
          // 通知社交页面更新
          uni.$emit('friendsDataUpdated');
        }
      } catch (e) {
        console.error('验证数据一致性失败:', e);
      }
    },
    
    // 检查并移除已删除的名片
    checkAndRemoveDeletedCards() {
      try {
        // 先重新加载最新数据
        this.loadCollectedCards();
        
        const storagePrefix = this.getStoragePrefix();
        const deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        
        // 如果有删除记录
        if (deletedCardIds.length > 0) {
          // 过滤掉需要删除的名片
          this.collectedCards = this.collectedCards.filter(card => 
            !deletedCardIds.includes(card.id)
          );
          
          // 更新本地存储
          uni.setStorageSync(`${storagePrefix}collectedCards`, this.collectedCards);
          
          // 清除已处理的删除记录
          uni.removeStorageSync(`${storagePrefix}deletedCardIds`);
        }
      } catch (e) {
        console.error('检查删除记录失败:', e);
      }
    },
    goToCardDetail(cardId) {
      // 跳转到名片详情页，并传递名片ID
      uni.navigateTo({
        url: '/pages/card-detail/card-detail?id=' + cardId
      });
    },
    // 从列表中删除名片
    deleteCardFromList(cardId) {
      const storagePrefix = this.getStoragePrefix();
      // 在collectedCards数组中查找并删除对应ID的名片
      const cardIndex = this.collectedCards.findIndex(c => c.id === cardId);
      if (cardIndex > -1) {
        this.collectedCards.splice(cardIndex, 1);
        // 更新本地存储
        uni.setStorageSync(`${storagePrefix}collectedCards`, this.collectedCards);
        
        // 同步更新互关好友列表
        const mutualFriends = uni.getStorageSync(`${storagePrefix}mutualFriends`) || [];
        const updatedMutualFriends = mutualFriends.filter(friend => friend.id !== cardId);
        uni.setStorageSync(`${storagePrefix}mutualFriends`, updatedMutualFriends);
        
        // 同步更新删除记录，供其他页面使用
        let deletedCardIds = uni.getStorageSync(`${storagePrefix}deletedCardIds`) || [];
        if (!deletedCardIds.includes(cardId)) {
          deletedCardIds.push(cardId);
          uni.setStorageSync(`${storagePrefix}deletedCardIds`, deletedCardIds);
        }
        
        console.log('已从名片夹删除好友，当前名片数量:', this.collectedCards.length);
        // 发送事件通知社交页面数据已更新
        uni.$emit('friendsDataUpdated');
      }
    },
    
    // 添加名片到名片夹（供其他页面调用）
    addCardToFolder(cardData) {
      try {
        const storagePrefix = this.getStoragePrefix();
        
        // 检查是否已存在相同ID的名片
        const existingIndex = this.collectedCards.findIndex(card => card.id === cardData.id);
        
        if (existingIndex === -1) {
          // 确保名片数据包含必要字段
          const newCard = {
            id: cardData.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: cardData.name || '未知用户',
            avatar: cardData.avatar || cardData.avatarUrl || '/static/icon/我的.png',
            signature: cardData.signature || '',
            desc: cardData.desc || ''
          };
          
          // 添加到名片夹
          this.collectedCards.push(newCard);
          
          // 更新本地存储
          uni.setStorageSync(`${storagePrefix}collectedCards`, this.collectedCards);
          
          console.log('已添加新名片到名片夹，当前名片数量:', this.collectedCards.length);
          // 发送事件通知社交页面数据已更新
          uni.$emit('friendsDataUpdated');
          
          return true;
        } else {
          console.log('名片已存在于名片夹中');
          return false;
        }
      } catch (e) {
        console.error('添加名片到名片夹失败:', e);
        return false;
      }
    }
  }
}
</script>

<style scoped>
.card-folder-page {
  background-image: url('/static/image/背景.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 30rpx 20rpx;
  box-sizing: border-box;
}

.header {
  height: 20rpx;
  margin-bottom: 20rpx;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 10rpx;
}

.card-item {
  width: 47%;
  margin-bottom: 30rpx;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  min-height: 240rpx;
  justify-content: center;
  box-sizing: border-box;
}

.card-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  background-color: #E0E0E0;
}

.card-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
  color: #333;
  text-align: center;
}

.card-tag {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  line-height: 1.5;
  padding: 0 10rpx;
}
</style>