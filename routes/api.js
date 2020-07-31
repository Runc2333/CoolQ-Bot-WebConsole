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

function standardReturn(res, status, msg, data = null) {
    if (data === null) {
        res.status(200).json({
            status: status,
            msg: msg
        });
    } else {
        res.status(200).json({
            status: status,
            msg: msg,
            data: data
        });
    }
}

/* GET home page. */
router.get('/', (req, res, next) => {
    ress.status(200).json({
        status: 1,
        msg: 'Calling to unknown interface.'
    });
});

router.post('/performlink', (req, res, next) => {
    if (req.body.token === 'undefined') {
        standardReturn(res, 1, '缺少参数');
        return;
    }
    var tokenRegexp = new RegExp('(?<=#)[A-Z0-9]+(?=#)');
    var token = req.body.token.replace(/[\r\n]/g, "").match(tokenRegexp);
    if (token === null) {
        if (/^[A-Z0-9]+$/.test(req.body.token.replace(/[\r\n]/g, ""))) {
            token = req.body.token.replace(/[\r\n]/g, "");
        } else {
            standardReturn(res, 1, '未能识别令牌');
            return;
        }
    } else {
        token = token[0];
    }
    db.query('SELECT * FROM `token-global-token` WHERE `token` = ?', [
        token,
    ], (e, r, f) => {
        if (r.length === 0) {
            standardReturn(res, 1, '无效令牌');
        } else if (Math.round((new Date()).getTime() / 1000) > r[0].expire) {
            standardReturn(res, 1, '令牌已过期');
        } else if (r[0].used == true) {
            standardReturn(res, 1, '令牌已被使用过');
        } else {
            db.query('UPDATE `token-global-token` SET used = true WHERE `ID` = ?', [
                r[0].ID,
            ], (ee, rr, ff) => {
                if (ee === null) {
                    req.session.botnum = r[0].elderlyBotNum;
                    req.session.userId = r[0].userId;
                    req.session.userNickname = r[0].userNickname;
                    req.session.token = token;
                    standardReturn(res, 0, 'OK');
                } else {
                    standardReturn(res, 1, '数据库错误');
                }
            });
        }
    });
});


// 插件开关
router.post('/pluginswitch', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        standardReturn(res, 1, '登录态已失效');
        return;
    }
    if (typeof (req.body.groupId) === 'undefined' || typeof (req.body.plugin) === 'undefined' || typeof (req.body.state) === 'undefined') {
        standardReturn(res, 1, '缺少参数');
        return;
    }
    db.query('SELECT * FROM `GROUP_MEMBERS` WHERE `userId` = ? AND `groupId` = ?', [
        req.session.userId,
        req.body.groupId,
    ], (error, result) => {
        if (result.length === 0) {
            standardReturn(res, 1, '用户不存在于该群组');
            return;
        }
        if (result[0].role === 'member') {
            standardReturn(res, 1, '没有权限');
            return;
        }
        db.query('SELECT * FROM `registry` WHERE (`plugin` = ?) AND `switchable` = true;', [
            req.body.plugin,
        ], (e, r, f) => {
            if (r.length > 0) {
                var targetPlugin = r[0].plugin;
                db.query('SELECT * FROM `pluginswitch` WHERE `groupId` = ?;', [
                    req.body.groupId
                ], (ee, rr, ff) => {
                    if (rr.length === 0) {
                        db.query('DESC `pluginswitch`;', (eee, rrr, fff) => {
                            var fields = [];
                            rrr.forEach((item) => {
                                if (!/ID|groupId/.test(item.Field)) {
                                    fields.push(item.Field);
                                }
                            });
                            db.query(`INSERT INTO \`pluginswitch\` (\`groupId\`, \`${fields.join('`, `')}\`) VALUES ('${req.body.groupId}', ${(new Array(fields.length)).join('0, ')}0);`, (eeee, rrrr, ffff) => {
                                if (eeee === null) {
                                    if (req.body.state == 1) {
                                        db.query(`UPDATE \`pluginswitch\` SET \`${targetPlugin}\` = ? WHERE \`groupId\` = ?;`, [
                                            r[0].defaultState === "enable" ? false : true,
                                            req.body.groupId
                                        ]);
                                        standardReturn(res, 0, `已启用插件<${req.body.plugin}>`);
                                        return;
                                    } else {
                                        db.query(`UPDATE \`pluginswitch\` SET \`${targetPlugin}\` = ? WHERE \`groupId\` = ?;`, [
                                            r[0].defaultState === "enable" ? true : false,
                                            req.body.groupId
                                        ]);
                                        standardReturn(res, 0, `已停用插件<${req.body.plugin}>`);
                                        return;
                                    }
                                } else {
                                    standardReturn(res, 1, '数据库错误');
                                    return;
                                }
                            });
                        });
                    } else {
                        if (req.body.state == 1) {
                            db.query(`UPDATE \`pluginswitch\` SET \`${targetPlugin}\` = ? WHERE \`groupId\` = ?;`, [
                                r[0].defaultState === "enable" ? false : true,
                                req.body.groupId
                            ]);
                            standardReturn(res, 0, `已启用插件<${req.body.plugin}>`);
                            return;
                        } else {
                            db.query(`UPDATE \`pluginswitch\` SET \`${targetPlugin}\` = ? WHERE \`groupId\` = ?;`, [
                                r[0].defaultState === "enable" ? true : false,
                                req.body.groupId
                            ]);
                            standardReturn(res, 0, `已停用插件<${req.body.plugin}>`);
                            return;
                        }
                    }
                });
            } else {
                standardReturn(res, 1, '目标插件不存在');
                return;
            }
        });
    });
});

// 状态数据
router.post('/status', (req, res, next) => {
    if (typeof (req.session.userId) === "undefined") {
        standardReturn(res, 1, '登录态已失效');
        return;
    }
    if (typeof (req.body.groupId) === 'undefined') {
        standardReturn(res, 1, '缺少参数');
        return;
    }
    db.query('SELECT * FROM `message_capacity` WHERE `groupId` = ?', [
        req.body.groupId,
    ], (error, result) => {
        standardReturn(res, 0, `OK`, result[0]);
    });
});

module.exports = router;