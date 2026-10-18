<template>
  <view class="praise-container">
    <!-- 头部导航栏 -->
    <view class="header">
      <view class="back-button" @click="goBack">
        <image src="/static/icon/back.png" class="back-icon"></image>
      </view>
      <view class="header-title">夸夸TA</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 主体内容 -->
    <view class="content">
      <!-- 图标区域 -->
      <view class="icon-section">
        <image src="/static/icon/夸夸.png" class="praise-icon" mode="aspectFit"></image>
      </view>
      
      <!-- 输入框区域 -->
      <view class="input-section">
        <textarea class="input-textarea" placeholder="留下对TA的夸夸吧!" v-model="praiseContent" @input="handleInput"/>
      </view>
      
      <!-- 图片上传区域 -->
      <view class="image-upload-section">
        <view class="upload-button" @click="chooseImage">
          <template v-if="!uploadIcon">
            <image src="/static/icon/社交.png" class="upload-icon"></image>
          </template>
          <template v-else>
            <image :src="uploadIcon" class="preview-image"></image>
          </template>
        </view>
      </view>
    </view>
    
    <!-- 底部发送按钮 -->
    <view class="footer">
      <button class="send-button" :disabled="!canSend" @click="sendPraise">发送!</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      praiseContent: '',
      uploadIcon: '',
      canSend: false
    }
  },
  onLoad(options) {
    // 获取传递的卡片ID
    this.cardId = options.cardId || '';
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    handleInput() {
      // 验证内容是否为空：文本内容不为空或已上传图片
      this.validateContent();
    },
    validateContent() {
      // 文本内容不为空或已上传图片时可以发送
      this.canSend = this.praiseContent.trim().length > 0 || !!this.uploadIcon;
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadIcon = res.tempFilePaths[0];
          // 验证内容
          this.validateContent();
        },
        fail: (err) => {
          console.log('选择图片失败:', err);
        }
      });
    },
    sendPraise() {
      // 再次验证内容非空
      this.validateContent();
      if (!this.canSend) {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 模拟发送夸夸
      console.log('发送夸夸:', {
        cardId: this.cardId,
        content: this.praiseContent,
        image: this.uploadIcon
      });
      
      // 发送成功后返回，并传递夸夸内容
      uni.showToast({
        title: '夸夸发送成功!',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            // 返回上一页并传递夸夸内容
            uni.navigateBack({
              delta: 1,
              success: () => {
                // 触发上一页的刷新，带上夸夸内容和图片
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 2];
                if (prevPage) {
                  // 调用上一页的方法来添加夸夸内容，同时传递图片
                  prevPage.$vm.addPraiseMessage(this.praiseContent, this.uploadIcon);
                }
              }
            });
          }, 2000);
        }
      });
    }
  }
}
</script>

<style scoped>
.praise-container {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.back-button {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.header-right {
  width: 88rpx;
}

.content {
  flex: 1;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-section {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}

.praise-icon {
  width: 100rpx;
  height: 100rpx;
  opacity: 0.7;
}

.input-section {
  width: 100%;
  margin-bottom: 40rpx;
}

.input-textarea {
  width: 100%;
  height: 240rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  padding: 30rpx;
  font-size: 32rpx;
  color: #333333;
  box-sizing: border-box;
  background-color: #fafafa;
}

.image-upload-section {
  width: 100%;
  margin-bottom: 40rpx;
}

.upload-button {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #e0e0e0;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 60rpx;
  height: 60rpx;
  opacity: 0.6;
}

.preview-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 15rpx;
}

.footer {
  padding: 40rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.send-button {
  width: 100%;
  height: 96rpx;
  background-color: #1989fa;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
}

.send-button[disabled] {
  background-color: #c0c4cc;
  color: #ffffff;
}
</style>