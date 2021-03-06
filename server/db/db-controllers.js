const pool = require('./connection.js');

// Controllers
const insertItem = (client) => {
  const connection = client || pool;
  const text = 'INSERT INTO items DEFAULT VALUES;';
  return connection.query(text);
};

const insertReview = (client, data) => {
  const connection = client || pool;
  const values = [
    data.item_id,
    data.user_id,
    data.date,
    data.title,
    data.body,
    data.stars,
    data.fit,
    data.width,
    data.recommend,
  ];
  const text = `INSERT INTO reviews (
    item_id,
    user_id,
    date,
    title,
    body,
    stars,
    fit,
    width,
    recommend
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
  );`;
  return connection.query(text, values);
};

const insertUser = (client, data) => {
  const connection = client || pool;
  const values = [
    data.name,
    data.size,
    data.height,
    data.weight,
    data.age,
    data.location,
  ];
  const text = `INSERT INTO users (
    name,
    size,
    height,
    weight,
    age,
    location
  ) VALUES (
    $1, $2, $3, $4, $5, $6
  );`;
  return connection.query(text, values);
};

const insertFoundHelpful = (client, data) => {
  const connection = client || pool;
  const values = [data.review_id, data.user_id];
  const text = 'INSERT INTO found_helpful (review_id, user_id) VALUES ($1, $2);';
  return connection.query(text, values);
};

const getReviewData = (itemId, log = false) => {
  const responseData = {};
  const analyze = (log) ? 'EXPLAIN ANALYZE ' : '';
  return pool.query(`
      ${analyze}
      SELECT r.user_id, r.item_id, r.title, r.body, r.date, r.stars, r.fit, r.width, r.recommend,
      u.name, u.size, u.height, u.weight, u.age, u.location,
      (SELECT COUNT(*) FROM found_helpful h WHERE h.review_id = r.id) AS helpful,
      (SELECT COUNT(*) FROM reviews WHERE user_id = u.id ) AS number_of_reviews
      FROM reviews r
      LEFT JOIN users u
      ON u.id = r.user_id
      WHERE r.item_id = ${itemId}
    `)
    .then((reviewResults) => {
      const reviews = reviewResults.rows;
      responseData.reviews = reviews;
      return Promise.resolve(responseData);
    });
};

module.exports = {
  insertItem,
  insertReview,
  insertUser,
  insertFoundHelpful,
  getReviewData,
};
