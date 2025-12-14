import styles from "@/styles/c-css/Mainbgvideo.module.css";

function Mainbgvideo() {
  return (
    <div id={styles["mbv-wrap"]}>
      <video src="https://yuriyuri01.github.io/gaon_img/video/mainbgvideo.mp4" autoPlay muted loop />
      <div className={styles.mbvBox}>
        <img
          src="https://yuriyuri01.github.io/gaon_img/img/logofront1.png"
          alt="logo"
        />
        <span>
          가온,
          <br />
          반려동물과 함께합니다.
        </span>
      </div>
    </div>
  );
}

export default Mainbgvideo;
