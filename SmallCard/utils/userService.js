// 用户服务类
import db from './db.js';

class UserService {
  /**
   * 根据openid获取用户信息
   * @param {string} openid - 微信openid
   * @returns {Promise} 用户信息
   */
  async getUserByOpenid(openid) {
    try {
      const sql = 'SELECT * FROM mp_user WHERE openid = ?';
      const result = await db.query(sql, [openid]);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('根据openid获取用户失败:', error);
      return null;
    }
  }

  /**
   * 根据用户ID获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise} 用户信息
   */
  async getUserById(userId) {
    try {
      const sql = 'SELECT * FROM mp_user WHERE user_id = ?';
      const result = await db.query(sql, [userId]);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('根据ID获取用户失败:', error);
      return null;
    }
  }

  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise} 创建结果
   */
  async createUser(userData) {
    try {
      const data = {
        openid: userData.openid || '',
        nickname: userData.nickname || '',
        avatar_url: userData.avatarUrl || '',
        phone: userData.phone || '',
        real_name: userData.realName || '',
        id_card: userData.idCard || '',
        auth_status: userData.authStatus || 0,
        role: userData.role || 0,
        status: userData.status || 1,
        register_time: new Date().toISOString(),
        last_login_time: new Date().toISOString()
      };
      
      const result = await db.insert('mp_user', data);
      
      if (result.success) {
        return {
          success: true,
          userId: result.insertId,
          userInfo: { ...data, user_id: result.insertId }
        };
      }
      
      return {
        success: false,
        error: result.error || '创建用户失败'
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise} 更新结果
   */
  async updateUser(userId, userData) {
    try {
      const data = {};
      
      // 只更新提供的字段
      if (userData.nickname !== undefined) data.nickname = userData.nickname;
      if (userData.avatarUrl !== undefined) data.avatar_url = userData.avatarUrl;
      if (userData.phone !== undefined) data.phone = userData.phone;
      if (userData.realName !== undefined) data.real_name = userData.realName;
      if (userData.idCard !== undefined) data.id_card = userData.idCard;
      if (userData.authStatus !== undefined) data.auth_status = userData.authStatus;
      if (userData.role !== undefined) data.role = userData.role;
      if (userData.status !== undefined) data.status = userData.status;
      
      data.last_login_time = new Date().toISOString();
      
      const result = await db.update('mp_user', data, { user_id: userId });
      
      return result;
    } catch (error) {
      console.error('更新用户失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 保存或更新用户会话
   * @param {string} sessionId - 会话ID
   * @param {number} userId - 用户ID
   * @param {string} openid - 微信openid
   * @returns {Promise} 操作结果
   */
  async saveSession(sessionId, userId, openid) {
    try {
      const sessionData = {
        session_id: sessionId,
        user_id: userId,
        openid: openid,
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };
      
      // 先检查是否已存在会话
      const existingSession = await this.getSessionById(sessionId);
      
      if (existingSession) {
        // 更新会话
        return await db.update('mp_session', sessionData, { session_id: sessionId });
      } else {
        // 创建新会话
        return await db.insert('mp_session', sessionData);
      }
    } catch (error) {
      console.error('保存会话失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 根据会话ID获取会话信息
   * @param {string} sessionId - 会话ID
   * @returns {Promise} 会话信息
   */
  async getSessionById(sessionId) {
    try {
      const sql = 'SELECT * FROM mp_session WHERE session_id = ?';
      const result = await db.query(sql, [sessionId]);
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('获取会话失败:', error);
      return null;
    }
  }

  /**
   * 从本地存储获取用户信息并同步到数据库
   * @returns {Promise} 同步结果
   */
  async syncLocalUserToDatabase() {
    try {
      // 从本地存储获取用户信息
      const userInfoStr = uni.getStorageSync('userInfo');
      if (!userInfoStr) {
        return {
          success: false,
          message: '本地没有用户信息'
        };
      }
      
      let userInfo = JSON.parse(userInfoStr);
      
      // 确保用户信息中的头像字段一致性，修复已注册账户没有储存头像的问题
      if (!userInfo.avatarUrl && userInfo.avatar) {
        userInfo.avatarUrl = userInfo.avatar;
      }
      if (!userInfo.avatar && userInfo.avatarUrl) {
        userInfo.avatar = userInfo.avatarUrl;
      }
      
      // 检查用户是否已存在于数据库
      let dbUser = null;
      if (userInfo.userId) {
        dbUser = await this.getUserById(userInfo.userId);
      } else if (userInfo.openid) {
        dbUser = await this.getUserByOpenid(userInfo.openid);
      }
      
      if (dbUser) {
        // 更新数据库中的用户信息
        const updateData = {
          nickname: userInfo.nickname || dbUser.nickname,
          // 确保avatarUrl字段的值始终可用，优先使用本地存储中的值
          avatarUrl: userInfo.avatarUrl || userInfo.avatar || dbUser.avatar_url,
          phone: userInfo.phone || dbUser.phone
        };
        
        const updateResult = await this.updateUser(dbUser.user_id, updateData);
        
        if (updateResult.success) {
          // 更新本地存储中的用户ID
          if (!userInfo.userId) {
            userInfo.userId = dbUser.user_id;
            uni.setStorageSync('userInfo', JSON.stringify(userInfo));
          }
          
          return {
            success: true,
            message: '用户信息已更新到数据库',
            userId: dbUser.user_id
          };
        }
      } else {
        // 创建新用户
        const createData = {
          openid: userInfo.openid || '',
          nickname: userInfo.nickname || '',
          // 确保avatarUrl字段的值始终可用，同时检查avatar字段
          avatarUrl: userInfo.avatarUrl || userInfo.avatar || '',
          phone: userInfo.phone || ''
        };
        
        const createResult = await this.createUser(createData);
        
        if (createResult.success) {
          // 更新本地存储中的用户ID
          userInfo.userId = createResult.userId;
          uni.setStorageSync('userInfo', JSON.stringify(userInfo));
          
          return {
            success: true,
            message: '用户已创建并保存到数据库',
            userId: createResult.userId
          };
        }
      }
      
      return {
        success: false,
        message: '同步用户信息失败'
      };
    } catch (error) {
      console.error('同步本地用户到数据库失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 导出用户服务实例
const userService = new UserService();
export default userService;