import { DateTime } from "luxon";
import { MessageEmbed } from "discord.js";

import { Plugin } from ".";

export const time: Plugin = () => ({
  command: {
    name: "time",

    handle: async (parsedArgs, message) => {
      const dateTime = (() => {
        const now = DateTime.utc();

        if (
          parsedArgs._.length > 0 &&
          parsedArgs._[0].toString().match(/^\d+$/)
        ) {
          const parsedInt = parseInt(parsedArgs._[0]);

          if (Number.isInteger(parsedInt)) {
            return parsedInt > now.toSeconds() * Math.sqrt(1000)
              ? DateTime.fromMillis(parsedInt)
              : DateTime.fromSeconds(parsedInt);
          }
        }

        if (parsedArgs._[0]) {
          return DateTime.fromISO(parsedArgs._[0], { setZone: true });
        }

        return now;
      })();

      const zones = [
        "Asia/Tokyo",
        "Europe/Dublin",
        "America/Los_Angeles",
        parsedArgs["zone"],
      ].flatMap((z) => (z ? [z] : []));

      await message.channel.send(
        new MessageEmbed({
          title: "Time",
          fields: [
            {
              name: "timestamp (sec)",
              value: Math.round(dateTime.toSeconds()),
            },
            {
              name: "timestamp (ms)",
              value: dateTime.toMillis(),
            },
            {
              name: "UTC",
              value: dateTime.toISO(),
            },
            ...zones.flatMap((zone) =>
              zone
                ? [{ name: zone, value: dateTime.setZone(zone).toISO() }]
                : []
            ),
          ],
        })
      );
    },
  },
});
