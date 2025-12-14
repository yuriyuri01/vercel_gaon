// 'use server'는 기본, page.js는 서버 컴포넌트
import MembersClient from "./MembersClient";

export default async function Page({ searchParams }) {
  // searchParams는 Promise이므로 await
  const params = await searchParams;
  const isTeacher = (params?.role ?? "") === "teacher";

  return <MembersClient isTeacher={isTeacher} />;
}
