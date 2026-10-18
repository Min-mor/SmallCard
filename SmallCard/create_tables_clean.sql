-- 创建数据库
CREATE DATABASE IF NOT EXISTS mini_program_digital_card CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 使用数据库
USE mini_program_digital_card;

-- 1. 用户信息表
CREATE TABLE mp_user (
  user_id INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key, unique user identifier',
  openid VARCHAR(100) NOT NULL COMMENT 'WeChat mini program openid',
  nickname VARCHAR(50) DEFAULT '' COMMENT 'WeChat nickname',
  avatar_url VARCHAR(255) DEFAULT '' COMMENT 'WeChat avatar URL',
  phone VARCHAR(20) DEFAULT '' COMMENT 'Phone number',
  real_name VARCHAR(50) DEFAULT '' COMMENT 'Real name',
  id_card VARCHAR(20) DEFAULT '' COMMENT 'ID card number',
  auth_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Authentication status: 0-unauthenticated, 1-authenticated, 2-failed',
  role TINYINT NOT NULL DEFAULT 0 COMMENT 'Role: 0-regular user, 1-admin',
  status TINYINT NOT NULL DEFAULT 1 COMMENT 'Status: 0-disabled, 1-active',
  register_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration time',
  last_login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Last login time',
  PRIMARY KEY (user_id),
  UNIQUE KEY idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Mini program session table
CREATE TABLE mp_session (
  session_id VARCHAR(64) NOT NULL COMMENT 'Session ID (token stored on mini program side)',
  user_id INT NOT NULL COMMENT 'Related user ID',
  openid VARCHAR(100) NOT NULL COMMENT 'WeChat openid',
  expire_time DATETIME NOT NULL COMMENT 'Session expiration time',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (session_id),
  UNIQUE KEY idx_user_id (user_id),
  INDEX idx_openid (openid),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES mp_user (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. User relation table
CREATE TABLE mp_user_relation (
  relation_id INT NOT NULL AUTO_INCREMENT COMMENT 'Relation ID',
  user_id INT NOT NULL COMMENT 'User ID',
  related_user_id INT NOT NULL COMMENT 'Related user ID',
  relation_type TINYINT NOT NULL COMMENT 'Relation type: 1-friend, 2-follow',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  PRIMARY KEY (relation_id),
  UNIQUE KEY idx_user_related_user (user_id, related_user_id),
  CONSTRAINT fk_relation_user FOREIGN KEY (user_id) REFERENCES mp_user (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_relation_related_user FOREIGN KEY (related_user_id) REFERENCES mp_user (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Digital business card table
CREATE TABLE mp_digital_card (
  card_id INT NOT NULL AUTO_INCREMENT COMMENT 'Card ID',
  user_id INT NOT NULL COMMENT 'Creator ID',
  card_name VARCHAR(100) NOT NULL COMMENT 'Card name',
  basic_info JSON NOT NULL COMMENT 'Basic information (JSON format)',
  card_status TINYINT DEFAULT 1 COMMENT 'Status: 0-draft, 1-published, 2-removed',
  view_count INT DEFAULT 0 COMMENT 'View count',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (card_id),
  INDEX idx_user_id (user_id),
  INDEX idx_card_status (card_status),
  CONSTRAINT fk_card_user FOREIGN KEY (user_id) REFERENCES mp_user (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Personal report table
CREATE TABLE mp_personal_report (
  report_id INT NOT NULL AUTO_INCREMENT COMMENT 'Report ID',
  user_id INT NOT NULL COMMENT 'User ID',
  report_content JSON NOT NULL COMMENT 'Report content (JSON format)',
  generate_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Generation time',
  PRIMARY KEY (report_id),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES mp_user (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Behavior log table
CREATE TABLE mp_behavior_log (
  log_id INT NOT NULL AUTO_INCREMENT COMMENT 'Log ID',
  user_id INT NULL COMMENT 'User ID (related when user operates)',
  visitor_id VARCHAR(100) DEFAULT '' COMMENT 'Visitor ID (generated for non-user access)',
  behavior_type TINYINT NOT NULL COMMENT 'Behavior type: 1-visit, 2-collect, 3-share',
  related_card_id INT NULL COMMENT 'Related card ID',
  behavior_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Behavior time',
  PRIMARY KEY (log_id),
  INDEX idx_user_id (user_id),
  INDEX idx_card_id (related_card_id),
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES mp_user (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_log_card FOREIGN KEY (related_card_id) REFERENCES mp_digital_card (card_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;