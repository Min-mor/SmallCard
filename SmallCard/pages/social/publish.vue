<template>
  <view class="publish-page">
    <!-- 发布内容区域 -->
    <view class="publish-content">
      <!-- 个人信息 -->
      <view class="user-info">
        <image 
          :src="userAvatar" 
          class="user-avatar" 
          mode="aspectFill"
          @error="handleAvatarError"
        ></image>
        <view class="user-name">{{ userName }}</view>
      </view>

      <!-- 内容输入框 -->
      <textarea 
        class="content-input" 
        placeholder="分享你的想法..." 
        v-model="postContent"
        auto-height
        @input="handleInput"
      ></textarea>

      <!-- 图片选择区域 -->
      <view class="image-upload">
        <view class="upload-title">添加图片（可选，最多9张）</view>
        <view class="image-list">
          <!-- 已选择的图片 -->
          <view class="image-item" v-for="(img, index) in selectedImages" :key="index">
            <image :src="img" class="selected-img" mode="aspectFill"></image>
            <view class="delete-img" @click="deleteImage(index)">×</view>
          </view>
          <!-- 图片选择按钮 -->
          <view class="image-item add-btn" @click="chooseImage" v-if="selectedImages.length < 9">
            <image src="/static/icon/社交媒体3.png" class="add-icon" mode="aspectFit"></image>
          </view>
        </view>
      </view>

      <!-- 字数统计 -->
      <view class="word-count">{{ currentWordCount }}/200</view>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-btn-container">
      <button class="submit-btn" @click="submitPost" :disabled="isSubmitting || !canSubmit">
        {{ isSubmitting ? '发布中...' : '发布' }}
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useRouter } from 'vue-router';

