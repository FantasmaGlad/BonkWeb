import type { ReactNode } from "react";
import { useText } from "../i18n/I18nProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Layout.module.css";

export function Layout({ children }: { children: ReactNode }) {
  const text = useText();
  return (
    <>
      <a className={styles.skip} href="#main">
        {text.skip}
      </a>
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
