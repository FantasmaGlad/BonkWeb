import { useText } from "../../../i18n/I18nProvider";
import styles from "./Hero.module.css";
import { SmartDownload } from "./SmartDownload";

export function Hero({ next }: { next: string }) {
  const text = useText();
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.body}>
        <div className={styles.text}>
          <h1 id="hero-title">{text.home.title}</h1>
          <p className="lead">{text.home.lead}</p>
          <SmartDownload />
        </div>
        <img className={styles.art} src="/bonk.png" alt="" width="377" height="471" />
      </div>
      <a className={styles.scroll} href={`#${next}`}>
        <span className="visually-hidden">{text.home.scroll}</span>
      </a>
    </section>
  );
}
