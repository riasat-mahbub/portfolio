// OpenCode plugin for project-tracker
// Deployed by `tracker init` into .opencode/plugins/ per project.
// Can also be installed manually at ~/.config/opencode/plugins/.
//
// Depends on: tracker CLI (pip install -e /path/to/project-tracker-graph)

export const ProjectTrackerPlugin = async ({ client, $, worktree }) => {
  const trackerDir = process.env.TRACKER_DIR || "tracker";

  return {
    "session.created": async () => {
      try {
        await $`cd ${worktree} && tracker --tracker-dir ${trackerDir} rebuild && tracker --tracker-dir ${trackerDir} validate`.quiet();
      } catch {
        // tracker may not be initialized yet — skip silently
      }
    },

    "tool.execute.before": async (input, output) => {
      const writeTools = ["write", "edit", "apply_patch"];
      if (!writeTools.includes(input.tool)) return;

      const filePath = output.args?.filePath;
      if (!filePath) return;

      try {
        const result =
          await $`cd ${worktree} && tracker --tracker-dir ${trackerDir} affects ${filePath}`.quiet();
        const text = result.stdout.toString().trim();
        if (text && input.sessionId) {
          await client.session.prompt({
            path: { id: input.sessionId },
            body: {
              noReply: true,
              parts: [
                {
                  type: "text",
                  text: `\n## Tracker entries affecting ${filePath}\n\n${text}\n\nConsider updating these entries after your edit.`,
                },
              ],
            },
          });
        }
      } catch {
        // tracker might not be initialized
      }
    },

    "session.idle": async () => {
      try {
        await $`cd ${worktree} && tracker --tracker-dir ${trackerDir} rebuild && tracker --tracker-dir ${trackerDir} validate`.quiet();

        const status =
          await $`cd ${worktree} && git status --porcelain ${trackerDir}/`.quiet();
        const text = status.stdout.toString().trim();
        if (text) {
          await $`cd ${worktree} && git add ${trackerDir}/ && git commit -m "tracker: auto-sync [skip ci]"`.quiet();
        }
      } catch {
        // skip if tracker not available
      }
    },
  };
};
