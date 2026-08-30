CREATE TABLE users (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL,
 password VARCHAR(255) NOT NULL,
 role VARCHAR(30) NOT NULL DEFAULT 'USER',
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uk_users_email UNIQUE (email)
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE categories (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 description TEXT,
 icon VARCHAR(255),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uk_categories_name UNIQUE (name)
);

CREATE TABLE entrepreneurs (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT NOT NULL,
 category_id BIGINT NOT NULL,
 company_name VARCHAR(150) NOT NULL,
 description TEXT,
 phone VARCHAR(30),
 email VARCHAR(150),
 location VARCHAR(255),
 status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
 active BOOLEAN NOT NULL DEFAULT TRUE,
 rating FLOAT(53) NOT NULL DEFAULT 0.0,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uk_entrepreneurs_user UNIQUE (user_id),
 CONSTRAINT fk_entrepreneurs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 CONSTRAINT fk_entrepreneurs_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE INDEX idx_entrepreneurs_status ON entrepreneurs(status);
CREATE INDEX idx_entrepreneurs_category ON entrepreneurs(category_id);
