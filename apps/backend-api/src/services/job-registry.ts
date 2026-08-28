export type JobStatus = "processing" | "done" | "error";

type JobEntry<T = unknown> = {
  status: JobStatus;
  result?: T;
  error?: string;
  expiresAt: number;
};

const JOB_TTL_MS = 5 * 60 * 1000;

// Registro de tareas en memoria. Asume instancia única del backend.
const jobs = new Map<string, JobEntry<unknown>>();

function cleanup() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (job.expiresAt < now) jobs.delete(id);
  }
}

export function createJob<T>(runner: () => Promise<T>): {
  jobId: string;
  status: JobStatus;
} {
  cleanup();

  const jobId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const entry: JobEntry<unknown> = {
    status: "processing",
    expiresAt: Date.now() + JOB_TTL_MS,
  };
  jobs.set(jobId, entry);

  runner()
    .then((result) => {
      const current = jobs.get(jobId);
      if (!current) return;
      current.status = "done";
      current.result = result;
      current.expiresAt = Date.now() + JOB_TTL_MS;
    })
    .catch((error) => {
      const current = jobs.get(jobId);
      if (!current) return;
      current.status = "error";
      current.error = error instanceof Error ? error.message : "Error al generar";
      current.expiresAt = Date.now() + JOB_TTL_MS;
    });

  return { jobId, status: entry.status };
}

export function getJob<T>(jobId: string): JobEntry<T> | null {
  cleanup();
  const entry = jobs.get(jobId);
  if (!entry) return null;
  return entry as JobEntry<T>;
}
