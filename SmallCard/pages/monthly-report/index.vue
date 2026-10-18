<template>
  <view class="monthly-report">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-button" @click="goBack">
        <text class="back-arrow">←</text>
      </view>
      <view class="header-title">个人月度报告</view>
      <view class="placeholder"></view>
    </view>
    
    <!-- 报告主体内容 -->
    <view class="report-content">
      <!-- 月度概览卡片 -->
      <view class="overview-card">
        <view class="overview-header">
          <text class="overview-title">{{ currentMonth }}月报告</text>
          <text class="report-date">{{ reportDate }}</text>
        </view>
        
        <!-- 统计数据概览 -->
        <view class="stats-overview">
          <view class="stat-item">
            <view class="stat-number">{{ stats.postViews }}</view>
            <view class="stat-label">帖子浏览</view>
          </view>
          <view class="stat-item">
            <view class="stat-number">{{ stats.postLikes }}</view>
            <view class="stat-label">点赞数</view>
          </view>
          <view class="stat-item">
            <view class="stat-number">{{ stats.friendCount }}</view>
            <view class="stat-label">好友数</view>
          </view>
        </view>
      </view>
      
      <!-- 详细统计信息 -->
      <view class="detail-section">
        <view class="section-title">详细统计</view>
        
        <view class="detail-card">
          <view class="detail-item">
            <view class="detail-label">查看过的帖子数</view>
            <view class="detail-value">{{ stats.postViews }}</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">点赞过的帖子数</view>
            <view class="detail-value">{{ stats.postLikes }}</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">交到的好友数</view>
            <view class="detail-value">{{ stats.friendCount }}</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">评论过的帖子数</view>
            <view class="detail-value">{{ stats.commentCount }}</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">浏览时长(分钟)</view>
            <view class="detail-value">{{ stats.browseTime }}</view>
          </view>
        </view>
      </view>
      
      <!-- 互动排行榜 -->
      <view class="ranking-section" v-if="interactionRanking.length > 0">
        <view class="section-title">互动排行榜</view>
        <view class="ranking-card">
          <view class="ranking-item" v-for="(item, index) in interactionRanking" :key="index">
            <view class="ranking-number">{{ index + 1 }}</view>
            <image :src="item.avatar" class="ranking-avatar" mode="aspectFill"></image>
            <view class="ranking-info">
              <view class="ranking-name">{{ item.name }}</view>
              <view class="ranking-desc">{{ item.desc }}</view>
            </view>
            <view class="ranking-interact">
              <text class="ranking-count">{{ item.interactCount }}次互动</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 月度总结 -->
      <view class="summary-section">
        <view class="section-title">月度总结</view>
        <view class="summary-card">
          <text class="summary-text">{{ monthlySummary }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
  data() {
    return {
      stats: {
        postViews: 0,
        postLikes: 0,
        friendCount: 0,
        commentCount: 0,
        browseTime: 0
      },
      interactionRanking: [],
      monthlySummary: '',
      currentMonth: new Date().getMonth() + 1,
      reportDate: '',
      // 添加全局应用实例引用
      app: null,
      isLoggedIn: false,
      isGuest: false
    };
    },
    onLoad() {
    // 获取全局应用实例
    this.app = getApp();
    
    // 设置用户状态，允许游客直接查看月度报告
    if (this.app.globalData && this.app.globalData.userStatus) {
      this.isLoggedIn = this.app.globalData.userStatus.isLoggedIn || false;
      this.isGuest = this.app.globalData.userStatus.isGuest || false;
    } else {
      this.isLoggedIn = false;
      this.isGuest = false;
    }
    // 初始化报告数据
    this.initReportData();
    },
    methods: {
      // 返回上一页
      goBack() {
        uni.navigateBack();
      },
      
      // 初始化报告数据
      initReportData() {
        // 设置报告日期
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        this.currentMonth = month;
        this.reportDate = `${year}年${month}月1日 - ${year}年${month}月${this.getDaysInMonth(year, month)}日`;
        
        // 从全局应用实例获取统计数据
        this.loadGlobalStatsData();
        
        // 生成月度总结
        this.generateSummary();
      },
      
      // 获取指定月份的天数
      getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
      },
      
      // 从全局应用实例加载统计数据
      loadGlobalStatsData() {
        try {
          // 获取全局应用实例
          const app = getApp();
          
          // 获取月度统计数据
          const monthlyStats = app.getMonthlyStats();
          
          // 如果有真实数据则使用，否则使用模拟数据
          this.stats = {
            postViews: monthlyStats.postViews > 0 ? monthlyStats.postViews : 42,
            postLikes: monthlyStats.postLikes > 0 ? monthlyStats.postLikes : 18,
            friendCount: monthlyStats.friendCount > 0 ? monthlyStats.friendCount : 11,
            commentCount: monthlyStats.commentCount > 0 ? monthlyStats.commentCount : 6,
            browseTime: monthlyStats.browseTime > 0 ? monthlyStats.browseTime : 345
          };
          
          // 生成互动排行榜模拟数据
          this.generateRankingData();
        } catch (error) {
          console.error('加载全局统计数据失败:', error);
          // 使用默认模拟数据
          this.stats = {
            postViews: 42,
            postLikes: 18,
            friendCount: 11,
            commentCount: 6,
            browseTime: 345
          };
          this.generateRankingData();
        }
      },
      
      // 生成互动排行榜数据
      generateRankingData() {
        // 从社交页面好友列表中获取数据，或者使用模拟数据
        const friends = [
          { name: '李四', avatar: '/static/photo/李四.jpg', desc: '前端工程师', interactCount: 12 },
          { name: '张三', avatar: '/static/photo/张三.jpg', desc: '旅行博主', interactCount: 10 },
          { name: '王五', avatar: '/static/photo/王五.jpg', desc: '摄影师', interactCount: 8 },
          { name: '赵六', avatar: '/static/photo/赵六.jpg', desc: 'UI设计师', interactCount: 6 },
          { name: '陈七', avatar: '/static/photo/陈七.jpg', desc: '数据分析师', interactCount: 5 }
        ];
        
        this.interactionRanking = friends.sort((a, b) => b.interactCount - a.interactCount);
      },
      
      // 生成月度总结
      generateSummary() {
        const { postViews, postLikes, friendCount, commentCount } = this.stats;
        
        let summary = `${this.currentMonth}月，你在社区中表现活跃！`;
        
        if (postViews > 50) {
          summary += ` 你浏览了${postViews}篇精彩帖子，知识量up！`;
        } else if (postViews > 20) {
          summary += ` 你浏览了${postViews}篇帖子，继续保持！`;
        }
        
        if (postLikes > 20) {
          summary += ` 你为${postLikes}位创作者点赞，传递了不少正能量！`;
        }
        
        if (friendCount > 10) {
          summary += ` 你目前有${friendCount}位好友，社交圈很活跃哦！`;
        }
        
        if (commentCount > 10) {
          summary += ` 你发表了${commentCount}条评论，积极参与社区讨论！`;
        }
        
        summary += ` 期待你下个月有更精彩的表现！`;
        
        this.monthlySummary = summary;
      }
    }
  };
