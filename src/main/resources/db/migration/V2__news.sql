CREATE TABLE news (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,

                      title VARCHAR(180) NOT NULL,
                      summary VARCHAR(500),
                      content TEXT NOT NULL,
                      image_url VARCHAR(500),

                      featured BOOLEAN NOT NULL DEFAULT FALSE,
                      status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      published_at TIMESTAMP NULL,

                      author_id BIGINT NOT NULL,

                      CONSTRAINT fk_news_author
                          FOREIGN KEY (author_id)
                              REFERENCES users(id)
);

CREATE INDEX idx_news_status
    ON news(status);

CREATE INDEX idx_news_published_at
    ON news(published_at);