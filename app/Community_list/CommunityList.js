"use client";

import React, { useState, useEffect } from "react";
import Header2 from "@/components/Header2";
import Footer2 from "@/components/Footer2";
import styles from "@/styles/p-css/Community_list.module.css";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";



export default function CommunityList() {
    const tabs = ["강사후기", "멍스타그램", "그룹신청", "QnA"];
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "강사후기";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]); // 전체 글
    const [filteredItems, setFilteredItems] = useState([]); // 현재 탭에 맞는 글
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    // 상단 useState 추가
    const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
    const [sortOrder, setSortOrder] = useState("인기순"); // 정렬 상태


    // 정렬 클릭 함수
    const handleSortClick = (order) => {
        setSortOrder(order);

        // 정렬 적용
        const sorted = [...filteredItems];
        if (order === "인기순") {
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0)); // 예: 좋아요 기준
        } else if (order === "최신순") {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredItems(sorted);
        setCurrentPage(1); // 정렬 시 페이지 초기화
    };



    const router = useRouter();

    // 로그인 유저 불러오기
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/session", { cache: "no-store" });
                const data = await res.json();
                setUserId(data.user?.id || null);
            } catch (e) {
                console.error("세션 조회 실패:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // 전체 게시글 불러오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch("/api/community/community_list", {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("게시글 조회 실패");
                const data = await res.json();
                setItems(data.posts || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchPosts();
    }, []);

    // 탭 변경 / 검색어 변경 시 필터링
    useEffect(() => {
        const normalized = activeTab.replace(/\s/g, ""); // 공백 제거
        const filtered = items
            .filter((post) => post.category?.replace(/\s/g, "") === normalized)
            .filter((post) =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredItems(filtered);
        setCurrentPage(1); // 탭 또는 검색어 변경 시 페이지 초기화
    }, [activeTab, items, searchTerm]);

    // 한 페이지당 글 수
    const ITEMS_PER_PAGE =
        activeTab === "멍스타그램" || activeTab === "그룹신청" ? 8 : 10;

    // 현재 페이지 글
    const currentItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // 총 페이지 수
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    // 페이지 이동 함수
    const goPrevPage = () =>
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    const goNextPage = () =>
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));

    const handleWriteButtonClick = () => {
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        router.push("Community_write");
    };

    const handlePostClick = (postId) => {
        router.push(`/Community_post?id=${postId}`);
    };

    return (
        <>
            <Header2 />
            <div className={styles.wrapper}>
                {/* 제목 */}
                <div className={styles.titleLine_post}>
                    <div className={styles["line-left"]}></div>
                    <span className={styles.title}>커뮤니티</span>
                    <div className={styles["line-right"]}></div>
                </div>

                {/* 탭 메뉴 */}
                <div className={styles.tabMenu}>
                    {tabs.map((tab, i) => (
                        <span
                            key={i}
                            className={`${styles.tabItem} ${activeTab === tab ? styles.active : ""
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {i !== 0 && <span className={styles.separator}>|</span>} {tab}
                        </span>
                    ))}
                </div>

                {/* 검색 / 정렬 */}
                <div className={styles.filterRow}>
                    <div className={styles.sortBox}>
                        <span
                            className={sortOrder === "인기순" ? styles.active : ""}
                            onClick={() => handleSortClick("인기순")}
                            style={{ cursor: "pointer" }}
                        >
                            인기순
                        </span>
                        <span>|</span>
                        <span
                            className={sortOrder === "최신순" ? styles.active : ""}
                            onClick={() => handleSortClick("최신순")}
                            style={{ cursor: "pointer" }}
                        >
                            최신순
                        </span>
                    </div>
                    <div className={styles.searchArea}>
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="검색어를 입력해주세요."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className={styles.searchIcon} />
                        </div>
                    </div>
                </div>

                {/* 게시판 콘텐츠 */}
                {currentItems.length > 0 ? (
                    activeTab === "멍스타그램" || activeTab === "그룹신청" ? (
                        <div className={styles.grid}>
                            {currentItems.map((post, i) => (
                                <div
                                    key={i}
                                    className={styles.card}
                                    onClick={() => handlePostClick(post._id)}
                                >
                                    {post.images && post.images.length > 0 ? (
                                        <div className={styles.imageWrapper}>
                                            <img
                                                src={post.images[0]} // ✅ GitHub raw URL 그대로 사용
                                                alt={post.title}
                                                className={styles.thumbnail}
                                            />
                                            <div className={styles.titleOverlay}>{post.title}</div>
                                        </div>
                                    ) : (
                                        <div className={styles.noImageBox}>이미지 없음</div>
                                    )}

                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul className={styles.list}>
                            {currentItems.map((post, i) => (
                                <li key={i} onClick={() => handlePostClick(post._id)}>
                                    <span className={styles.text}>{post.title}</span>
                                    <span className={styles.date}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )
                ) : searchTerm.trim() ? (
                    <p className={styles.noPost}>검색결과가 없습니다.</p>
                ) : (
                    <p className={styles.noPost}>게시글이 없습니다.</p>
                )}

                {/* 하단 페이지네이션 & 작성 버튼 */}
                <div className={styles.paginationWrapper}>
                    <div className={styles.pagination}>
                        <span onClick={goPrevPage} style={{ cursor: "pointer" }}>
                            ←
                        </span>
                        <span>
                            {currentPage} / {totalPages}
                        </span>
                        <span onClick={goNextPage} style={{ cursor: "pointer" }}>
                            →
                        </span>
                    </div>
                    <button
                        className={styles.writeBtn}
                        onClick={handleWriteButtonClick}
                        disabled={loading}
                    >
                        {loading ? "로딩 중..." : "작성하기"}
                    </button>
                </div>
            </div>
            <Footer2 />
        </>
    );
}