export default {
  setup() {
    // 响应式数据
    const postContent = ref('');
    const selectedImages = ref([]);
    const isSubmitting = ref(false);
    const currentWordCount = ref(0);
    const userAvatar = ref('/static/icon/我的.png');
    const userName = ref('梨鸣唱兽');

    // 路由实例
    const router = useRouter();

    // 计算属性：判断是否可以提交
    const canSubmit = computed(() => {
      return postContent.value.trim() !== '' || selectedImages.value.length > 0;
    });

    // 从全局应用实例加载用户信息
    const loadUserInfo = () => {
      // 优先从全局应用实例获取用户信息
      const app = getApp();
      if (app && app.globalData && app.globalData.userStatus && app.globalData.userStatus.userInfo) {
        const globalUserInfo = app.globalData.userStatus.userInfo;
        userAvatar.value = globalUserInfo.avatarUrl || globalUserInfo.avatar_url || '/static/icon/我的.png';
        userName.value = globalUserInfo.userName || globalUserInfo.nickname || '梨鸣唱兽';
      } else {
        // 从本地存储加载作为备用
        const storedUserInfo = uni.getStorageSync('userInfo');
        if (storedUserInfo) {
          userAvatar.value = storedUserInfo.avatarUrl || storedUserInfo.avatar_url || '/static/icon/我的.png';
          userName.value = storedUserInfo.userName || storedUserInfo.nickname || '梨鸣唱兽';
        } else {
          userAvatar.value = '/static/icon/我的.png';
          userName.value = '梨鸣晒兽';
        }
      }
    };

    // 监听全局事件，更新用户信息
    const handleUserInfoUpdate = (updatedData) => {
      if (updatedData) {
        if (updatedData.avatarUrl) {
          userAvatar.value = updatedData.avatarUrl;
        }
        if (updatedData.userName) {
          userName.value = updatedData.userName;
        }
      }
    };

    // 返回上一页
    const goBack = () => {
      router.back();
    };

    // 选择图片
    const chooseImage = () => {
      uni.chooseImage({
        count: 9 - selectedImages.value.length,
        sourceType: ['album', 'camera'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            selectedImages.value = [...selectedImages.value, ...res.tempFilePaths];
          }
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
          uni.showToast({ title: '图片选择失败', icon: 'none' });
        }
      });
    };

    // 删除选中的图片
    const deleteImage = (index) => {
      selectedImages.value.splice(index, 1);
    };

    // 处理头像加载失败
    const handleAvatarError = (e) => {
      e.target.src = '/static/icon/我的.png';
    };

    // 处理输入框变化（字数统计）
    const handleInput = (e) => {
      const value = e.detail.value || '';
      currentWordCount.value = value.length;
      if (currentWordCount.value > 200) {
        postContent.value = value.slice(0, 200);
        currentWordCount.value = 200;
      }
    };

    // 修改图片处理函数，直接返回本地临时文件路径，确保能够正常预览
    const uploadImages = async (tempPaths) => {
      if (!tempPaths || tempPaths.length === 0) return [];
      // 直接返回临时文件路径，这样可以确保图片能够正常预览
      return tempPaths;
    };

    // 提交发布
    const submitPost = async () => {
      // 再次检查登录状态，防止登录过期
      const app = getApp();
      if (!app.globalData.userStatus.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      if (!canSubmit.value) {
        uni.showToast({ title: '内容或图片不能为空', icon: 'none' });
        return;
      }

      isSubmitting.value = true;
      uni.showLoading({ title: '发布中...' });

      try {
        // 模拟图片上传
        const uploadedImages = await uploadImages(selectedImages.value);

        // 创建帖子对象
        const newPost = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          content: postContent.value,
          images: uploadedImages,
          userId: app.globalData.userStatus.userInfo?.userId || app.globalData.userStatus.userId || 'current_user', // 修复：从userInfo对象获取正确的userId
          userName: userName.value,
          userAvatar: userAvatar.value,
          createTime: Date.now(),
          likeCount: 0,
          commentCount: 0,
          liked: false
        };

        // 保存到本地存储
        const savedPosts = uni.getStorageSync('myPosts') || [];
        savedPosts.unshift(newPost); // 新帖子放在最前面
        uni.setStorageSync('myPosts', savedPosts);

        // 保存到推荐列表（为你推荐使用）
        const recommendedPosts = uni.getStorageSync('recommendedPosts') || [];
        recommendedPosts.unshift(newPost);
        // 限制推荐列表数量，避免占用过多存储空间
        if (recommendedPosts.length > 50) {
          recommendedPosts.splice(50);
        }
        uni.setStorageSync('recommendedPosts', recommendedPosts);

        // 模拟API请求
        console.log('开始提交数据:', newPost);

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        uni.showToast({ title: '发布成功', icon: 'success' });

        // 触发全局事件，通知其他页面更新
        uni.$emit('postsUpdated');

        setTimeout(() => {
          postContent.value = '';
          selectedImages.value = [];
          currentWordCount.value = 0;
          goBack();
        }, 1500);

      } catch (error) {
        console.error("发布失败:", error);
        uni.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
      } finally {
        isSubmitting.value = false;
        uni.hideLoading();
      }
    };

    // 生命周期钩子
    onMounted(() => {
      // 获取全局应用实例
      const app = getApp();
      
      // 检查登录状态
      if (!app.globalData.userStatus.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        // 延迟返回，让用户看到提示
        setTimeout(() => {
          goBack();
        }, 1500);
        return;
      }
      
      loadUserInfo();
      uni.$on('userInfoUpdated', handleUserInfoUpdate);
    });

    onShow(() => {
      loadUserInfo();
    });

    onBeforeUnmount(() => {
      uni.$off('userInfoUpdated', handleUserInfoUpdate);
    });

    // 将需要在模板中使用的变量和方法暴露出去
    return {
      postContent,
      selectedImages,
      isSubmitting,
      currentWordCount,
      userAvatar,
      userName,
      canSubmit,
      goBack,
      chooseImage,
      deleteImage,
      handleAvatarError,
      handleInput,
      submitPost
    };
  }
}
</script>

<style scoped>
/* 你的样式代码保持不变 */
.publish-page {
  padding-bottom: 120rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.publish-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}
.back-btn { font-size: 30rpx; color: #333; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #333; }
.empty { width: 30rpx; }

.publish-content {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid #f0f0f0;
  object-fit: cover;
}
.user-name { font-size: 30rpx; color: #333; font-weight: 500; }

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  padding: 10rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  resize: none;
}

.image-upload { margin-top: 30rpx; }
.upload-title { font-size: 28rpx; color: #666; margin-bottom: 15rpx; }
.image-list { display: flex; flex-wrap: wrap; gap: 15rpx; }
.image-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
  border-radius: 10rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}
.selected-img, .add-icon { width: 100%; height: 100%; }
.add-btn {
  border: 1rpx dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
.delete-img {
  position: absolute;
  top: -15rpx;
  right: -15rpx;
  width: 30rpx;
  height: 30rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  z-index: 10;
}

.word-count {
  font-size: 26rpx;
  color: #999;
  text-align: right;
  margin-top: 15rpx;
}

.publish-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: white;
  border-radius: 40rpx;
  font-size: 32rpx;
  border: none;
}
.submit-btn[disabled] { background-color: #c0c4cc; }
</style>