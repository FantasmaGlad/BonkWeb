import commands from "./commands.json";
import { useLanguage, useText } from "./ui";

type Row = { flag: string; text: { en: string; fr: string } };

const anchor = (command: string) => command.replaceAll(" ", "-");

function Rows({ title, rows }: { title: string; rows: Row[] }) {
  const language = useLanguage();
  if (rows.length === 0) {
    return null;
  }
  return (
    <>
      <h3 className="label">{title}</h3>
      <dl className="rows">
        {rows.map((row) => (
          <div key={row.flag}>
            <dt>
              <code>{row.flag}</code>
            </dt>
            <dd>{row.text[language]}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function Docs() {
  const text = useText();
  const language = useLanguage();
  return (
    <>
      <header className="page-head">
        <h1>{text.commandsTitle}</h1>
        <p className="lead">{text.commandsIntro}</p>
      </header>
      <div className="docs">
        <nav className="docs-index" aria-label={text.commandsTitle}>
          <ul>
            {commands.commands.map((command) => (
              <li key={command.command}>
                <a className="docs-index-link" href={`#${anchor(command.command)}`}>
                  {command.command.replace(/^bonk /, "")}
                </a>
              </li>
            ))}
            <li>
              <a className="docs-index-link" href="#global">
                {text.globalTitle}
              </a>
            </li>
          </ul>
        </nav>
        <div className="docs-body">
          {commands.commands.map((command) => (
            <section
              key={command.command}
              id={anchor(command.command)}
              className="doc"
              aria-labelledby={`${anchor(command.command)}-title`}
            >
              <h2 id={`${anchor(command.command)}-title`}>
                <code>{command.command}</code>
              </h2>
              <p>{command.text[language]}</p>
              <Rows title={text.arguments} rows={command.args} />
              <Rows title={text.options} rows={command.options} />
            </section>
          ))}
          <section id="global" className="doc" aria-labelledby="global-title">
            <h2 id="global-title">{text.globalTitle}</h2>
            <Rows title={text.globalOptions} rows={commands.global} />
          </section>
        </div>
      </div>
    </>
  );
}
