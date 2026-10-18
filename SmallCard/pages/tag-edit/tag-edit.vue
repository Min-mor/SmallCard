<template>
  <view class="tag-edit-page">
    <!-- 标签示例区域 -->
    <view class="tag-example">
      <text class="example-tag">Founder@Bonjour!</text>
      <text class="example-tag">iOS 开发者@Bonjour!</text>
      <text class="example-tag">✨ Swift</text>
      <text class="example-tag">📍 杭州 · 良渚</text>
      <text class="example-tag">😎 他</text>
    </view>

    <!-- 自定义标签区域 -->
    <view class="custom-tag-section">
      <!-- 简介输入框（覆盖index页面简介） -->
      <view class="section-item">
        <text class="section-label">简介</text>
        <textarea 
          class="tag-input" 
          v-model="userIntro" 
          placeholder="例如：我要浦到天光（将覆盖主页简介）" 
          auto-height
          maxlength="100"
        ></textarea>
      </view>
      
      <view class="section-item">
        <text class="section-label">当前在做</text>
        <textarea 
          class="tag-input" 
          v-model="currentDo" 
          placeholder="例如：Founder CEO@Apple" 
          auto-height
          maxlength="50"
        ></textarea>
      </view>
      <view class="section-item">
        <text class="section-label">角色</text>
        <textarea 
          class="tag-input" 
          v-model="role" 
          placeholder="例如：产品经理, 嬉皮士, etc" 
          auto-height
          maxlength="50"
        ></textarea>
      </view>
      <view class="section-item">
        <text class="section-label">地区</text>
        <textarea 
          class="tag-input" 
          v-model="region" 
          placeholder="例如：Cupertino, California" 
          auto-height
          maxlength="50"
        ></textarea>
      </view>
      <view class="section-item">
        <text class="section-label">性别代词</text>
        <textarea 
          class="tag-input" 
          v-model="pronoun" 
          placeholder="例如：他" 
          auto-height
          maxlength="20"
        ></textarea>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <button class="save-btn" @click="saveTag">保存标签与简介</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userIntro: '',
      currentDo: '',
      role: '',
      region: '',
      pronoun: ''
    }
  },
  onLoad() {
    // 加载已保存的用户信息，回显简介和标签（按换行拆分）
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      // 回显简介
      this.userIntro = userInfo.userIntro || '';
      // 回显标签（按换行符拆分到对应输入框）
      if (userInfo.userTag) {
        const tagArr = userInfo.userTag.split('\n'); // 关键修改：用换行符拆分
        this.currentDo = tagArr[0] || '';
        this.role = tagArr[1] || '';
        this.region = tagArr[2] || '';
        this.pronoun = tagArr[3] || '';
      }
    }
  },
  methods: {
    // 保存标签和简介，按行排列（用换行符连接）
    saveTag() {
      // 关键修改：用换行符 \n 连接各项，实现按行排列
      const tagStr = [this.currentDo, this.role, this.region, this.pronoun]
        .filter(item => item.trim()) // 过滤空值和纯空格
        .join('\n'); // 换行符连接，而非空格
      
      // 触发全局事件，传递标签（按行）和简介
      uni.$emit('userInfoUpdated', { 
        userTag: tagStr,
        userIntro: this.userIntro.trim() || '我要浦到天光'
      });
      
      uni.showToast({ title: '标签与简介已更新', icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 800);
    }
  }
}
</script>

<style scoped>
.tag-edit-page {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}

.tag-example {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.example-tag {
  display: inline-block;
  padding: 8rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.custom-tag-section {
  margin-bottom: 60rpx;
}

.section-item {
  margin-bottom: 30rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.tag-input {
  width: 100%;
  padding: 16rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  min-height: 80rpx;
  line-height: 1.5;
  resize: none;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #2699fb;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
}

button::after {
  border: none;
}
</style>