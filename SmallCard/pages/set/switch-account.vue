<template>
  <view class="switch-account-container">
    <view class="content">
      <view class="other-accounts">
        <text class="subtitle">历史账号</text>
        <view v-if="historyAccounts.length > 0" class="account-list">
          <view v-for="(account, index) in historyAccounts" :key="index" class="account-item">
            <view class="account-info" @click="selectAccount(account)">
              <image class="account-avatar" :src="(account.avatar || account.avatarUrl) || '/static/icon/我的.png'" mode="aspectFit"></image>
              <view class="account-details">
                <text class="account-name">{{ account.username || account.nickname || '未知用户' }}</text>
                <text class="account-id">账号ID: {{ account.userId || 'N/A' }}</text>
              </view>
            </view>
            <view class="account-actions">
              <text class="delete-btn" @click.stop="deleteAccount(index)">删除</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-tip">
          <text>暂无历史账号</text>
        </view>
      </view>
      
      <view class="login-btn" @click="gotoLogin">
        <text>使用新账号登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      historyAccounts: [] // 历史账号列表
    };
  },
  onLoad() {
    // 页面加载时读取历史账号
    this.loadHistoryAccounts();
  },
  methods: {
    // 加载历史账号
    loadHistoryAccounts() {
      try {
        const storedAccounts = uni.getStorageSync('historyAccounts');
        if (storedAccounts) {
          this.historyAccounts = typeof storedAccounts === 'string' ? JSON.parse(storedAccounts) : storedAccounts;
          if (!Array.isArray(this.historyAccounts)) {
            this.historyAccounts = [];
          }
        }
        
        // 为了测试方便，如果没有历史账号，添加一些模拟数据
        if (this.historyAccounts.length === 0) {
          this.addMockAccountsForTest();
        }
      } catch (error) {
        console.error('加载历史账号失败:', error);
        this.historyAccounts = [];
        // 出错时也添加一些模拟数据用于演示
        this.addMockAccountsForTest();
      }
    },
    
    // 添加模拟账号数据用于测试
    addMockAccountsForTest() {
      // 生成唯一的模拟账号数据，避免用户名冲突
      const timestamp = Date.now();
      this.historyAccounts = [
        {
          userId: `user_001_${timestamp}`,
          username: `吉梨_${timestamp}`,
          nickname: `吉梨_${timestamp}`,
          // 统一使用avatarUrl字段，同时保留avatar字段以便兼容旧数据
          avatar: '/static/icon/我的.png',
          avatarUrl: '/static/icon/我的.png',
          lastLoginTime: new Date(Date.now() - 86400000).toISOString()
        },
        {
          userId: `user_002_${timestamp}`,
          username: `张三_${timestamp}`,
          nickname: `张三_${timestamp}`,
          // 统一使用avatarUrl字段，同时保留avatar字段以便兼容旧数据
          avatar: '/static/photo/张三.jpg',
          avatarUrl: '/static/photo/张三.jpg',
          lastLoginTime: new Date(Date.now() - 172800000).toISOString()
        },
        {
          userId: `user_003_${timestamp}`,
          username: `李四_${timestamp}`,
          nickname: `李四_${timestamp}`,
          // 统一使用avatarUrl字段，同时保留avatar字段以便兼容旧数据
          avatar: '/static/photo/李四.jpg',
          avatarUrl: '/static/photo/李四.jpg',
          lastLoginTime: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      console.log('添加模拟账号数据用于测试');
    },
    
    // 删除历史账号
    deleteAccount(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个历史账号吗？',
        success: (res) => {
          if (res.confirm) {
            this.historyAccounts.splice(index, 1);
            this.saveHistoryAccounts();
            uni.showToast({ title: '删除成功', icon: 'success' });
          }
        }
      });
    },
    
    // 保存历史账号到本地存储
    saveHistoryAccounts() {
      try {
        // 在保存前进行用户名唯一性检查和清理
        const cleanedAccounts = this.ensureUsernameUniqueness(this.historyAccounts);
        uni.setStorageSync('historyAccounts', JSON.stringify(cleanedAccounts));
        // 更新本地历史账号列表
        this.historyAccounts = cleanedAccounts;
      } catch (error) {
        console.error('保存历史账号失败:', error);
      }
    },
    
    // 确保历史账号列表中的用户名唯一性
    ensureUsernameUniqueness(accounts) {
      const usernameMap = new Map();
      const result = [];
      
      // 按最后登录时间排序，优先保留最近登录的账号使用原始用户名
      const sortedAccounts = [...accounts].sort((a, b) => {
        const timeA = new Date(a.lastLoginTime || 0).getTime();
        const timeB = new Date(b.lastLoginTime || 0).getTime();
        return timeB - timeA; // 降序排序，最新的在前
      });
      
      sortedAccounts.forEach(account => {
        const originalUsername = account.username || account.nickname || '未知用户';
        
        if (!usernameMap.has(originalUsername)) {
          // 原始用户名可用，直接使用
          usernameMap.set(originalUsername, true);
          result.push(account);
        } else {
          // 用户名已存在，添加用户ID后缀确保唯一性
          const uniqueUsername = `${originalUsername}_${account.userId.substring(0, 4)}`;
          const updatedAccount = {
            ...account,
            username: uniqueUsername,
            nickname: uniqueUsername
          };
          usernameMap.set(uniqueUsername, true);
          result.push(updatedAccount);
        }
      });
      
      return result;
    },
    
    // 选择历史账号登录 - 直接点击登录，不再弹出确认框
    selectAccount(account) {
      // 直接调用切换账号方法，实现点击即登录
      this.switchToAccount(account);
    },
    
    // 切换到选中的账号
    switchToAccount(account) {
      try {
        // 验证用户名唯一性，防止切换到与其他账号重名的账号
        let currentUserInfo = {};
        const storedUserInfo = uni.getStorageSync('userInfo');
        if (storedUserInfo) {
          // 确保storedUserInfo是字符串才进行解析
          currentUserInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
        }
        
        // 如果切换到不同账号，检查用户名是否与其他账号冲突
        if (currentUserInfo.id && currentUserInfo.id !== account.userId) {
          // 读取所有历史账号
          const allAccounts = uni.getStorageSync('historyAccounts');
          if (allAccounts) {
            // 确保allAccounts是字符串才进行解析
            const historyAccounts = typeof allAccounts === 'string' ? JSON.parse(allAccounts) : allAccounts;
            if (Array.isArray(historyAccounts)) {
              // 检查是否存在相同用户名但不同用户ID的账号
              const conflictingAccounts = historyAccounts.filter(acc => 
                acc.username === account.username && 
                acc.userId !== account.userId
              );
              
              if (conflictingAccounts.length > 0) {
                console.warn('发现用户名冲突:', account.username, conflictingAccounts);
                // 为避免冲突，可以考虑为账号添加标识
                account.username = `${account.username}_${account.userId.substring(0, 4)}`;
                account.nickname = account.username;
              }
            }
          }
        }
        
        // 创建完整的用户信息对象
        const userInfo = {
          id: account.userId,
          userName: account.username,
          nickname: account.nickname,
          // 优先使用avatarUrl，若不存在则使用avatar字段，确保头像正确显示
          avatarUrl: account.avatarUrl || account.avatar,
          // 同时保留avatar字段以兼容旧代码
          avatar: account.avatar || account.avatarUrl,
          isGuest: false,
          lastLoginTime: new Date().toISOString()
        };
        
        // 清除旧的登录状态
        uni.removeStorageSync('isGuest');
        
        // 保存用户信息到本地存储
        try {
          uni.setStorageSync('userInfo', JSON.stringify(userInfo));
        } catch (error) {
          console.error('保存用户信息失败:', error);
          // 为了安全起见，如果JSON序列化失败，尝试简化用户对象后再保存
          const simplifiedUserInfo = {
            id: account.userId,
            userName: account.username,
            nickname: account.nickname
          };
          uni.setStorageSync('userInfo', JSON.stringify(simplifiedUserInfo));
        }
        
        // 更新全局应用状态
        const app = getApp();
        if (app && app.globalData) {
          if (app.globalData.userStatus) {
            app.globalData.userStatus.isLoggedIn = true;
            app.globalData.userStatus.isGuest = false;
            app.globalData.userStatus.userInfo = userInfo;
          } else {
            app.globalData.userStatus = {
              isLoggedIn: true,
              isGuest: false,
              userInfo: userInfo
            };
          }
          
          // 导入用户服务并同步用户数据到数据库
          if (app.syncUserToDatabase) {
            app.syncUserToDatabase();
          }
        }
        
        // 更新历史记录中的最后登录时间
        const index = this.historyAccounts.findIndex(acc => acc.userId === account.userId);
        if (index !== -1) {
          this.historyAccounts[index].lastLoginTime = userInfo.lastLoginTime;
          this.historyAccounts[index].username = userInfo.userName; // 更新用户名以确保一致性
          this.historyAccounts[index].nickname = userInfo.userName;
          // 将登录的账号移到列表顶部
          const loggedAccount = this.historyAccounts.splice(index, 1)[0];
          this.historyAccounts.unshift(loggedAccount);
          this.saveHistoryAccounts();
        }
        
        console.log('切换账号成功:', userInfo);
        
        // 强制使用reLaunch确保页面栈干净
        uni.reLaunch({
          url: '/pages/index/index',
          success: () => {
            uni.showToast({
              title: '账号切换成功',
              icon: 'success'
            });
          },
          fail: (err) => {
            console.error('切换账号后跳转失败:', err);
            uni.showToast({
              title: '跳转失败，请重试',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('切换账号失败:', error);
        uni.showToast({
          title: '账号切换失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 去登录新账号
    gotoLogin() {
      // 清除当前登录状态并跳转到登录页
      uni.removeStorageSync('userToken');
      uni.removeStorageSync('userInfo');
      
      uni.reLaunch({ 
        url: '/pages/index/cover',
        success: () => {
          uni.showToast({ 
            title: '请选择账号登录', 
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.switch-account-container {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 0 15px;
  overflow-y: auto;
}

.other-accounts {
  padding: 20px 0;
}

.subtitle {
  font-size: 14px;
  color: #999999;
  margin-bottom: 15px;
  display: block;
}

.empty-tip {
  padding: 40px 0;
  text-align: center;
  color: #999999;
}

.login-btn {
  margin-top: 30px;
  background-color: #007aff;
  color: #ffffff;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

.login-btn:active {
  background-color: #0066cc;
}

/* 账号列表样式 */
.account-list {
  margin-bottom: 20px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.account-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.account-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15px;
}

.account-details {
  flex: 1;
}

.account-name {
  font-size: 16px;
  color: #333333;
  display: block;
  margin-bottom: 4px;
}

.account-id {
  font-size: 12px;
  color: #999999;
  display: block;
}

.account-actions {
  margin-left: 15px;
}

.delete-btn {
  font-size: 14px;
  color: #ff3b30;
  padding: 5px 10px;
}
</style>