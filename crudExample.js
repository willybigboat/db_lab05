// crudExample.js
const pool = require('./db');

async function basicCrud() {
    let conn;
    try {

        conn = await pool.getConnection();

        // 安全：使用參數化查詢
        const userInput = "S10811001";

        async function checkstudent(id) {
            const sql = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
            const bows = await conn.query(sql, [id]);
            return bows.length > 0;
        }
        // 1. INSERT 新增
        if (await checkstudent(userInput)) {
            console.log('該學生已存在，無法新增！');
        } else {
            let sql = 'INSERT INTO STUDENT (Student_ID, Name, Gender, Email, Department_ID) VALUES (?, ?, ?, ?, ?)';
            await conn.query(sql, ['S10810001', '王曉明', 'M', 'wang@example.com', 'CS001']);
            console.log('已新增一筆學生資料');
        }

        // 2. SELECT 查詢
        if (await checkstudent(userInput)) {
            sql = 'SELECT * FROM STUDENT WHERE Department_ID = ?';
            const rows = await conn.query(sql, ['CS001']);
            console.log('查詢結果：', rows);
        } else {
            console.log('查無學生資料');
        }

        // 3. UPDATE 更新
        if (await checkstudent(userInput)) {
            sql = 'UPDATE STUDENT SET Name = ? WHERE Student_ID = ?';
            await conn.query(sql, ['王小明', 'S10810001']);
            console.log('已更新學生名稱');
        } else {
            console.log('查無學生資料，無法更新');
        }


        // 4. DELETE 刪除
        if (await checkstudent(userInput)) {
        sql = 'DELETE FROM STUDENT WHERE Student_ID = ?';
        await conn.query(sql, ['S10810001']);
        console.log('已刪除該學生');
        } else {
        console.log('查無學生資料，無法刪除');
        }


    } catch (err) {
        console.error('操作失敗：', err);
    } finally {
        if (conn) conn.release();
    }
}

basicCrud();
