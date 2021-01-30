import { Client, Message, MessageReaction, PartialMessage } from "discord.js";

import { Logger } from "winston";
import { ParsedArgs, Opts } from "minimist";

export type PluginOptions = {
  client: Client;
  logger: Logger;
};

export type Plugin = (
  options: PluginOptions
) => {
  command?: {
    name: string;
    parserOptions?: Opts;

    handle: (
      parsedArgs: ParsedArgs,
      message: Message | PartialMessage
    ) => Promise<void>;
  };

  onMessage?: (message: Message | PartialMessage) => Promise<void>;
  onMessageReactionAdd?: (reaction: MessageReaction) => Promise<void>;
};

export function getPlugins(options: PluginOptions): ReturnType<Plugin>[] {
  return Object.entries(plugins).map(([name, plugin]) =>
    plugin({
      ...options,
      logger: options.logger.child({ plugin: name }),
    })
  );
}

// List plugins below.

import { ping } from "./ping";
import { time } from "./time";

const plugins: { [name: string]: Plugin } = { ping, time };
