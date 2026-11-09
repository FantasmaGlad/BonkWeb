import { useText } from "../../../i18n/I18nProvider";
import styles from "./Explainer.module.css";

type Item = { title: string; text: string };

function Items({ items, numbered }: { items: readonly Item[]; numbered?: boolean }) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className={styles.items} data-numbered={numbered || undefined}>
      {items.map((item) => (
        <li key={item.title}>
          <h3>{item.title}</h3>
          <p className="muted">{item.text}</p>
        </li>
      ))}
    </List>
  );
}

export function Explainer({ id }: { id: string }) {
  const text = useText();
  return (
    <>
      <section id={id} className={styles.section} aria-labelledby="how-title">
        <h2 id="how-title">{text.home.howTitle}</h2>
        <Items items={text.home.steps} numbered />
      </section>
      <section className={styles.section} aria-labelledby="guarantees-title">
        <h2 id="guarantees-title">{text.home.guaranteesTitle}</h2>
        <Items items={text.home.guarantees} />
      </section>
    </>
  );
}
