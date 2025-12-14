"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header2 from "@/components/Header2";
import Footer2 from "@/components/Footer2";
import styles from "@/styles/p-css/Community_edit.module.css";

export default function EditClient({ postId }) {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("강사후기");
    const [images, setImages] = useState(Array(4).fill(null));     // 미리보기/파일명
    const [imageFiles, setImageFiles] = useState(Array(4).fill(null)); // 실제 업로드 파일
    const [removedImages, setRemovedImages] = useState([]);


    // 기존 게시글 불러오기
    useEffect(() => {
        if (!postId) return; // 새 글 모드로도 쓸 수 있게 가드

        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/community/getPost?id=${postId}`, { cache: "no-store" });
                if (!res.ok) throw new Error("게시글 조회 실패");
                const data = await res.json();
                const post = data.post;
                if (!post) {
                    alert("게시글이 존재하지 않습니다.");
                    router.push("/Community_list");
                    return;
                }

                setTitle(post.title || "");
                setContent(post.content || "");
                setCategory(post.category || "강사후기");

                const imgs = post.images || [];
                setImages(imgs.concat(Array(4 - imgs.length).fill(null)).slice(0, 4));
            } catch (err) {
                console.error(err);
                alert("게시글 불러오기 실패");
                router.push("/Community_list");
            }
        };
        fetchPost();
    }, [postId, router]);

    // 기존 getImageSrc 대체
    const getImageSrc = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;      // 깃허브 기존 이미지
        if (img.startsWith("data:")) return img;     // 새로 선택한 이미지 미리보기
        return `/uploads/${img}`;                    // 서버 업로드 이미지
    };




    // 이미지 선택
    const handleImageChange = (e, index) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const newFiles = [...imageFiles];
        newFiles[index] = file;
        setImageFiles(newFiles);

        const reader = new FileReader();
        reader.onloadend = () => {
            const newImages = [...images];
            newImages[index] = reader.result; // data URL 미리보기
            setImages(newImages);
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (index) => {
        const newImages = [...images];
        const removed = newImages[index];
        newImages[index] = null;
        setImages(newImages);

        const newFiles = [...imageFiles];
        newFiles[index] = null;
        setImageFiles(newFiles);

        // 기존 이미지였으면 removedImages에 추가
        if (typeof removed === "string" && !removed.startsWith("data:")) {
            setRemovedImages((prev) => [...prev, removed]);
        }
    };

    const renderImageBoxes = () =>
        images.map((img, index) => (
            <div
                key={index}
                className={`${styles.imageBox_edit} ${!img ? styles.addBox_edit : styles.filledBox_edit}`}
                onClick={() => !img && document.getElementById(`fileInputEdit-${index}`).click()}
            >
                {img ? (
                    <>
                        <img
                            src={getImageSrc(img)}   // 기존 조건 제거하고 getImageSrc 하나로 통합
                            alt={`preview-${index}`}
                        />


                        <button
                            type="button"
                            className={styles.deleteBtn_edit}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(index);
                            }}
                        >
                            −
                        </button>
                    </>
                ) : (
                    <span className={styles.plusSign_edit}>+</span>
                )}
                <input
                    id={`fileInputEdit-${index}`}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageChange(e, index)}
                />
            </div>
        ));

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        imageFiles.forEach((file) => file && formData.append("images", file));

        // 삭제한 이미지 보내기
        formData.append("removedImages", JSON.stringify(removedImages));

        const res = await fetch(`/api/community/community_edit?id=${postId}`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "수정 실패");
        alert("게시글 수정 완료!");
        router.push(`/Community_post?id=${postId}`);
    };


    return (
        <>
            <Header2 />
            <div className={styles.container_edit}>
                <div className={styles.titleBox_edit}>
                    <h2 className={styles.title_edit}>글 수정하기</h2>
                    <div className={styles.titleLine_edit}></div>
                </div>

                <div className={styles.formWrapper_edit}>
                    <div className={styles.inputRow_edit}>
                        <input
                            type="text"
                            placeholder="제목을 수정해주세요."
                            className={styles.titleInput_edit}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <select
                            className={styles.selectBox_edit}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>강사후기</option>
                            <option>멍스타그램</option>
                            <option>그룹신청</option>
                            <option>QnA</option>
                        </select>
                    </div>

                    <textarea
                        className={styles.textarea_edit}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div className={styles.imageUpload_edit}>{renderImageBoxes()}</div>

                    <button className={styles.submitBtn_edit} onClick={handleSubmit}>
                        수정 완료
                    </button>
                </div>
            </div>
            <Footer2 />
        </>
    );
}
