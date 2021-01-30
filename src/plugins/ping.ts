import { Plugin } from ".";

export const ping: Plugin = () => ({
  onMessage: async (message) => {
    if (message.channel.type === "text" && message?.content?.match(/^ping$/)) {
      await message.channel.send("pong");
    }
  },
});
