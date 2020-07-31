const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.render('index', {
            userId: false,
            userNickname: false,
            title: '首页 - 老人机',
        });
        return true;
    }
    res.render('index', {
        userId: req.session.userId,
        userNickname: req.session.userNickname,
        title: '首页 - 老人机',
    });
});

router.get('/help', (req, res, next) => {
    res.render('help', {
        title: '使用说明 - 老人机',
        navtitle: '使用说明',
    });
});

module.exports = router;
