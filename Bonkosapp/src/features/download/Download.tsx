import { COMMANDS_ANCHOR, PATHS } from "../../app/routes";
import { RELEASES } from "../../data/links";
import { RELEASE } from "../../data/releases";
import { useLanguage, useText } from "../../i18n/I18nProvider";
import { Breadcrumb } from "../../shared/components/Breadcrumb";
import { FirstScreen } from "../../shared/components/FirstScreen";
import { useOsDetection } from "../../shared/hooks/useOsDetection";
import { dateLabel } from "../../shared/lib/format";
import { AppDownloads } from "./components/AppDownloads";
import { CliOnly } from "./components/CliOnly";
import { CommandReference } from "./components/CommandReference";
import { TerminalInstall } from "./components/TerminalInstall";
import styles from "./Download.module.css";

const ANCHORS = {
  apps: "apps",
  terminal: "terminal",
  cli: "cli",
  commands: COMMANDS_ANCHOR,
} as const;
const ORDER = ["apps", "terminal", "cli", "commands"] as const;

export function Download() {
  const all = useText();
  const text = all.install;
  const language = useLanguage();
  const machine = useOsDetection();
  const title = (section: (typeof ORDER)[number]) => `${ANCHORS[section]}-title`;
  return (
    <>
      <FirstScreen labelledBy="download-title" next={ANCHORS.apps} nextLabel={text.sections.apps}>
        <Breadcrumb
          trail={[
            { label: "Bonk", to: PATHS.home },
            { label: `${all.nav.download}${all.nav.downloadMore}` },
          ]}
        />
        <h1 id="download-title">{text.title}</h1>
        <p className="lead">
          {text.intro(RELEASE.version, dateLabel(RELEASE.published, language))}{" "}
          <a href={RELEASES}>{all.footer.releases}</a>
        </p>
        <nav aria-label={text.title}>
          <ul className={styles.contents}>
            {ORDER.map((section) => (
              <li key={section}>
                <a href={`#${ANCHORS[section]}`}>
                  <strong>{text.sections[section]}</strong>
                  <span>{text.sectionTexts[section]}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </FirstScreen>
      <section id={ANCHORS.apps} className={styles.section} aria-labelledby={title("apps")}>
        <h2 id={title("apps")}>{text.sections.apps}</h2>
        <p className="muted">{text.appsText}</p>
        <AppDownloads arch={machine.arch} />
      </section>
      <section id={ANCHORS.terminal} className={styles.section} aria-labelledby={title("terminal")}>
        <h2 id={title("terminal")}>{text.sections.terminal}</h2>
        <p className="muted">{text.terminalText}</p>
        <TerminalInstall machine={machine} />
      </section>
      <section id={ANCHORS.cli} className={styles.section} aria-labelledby={title("cli")}>
        <h2 id={title("cli")}>{text.sections.cli}</h2>
        <p className="muted">{text.cliText}</p>
        <CliOnly arch={machine.arch} />
      </section>
      <section id={ANCHORS.commands} className={styles.section} aria-labelledby={title("commands")}>
        <h2 id={title("commands")}>{text.sections.commands}</h2>
        <p className="muted">{text.commandsText}</p>
        <CommandReference />
      </section>
    </>
  );
}
