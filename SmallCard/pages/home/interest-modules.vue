<template>
  <view class="interest-modules-wrapper">
    <!-- 模块容器 -->
    <view 
      class="module-grid" 
      ref="modulesContainer" 
      :style="{ height: containerHeight + 'px' }"
      @touchmove.stop="handleContainerTouchMove"
    >
      <view 
        v-for="(module, index) in modules" 
        :key="module.id"
        :ref="el => setModuleRef(el, module.id)"
        class="module-item"
        :class="{ 
          'editing': isEditMode && editingModuleId === module.id, 
          'resizing': isEditMode && resizingModuleId === module.id,
          'edit-mode': isEditMode
        }"
        :style="{
          left: module.x + 'px',
          top: module.y + 'px',
          width: module.width + 'px',
          height: module.height + 'px'
        }"
        @touchstart="isEditMode && handleTouchStart($event, module, index)"
        @touchmove="isEditMode && handleTouchMove($event, module, index)"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
        catchtap="handleModuleTap(module)"
      >
        <!-- 模块内容 -->
        <view class="module-content" @tap="handleModuleTap(module)">
          <image v-if="module.type === 'image' && module.content" :src="module.content || '/static/icon/社交媒体1.png'" class="content-img" mode="aspectFit"></image>
          <text v-else-if="module.type === 'text' || module.type === 'emoji'">{{ module.content || (isEditMode ? '点击编辑' : '') }}</text>
          <text v-else-if="isEditMode">点击编辑</text>
        </view>
        
        <!-- 右下角调整大小的控制点 - 只在编辑模式下显示 -->
        <view 
          v-if="isEditMode"
          class="resize-handle"
          @touchstart="handleResizeStart($event, module, index)"
          @touchmove="handleResizeMove($event)"
          @touchend="handleResizeEnd"
          @touchcancel="handleResizeEnd"
        ></view>
      </view>
    </view>
    
    <!-- 编辑模式提示 -->
    <view v-if="isEditMode" class="edit-mode-tip">
      编辑模式：长按模块可拖动，拖动右下角可调整大小，点击可编辑内容
    </view>
  </view>
</template>

