import { createLogger, transports, format } from "winston";
import { Client, MessageEmbed, version } from "discord.js";
import { DateTime } from "luxon";
import * as minimist from "minimist";

import { sourceVersion, buildNumber, builtAt } from "../buildMeta.json";
import { name, description, homepage } from "../package.json";
import { DISCORD_BOT_TOKEN } from "./env";
import { Plugin, getPlugins } from "./plugins";

const baseLogger = createLogger({
  transports: [new transports.Console()],
  level: sourceVersion === "dev" ? "debug" : "info",
  format: format.combine(
    format.timestamp(),
    format.metadata({
      fillExcept: ["timestamp", "level", "plugin", "message"],
    }),
    format.json()
  ),
});

const logger = baseLogger.child({ plugin: "core" });

logger.info("Starting up", { sourceVersion, buildNumber, builtAt });

(async () => {
  const client = new Client({});

  let plugins: ReturnType<Plugin>[];

  client.on("ready", async () => {
    logger.info("Ready");

    plugins = getPlugins({ client, logger: baseLogger });
  });

  client.on("message", async (message) => {
    logger.info("Got message", { messageData: message });

    // prevent infinite loop
    if (message.author && message.author.id === client.user?.id) return;

    try {
      const commandPromises: Promise<any>[] = [];

      if (message.mentions.has(client.user!)) {
        const [_, command] = message.content.split(/\s+/);

        plugins.forEach((plugin) => {
          if (plugin.command) {
            if (command === plugin.command.name) {
              const parsedArgs = minimist(
                message.content.split(/\s+/).slice(2),
                { ...plugin.command.parserOptions }
              );

              commandPromises.push(plugin.command.handle(parsedArgs, message));
            }
          }
        });

        if (commandPromises.length === 0) {
          commandPromises.push(
            message.channel.send(
              new MessageEmbed({
                color: "#7289da",
                title: name,
                description,
                url: homepage,
                image: {
                  url: client.user?.avatarURL()!,
                },
                timestamp: new Date(),
                fields: [
                  {
                    name: "Build Number",
                    value: buildNumber,
                  },
                  {
                    name: "Built At",
                    value: DateTime.fromMillis(builtAt),
                  },
                  {
                    name: "Source Version",
                    value: sourceVersion,
                  },
                  {
                    name: "Node.js",
                    value: process.version,
                  },
                  {
                    name: "Discord.js",
                    value: version,
                  },
                  {
                    name: "Available Commands",
                    value: plugins
                      .flatMap((f) =>
                        f.command ? [`\`${f.command.name}\``] : []
                      )
                      .join(", "),
                  },
                ],
              })
            )
          );
        }
      }

      await Promise.all([
        ...commandPromises,
        ...plugins.flatMap((plugin) =>
          plugin.onMessage ? plugin.onMessage(message) : []
        ),
      ]);
    } catch (error) {
      logger.error("Error", error);
      await message.channel.send("```" + error + "```");
    }
  });

  client.on("messageReactionAdd", async (messageReaction) => {
    logger.info("Got messageReactionAdd", { messageReaction });

    await Promise.all(
      plugins.flatMap((c) =>
        c.onMessageReactionAdd ? [c.onMessageReactionAdd(messageReaction)] : []
      )
    );
  });

  client.on("error", (error) => {
    logger.error("Error", error);
    process.exit(1);
  });

  process.on("SIGTERM", () => {
    logger.info("Got SIGTERM");
    process.exit(0);
  });

  await client.login(DISCORD_BOT_TOKEN);
})().catch((error) => {
  logger.emerg("Emergency", { error });
  process.exit(1);
});
