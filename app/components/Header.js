"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ 추가
import styles from "@/styles/c-css/Header.module.css";

export default function Header({ openMenu }) {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState(null); // ✅ 로그인 사용자 상태 추가
  const searchBoxRef = useRef(null);
  const router = useRouter(); // ✅ 추가

  // ✅ 로그인 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error("세션 조회 실패", err);
      }
    };
    fetchUser();
  }, []);

  // 검색창 밖 클릭 시 검색창 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSearch = () => setShowSearch((prev) => !prev);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      sessionStorage.setItem("searchQuery", query);
      window.location.href = "/category1";
    }
  };

  // ✅ 로그아웃 함수
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout");
      if (!res.ok) throw new Error("로그아웃 실패");
      router.push("/login"); // 로그인 페이지로 이동
    } catch (err) {
      console.error(err);
      alert("로그아웃 중 오류 발생");
    }
  };

  return (
    <div className={styles.hdWrap}>
      <Link href="/">
        <img
          src="https://yuriyuri01.github.io/gaon_img/img/gaonlogo.png"
          alt="logo"
        />
      </Link>

      <div className={styles.hdMenucon}>
        <div className={styles.hdPersonal}>
          <span onClick={toggleSearch} className={styles.hdsearch}>검색</span>

          {user ? (
            <span onClick={handleLogout} style={{ cursor: "pointer" }}>로그아웃</span> // ✅ 로그인 상태면 로그아웃
          ) : (
            <Link href="/login">
              <span>로그인</span>
            </Link>
          )}

          <Link href="/cart2">
            <span>장바구니</span>
          </Link>
        </div>

        <div className={styles.hdMenu}>
          <div className={styles.hdSpanbox}>
            <Link href="/category1"><span>보호자</span></Link>
            <Link href="/category2"><span>자격증</span></Link>
            <Link href="/Community_list"><span>커뮤니티</span></Link>
          </div>

          <svg
            onClick={openMenu}
            style={{ cursor: "pointer" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M4 18q-.425 0-.712-.288T3 17t.288-.712T4 16h16q.425 0 .713.288T21 17t-.288.713T20 18zm0-5q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm0-5q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"
            />
          </svg>
        </div>
      </div>

      <div
        className={`${styles.searchBox} ${showSearch ? styles.show : ""}`}
        ref={searchBoxRef}
      >
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
        />
      </div>
    </div>
  );
}
