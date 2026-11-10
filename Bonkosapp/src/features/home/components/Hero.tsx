import { useText } from "../../../i18n/I18nProvider";
import { FirstScreen } from "../../../shared/components/FirstScreen";
import styles from "./Hero.module.css";
import { SmartDownload } from "./SmartDownload";

export function Hero({ next }: { next: string }) {
  const text = useText();
  return (
    <FirstScreen labelledBy="hero-title" next={next} nextLabel={text.home.scroll}>
      <div className={styles.body}>
        <div className={styles.text}>
          <h1 id="hero-title">{text.home.title}</h1>
          <p className="lead">{text.home.lead}</p>
          <SmartDownload />
        </div>
        <img className={styles.art} src="/bonk.png" alt="" width="377" height="471" />
      </div>
    </FirstScreen>
  );
}
