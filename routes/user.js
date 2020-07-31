const processPath = process.cwd().replace(/\\/g, "/");//程序运行路径
const configFilePath = `${processPath}/config/config.json`;//配置文件路径
const fs = require("fs");//文件系统读写
const express = require('express');
const router = express.Router();
const mysql = require("mysql"); // mysql

// 读入固定配置
var configFile = fs.readFileSync(configFilePath);
try {
    var configFileObject = JSON.parse(configFile);
} catch (e) {
    log.write(`[${configFilePath}]解析失败，正在退出进程...`, "CONFIG API", "ERROR");
    process.exit();
}

// 连接远程数据库
const db = mysql.createConnection({
    host: configFileObject.MYSQL_HOST,
    user: configFileObject.MYSQL_USERNAME,
    password: configFileObject.MYSQL_PASSWORD,
    database: configFileObject.MYSQL_DATABASE
});
try {
    db.connect();
} catch (e) {
    log.write(`无法连接到远程数据库，正在退出进程...`, "CONFIG API", "ERROR");
    process.exit();
}

/* GET user Page */
router.get('/', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.redirect('/');
    }
    db.query(`SELECT * FROM group_members WHERE userId = ? ORDER BY groupId`, [
        req.session.userId
    ], (e, r, f) => {
        var group = [];
        var oCounter = 0;
        r.forEach((item) => {
            if (item.role === "owner") {
                group.unshift(item);
                oCounter++;
            } else if (item.role === "admin") {
                group.splice(oCounter, 0, item);
            } else {
                group.push(item);
            }
        })
        res.render('user', {
            title: "控制面板 - 老人机",
            group: group
        });
    });
});

router.get('/configureGroup', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.redirect('/');
        return;
    }
    if (typeof (req.query.groupId) === 'undefined') {
        res.redirect('/user');
        return;
    }
    db.query('SELECT * FROM `GROUP_LIST` WHERE `groupId` = ?', [
        req.query.groupId,
    ], (e, r, f) => {
        if (r.length > 0) {
            res.render('configureGroup', {
                title: `${r[0].groupName} - 老人机`,
                groupId: req.query.groupId,
                groupName: r[0].groupName,
            });
        } else {
            res.redirect('/user');
        }
    });
});

router.get('/configureGroup/status', (req, res, next) => {
    // if (typeof (req.session.userId) === "undefined") {
    //     res.redirect('/');
    //     return;
    // }
    // if (typeof (req.query.groupId) === 'undefined') {
    //     res.redirect('/user');
    //     return;
    // }
    db.query('SELECT * FROM `GROUP_LIST` WHERE `groupId` = ?', [
        req.query.groupId,
    ], (e, r, f) => {
        if (r.length > 0) {
            db.query('SELECT * FROM `message_capacity` WHERE `groupId` = ?', [
                req.query.groupId,
            ], (_e, rr, _f) => {
                res.render('status', {
                    title: `${r[0].groupName} - 老人机`,
                    navtitle: `运行状态`,
                    groupId: req.query.groupId,
                    groupName: r[0].groupName,
                    data: rr[0],
                });
            });
        } else {
            res.redirect('/user');
        }
    });
});

router.get('/configureGroup/pluginSwitch', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.redirect('/');
        return;
    }
    if (typeof (req.query.groupId) === 'undefined') {
        res.redirect('/user');
        return;
    }
    var tmp = {};
    db.query('SELECT * FROM `registry` WHERE `switchable` = true ORDER BY `alias`', (e, r, f) => {
        var pluginDefaultState = {};
        r.forEach((item) => {
            pluginDefaultState[item.plugin] = item.defaultState === "enable" ? 1 : 0;
        });
        db.query('SELECT * FROM `pluginswitch` WHERE `groupId` = ?', [
            req.query.groupId,
        ], (ee, rr, ff) => {
            var pluginState = pluginDefaultState;
            if (rr.length === 0) {
                db.query('DESC `pluginswitch`;', (eee, rrr, fff) => {
                    var fields = [];
                    rrr.forEach((item) => {
                        if (!/ID|groupId/.test(item.Field)) {
                            fields.push(item.Field);
                        }
                    });
                    db.query(`INSERT INTO \`pluginswitch\` (\`groupId\`, \`${fields.join('`, `')}\`) VALUES ('${req.query.groupId}', ${(new Array(fields.length)).join('0, ')}0);`, (eeee, rrrr, ffff) => {
                        if (eeee === null) {
                            res.render('pluginSwitch', {
                                title: `插件管理 - 老人机`,
                                groupId: req.query.groupId,
                                groupName: `插件管理`,
                                plugins: r,
                                pluginState: pluginState,
                            });
                        }
                    });
                });
            } else {
                Object.keys(rr[0]).forEach((plugin) => {
                    if (typeof (pluginState[plugin]) !== "undefined") {
                        pluginState[plugin] = pluginState[plugin] ^ rr[0][plugin];
                    }
                });
                res.render('pluginSwitch', {
                    title: `插件管理 - 老人机`,
                    groupId: req.query.groupId,
                    groupName: `插件管理`,
                    plugins: r,
                    pluginState: pluginState,
                });
            }
        });
    });
});

router.get('/configureGroup/pluginConfig', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.redirect('/');
        return;
    }
    if (typeof (req.query.groupId) === 'undefined') {
        res.redirect('/user');
        return;
    }
    db.query('SELECT * FROM `webconsole`', (_e, r) => {
        res.render('pluginConfig', {
            title: `插件配置 - 老人机`,
            groupId: req.query.groupId,
            plugins: r,
        });
    });
});

router.get('/configureGroup/pluginConfig/edit', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.redirect('/');
        return;
    }
    if (typeof (req.query.groupId) === 'undefined' || typeof (req.query.plugin) === 'undefined' || typeof (req.query.table) === 'undefined') {
        res.redirect('/user');
        return;
    }
    db.query('SELECT * FROM `webconsole` WHERE plugin = ?', [
        req.query.plugin,
    ], (_e, r, f) => {
        db.query(`SELECT * FROM \`${req.query.plugin}-${req.query.table}\` WHERE \`groupId\` = '${req.query.groupId}'`, (_e, rr, ff) => {
            res.render('editPluginConfig', {
                title: `${r[0].name} - 老人机`,
                navtitle: r[0].name,
                groupId: req.query.groupId,
                columns: JSON.parse(r[0].columns),
                data: rr,
            });
        });
    });
});

router.get('/configureGroup/pluginConfig/display', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        res.redirect('/');
        return;
    }
    if (typeof (req.query.groupId) === 'undefined' || typeof (req.query.plugin) === 'undefined' || typeof (req.query.table) === 'undefined') {
        res.redirect('/user');
        return;
    }
    db.query('SELECT * FROM `webconsole` WHERE plugin = ?', [
        req.query.plugin,
    ], (_e, r, f) => {
        db.query(`SELECT * FROM \`${req.query.plugin}-${req.query.table}\` WHERE \`groupId\` = '${req.query.groupId}'`, (_e, rr, ff) => {
            res.render('displayPluginConfig', {
                title: `${r[0].name} - 老人机`,
                navtitle: r[0].name,
                groupId: req.query.groupId,
                columns: JSON.parse(r[0].columns),
                data: rr,
            });
        });
    });
});

module.exports = router;
