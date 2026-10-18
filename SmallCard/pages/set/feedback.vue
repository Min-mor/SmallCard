<template>
  <view class="feedback-page">
    <!-- 头部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">反馈</text>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <image src="/static/logo.jpg" class="page-logo" mode="aspectFit"></image>
    </view>
    
    <!-- 主内容区 -->
    <view class="content">
      <!-- 反馈输入框区域 -->
      <view class="feedback-input-box">
        <!-- 文本输入区域 -->
        <textarea 
          class="feedback-textarea" 
          placeholder="每天都有1亿人想教会我们做好的产品，把你的想法告诉我们吧..."
          v-model="feedbackContent"
          auto-height
        ></textarea>
        
        <!-- 文件选择按钮 -->
        <view class="file-ops">
          <button class="file-btn" @click="chooseFile">选择文件</button>
          <text class="file-name" v-if="fileName">{{ fileName }}</text>
          <text class="file-name" v-else>未选择文件</text>
        </view>
      </view>

      <!-- 发送反馈按钮 -->
      <button class="submit-btn" @click="submitFeedback">发送反馈</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedbackContent: '', // 反馈内容
      fileName: '', // 选中的文件名
      fileTempPath: '' // 文件临时路径
    };
  },
  methods: {
    // 返回上一页（设置页面）
    goBack() {
      uni.navigateBack();
    },
    // 选择文件（支持图片/文档）
    chooseFile() {
      uni.chooseFile({
        count: 11, // 仅允许选择1个文件
        type: 'all', // 允许所有类型文件
        success: (res) => {
          this.fileTempPath = res.tempFilePaths[0];
          // 提取文件名（截取路径中的最后一段）
          this.fileName = res.tempFilePaths[0].split('/').pop();
        },
        fail: (err) => {
          console.log('选择文件失败', err);
        }
      });
    },
    // 提交反馈
    submitFeedback() {
      if (!this.feedbackContent.trim()) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        });
        return;
      }

      // 模拟提交（实际项目中替换为接口请求）
      uni.showLoading({ title: '提交中...' });
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '反馈发送成功，感谢您的支持！',
          icon: 'none',
          duration: 2000
        });
        // 提交成功后返回设置页
        setTimeout(() => {
          this.goBack();
        }, 2000);
      }, 1500);
    }
  }
};
</script>

<style scoped>
.feedback-page {
 
  min-height: 100vh;
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 头部导航 */
.header {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 36rpx;
  background: transparent;
  color: #fff;
  padding: 0;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

/* Logo样式 */
.logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
}

.page-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
}

/* 主内容区 */
.content {
  padding-top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
}

/* 反馈输入框容器 */
.feedback-input-box {
  width: 100%;
  background-color: #ddd;
  border-radius: 16rpx;
  padding: 30rpx;
  box-sizing: border-box;
  margin-bottom: 60rpx;
}

/* 文本输入区域 */
.feedback-textarea {
  width: 100%;
  min-height: 300rpx;
  font-size: 30rpx;
  color: #333;
  padding: 10rpx;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  outline: none;
}

/* 文件选择区域 */
.file-ops {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #ddd;
}

.file-btn {
  width: 180rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 26rpx;
  color: #2699fb;
  border: 1rpx solid #2699fb;
  border-radius: 8rpx;
  background-color: transparent;
  margin-right: 20rpx;
}

.file-name {
  font-size: 26rpx;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 发送按钮 */
.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #2699fb;
  color: #fff;
  font-size: 32rpx;
  border-radius: 45rpx;
  border: none;
}

button::after {
  border: none;
}
</style>