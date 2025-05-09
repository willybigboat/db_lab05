// queryExample.js
const { Student, Course, Enrollment } = require('./models');

async function findUngraded() {
  try {
    const results = await Enrollment.findAll({
      where: { Grade: null },
      include: [
        {
          model: Student,
          attributes: ['Student_ID', 'Name']
        },
        {
          model: Course,
          attributes: ['Course_ID', 'Title']
        }
      ]
    });

    console.log('未評分的選課記錄：');
    results.forEach(row => {
      // row.Student 與 row.Course 來自 include
      console.log(`學生：${row.Student.Name} (${row.Student.Student_ID}), 課程：${row.Course.Title} (${row.Course.Course_ID})`);
    });
  } catch (err) {
    console.error('查詢失敗：', err);
  }
}

findUngraded();
