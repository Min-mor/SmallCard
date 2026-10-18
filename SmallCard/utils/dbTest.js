// 数据库功能测试脚本
import db from './db.js';
import userService from './userService.js';

/**
 * 测试数据库连接功能
 */
async function testDbConnection() {
  console.log('=== 测试数据库连接 ===');
  try {
    const result = await db.connect();
    console.log('连接结果:', result);
    return result.success;
  } catch (error) {
    console.error('连接测试失败:', error);
    return false;
  }
}

/**
 * 测试用户数据同步功能
 */
async function testUserSync() {
  console.log('=== 测试用户数据同步 ===');
  try {
    // 创建测试用户数据
    const testUser = {
      openid: 'test_openid_' + Date.now(),
      nickname: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg',
      phone: '13800138000'
    };
    
    // 先保存到本地存储
    uni.setStorageSync('userInfo', JSON.stringify(testUser));
    uni.removeStorageSync('isGuest'); // 确保不是游客状态
    
    console.log('已保存测试用户到本地存储:', testUser);
    
    // 调用同步方法
    const result = await userService.syncLocalUserToDatabase();
    console.log('同步结果:', result);
    
    return result.success;
  } catch (error) {
    console.error('用户同步测试失败:', error);
    return false;
  }
}

/**
 * 测试插入用户功能
 */
async function testInsertUser() {
  console.log('=== 测试插入用户 ===');
  try {
    const userData = {
      openid: 'test_insert_openid_' + Date.now(),
      nickname: '插入测试用户',
      avatar_url: 'https://example.com/insert_avatar.jpg',
      phone: '13900139000'
    };
    
    const result = await userService.createUser(userData);
    console.log('插入结果:', result);
    
    return result.success;
  } catch (error) {
    console.error('插入用户测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始运行数据库功能测试...');
  
  const tests = [
    { name: '数据库连接', run: testDbConnection },
    { name: '用户数据同步', run: testUserSync },
    { name: '插入用户', run: testInsertUser }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n开始测试: ${test.name}`);
    const success = await test.run();
    results.push({ name: test.name, success });
    console.log(`${test.name} 测试: ${success ? '通过' : '失败'}`);
  }
  
  // 输出测试总结
  console.log('\n=== 测试总结 ===');
  let passedCount = 0;
  
  for (const result of results) {
    console.log(`${result.name}: ${result.success ? '✅ 通过' : '❌ 失败'}`);
    if (result.success) passedCount++;
  }
  
  console.log(`\n测试完成: ${passedCount}/${results.length} 通过`);
  return passedCount === results.length;
}

// 导出测试函数
export default {
  runAllTests,
  testDbConnection,
  testUserSync,
  testInsertUser
};

// 如果直接运行此脚本，则执行测试
if (typeof window !== 'undefined') {
  // 在小程序环境中，可以通过全局方法调用
  window.runDbTests = runAllTests;
}