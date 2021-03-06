const express = require('express');
const userRouter = require('./user/userRouter.js');
const boardRouter = require('./board/boardRouter.js');
const adminRouter = require('./admin/adminRouter.js');
const replyRouter = require('./reply/replyRouter.js');

const router = express.Router();

router.use('/board', boardRouter);
router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/reply', replyRouter);

router.get('/', (req, res) => {
  const main = 1;
  const { user, admin } = req.session;
  if (user !== undefined) {
    res.render('index.html', { user, main });
  } else if (admin !== undefined) {
    res.render('index.html', { admin, main });
  } else {
    res.render('index.html');
  }
});

module.exports = router;
