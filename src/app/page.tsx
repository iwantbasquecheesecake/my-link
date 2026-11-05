export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <main className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center">
        {/* 아바타 / 이니셜 */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-3xl font-semibold shadow-inner mb-5">
          나린
        </div>

        {/* 이름 */}
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          임나린
        </h1>

        {/* 전공 / 태그 */}
        <span className="mt-2 inline-block px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full">
          공간정보시스템(GIS)
        </span>

        {/* 소개글 */}
        <p className="mt-4 text-sm leading-relaxed text-slate-600 break-keep">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다. 전공은 공간정보시스템(GIS)입니다.
        </p>
      </main>
    </div>
  );
}
