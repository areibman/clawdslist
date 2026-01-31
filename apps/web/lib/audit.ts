export const auditLog = (event: string, payload: Record<string, unknown>) => {
  console.info(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      payload
    })
  );
};
