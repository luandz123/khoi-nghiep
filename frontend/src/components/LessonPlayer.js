import React, { useState } from 'react';

const lessonsData = [
  { id: 1, title: 'Giới thiệu', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false },
  { id: 2, title: 'Nội dung chính', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false },
  { id: 3, title: 'Kết luận', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false },
];

const LessonPlayer = () => {
  const [lessons, setLessons] = useState(lessonsData);
  const [currentLesson, setCurrentLesson] = useState(lessonsData[0]);

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
  };

  const markLessonComplete = () => {
    const updatedLessons = lessons.map((lesson) =>
      lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson
    );
    setLessons(updatedLessons);
    setCurrentLesson(updatedLessons.find((lesson) => lesson.id === currentLesson.id));
  };

  return (
    <div className="flex flex-col md:flex-row p-4">
      {/* Sidebar: Danh sách bài học */}
      <aside className="md:w-1/4 mb-4 md:mb-0 md:mr-4">
        <h2 className="text-xl font-semibold mb-3">Danh sách bài học</h2>
        <ul>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              className={`p-2 mb-2 border rounded cursor-pointer hover:bg-gray-100 ${
                currentLesson.id === lesson.id ? 'bg-gray-200' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{lesson.title}</span>
                {lesson.completed && <span className="text-green-600 text-sm">Đã hoàn thành</span>}
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Nội dung bài học */}
      <main className="md:w-3/4">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4">
          {currentLesson.title}
        </h1>
        <div className="mb-4">
          {/* Sử dụng thẻ video để phát video; có thể thay bằng nhúng YouTube nếu cần */}
          <video className="w-full max-h-96" controls>
            <source src={currentLesson.videoUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
        <button
          onClick={markLessonComplete}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Hoàn thành bài học
        </button>
      </main>
    </div>
  );
};

export default LessonPlayer;