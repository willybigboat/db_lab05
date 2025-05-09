// ormRelationTest.js
const { Student, Course, Department } = require('./models');

async function testRelations() {
    try {
        // 查詢學生及其所屬系所
        const student = await Student.findByPk('S10811002', {
            include: [Department]
        });

        console.log(`學生 ${student.Name} 屬於 ${student.Department.Name} 系`);

        // 查詢學生及其選修的所有課程
        const studentWithCourses = await Student.findByPk('S10811001', {
            include: [Course]
        });

        console.log(`${studentWithCourses.Name} 選修的課程：`);
        studentWithCourses.Courses.forEach(course => {
            console.log(`- ${course.Title} (${course.Credits} 學分)`);
        });

        // 查詢課程及其選修的學生
        const coursesInDept = await Course.findAll({
            where: {
                Department_ID: 'CS001'
            },
            include: [{
                model: Student, // <-- 包含關聯的學生模型
                through: { attributes: [] } // 在多對多關係中，通常只需要學生資訊，不需要中間表 Enrollment 的額外欄位
            }]
        });
        // 遍歷 findAll 返回的課程陣列
        coursesInDept.forEach(course => {
            console.log(`\n課程名稱: ${course.Title} (課程 ID: ${course.Course_ID})`); // 訪問每個課程的 Title
            console.log(`選修學生：`);
            // 遍歷這門課程關聯的學生陣列
            course.Students.forEach(student => {
                console.log(`- ${student.Name} (${student.Student_ID})`);
            });
        });

    } catch (err) {
        console.error('關聯查詢出錯：', err);
    }
}

testRelations();
