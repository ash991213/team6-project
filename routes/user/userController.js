const pool = require('../../models/db/db.js');
const { alertmove } = require('../../util/alertmove.js');

exports.join = (req,res)=>{
    res.render('user/join.html');
};

exports.joincheck = async (req,res)=>{
    const { body } = req;
    const conn = await pool.getConnection();
    try {
        const usertel = `${body.usertel1}-${body.usertel2}-${body.usertel3}`;
        const sql = `INSERT INTO user
                (userid, userpw, username, alias, birthdate, email, gender, mobile, tel)
                values
                ("${body.userid}", "${body.userpw}", "${body.username}", "${body.useralias}", "${body.userBirthYear}-${body.userBirthMonth}-${body.userBirthDay}", "${body.useremail}", "${body.usergender}",
                "${body.usermobile1}-${body.usermobile2}-${body.usermobile3}", "${body.usertel1}-${body.usertel2}-${body.usertel3}")`;
        const sql2 = `INSERT INTO user
                (userid, userpw, username, alias, birthdate, email, gender, mobile)
                values
                ("${body.userid}", "${body.userpw}", "${body.username}", "${body.useralias}", "${body.userBirthYear}-${body.userBirthMonth}-${body.userBirthDay}", "${body.useremail}", "${body.usergender}",
                "${body.usermobile1}-${body.usermobile2}-${body.usermobile3}")`;
        if ( usertel == undefined ) {
            await conn.query(sql);
        } else {
            await conn.query(sql2);
        };
    } catch (error){
        throw error;
    } finally {
        conn.release();
    }
    res.send(alertmove('/user/welcome','회원가입이 완료되었습니다.'));
}

exports.login = (req,res)=>{
    res.render('user/login.html')
};

exports.logincheck = async (req,res)=>{
    const conn = await pool.getConnection();
    try {
        const { userid,userpw } = req.body;
        const sql = `SELECT * FROM user WHERE userid = "${userid}"`
        let [result] = await conn.query(sql)
        if ( userid == result[0].userid ) {
            if ( userpw == result[0].userpw ) {
                if (result[0].isActive === 1) {
                    req.session.user = result[0];
                    res.redirect('/') 
                } else {
                    res.send(alertmove('/user/login','사용이 정지된 계정입니다.'))
                }
            } else {
                res.send(alertmove('/user/login','비밀번호가 일치하지 않습니다.'))
            }
        } else {
            res.send(alertmove('/user/login','아이디가 일치하지 않습니다.'))
        }
    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};

exports.logout = (req,res) => {
    req.session.destroy(() => {
        req.session;
    });
    res.send(alertmove('/','로그아웃이 완료되었습니다.'));
}

exports.profile = (req,res)=>{
    const { user } = req.session;
    res.render('user/profile', { user });
};

exports.profilecheck = (req,res)=>{
    res.send('hello world');
};

exports.quit = async (req,res)=>{
    const { body } = req;
    const conn = await pool.getConnection()
    try {
        const sql = `DELETE FORM user WHERE userid = "${ body.userid }"`
        await conn.query(sql)
    } catch (error){
        throw error;
    } finally {
        conn.release();
    }
    res.send(alertmove('/','회원탈퇴가 완료되었습니다.'));
};

exports.welcome = (req,res)=>{
    const { user } = req.session;
    res.render('user/welcome.html');
};
