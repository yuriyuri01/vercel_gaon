"use client";

import React, { useState, useEffect } from "react";
import Header2 from "@/components/Header2";
import Footer2 from "@/components/Footer2";
import styles from "@/styles/p-css/Community_write.module.css";
import { useRouter } from "next/navigation";

export default function CommunityWrite() {
  const [isMobile, setIsMobile] = useState(false);
  const [images, setImages] = useState(Array(4).fill(null));
  const [imageFiles, setImageFiles] = useState(Array(4).fill(null));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("강사후기");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 반응형 감지
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 375);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 세션에서 로그인 사용자 ID 가져오기
  // 세션에서 로그인 사용자 ID 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/session`);
        const data = await res.json();

        // 🔹 세션에 따라 정보 분기
        if (data.user) {
          // 예: data.user.provider === "kakao" or "google" (소셜로그인)
          if (data.user.provider && data.user.name) {
            setUserId(data.user.name); // 소셜로그인 → MongoDB의 name 사용
          } else {
            setUserId(data.user.id); // 일반 로그인 → 기존 id
          }
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.error("세션 조회 실패", err);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 이미지 선택/미리보기
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images];
      newImages[index] = reader.result; // Base64로 미리보기
      setImages(newImages);

      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);
    };
    reader.readAsDataURL(file);
  };

  const handleAddClick = (index) => document.getElementById(`fileInput-${index}`).click();
  const handleDelete = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
  };

  const renderImageBoxes = () =>
    images.map((img, i) => (
      <div
        key={i}
        className={`${styles.imageBox} ${!img ? styles.addBox : styles.filledBox}`}
        onClick={() => !img && handleAddClick(i)}
      >
        {img ? (
          <>
            <img src={img} alt={`preview-${i}`} />
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(i);
              }}
            >
              −
            </button>
          </>
        ) : (
          <span className={styles.plusSign}>+</span>
        )}
        <input
          id={`fileInput-${i}`}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleImageChange(e, i)}
        />
      </div>
    ));

  // 게시글 작성
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // 🔹 필수값 체크: 경고창(alert)으로 표시
    if (!title.trim() || !content.trim() || !userId) {
      alert("제목, 내용 작성은 필수입니다.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("userId", userId);
      formData.append("category", category);

      // 이미지 파일 추가
      imageFiles.forEach((file) => {
        if (file) formData.append("images", file);
      });

      const res = await fetch("/api/community/community_write", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "게시글 작성 실패");
      alert("게시글 작성 성공!");
      router.push(`/Community_list?tab=${encodeURIComponent(category)}`);

    } catch (err) {
      console.error(err);
      alert(err.message || "게시글 작성 중 오류 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header2 />
      <div className={styles.container}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>작성하기</h2>
          <div className={styles.titleLine}></div>
        </div>

        {!isMobile && (
          <>
            <div className={styles.profileBox}>
              <div className={styles.profileCircle}></div>
              <p className={styles.username}>
                {loading
                  ? "로딩 중..."
                  : userId
                    ? `${userId}님`
                    : "로그인 후 이용해주세요."}
              </p>
            </div>
            <div className={styles.formWrapper}>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  placeholder="제목을 입력해주세요."
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <select
                  className={styles.selectBox}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>게시판 선택</option>
                  <option>강사후기</option>
                  <option>멍스타그램</option>
                  <option>그룹신청</option>
                  <option>QnA</option>
                </select>
              </div>
              <textarea
                placeholder="내용을 입력해주세요."
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
              <div className={styles.imageUpload}>{renderImageBoxes()}</div>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </>
        )}

        {isMobile && (
          <>
            <div className={styles.mobileHeaderRow}>
              <div className={styles.profileBoxMobile}>
                <div className={styles.profileCircle}></div>
                <p className={styles.username}>
                  {loading
                    ? "로딩 중..."
                    : userId
                      ? `${userId}님`
                      : "로그인 후 이용해주세요."}
                </p>
              </div>
              <select
                className={styles.selectBoxMobile}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>게시판 선택</option>
                <option>강사후기</option>
                <option>멍스타그램</option>
                <option>그룹신청</option>
                <option>QnA</option>
              </select>
            </div>
            <div className={styles.formWrapper}>
              <input
                type="text"
                placeholder="제목을 입력해주세요."
                className={styles.titleInputMobile}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="내용을 입력해주세요."
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
              <div className={styles.imageUpload}>{renderImageBoxes()}</div>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </>
        )}
      </div>
      <Footer2 />
    </>
  );
}
