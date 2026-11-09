import { COMMANDS_ANCHOR } from "../../app/routes";
import { RELEASES } from "../../data/links";
import { RELEASE } from "../../data/releases";
import { useLanguage, useText } from "../../i18n/I18nProvider";
import { useOsDetection } from "../../shared/hooks/useOsDetection";
import { dateLabel } from "../../shared/lib/format";
import { AppDownloads } from "./components/AppDownloads";
import { CliDownloads } from "./components/CliDownloads";
import { CommandReference } from "./components/CommandReference";
import { TerminalInstall } from "./components/TerminalInstall";
import styles from "./Download.module.css";

const APPS_ANCHOR = "apps";
const TERMINAL_ANCHOR = "terminal";

export function Download() {
  const all = useText();
  const text = all.install;
  const language = useLanguage();
  const machine = useOsDetection();
  const sections = [
    [APPS_ANCHOR, text.sections.apps],
    [TERMINAL_ANCHOR, text.sections.terminal],
    [COMMANDS_ANCHOR, text.sections.commands],
  ] as const;
  return (
    <>
      <header className={styles.head}>
        <h1>{text.title}</h1>
        <p className="lead">
          {text.intro(RELEASE.version, dateLabel(RELEASE.published, language))}{" "}
          <a href={RELEASES}>{all.footer.releases}</a>
        </p>
        <nav className={styles.nav} aria-label={text.title}>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </header>
      <section id={APPS_ANCHOR} className={styles.section} aria-labelledby="apps-title">
        <h2 id="apps-title">{text.sections.apps}</h2>
        <p className="muted">{text.appsText}</p>
        <AppDownloads arch={machine.arch} />
      </section>
      <section id={TERMINAL_ANCHOR} className={styles.section} aria-labelledby="terminal-title">
        <h2 id="terminal-title">{text.sections.terminal}</h2>
        <p className="muted">{text.terminalText}</p>
        <TerminalInstall machine={machine} />
        <h3 className={styles.sub}>{text.cliTitle}</h3>
        <CliDownloads arch={machine.arch} />
      </section>
      <section id={COMMANDS_ANCHOR} className={styles.section} aria-labelledby="commands-title">
        <h2 id="commands-title">{text.sections.commands}</h2>
        <p className="muted">{text.commandsText}</p>
        <CommandReference />
      </section>
    </>
  );
}
