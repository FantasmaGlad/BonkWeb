import type { CommandEntry, CommandSet } from "../types/command";
import data from "./commands.json";

export const COMMANDS: CommandSet = data;

export const DISK_PLACEHOLDER = "<DISK>";
export const WRITE_COMMAND = "bonk disk write";
export const WRITE_TEMPLATE = `${WRITE_COMMAND} {disk} --image {image} --yes`;

/** The three steps from a blank drive to a written one; each line names its command entry. */
export const ESSENTIAL_FLOW: readonly { command: string; line: string }[] = [
  { command: "bonk disk list", line: "bonk disk list" },
  { command: "bonk catalog list", line: "bonk catalog list" },
  { command: WRITE_COMMAND, line: `${WRITE_COMMAND} ${DISK_PLACEHOLDER} --image <ID> --yes` },
];

export const REFERENCE_COMMANDS: readonly string[] = [
  "bonk disk list",
  "bonk catalog list",
  WRITE_COMMAND,
  "bonk disk info",
  "bonk disk verify",
  "bonk disk repair-gpt",
  "bonk cache list",
  "bonk cache clean",
];

/** Options shown first; every other one sits under "advanced". */
export const COMMON_FLAGS: readonly string[] = [
  "--image",
  "--yes",
  "--dry-run",
  "--json",
  "--sha256",
  "--all",
  "--family",
  "--arch",
  "--force",
];

export const commandNamed = (name: string): CommandEntry | undefined =>
  COMMANDS.commands.find((entry) => entry.command === name);

export const isCommonFlag = (flag: string): boolean =>
  COMMON_FLAGS.some((common) => flag.split(/[ ,=<[]+/).includes(common));
