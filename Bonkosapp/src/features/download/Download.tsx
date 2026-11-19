import type { ReactNode } from "react";
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
      <Section section="apps" description={text.appsText}>
        <AppDownloads arch={machine.arch} />
      </Section>
      <Section section="terminal" description={text.terminalText}>
        <TerminalInstall machine={machine} />
      </Section>
      <Section section="cli" description={text.cliText}>
        <CliOnly arch={machine.arch} />
      </Section>
      <Section section="commands" description={text.commandsText}>
        <CommandReference />
      </Section>
    </>
  );
}

function Section({
  section,
  description,
  children,
}: {
  section: (typeof ORDER)[number];
  description: string;
  children: ReactNode;
}) {
  const text = useText().install;
  const title = `${ANCHORS[section]}-title`;
  return (
    <section id={ANCHORS[section]} className={styles.section} aria-labelledby={title}>
      <h2 id={title}>{text.sections[section]}</h2>
      <p className="muted">{description}</p>
      {children}
    </section>
  );
}
