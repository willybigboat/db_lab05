// transferStudent.js
const { sequelize, Student, Course, Enrollment } = require('./models');

async function transferStudent(studentId, oldDeptId, newDeptId) {
  const t = await sequelize.transaction(); // 開始一個事務
  // 假設有個當前學期的 ID - 注意：實際應用需要根據系統規則確定當前學期
  const currentSemester = '112-1';
  try {
    console.log(`--- 處理學生 ${studentId} 從 ${oldDeptId} 轉到 ${newDeptId} 的轉系流程 ---`);

    // 1. 更新學生所屬系所
    console.log(`步驟 1: 更新學生系所為 ${newDeptId}`);
    await Student.update(
      { Department_ID: newDeptId },
      { where: { Student_ID: studentId }, transaction: t }
    );
    console.log(`學生 ${studentId} 的系所已更新。`);

    // 2. 標記舊系所開設課程的選課為「轉系退選」
    console.log(`\n步驟 2: 標記舊系所 (${oldDeptId}) 開設課程的選課狀態為「轉系退選」`);
    // 查詢舊系所開設的所有課程 ID (不再過濾 Is_Required)
    const oldDeptCourses = await Course.findAll({
      where: { Department_ID: oldDeptId }, // <-- 只根據舊系所 ID 過濾
      attributes: ['Course_ID'], // 只抓取 Course_ID
      transaction: t // 納入事務
    });
    const oldDeptCourseIds = oldDeptCourses.map(c => c.Course_ID); // 提取所有相關課程 ID

    if (oldDeptCourseIds.length > 0) {
      console.log(`找到舊系所 (${oldDeptId}) 開設的課程數量: ${oldDeptCourseIds.length}`);
      // 更新該學生在這些舊系所課程中的選課記錄狀態
      const updateCount = await Enrollment.update(
        { Status: '轉系退選' }, // 將狀態設為「轉系退選」
        {
          where: {
            Student_ID: studentId, // 指定學生
            Course_ID: oldDeptCourseIds, // 指定課程 ID 列表 (WHERE IN 語句)
            Semester_ID: currentSemester // 假定當前學期的
          },
          transaction: t // 納入事務
        }
      );
      console.log(`學生 ${studentId} 在舊系所課程中的 ${updateCount[0]} 筆選課記錄已更新為「轉系退選」。`);
    } else {
      console.log(`舊系所 (${oldDeptId}) 沒有找到開設的課程，跳過退選處理。`);
    }


    // 3. 為學生加選新系所開設的所有課程
    console.log(`\n步驟 3: 為學生加選新系所 (${newDeptId}) 開設的所有課程`);
    // 查詢新系所開設的所有課程 (不再過濾 Is_Required)
    const newDeptCourses = await Course.findAll({
      where: { Department_ID: newDeptId }, // <-- 只根據新系所 ID 過濾
      attributes: ['Course_ID', 'Title'], // 也獲取 Title 方便輸出
      transaction: t // 納入事務
    });


    console.log(`假定當前學期為 ${currentSemester}。`);

    if (newDeptCourses.length > 0) {
      console.log(`找到新系所 (${newDeptId}) 開設的課程數量: ${newDeptCourses.length}`);
      console.log("正在為學生加選新系所課程...");
      for (const course of newDeptCourses) {
        // 為學生創建新的選課記錄
        // 注意：這裡沒有檢查學生是否已經選過這門課。如果資料庫有唯一約束
        // (Student_ID, Course_ID, Semester_ID)，嘗試創建重複的記錄會拋錯，
        // 進而觸發事務回滾。
        const existingEnrollment = await Enrollment.findOne({
          where: {
            Student_ID: studentId,
            Course_ID: course.Course_ID,
            Semester_ID: currentSemester // <-- 檢查當前學期的選課
          },
          transaction: t // *** 重要：查詢也要在事務中進行 ***
        });

        if (existingEnrollment) {
          // 如果找到已存在的選課記錄，表示學生已經選了這門課
          console.log(`- 學生已選課程: ${course.Title} (${course.Course_ID}) 在學期 ${currentSemester}，跳過加選。`);
          // 你可以在這裡選擇是否根據 existingEnrollment.Status 進行其他處理，例如如果狀態是 '退選'，可能需要改回 '修課中'
          // 但為了先解決 UNIQUE 約束錯誤，這裡只是跳過創建
        } else {
          // *** 如果不存在選課記錄，才進行創建 ***
          try {
            await Enrollment.create({
              Student_ID: studentId,
              Course_ID: course.Course_ID,
              Semester_ID: currentSemester, // 指定學期
              Status: '轉系加選', // 設定狀態為「轉系加選」
              Enrollment_Date: new Date() // 記錄加選日期
            }, { transaction: t }); // 納入事務
            console.log(`- 成功加選課程: ${course.Title} (${course.Course_ID})`);
          } catch (createErr) {
            // 這裡可以根據 createErr 的類型判斷是否是重複選課錯誤
            // 如果是唯一約束錯誤，可以選擇跳過而不是讓整個事務回滾
            // 但在簡化版本且假設資料一致的情況下，就讓它拋錯觸發回滾
            console.error(`- 加選課程 ${course.Title} (${course.Course_ID}) 時發生錯誤: ${createErr.message}`);
            throw createErr; // 拋出錯誤以觸發外層 catch 和回滾
          }
        }
      }
      console.log("新系所課程加選處理完成。");
    } else {
      console.log(`新系所 (${newDeptId}) 沒有找到開設的課程，跳過加選處理。`);
    }


    // 如果以上所有操作都成功，提交事務
    await t.commit();
    console.log(`\n轉系處理成功：學生 ${studentId} 已從 ${oldDeptId} 轉到 ${newDeptId}`);

  } catch (err) {
    // 如果任何一個操作失敗，回滾整個事務
    await t.rollback();
    console.error('\n轉系處理失敗：', err);
    // 這裡可以根據 err 類型提供更友好的錯誤信息
  } finally {
    // 這裡可以執行一些清理工作，無論成功或失敗
    console.log("\n--- 轉系流程結束 ---");
  }
}

transferStudent('S10721001', 'ME001', 'CS001');
// 或者其他測試數據
// transferStudent('學生ID', '舊系ID', '新系ID');