<script>
export default {
  name: 'InterestModules',
  props: {
    editMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 模块相关数据
      modules: [],
      containerHeight: 500, // 模块容器高度
      // 拖拽相关状态
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      moduleStartX: 0,
      moduleStartY: 0,
      editingModuleId: null,
      // 调整大小相关状态
      isResizing: false,
      resizingModuleId: null,
      resizeStartX: 0,
      resizeStartY: 0,
      resizeStartWidth: 0,
      resizeStartHeight: 0,
      longPressTimer: null, // 长按计时器
      isLongPressing: false, // 是否正在长按
      longPressDuration: 2000, // 长按触发时间（毫秒）
      tempResizeModule: null, // 临时记录调整大小的模块信息
      tempResizeStartX: 0, // 临时记录调整大小的起始X坐标
      tempResizeStartY: 0, // 临时记录调整大小的起始Y坐标
      moduleRefs: {} // 模块DOM引用
    };
  },
  computed: {
    isEditMode() {
      return this.editMode;
    }
  },
  watch: {
    editMode: {
      handler(newVal) {
        if (!newVal) {
          // 退出编辑模式时重置状态
          this.resetEditState();
        }
      }
    }
  },
  mounted() {
    this.initModules();
    this.updateContainerHeight();
    // 监听窗口大小变化，更新容器高度
    uni.onWindowResize(() => {
      this.updateContainerHeight();
    });
  },
  beforeDestroy() {
    uni.offWindowResize();
    this.clearLongPressTimer();
  },
  methods: {
    // 初始化模块
    initModules() {
      // 从本地存储加载模块数据，如果没有则使用默认数据
      const savedModules = uni.getStorageSync('interestModules');
      if (savedModules && savedModules.length > 0) {
        this.modules = savedModules;
        return;
      }
      
      // 默认模块数据
      this.modules = [
        {
          id: Date.now() + 1,
          x: 10,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体1.png'
        },
        {
          id: Date.now() + 2,
          x: 180,
          y: 10,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体2.png'
        },
        {
          id: Date.now() + 3,
          x: 10,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体3.png'
        },
        {
          id: Date.now() + 4,
          x: 180,
          y: 120,
          width: 150,
          height: 100,
          type: 'image',
          content: '/static/icon/社交媒体4.png'
        }
      ];
      
      // 保存默认模块数据到本地存储
      this.saveModules();
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.modulesContainer) {
        const containerWidth = this.$refs.modulesContainer.offsetWidth;
        // 根据宽度动态调整高度，保持合适的比例
        this.containerHeight = containerWidth * 1.2;
      }
    },
    
    // 设置模块引用
    setModuleRef(el, id) {
      if (el) {
        if (!this.moduleRefs) this.moduleRefs = {};
        this.moduleRefs[id] = el;
      }
    },
    
    // 处理模块点击
    handleModuleTap(module) {
      if (this.isEditMode && !this.isDragging && !this.isResizing) {
        this.$emit('edit-module', module);
      }
    },
    
    // 处理容器触摸移动（主要用于取消拖拽）
    handleContainerTouchMove(event) {
      if (this.isDragging || this.isResizing) {
        this.isDragging = false;
        this.isResizing = false;
        this.editingModuleId = null;
        this.resizingModuleId = null;
      }
    },
    
    // 处理模块触摸开始
    handleTouchStart(event, module, index) {
      // 防止冒泡到容器
      event.stopPropagation();
      
      // 检查是否正在调整大小，如果是则不触发拖拽
      if (this.isResizing) return;
      
      // 设置拖拽状态
      this.isDragging = true;
      this.editingModuleId = module.id;
      
      // 记录开始位置
      const touch = event.touches[0];
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.moduleStartX = module.x;
      this.moduleStartY = module.y;
      
      // 阻止默认行为，防止页面滚动
      event.preventDefault();
    },
    
    // 处理模块触摸移动
    handleTouchMove(event, module, index) {
      // 检查是否正在拖拽
      if (!this.isDragging || this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStartX;
      const deltaY = touch.clientY - this.dragStartY;
      
      // 计算新位置
      let newX = this.moduleStartX + deltaX;
      let newY = this.moduleStartY + deltaY;
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        newX = Math.max(0, Math.min(containerRect.width - module.width, newX));
        newY = Math.max(0, Math.min(containerRect.height - module.height, newY));
      }
      
      // 更新模块位置
      module.x = newX;
      module.y = newY;
      
      // 防止默认行为
      event.preventDefault();
    },
    
    // 处理触摸结束
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.editingModuleId = null;
        // 保存模块位置
        this.saveModules();
      }
    },
    
    // 处理调整大小开始
    handleResizeStart(event, module, index) {
      // 防止冒泡
      event.stopPropagation();
      
      // 设置调整大小状态
      this.isResizing = true;
      this.resizingModuleId = module.id;
      
      // 记录开始位置和尺寸
      const touch = event.touches[0];
      this.resizeStartX = touch.clientX;
      this.resizeStartY = touch.clientY;
      this.resizeStartWidth = module.width;
      this.resizeStartHeight = module.height;
      
      // 阻止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小移动
    handleResizeMove(event) {
      if (!this.isResizing) return;
      
      // 获取触摸位置
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.resizeStartX;
      const deltaY = touch.clientY - this.resizeStartY;
      
      // 计算新尺寸，设置最小尺寸限制
      let newWidth = Math.max(80, this.resizeStartWidth + deltaX);
      let newHeight = Math.max(60, this.resizeStartHeight + deltaY);
      
      // 找到正在调整大小的模块
      const moduleIndex = this.modules.findIndex(m => m.id === this.resizingModuleId);
      if (moduleIndex === -1) return;
      
      const module = this.modules[moduleIndex];
      
      // 限制在容器内
      const container = this.$refs.modulesContainer;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        newWidth = Math.min(containerRect.width - module.x, newWidth);
        newHeight = Math.min(containerRect.height - module.y, newHeight);
      }
      
      // 更新模块尺寸
      module.width = newWidth;
      module.height = newHeight;
      
      // 防止默认行为
      event.preventDefault();
    },
    
    // 处理调整大小结束
    handleResizeEnd() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizingModuleId = null;
        // 保存模块尺寸
        this.saveModules();
      }
    },
    
    // 重置编辑状态
    resetEditState() {
      this.isDragging = false;
      this.isResizing = false;
      this.editingModuleId = null;
      this.resizingModuleId = null;
      this.clearLongPressTimer();
    },
    
    // 清除长按计时器
    clearLongPressTimer() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        this.isLongPressing = false;
      }
    },
    
    // 保存模块数据到本地存储
    saveModules() {
      uni.setStorageSync('interestModules', this.modules);
    },
    
    // 更新模块内容
    updateModuleContent(moduleId, type, content) {
      const moduleIndex = this.modules.findIndex(m => m.id === moduleId);
      if (moduleIndex !== -1) {
        this.modules[moduleIndex].type = type;
        this.modules[moduleIndex].content = content;
        this.saveModules();
      }
    }
  }
};
</script>

<style scoped>
.interest-modules-wrapper {
  width: 100%;
  position: relative;
}

.module-grid {
  position: relative;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.module-item {
  position: absolute;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
}

.module-item.edit-mode {
  box-shadow: 0 0 0 2rpx #2699fb;
}

.module-item.editing {
  z-index: 10;
  transform: scale(1.02);
}

.module-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  box-sizing: border-box;
}

.content-img {
  width: 100%;
  height: 100%;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20rpx;
  height: 20rpx;
  background-color: #2699fb;
  border-radius: 0 0 0 10rpx;
  cursor: se-resize;
}

.edit-mode-tip {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  padding: 10rpx 0;
  margin-bottom: 20rpx;
}
</style>