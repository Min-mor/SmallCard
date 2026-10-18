<script>
	// 导入用户服务
	import userService from './utils/userService.js';
	export default {
		globalData: {
			// 用户状态
			userStatus: {
				isLoggedIn: false,
				isGuest: false,
				userInfo: null
			},
			// 全局数据统计对象
			userStats: {
				viewedPosts: [], // 查看过的帖子ID列表
				likedPosts: [],  // 点赞过的帖子ID列表
				commentedPosts: [], // 评论过的帖子ID列表
				addedFriends: [] // 新添加的好友ID列表
			},
			// 浏览时长统计
			browseStartTime: null,
			totalBrowseTime: 0 // 总浏览时长（分钟）
		},
		onLaunch: function() {
			console.log('App Launch')
			// 初始化时从本地存储加载统计数据
			this.initUserStats();
			// 初始化用户登录状态
			this.initUserStatus();
			// 初始化虚拟用户数据
			this.initVirtualUsers();
			
			// 添加全局路由守卫
			const _this = this;
			
			// navigateTo 拦截器
			uni.addInterceptor('navigateTo', {
				invoke: function(options) {
					// 检查是否有权限访问目标页面
					if (!_this.checkPageAuth(options.url)) {
						// 如果没有权限，中断导航
						throw new Error('无权限访问此页面');
					}
				},
				fail: function(err) {
					// 导航失败时显示提示
					if (err && err.message === '无权限访问此页面') {
						uni.showToast({
							title: '请先登录才能访问',
							icon: 'none'
						});
					}
				}
			});
			
			// 全局导航守卫 - 拦截所有页面跳转
			function setupNavigationGuards() {
				// 检查是否有权限访问页面的通用函数
				function canAccessPage(url) {
					// 确保全局状态存在
					if (!_this.globalData) {
						_this.globalData = {};
					}
					if (!_this.globalData.userStatus) {
						_this.globalData.userStatus = {
							isLoggedIn: false,
							isGuest: false,
							userInfo: null
						};
					}
					
					// 解析URL，获取页面路径
					const path = url.replace(/^\//, '').split('?')[0];
					
					// 明确允许游客访问的页面列表 - 包括设置页面用于注册和社交页面
					const allowedPaths = [
						'pages/index/index', 
						'pages/index/cover',
						'pages/setting/basic',
						'pages/setting/social',
						'pages/social/index', // 允许游客访问社交页面
						'pages/set/switch-account', // 允许游客访问切换账号页面
						'pages/friend-detail/friend-detail' // 允许游客访问好友页面
					];
						if (allowedPaths.includes(path)) {
							return true;
						}
					
					// 检查是否是游客或未登录
					const isLoggedIn = _this.globalData.userStatus.isLoggedIn;
					const isGuest = _this.globalData.userStatus.isGuest;
					
					// 游客或未登录用户不能访问其他页面
					if (!isLoggedIn || isGuest) {
						return false;
					}
					
					return true;
				}
				
				// 处理无权限访问的通用函数
				function handleUnauthorizedAccess() {
					// 显示带选项的模态框
					uni.showModal({
						title: '请先登录',
						content: '登录后可使用更多功能',
						showCancel: true,
						cancelText: '取消',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								// 跳转到登录注册页面
								uni.navigateTo({
									url: '/pages/setting/basic',
									fail: () => {
										// 如果失败，尝试其他方式
										uni.reLaunch({
											url: '/pages/index/cover'
										});
									}
								});
							} else if (res.cancel) {
								// 用户点击取消，跳转到首页
								uni.switchTab({
									url: '/pages/index/index'
								});
							}
						}
					});
				}
				
				// switchTab 拦截器 - 增强对底部导航栏的拦截
					uni.addInterceptor('switchTab', {
						invoke: function(options) {
							// 特别针对"我的"页面进行提前拦截
							if (options.url && options.url.includes('/pages/home/index')) {
								const isLoggedIn = _this.globalData.userStatus && _this.globalData.userStatus.isLoggedIn;
								const isGuest = _this.globalData.userStatus && _this.globalData.userStatus.isGuest;
								
								// 未登录或游客不能访问"我的"页面
								if (!isLoggedIn || isGuest) {
									// 显示带选项的模态框
									uni.showModal({
										title: '请先登录',
										content: '登录后可使用更多功能',
										showCancel: true,
										cancelText: '取消',
										confirmText: '去登录',
										success: function(res) {
											if (res.confirm) {
												// 跳转到切换账号页面
												uni.navigateTo({
													url: '/pages/set/switch-account',
													fail: function() {
														uni.reLaunch({
															url: '/pages/index/cover'
														});
													}
												});
											} else if (res.cancel) {
												// 用户点击取消，跳转到首页
												uni.switchTab({
													url: '/pages/index/index'
												});
											}
										}
									});
									// 不自动跳转，由用户决定
									return;
								}
							}
							// 其他页面的常规权限检查
							else if (options.url) {
								// 对其他页面进行常规权限检查
								if (!canAccessPage(options.url)) {
									throw new Error('无权限访问此页面');
								}
							}
						},
						fail: function(err) {
							// 处理权限失败的情况 - 保持与原逻辑一致
							if (err && err.errMsg && (err.errMsg.includes('无权限') || err.errMsg.includes('权限'))) {
								uni.showModal({
									title: '提示',
									content: '请先登录',
									showCancel: true,
									cancelText: '取消',
									confirmText: '去登录',
									success: function(res) {
										if (res.confirm) {
											uni.navigateTo({
												url: '/pages/setting/basic'
											});
										} else if (res.cancel) {
											// 用户取消后，可以跳转到默认页面
											uni.switchTab({
												url: '/pages/index/index'
											});
										}
									}
								});
							}
						}
					});
				
				// navigateTo 拦截器
				uni.addInterceptor('navigateTo', {
					invoke: function(options) {
						if (!canAccessPage(options.url)) {
							throw new Error('无权限访问此页面');
						}
					},
					fail: function(err) {
						if (err && err.message === '无权限访问此页面') {
							handleUnauthorizedAccess();
						}
					}
				});
				
				// reLaunch 拦截器
				uni.addInterceptor('reLaunch', {
					invoke: function(options) {
						if (!canAccessPage(options.url)) {
							throw new Error('无权限访问此页面');
						}
					},
					fail: function(err) {
						if (err && err.message === '无权限访问此页面') {
							handleUnauthorizedAccess();
						}
					}
				});
				
				// redirectTo 拦截器
				uni.addInterceptor('redirectTo', {
					invoke: function(options) {
						if (!canAccessPage(options.url)) {
							throw new Error('无权限访问此页面');
						}
					},
					fail: function(err) {
						if (err && err.message === '无权限访问此页面') {
							handleUnauthorizedAccess();
						}
					}
				});
			}
			
			// 初始化所有导航守卫
			setupNavigationGuards();
		},
		onShow: function() {
			console.log('App Show')
			// 记录应用显示时间，用于统计浏览时长
			this.globalData.browseStartTime = new Date();
		},
		onHide: function() {
			console.log('App Hide')
			// 计算本次浏览时长并累加
			this.updateBrowseTime();
		},
		methods: {
			// 初始化用户统计数据
			initUserStats: function() {
				try {
					// 从本地存储加载数据，如果没有则使用默认值
					const viewedPosts = uni.getStorageSync('viewedPosts') || [];
					const likedPosts = uni.getStorageSync('likedPosts') || [];
					const commentedPosts = uni.getStorageSync('commentedPosts') || [];
					const addedFriends = uni.getStorageSync('addedFriends') || [];
					const totalBrowseTime = uni.getStorageSync('totalBrowseTime') || 0;
					
					// 更新全局数据
					this.globalData.userStats = {
						viewedPosts,
						likedPosts,
						commentedPosts,
						addedFriends
					};
					this.globalData.totalBrowseTime = totalBrowseTime;
				} catch (error) {
					console.error('初始化统计数据失败:', error);
				}
			},
			
			// 更新浏览时长
			updateBrowseTime: function() {
				if (this.globalData.browseStartTime) {
					const now = new Date();
					const durationMinutes = (now - this.globalData.browseStartTime) / (1000 * 60);
					// 只记录有效时长（大于1分钟）
					if (durationMinutes > 1) {
						this.globalData.totalBrowseTime += Math.floor(durationMinutes);
						// 保存到本地存储
						try {
							uni.setStorageSync('totalBrowseTime', this.globalData.totalBrowseTime);
						} catch (error) {
							console.error('保存浏览时长失败:', error);
						}
					}
					this.globalData.browseStartTime = null;
				}
			},
			
			// 记录帖子浏览
			recordPostView(postId) {
				if (!this.globalData.userStats.viewedPosts.includes(postId)) {
					this.globalData.userStats.viewedPosts.push(postId);
					// 保存到本地存储
					try {
						uni.setStorageSync('viewedPosts', this.globalData.userStats.viewedPosts);
					} catch (error) {
						console.error('保存浏览记录失败:', error);
					}
				}
			},
			
			// 记录帖子点赞
			recordPostLike(postId, isLike) {
				const index = this.globalData.userStats.likedPosts.indexOf(postId);
				if (isLike && index === -1) {
					// 添加点赞记录
					this.globalData.userStats.likedPosts.push(postId);
				} else if (!isLike && index > -1) {
					// 移除点赞记录
					this.globalData.userStats.likedPosts.splice(index, 1);
				}
				// 保存到本地存储
				try {
					uni.setStorageSync('likedPosts', this.globalData.userStats.likedPosts);
				} catch (error) {
					console.error('保存点赞记录失败:', error);
				}
			},
			
			// 记录帖子评论
			recordPostComment(postId) {
				if (!this.globalData.userStats.commentedPosts.includes(postId)) {
					this.globalData.userStats.commentedPosts.push(postId);
					// 保存到本地存储
					try {
						uni.setStorageSync('commentedPosts', this.globalData.userStats.commentedPosts);
					} catch (error) {
						console.error('保存评论记录失败:', error);
					}
				}
			},
			
			// 记录添加好友
		recordAddFriend(friendId) {
			if (!this.globalData.userStats.addedFriends.includes(friendId)) {
				this.globalData.userStats.addedFriends.push(friendId);
				// 保存到本地存储
				try {
					uni.setStorageSync('addedFriends', this.globalData.userStats.addedFriends);
				} catch (error) {
					console.error('保存好友记录失败:', error);
				}
			}
		},
		
		// 初始化虚拟用户数据
		initVirtualUsers: function(force = false) {
			try {
				// 检查是否已经初始化过虚拟用户
				const hasVirtualUsers = uni.getStorageSync('hasVirtualUsers');
				if (hasVirtualUsers && !force) {
					console.log('虚拟用户数据已存在，跳过初始化');
					return;
				}
				
				// 创建虚拟用户数据
				const virtualUsers = [
					{
						id: 'virtual_user_1',
						name: '小明',
						userName: '小明',
						avatar: '/static/icon/我的.png',
						signature: '热爱生活，分享美好',
						phone: '13800138001'
					},
					{
						id: 'virtual_user_2',
						name: '小红',
						userName: '小红',
						avatar: '/static/icon/我的.png',
						signature: '记录生活的点点滴滴',
						phone: '13900139002'
					},
					{
						id: 'virtual_user_3',
						name: '小李',
						userName: '小李',
						avatar: '/static/icon/我的.png',
						signature: '技术爱好者，喜欢分享',
						phone: '13700137003'
					},
					{
						id: 'virtual_user_4',
						name: '小张',
						userName: '小张',
						avatar: '/static/icon/我的.png',
						signature: '旅行达人，美食探索者',
						phone: '13600136004'
					},
					{
						id: 'virtual_user_5',
						name: '小王',
						userName: '小王',
						avatar: '/static/icon/我的.png',
						signature: '摄影师，用镜头记录世界',
						phone: '13500135005'
					}
				];
				
				// 获取当前的关注者列表
				let followers = uni.getStorageSync('followers') || [];
				// 确保followers是数组
				followers = Array.isArray(followers) ? followers : [];
				
				// 将虚拟用户添加到关注者列表（如果不存在）
				virtualUsers.forEach(virtualUser => {
					const exists = followers.some(user => user.id === virtualUser.id);
					if (!exists) {
						followers.push(virtualUser);
					}
				});
				
				// 保存更新后的关注者列表
				uni.setStorageSync('followers', followers);
				
				// 标记已经初始化过虚拟用户
				uni.setStorageSync('hasVirtualUsers', true);
				
				console.log('虚拟用户数据初始化完成' + (force ? '（强制重新初始化）' : ''));
				return true;
			} catch (error) {
				console.error('初始化虚拟用户数据失败:', error);
				return false;
			}
		},
		
		// 获取用户月度统计数据
		getMonthlyStats: function() {
			// 获取本月第一天和最后一天
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth();
			const firstDay = new Date(year, month, 1);
			const lastDay = new Date(year, month + 1, 0);
			
			// 这里可以根据时间戳筛选当月数据
			// 由于是模拟数据，我们直接返回当前所有统计
			return {
					postViews: this.globalData.userStats.viewedPosts.length,
					postLikes: this.globalData.userStats.likedPosts.length,
					commentCount: this.globalData.userStats.commentedPosts.length,
					friendCount: this.globalData.userStats.addedFriends.length,
					browseTime: this.globalData.totalBrowseTime
				};
		},
		
		// 初始化用户状态
		initUserStatus: function() {
			try {
				const isGuest = uni.getStorageSync('isGuest');
				let userInfo = null;
				
				// 获取并正确解析用户信息
				const storedUserInfo = uni.getStorageSync('userInfo');
				if (storedUserInfo) {
					// 确保storedUserInfo是字符串才进行解析
					userInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
				}
				
				// 更新全局用户状态
				this.globalData.userStatus = {
					isLoggedIn: !!userInfo,
					isGuest: !!isGuest,
					userInfo: userInfo
				};
				
				// 如果用户已登录且不是游客，自动同步到数据库
				if (!!userInfo && !isGuest) {
					this.syncUserToDatabase();
				}
			} catch (error) {
				console.error('初始化用户状态失败:', error);
				// 出错时重置用户状态，确保应用能正常运行
				this.globalData.userStatus = {
					isLoggedIn: false,
					isGuest: false,
					userInfo: null
				};
			}
		},
		
		// 同步用户数据到数据库
		syncUserToDatabase: function() {
			console.log('开始同步用户数据到数据库...');
			userService.syncLocalUserToDatabase()
				.then(result => {
					if (result.success) {
						console.log('用户数据同步成功:', result.message);
						// 同步成功后更新全局用户状态
						if (result.userId) {
							const userInfo = this.globalData.userStatus.userInfo;
							if (userInfo) {
								userInfo.userId = result.userId;
								this.globalData.userStatus.userInfo = userInfo;
							}
						}
					} else {
						console.log('用户数据同步失败:', result.message || result.error);
					}
				})
				.catch(error => {
					console.error('用户数据同步异常:', error);
				});
		},
		
		// 检查是否为游客登录
		isGuestLogin: function() {
			return this.globalData.userStatus.isGuest && this.globalData.userStatus.isLoggedIn;
		},
		
		// 检查是否为正式登录
		isRegularLogin: function() {
				return this.globalData.userStatus.isLoggedIn && !this.globalData.userStatus.isGuest;
			},
			
		// 手动强制初始化虚拟用户数据（用于测试）
		forceInitVirtualUsers: function() {
				// 清除标记
				uni.removeStorageSync('hasVirtualUsers');
				// 重新初始化
				const result = this.initVirtualUsers(true);
				if (result) {
					uni.showToast({
						title: '虚拟用户数据已重置',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: '虚拟用户数据重置失败',
						icon: 'none'
					});
				}
				return result;
			},
			
		// 检查是否需要登录
		requireLogin: function(showToast = true) {
			if (!this.globalData.userStatus.isLoggedIn) {
				if (showToast) {
					// 显示带选项的模态框
					uni.showModal({
						title: '请先登录',
						content: '登录后可使用更多功能',
						showCancel: true,
						cancelText: '取消',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								// 跳转到登录注册页面
								uni.navigateTo({
											url: '/pages/setting/basic',
											fail: () => {
												uni.reLaunch({
													url: '/pages/index/cover'
												});
											}
										});
									}
								}
							});
						}
						return false;
					}
					return true;
				},
				
				// 检查是否需要正式登录（非游客）
				requireRegularLogin(showToast = true) {
					if (!this.requireLogin(showToast)) {
						return false;
					}
					if (this.isGuestLogin()) {
						if (showToast) {
							// 显示带选项的模态框
							uni.showModal({
								title: '需要登录账号',
								content: '请先注册登录，再使用此功能',
								showCancel: true,
								cancelText: '取消',
								confirmText: '去登录',
								success: (res) => {
									if (res.confirm) {
										// 跳转到登录注册页面
										uni.navigateTo({
											url: '/pages/setting/basic',
											fail: () => {
												uni.reLaunch({
													url: '/pages/index/cover'
												});
											}
										});
									}
								}
							});
						}
						return false;
					}
					return true;
				},
			
			// 检查页面访问权限
		checkPageAuth(url) {
				// 确保全局状态存在
				if (!this.globalData || !this.globalData.userStatus) {
					this.globalData = this.globalData || {};
					this.globalData.userStatus = {
						isLoggedIn: false,
						isGuest: false,
						userInfo: null
					};
				}
				
				// 解析URL，获取页面路径（去掉查询参数和可能的前导斜杠）
				const path = url.replace(/^\//, '').split('?')[0];
				
				// 获取用户状态
				const isGuest = this.globalData.userStatus.isGuest;
				const isLoggedIn = this.globalData.userStatus.isLoggedIn;
				const isRegularUser = isLoggedIn && !isGuest; // 已注册用户
				
				// 1. 已注册用户可以访问所有页面
				if (isRegularUser) {
					return true;
				}
				
				// 2. 明确允许游客访问的页面列表
				const allowedPaths = [
					'pages/index/index', 
					'pages/index/cover',
					'pages/setting/basic',
					'pages/setting/social',
					'pages/monthly-report/index', // 允许游客访问月度报告
					'pages/social/index', // 允许游客访问社交页面的为你推荐
					'pages/set/switch-account' // 允许游客访问切换账号页面
				];
				
				// 检查是否是明确允许的页面
				if (allowedPaths.includes(path)) {
					return true;
				}
				
				// 3. 游客或未登录用户访问其他页面时进行拦截
				if (!isLoggedIn || isGuest) {
					// 显示带选项的模态框
					uni.showModal({
						title: '请先登录',
						content: '登录后可使用更多功能',
						showCancel: true,
						cancelText: '取消',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								// 跳转到登录注册页面
								uni.navigateTo({
									url: '/pages/setting/basic',
									fail: () => {
										uni.reLaunch({
											url: '/pages/index/cover'
										});
									}
								});
							} else if (res.cancel) {
								// 用户点击取消，跳转到首页
								uni.switchTab({
									url: '/pages/index/index'
								});
							}
						}
					});
					return false;
				}
				
				return true;
			}
		}}
</script>

<style>
	/*每个页面公共css */
</style>
