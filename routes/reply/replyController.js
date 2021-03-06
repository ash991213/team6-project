const pool = require('../../models/db/db.js');

exports.readReply = async (req, res) => {
  const { page, index } = req.query;
  const pageNum = Number(page);
  const readSql = `SELECT
  reply._id, reply.content, alias, linkedPosting, DATE_FORMAT(reply.date, '%Y-%m-%d') AS date
                    FROM reply
                    JOIN board
                    ON board._id = reply.linkedPosting
                    JOIN user
                    ON reply.author = user._id
                    WHERE linkedPosting = ${index}
                    ORDER BY reply._id DESC
                    LIMIT ${pageNum * 5},5`;
  const cntSql = `SELECT * FROM reply WHERE linkedPosting = ${index}`;
  const conn = await pool.getConnection();
  try {
    const [cnt] = await conn.query(cntSql);
    const lastPage = Math.ceil(cnt.length / 5);
    if (lastPage < pageNum) {
      res.send('false');
    } else {
      const [replyList] = await conn.query(readSql);
      res.render('reply/replyList.html', { replyList });
    }
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

exports.createReply = async (req, res) => {
  const { linkedPosting, replyContent } = req.body;
  const { admin, user } = req.session;
  let author = null;
  if (admin === undefined) {
    author = user._id;
  } else {
    author = admin._id;
  }
  const createSql = `INSERT INTO reply 
                    (content, author, linkedPosting, date)
                    VALUES
                    ('${replyContent}', '${author}', '${linkedPosting}', current_date())`;
  const readSql = `SELECT
                    reply._id, reply.content, alias, linkedPosting, DATE_FORMAT(reply.date, '%Y-%m-%d') AS date
                    FROM reply
                    JOIN board
                    ON board._id = reply.linkedPosting
                    JOIN user
                    ON reply.author = user._id
                    WHERE linkedPosting = ${linkedPosting}
                    ORDER BY reply._id DESC
                    LIMIT 5`;
  const countSql = `SELECT COUNT(*) AS replyCnt FROM reply WHERE linkedPosting = '${linkedPosting}'`;
  const conn = await pool.getConnection();
  try {
    await conn.query(createSql);
    const [replyList] = await conn.query(readSql);
    const [replyCnt] = await conn.query(countSql);
    const cnt = replyCnt[0].replyCnt;
    res.render('reply/replyList.html', { replyList, cnt });
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

exports.editGetReply = (req, res) => {
  res.send(true);
};

exports.editPostReply = async (req, res) => {
  const { replyId, editContent } = req.body;
  const conn = await pool.getConnection();

  const updateSql = `UPDATE reply 
                      SET content = '${editContent}'
                      WHERE _id = '${replyId}'`;
  const readSql = ` SELECT
                    reply._id, reply.content, alias, linkedPosting, DATE_FORMAT(reply.date, '%Y-%m-%d') AS date
                    FROM reply
                    JOIN board
                    ON board._id = reply.linkedPosting
                    JOIN user
                    ON reply.author = user._id
                    WHERE reply._id = ${replyId}
                    `;
  try {
    await conn.query(updateSql);
    const [result] = await conn.query(readSql);
    res.render('reply/replyEdit.html', { reply: result[0] });
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

exports.delReply = async (req, res) => {
  const { replyId } = req.body;
  const conn = await pool.getConnection();
  const delSql = `DELETE FROM reply WHERE _id = ${replyId}`;

  try {
    await conn.query(delSql);

    res.send(true);
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

exports.checkLogin = (req, res, next) => {
  const { user } = req.session;
  if (user === undefined) {
    res.send('error1');
  } else {
    next();
  }
};

exports.userCheck = async (req, res, next) => {
  const { user } = req.session;
  const { reply } = req.query;
  const conn = await pool.getConnection();
  const sql = `SELECT author FROM reply WHERE _id = '${reply}'`;
  try {
    const [result] = await conn.query(sql);
    if (result[0].author !== user._id) {
      res.send('error2');
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

exports.adminCheck = (req, res, next) => {
  const { admin } = req.session;

  if (admin !== undefined) {
    res.send('admin');
  } else {
    next();
  }
};
