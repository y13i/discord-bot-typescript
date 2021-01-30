function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;

  if (!value || value === "") {
    throw new Error(`Environment variable ${name} is not present.`);
  }

  return value;
}

export const DISCORD_BOT_TOKEN = getEnv("DISCORD_BOT_TOKEN");
