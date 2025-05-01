// transactionExample.js
const pool = require('./db');

async function doTransaction() {
    let conn;
    try {
        const studentId = 'S10811001'; // 假設要查詢的學生ID
        conn = await pool.getConnection();
        await conn.beginTransaction(); // 開始交易

        async function checkstudent(id) {
            const sql = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
            const bows = await conn.query(sql, [id]);
            return bows.length > 0;
        }

        // 假設要同時將學生 'S10810005' 的系所由 CS001 換成 EE001
        if (await checkstudent(studentId)) {
            const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
            await conn.query(updateStudent, ['EE001', studentId]);
            await conn.commit();
            console.log('交易成功，已提交');
            const sql = 'SELECT Student_ID, Department_ID FROM STUDENT WHERE Student_ID = ?';
            const rows = await conn.query(sql, [studentId]);
            if (rows.length > 0) {
                console.log('學生最新系資訊：', rows[0]);
            } else {
                console.log('查無該學生');
            }
        } else {
            console.log('找不到該學生');
        }
        // 假設同時更新其他相關表格
        // 例如：更新學生選課表中的系所標記
        //const updateCourses = 'UPDATE ENROLLMENT SET Status = ? WHERE Student_ID = ?';
        //await conn.query(updateCourses, ['轉系', 'S10810005']);

        // 如果以上操作都成功，則提交交易
    } catch (err) {
        // 若有任何錯誤，回滾所有操作
        if (conn) await conn.rollback();
        console.error('交易失敗，已回滾：', err);
    } finally {
        if (conn) conn.release();
    }

    
}

doTransaction();
