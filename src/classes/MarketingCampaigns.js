export default () => ({
  fromType: "static_number",
  from: null,
  name: "",
  description: "",
  segment: "",
  opens: "",
  clicks: [],
  templateMessage: "",
  // scheduleDateTime: "",
  chunkSize: 100,
  chunkPages: 1,
  chunls: [],
  autoSendChunksSequentiallyOnStart: false,
  millisecondsBetweenChunks: 0,
  scheduledChunks: {}, // Stores scheduled chunk info: { chunkIndex: { scheduledTime: Date, status: 'scheduled'|'sent', delayHours: Number, delayMinutes: Number } }
});
