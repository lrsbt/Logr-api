import db from "../db/index.ts";

const verifyProjectOwnership = (projectId: number, userId: number): boolean => {
  const project = db
    .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
    .get(projectId, userId);
  return !!project;
};

export default verifyProjectOwnership;