</script>

<style scoped>
  .monthly-report {
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  /* 顶部导航栏 */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    background-color: #fff;
    padding: 0 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
  
  .back-button {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-arrow {
    font-size: 40rpx;
    color: #333;
  }
  
  .header-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
  
  .placeholder {
    width: 40rpx;
  }
  
  /* 报告内容区域 */
  .report-content {
    padding-top: 108rpx;
    padding-bottom: 40rpx;
  }
  
  /* 概览卡片 */
  .overview-card {
    margin: 20rpx;
    padding: 30rpx;
    background: linear-gradient(135deg, #1aad19 0%, #52c41a 100%);
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(26, 173, 25, 0.3);
    color: #fff;
  }
  
  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
  }
  
  .overview-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
  }
  
  .report-date {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
  
  /* 统计概览 */
  .stats-overview {
    display: flex;
    justify-content: space-around;
    padding-top: 20rpx;
    border-top: 2rpx solid #f0f0f0;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  
  .stat-number {
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }
  
  .stat-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
  
  /* 通用区块样式 */
  .detail-section,
  .ranking-section,
  .summary-section {
    margin-top: 30rpx;
    padding: 0 20rpx;
  }
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
  }
  
  .detail-card,
  .ranking-card,
  .summary-card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .detail-card:active,
  .ranking-card:active,
  .summary-card:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
  
  /* 详细统计 */
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #f0f0f0;
    transition: background-color 0.2s ease;
  }
  
  .detail-item:last-child {
    border-bottom: none;
  }
  
  .detail-item:active {
    background-color: #f5f5f5;
  }
  
  .detail-label {
    font-size: 28rpx;
    color: #666;
  }
  
  .detail-value {
    font-size: 32rpx;
    font-weight: 600;
    color: #1aad19;
  }
  
  /* 排行榜 */
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #f0f0f0;
  }
  
  .ranking-item:last-child {
    border-bottom: none;
  }
  
  .ranking-number {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1aad19;
    color: #fff;
    font-size: 28rpx;
    font-weight: 600;
    border-radius: 50%;
    margin-right: 20rpx;
    position: relative;
    overflow: hidden;
  }
  
  .ranking-number::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%);
    transform: rotate(30deg);
    animation: shine 3s infinite;
  }
  
  @keyframes shine {
    0% {
      transform: rotate(30deg) translateX(-100%);
    }
    100% {
      transform: rotate(30deg) translateX(100%);
    }
  }
  
  .ranking-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  
  .ranking-info {
    flex: 1;
  }
  
  .ranking-name {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .ranking-desc {
    font-size: 24rpx;
    color: #999;
  }
  
  .ranking-interact {
    font-size: 26rpx;
    color: #1aad19;
  }
  
  /* 总结 */
  .summary-text {
    font-size: 28rpx;
    line-height: 48rpx;
    color: #666;
    padding: 10rpx 0;
    animation: fadeIn 1s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>