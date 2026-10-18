<template>
  <view class="contact-page">
    <!-- 头部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">联系方式</text>
    </view>

    <!-- 联系方式表单 -->
    <view class="contact-form">
      <!-- 手机号输入 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <input 
          type="number" 
          v-model="phoneNumber" 
          placeholder="请输入手机号" 
          class="input"
        />
      </view>

      <!-- 微信二维码上传 -->
      <view class="form-item">
        <text class="label">微信二维码</text>
        <view class="qr-upload">
          <image 
            :src="wechatQrUrl || '/static/icon/upload.png'" 
            class="qr-image" 
            mode="aspectFill"
            @click="chooseQrImage"
          ></image>
          <text class="upload-text" v-if="!wechatQrUrl">点击上传二维码</text>
        </view>
      </view>

      <!-- 新增：社交平台链接展示与编辑 -->
      <view class="social-section">
        <text class="section-label">社交平台链接</text>
        <view class="social-item" v-for="(item, index) in socialList" :key="index">
          <image :src="item.icon" class="social-icon" mode="aspectFit"></image>
          <input 
            type="text" 
            :placeholder="`请输入${item.name}链接`" 
            class="social-input" 
            v-model="item.link"
          />
          <text class="close-text" @click="clearSocialInput(index)">X</text>
        </view>
      </view>

      <!-- 保存按钮 -->
      <button class="save-btn" @click="saveContactInfo">保存联系方式</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phoneNumber: '',
      wechatQrUrl: '',
      // 与social页面一致的社交平台配置（id、name、icon对应）
      socialList: [
        { id: 'social1', name: '社交平台1', icon: '/static/icon/社交媒体1.png', link: '' },
        { id: 'social2', name: '社交平台2', icon: '/static/icon/社交媒体2.png', link: '' },
        { id: 'social3', name: '社交平台3', icon: '/static/icon/社交媒体3.png', link: '' },
        { id: 'social4', name: '社交平台4', icon: '/static/icon/社交媒体4.png', link: '' },
        { id: 'social5', name: '社交平台5', icon: '/static/icon/社交媒体5.png', link: '' }
      ]
    };
  },
  onLoad() {
    // 加载已保存的联系方式和社交链接
    this.loadContactInfo();
    this.loadSocialLinks();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 加载本地存储的联系方式
    loadContactInfo() {
      const contactInfo = uni.getStorageSync('contactInfo');
      if (contactInfo) {
        this.phoneNumber = contactInfo.phoneNumber || '';
        this.wechatQrUrl = contactInfo.wechatQrUrl || '';
      }
    },

    // 加载本地存储的社交链接（从social页面保存的缓存中读取）
    loadSocialLinks() {
      try {
        const storedSocialStr = uni.getStorageSync('socialLinks');
        let storedSocial = [];
        if (storedSocialStr) {
          // 尝试解析JSON字符串
          storedSocial = typeof storedSocialStr === 'string' ? JSON.parse(storedSocialStr) : storedSocialStr;
        }
        if (storedSocial && Array.isArray(storedSocial) && storedSocial.length) {
          this.socialList = this.socialList.map(item => {
            const storedItem = storedSocial.find(s => s.id === item.id);
            return storedItem ? { ...item, link: storedItem.link } : item;
          });
        }
      } catch (error) {
        console.error('加载社交链接失败:', error);
      }
    },

    // 选择微信二维码图片
    chooseQrImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.wechatQrUrl = res.tempFilePaths[0];
        }
      });
    },

    // 清除社交链接输入框内容
    clearSocialInput(index) {
      this.socialList[index].link = '';
    },

    // 保存联系方式和社交链接到本地存储
    saveContactInfo() {
      // 保存联系方式
      const contactInfo = {
        phoneNumber: this.phoneNumber.trim(),
        wechatQrUrl: this.wechatQrUrl
      };
      uni.setStorageSync('contactInfo', contactInfo);

      // 同步保存修改后的社交链接（覆盖原缓存，实现双向同步）
      uni.setStorageSync('socialLinks', this.socialList);

      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });

      // 延迟返回上一页
      setTimeout(() => {
        this.goBack();
      }, 800);
    }
  }
};
</script>

<style scoped>
.contact-page {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  padding-top: 80rpx; /* 留出头部空间 */
}

.header {
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  z-index: 10;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 36rpx;
  background: transparent;
  color: #333;
  padding: 0;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.contact-form {
  margin-top: 40rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

/* 社交链接样式 */
.social-section {
  margin: 50rpx 0 40rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.social-item {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.social-icon {
  width: 50rpx;
  height: 50rpx;
  margin-right: 20rpx;
}

.social-input {
  flex: 1;
  height: 76rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin-right: 20rpx;
  box-sizing: border-box;
  font-size: 26rpx;
}

.close-text {
  font-size: 30rpx;
  color: #999;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-text:active {
  background-color: #f5f5f5;
}

.qr-upload {
  width: 200rpx;
  height: 200rpx;
  border: 1rpx dashed #ddd;
  border-radius: 10rpx;
  position: relative;
  overflow: hidden;
}

.qr-image {
  width: 100%;
  height: 100%;
}

.upload-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24rpx;
  color: #999;
  text-align: center;
  width: 100%;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #2699fb;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  margin-top: 60rpx;
}

button::after {
  border: none;
}
</style>