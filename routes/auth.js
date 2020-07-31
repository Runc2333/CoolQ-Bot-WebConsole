const express = require('express');
const router = express.Router();

// link page
router.get('/link', (req, res, next) => {
    res.render('link', {
        title: "验证您的身份 - 老人机"
    });
});

// logout
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).render('error', {
                message: 'Internal Server Error',
                status: 500,
                tips: '我们此时无法处理您的请求，请稍后再试一次.'
            });
        } else {
            res.redirect('/');
        }
    });
})

module.exports = router;
