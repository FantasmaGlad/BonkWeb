import { useText } from "../../../i18n/I18nProvider";
import { FirstScreen } from "../../../shared/components/FirstScreen";
import { DownloadCount } from "./DownloadCount";
import styles from "./Hero.module.css";
import { SmartDownload } from "./SmartDownload";

export function Hero({ next }: { next: string }) {
  const text = useText();
  return (
    <FirstScreen labelledBy="hero-title" next={next} nextLabel={text.home.catalogTitle}>
      <div className={styles.body}>
        <div className={styles.text}>
          <h1 id="hero-title">{text.home.title}</h1>
          <p className="lead">{text.home.lead}</p>
          <SmartDownload />
          <DownloadCount />
        </div>
        <img className={styles.art} src="/bonk.png" alt="" width="480" height="480" />
      </div>
    </FirstScreen>
  );
}
