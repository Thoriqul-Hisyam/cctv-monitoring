export function buildHikvisionRtsp({
  ipAddress,
  port,
  username,
  password,
  channel,
}: {
  ipAddress: string;
  port: number;
  username?: string | null;
  password?: string | null;
  channel: number;
}) {
  if (!username || !password) return null;

  return `rtsp://${username}:${password}@${ipAddress}:${port}/Streaming/Channels/${channel}`;
}
