import { type KeyboardEvent, useState } from "react";
import { CLI_FAMILIES, downloadUrl, FAMILIES, type Family, VERSION } from "./downloads";
import {
  HEADLESS_INSTALL,
  HEADLESS_INSTALL_WINDOWS,
  HEADLESS_REMOVE,
  HEADLESS_REMOVE_WINDOWS,
  MANAGERS,
} from "./install";
import { MANAGER_OF } from "./machine";
import { RELEASES } from "./text";
import { Command, useLanguage, useText } from "./ui";
import { useMachine } from "./useMachine";

function Logos({ names }: { names: readonly string[] }) {
  return (
    <span className="logos">
      {names.map((logo) => (
        <img key={logo} src={`/logos/${logo}.png`} alt="" width="28" height="28" />
      ))}
    </span>
  );
}

export function Families({ families }: { families: readonly Family[] }) {
  const text = useText();
  return (
    <ul className="download-grid">
      {families.map((family) => (
        <li key={family.id} className="download-card">
          <Logos names={family.logos} />
          <h3 id={family.id}>{family.name}</h3>
          {family.writes ? null : (
            <p className="hint">{family.id === "android" ? text.androidBeta : text.preview}</p>
          )}
          <p className="actions">
            {family.files.map(({ arch, format, file }) => (
              <a key={file} className="button secondary small" href={downloadUrl(file)}>
                {arch} <small>{format}</small>
              </a>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Tabs of the WAI-ARIA pattern: arrows move between managers, Tab goes into the panel. */
function Managers() {
  const text = useText();
  const language = useLanguage();
  const machine = useMachine();
  const preferred =
    machine.os === "linux"
      ? MANAGER_OF[machine.distro]
      : machine.os === "macos"
        ? "brew"
        : machine.os === "windows"
          ? "scoop"
          : "";
  const [chosen, setChosen] = useState<string | null>(null);
  const selected = chosen ?? (MANAGERS.some((m) => m.id === preferred) ? preferred : "apt");
  const manager = MANAGERS.find((candidate) => candidate.id === selected) ?? MANAGERS[0];

  const move = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = MANAGERS.findIndex((candidate) => candidate.id === selected);
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step) {
      const next = MANAGERS[(index + step + MANAGERS.length) % MANAGERS.length];
      if (next) {
        setChosen(next.id);
        document.getElementById(`tab-${next.id}`)?.focus();
      }
    }
  };

  if (!manager) {
    return null;
  }
  return (
    <>
      <div className="tabs" role="tablist" aria-label={text.managersTitle}>
        {MANAGERS.map((candidate) => (
          <button
            key={candidate.id}
            id={`tab-${candidate.id}`}
            type="button"
            role="tab"
            aria-selected={candidate.id === selected}
            aria-controls="manager-panel"
            tabIndex={candidate.id === selected ? 0 : -1}
            onClick={() => setChosen(candidate.id)}
            onKeyDown={move}
          >
            {candidate.name.split(":")[0]}
          </button>
        ))}
      </div>
      <div
        id="manager-panel"
        className="panel"
        role="tabpanel"
        aria-labelledby={`tab-${manager.id}`}
      >
        <p className="panel-head">
          <Logos names={manager.logos} />
          <strong>{manager.name.split(": ")[1] ?? manager.name}</strong>
        </p>
        {manager.note ? <p className="hint">{manager.note[language]}</p> : null}
        <h3 className="label">{text.installStep}</h3>
        <Command value={manager.install} />
        <h3 className="label">{text.cliStep}</h3>
        <Command value={manager.cli} />
        <h3 className="label">{text.updateStep}</h3>
        <Command value={manager.update} />
        <h3 className="label">{text.removeStep}</h3>
        <Command value={manager.remove} />
      </div>
    </>
  );
}

export function Install() {
  const text = useText();
  return (
    <>
      <header className="page-head">
        <h1>{text.installTitle}</h1>
        <p className="lead">{text.installIntro(VERSION)}</p>
      </header>
      <section className="block" aria-labelledby="files">
        <h2 id="files">{text.filesTitle}</h2>
        <Families families={FAMILIES} />
      </section>
      <section className="block" aria-labelledby="managers">
        <h2 id="managers">{text.managersTitle}</h2>
        <Managers />
      </section>
      <section className="block" aria-labelledby="headless">
        <h2 id="headless">{text.scriptTitle}</h2>
        <p className="muted">{text.scriptText}</p>
        <h3 className="label">{text.installStep}</h3>
        <Command value={HEADLESS_INSTALL} />
        <Command value={HEADLESS_INSTALL_WINDOWS} />
        <h3 className="label">{text.removeStep}</h3>
        <Command value={HEADLESS_REMOVE} />
        <Command value={HEADLESS_REMOVE_WINDOWS} />
      </section>
      <section className="block" aria-labelledby="cli">
        <h2 id="cli">{text.cliFilesTitle}</h2>
        <Families families={CLI_FAMILIES} />
        <p className="links">
          <a href={RELEASES}>{text.allReleases}</a>
        </p>
      </section>
    </>
  );
}
