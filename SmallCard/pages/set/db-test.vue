<template>
  <view class="container">
    <view class="header">
      <text class="title">数据库功能测试</text>
    </view>
    
    <view class="content">
      <view class="info-section">
        <text class="info-text">此页面用于测试数据库连接和用户数据存储功能</text>
      </view>
      
      <view class="test-actions">
        <button class="test-btn primary" @click="runAllTests">运行所有测试</button>
        <button class="test-btn" @click="testConnection">仅测试连接</button>
        <button class="test-btn" @click="testUserSync">测试用户同步</button>
      </view>
      
      <view class="test-results">
        <text class="section-title">测试结果</text>
        <scroll-view class="results-scroll" scroll-y="true">
          <view v-if="testResults.length === 0" class="no-results">
            <text>尚未运行测试</text>
          </view>
          <view v-for="(result, index) in testResults" :key="index" 
                :class="['result-item', result.success ? 'success' : 'error']">
            <text class="result-name">{{ result.name }}</text>
            <text class="result-status">{{ result.success ? '✅ 通过' : '❌ 失败' }}</text>
            <text v-if="result.message" class="result-message">{{ result.message }}</text>
          </view>
        </scroll-view>
      </view>
      
      <view class="test-summary" v-if="testSummary">
        <text class="summary-text">{{ testSummary }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import dbTest from '../../utils/dbTest.js';
import db from '../../utils/db.js';
import userService from '../../utils/userService.js';

export default {
  data() {
    return {
      testResults: [],
      testSummary: '',
      isTesting: false
    };
  },
  onLoad() {
    console.log('数据库测试页面已加载');
  },
  methods: {
    // 运行所有测试
    async runAllTests() {
      if (this.isTesting) return;
      
      this.isTesting = true;
      this.testResults = [];
      this.testSummary = '';
      
      try {
        console.log('开始运行所有数据库测试...');
        
        // 清空之前的测试结果
        this.testResults = [];
        
        // 测试数据库连接
        const connectionResult = await this.testDbConnectionInternal();
        this.testResults.push(connectionResult);
        
        // 测试用户数据同步
        const syncResult = await this.testUserSyncInternal();
        this.testResults.push(syncResult);
        
        // 测试插入用户
        const insertResult = await this.testInsertUserInternal();
        this.testResults.push(insertResult);
        
        // 计算测试通过率
        const passedCount = this.testResults.filter(r => r.success).length;
        const totalCount = this.testResults.length;
        
        this.testSummary = `测试完成: ${passedCount}/${totalCount} 通过`;
        
        // 显示测试结果提示
        if (passedCount === totalCount) {
          uni.showToast({
            title: '所有测试通过！',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: `测试失败: ${totalCount - passedCount} 个测试未通过`,
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('测试运行失败:', error);
        this.testResults.push({
          name: '测试运行',
          success: false,
          message: error.message
        });
        this.testSummary = '测试过程中发生错误';
      } finally {
        this.isTesting = false;
      }
    },
    
    // 仅测试数据库连接
    async testConnection() {
      if (this.isTesting) return;
      
      this.isTesting = true;
      
      try {
        const result = await this.testDbConnectionInternal();
        this.testResults.unshift(result); // 添加到结果列表开头
        
        if (result.success) {
          uni.showToast({
            title: '数据库连接测试通过！',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '数据库连接测试失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('连接测试失败:', error);
        this.testResults.unshift({
          name: '数据库连接',
          success: false,
          message: error.message
        });
      } finally {
        this.isTesting = false;
      }
    },
    
    // 测试用户同步
    async testUserSync() {
      if (this.isTesting) return;
      
      this.isTesting = true;
      
      try {
        const result = await this.testUserSyncInternal();
        this.testResults.unshift(result);
        
        if (result.success) {
          uni.showToast({
            title: '用户同步测试通过！',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '用户同步测试失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('用户同步测试失败:', error);
        this.testResults.unshift({
          name: '用户数据同步',
          success: false,
          message: error.message
        });
      } finally {
        this.isTesting = false;
      }
    },
    
    // 内部方法：测试数据库连接
    async testDbConnectionInternal() {
      try {
        console.log('测试数据库连接...');
        const result = await db.connect();
        return {
          name: '数据库连接',
          success: result.success,
          message: result.message || (result.success ? '连接成功' : '连接失败')
        };
      } catch (error) {
        return {
          name: '数据库连接',
          success: false,
          message: error.message
        };
      }
    },
    
    // 内部方法：测试用户同步
    async testUserSyncInternal() {
      try {
        console.log('测试用户数据同步...');
        
        // 创建测试用户数据
        const testUser = {
          openid: 'test_openid_' + Date.now(),
          nickname: '测试用户',
          avatarUrl: 'https://example.com/avatar.jpg',
          phone: '13800138000'
        };
        
        // 保存到本地存储
        uni.setStorageSync('userInfo', JSON.stringify(testUser));
        uni.removeStorageSync('isGuest');
        
        // 调用同步方法
        const result = await userService.syncLocalUserToDatabase();
        
        return {
          name: '用户数据同步',
          success: result.success,
          message: result.message || (result.success ? '同步成功' : '同步失败')
        };
      } catch (error) {
        return {
          name: '用户数据同步',
          success: false,
          message: error.message
        };
      }
    },
    
    // 内部方法：测试插入用户
    async testInsertUserInternal() {
      try {
        console.log('测试插入用户...');
        
        const userData = {
          openid: 'test_insert_openid_' + Date.now(),
          nickname: '插入测试用户',
          avatarUrl: 'https://example.com/insert_avatar.jpg',
          phone: '13900139000'
        };
        
        const result = await userService.createUser(userData);
        
        return {
          name: '插入用户',
          success: result.success,
          message: result.message || (result.success ? '插入成功' : '插入失败')
        };
      } catch (error) {
        return {
          name: '插入用户',
          success: false,
          message: error.message
        };
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30rpx;
  padding: 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.content {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
}

.info-section {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f0f7ff;
  border-radius: 8rpx;
}

.info-text {
  font-size: 32rpx;
  color: #666;
  line-height: 1.5;
}

.test-actions {
  margin-bottom: 30rpx;
}

.test-btn {
  margin-bottom: 20rpx;
  font-size: 34rpx;
  line-height: 80rpx;
}

.test-btn.primary {
  background-color: #007aff;
  color: #fff;
}

.test-results {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.results-scroll {
  height: 400rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
}

.no-results {
  text-align: center;
  color: #999;
  padding: 40rpx 0;
}

.result-item {
  margin-bottom: 20rpx;
  padding: 20rpx;
  border-radius: 8rpx;
  background-color: #fff;
  border-left: 6rpx solid #007aff;
}

.result-item.success {
  border-left-color: #4cd964;
}

.result-item.error {
  border-left-color: #ff3b30;
}

.result-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.result-status {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.result-message {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-top: 10rpx;
  word-break: break-all;
}

.test-summary {
  padding: 20rpx;
  background-color: #f0f7ff;
  border-radius: 8rpx;
  text-align: center;
}

.summary-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #007aff;
}
</style>