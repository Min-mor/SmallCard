// 数据库连接配置
const dbConfig = {
  host: 'localhost',    // 数据库主机地址
  user: 'root',         // 数据库用户名
  password: '123456',   // 数据库密码
  database: 'mini_program_digital_card', // 数据库名称
  port: 3306,           // 数据库端口
  charset: 'utf8mb4',   // 字符集
  connectTimeout: 10000 // 连接超时时间（毫秒）
};

export default dbConfig;