/** 사용자 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/** 팀 */
export interface Team {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

/** 프로젝트 */
export interface Project {
  id: string;
  name: string;
  teamId: string;
  visibility: 'private' | 'public';
}

/** 문서 */
export interface Document {
  id: string;
  title: string;
  projectId: string;
  creatorId: string;
  deletedAt: Date | null;
  publicLinkEnabled: boolean;
}

/** 팀 멤버십 */
export interface TeamMembership {
  userId: string;
  teamId: string;
  role: 'viewer' | 'editor' | 'admin';
}

/** 프로젝트 멤버십 */
export interface ProjectMembership {
  userId: string;
  projectId: string;
  role: 'viewer' | 'editor' | 'admin';
}
