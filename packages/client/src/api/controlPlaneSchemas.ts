/**
 * Generated by @openapi-codegen
 *
 * @version 1.0
 */
export type OAuthResponseType = 'code';

export type OAuthScope = 'admin:all';

export type AuthorizationCodeResponse = {
  state?: string;
  redirectUri?: string;
  scopes?: OAuthScope[];
  clientId?: string;
  /**
   * @format date-time
   */
  expires?: string;
  code?: string;
};

export type AuthorizationCodeRequest = {
  state?: string;
  redirectUri?: string;
  scopes?: OAuthScope[];
  clientId: string;
  responseType: OAuthResponseType;
};

export type User = {
  /**
   * @format email
   */
  email: string;
  fullname: string;
  image: string;
};

/**
 * @pattern [a-zA-Z0-9_-~:]+
 */
export type UserID = string;

export type UserWithID = User & {
  id: UserID;
};

/**
 * @format date-time
 * @x-go-type string
 */
export type DateTime = string;

/**
 * @pattern [a-zA-Z0-9_\-~]*
 */
export type APIKeyName = string;

export type OAuthClientPublicDetails = {
  name?: string;
  description?: string;
  icon?: string;
  clientId: string;
};

export type OAuthClientID = string;

export type OAuthAccessToken = {
  token: string;
  scopes: string[];
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
  /**
   * @format date-time
   */
  expiresAt: string;
  clientId: string;
};

export type AccessToken = string;

/**
 * @pattern ^([a-zA-Z0-9][a-zA-Z0-9_\-~]+-)?[a-zA-Z0-9]{6}
 * @x-go-type auth.WorkspaceID
 */
export type WorkspaceID = string;

/**
 * @x-go-type auth.Role
 */
export type Role = 'owner' | 'maintainer';

export type WorkspacePlan = 'free' | 'pro';

export type WorkspaceMeta = {
  name: string;
  slug?: string;
};

export type Workspace = WorkspaceMeta & {
  id: WorkspaceID;
  memberCount: number;
  plan: WorkspacePlan;
};

export type WorkspaceSettings = {
  postgresEnabled: boolean;
  dedicatedClusters: boolean;
};

export type WorkspaceMember = {
  userId: UserID;
  fullname: string;
  /**
   * @format email
   */
  email: string;
  role: Role;
};

/**
 * @pattern [a-zA-Z0-9]+
 */
export type InviteID = string;

export type WorkspaceInvite = {
  inviteId: InviteID;
  /**
   * @format email
   */
  email: string;
  /**
   * @format date-time
   */
  expires: string;
  role: Role;
};

export type WorkspaceMembers = {
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
};

/**
 * @pattern ^ik_[a-zA-Z0-9]+
 */
export type InviteKey = string;

/**
 * Page size.
 *
 * @x-internal true
 * @default 25
 * @minimum 0
 */
export type PageSize = number;

/**
 * Page token
 *
 * @x-internal true
 * @maxLength 255
 * @minLength 24
 */
export type PageToken = string;

/**
 * @x-internal true
 * @pattern [a-zA-Z0-9_-~:]+
 */
export type ClusterID = string;

/**
 * @x-internal true
 */
export type ClusterShortMetadata = {
  id: ClusterID;
  state: string;
  region: string;
  name: string;
  /**
   * @format int64
   */
  branches: number;
};

/**
 * @x-internal true
 */
export type PageResponse = {
  size: number;
  hasMore: boolean;
  token?: string;
};

/**
 * @x-internal true
 */
export type ListClustersResponse = {
  clusters: ClusterShortMetadata[];
  page: PageResponse;
};

/**
 * @x-internal true
 */
export type AutoscalingConfig = {
  /**
   * @format double
   * @default 2
   */
  minCapacity?: number;
  /**
   * @format double
   * @default 16
   */
  maxCapacity?: number;
};

/**
 * @x-internal true
 */
export type WeeklyTimeWindow = {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  /**
   * @maximum 24
   * @minimum 0
   */
  hour: number;
  /**
   * @maximum 60
   * @minimum 0
   */
  minute: number;
  /**
   * @format float
   * @maximum 23.5
   * @minimum 0.5
   */
  duration: number;
};

/**
 * @x-internal true
 */
export type DailyTimeWindow = {
  /**
   * @maximum 24
   * @minimum 0
   */
  hour: number;
  /**
   * @maximum 60
   * @minimum 0
   */
  minute: number;
  /**
   * @format float
   */
  duration: number;
};

/**
 * @x-internal true
 */
export type MaintenanceConfig = {
  /**
   * @default false
   */
  autoMinorVersionUpgrade?: boolean;
  /**
   * @default false
   */
  applyImmediately?: boolean;
  maintenanceWindow?: WeeklyTimeWindow;
  backupWindow?: DailyTimeWindow;
};

/**
 * @x-internal true
 */
export type ClusterConfiguration = {
  engineVersion: string;
  instanceType: string;
  /**
   * @format int64
   */
  replicas?: number;
  /**
   * @format int64
   * @default 1
   * @maximum 3
   * @minimum 1
   */
  instanceCount?: number;
  /**
   * @default false
   */
  deletionProtection?: boolean;
  autoscaling?: AutoscalingConfig;
  maintenance?: MaintenanceConfig;
};

/**
 * @x-internal true
 */
export type ClusterCreateDetails = {
  /**
   * @minLength 1
   */
  region: string;
  /**
   * @maxLength 63
   * @minLength 1
   * @pattern [a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*
   */
  name: string;
  configuration: ClusterConfiguration;
};

/**
 * @x-internal true
 */
export type ClusterResponse = {
  state: string;
  clusterID: string;
};

/**
 * @x-internal true
 */
export type AutoscalingConfigResponse = {
  /**
   * @format double
   * @default 0.5
   */
  minCapacity: number;
  /**
   * @format double
   * @default 4
   */
  maxCapacity: number;
};

/**
 * @x-internal true
 */
export type MaintenanceConfigResponse = {
  /**
   * @default false
   */
  autoMinorVersionUpgrade: boolean;
  /**
   * @default false
   */
  applyImmediately: boolean;
  maintenanceWindow: WeeklyTimeWindow;
  backupWindow: DailyTimeWindow;
};

/**
 * @x-internal true
 */
export type ClusterConfigurationResponse = {
  engineVersion: string;
  instanceType: string;
  /**
   * @format int64
   */
  replicas: number;
  /**
   * @format int64
   */
  instanceCount: number;
  /**
   * @default false
   */
  deletionProtection: boolean;
  autoscaling?: AutoscalingConfigResponse;
  maintenance: MaintenanceConfigResponse;
};

/**
 * @x-internal true
 */
export type ClusterMetadata = {
  id: ClusterID;
  state: string;
  region: string;
  name: string;
  /**
   * @format int64
   */
  branches: number;
  configuration: ClusterConfigurationResponse;
};

/**
 * @x-internal true
 */
export type ClusterUpdateMetadata = {
  id: ClusterID;
  state: string;
};

/**
 * @x-internal true
 */
export type ClusterUpdateDetails = {
  /**
   * @pattern ^[Ss][Tt][Oo][Pp]|[Ss][Tt][Aa][Rr][Tt]$
   */
  command: string;
};

/**
 * Metadata of databases
 */
export type DatabaseMetadata = {
  /**
   * The machine-readable name of a database
   */
  name: string;
  /**
   * Region where this database is hosted
   */
  region: string;
  /**
   * The time this database was created
   */
  createdAt: DateTime;
  /**
   * @x-internal true
   */
  newMigrations?: boolean;
  /**
   * The default cluster ID where branches from this database reside. Value of 'shared-cluster' for branches in shared clusters.
   */
  defaultClusterID?: string;
  /**
   * The database is accessible via the Postgres protocol
   */
  postgresEnabled?: boolean;
  /**
   * Metadata about the database for display in Xata user interfaces
   */
  ui?: {
    /**
     * The user-selected color for this database across interfaces
     */
    color?: string;
  };
};

export type ListDatabasesResponse = {
  /**
   * A list of databases in a Xata workspace
   */
  databases: DatabaseMetadata[];
};

/**
 * @maxLength 255
 * @minLength 1
 * @pattern [a-zA-Z0-9_\-~]+
 */
export type DBName = string;

/**
 * @maxLength 255
 * @minLength 1
 * @pattern [a-zA-Z0-9_\-~]+
 */
export type BranchName = string;

/**
 * @example {"repository":"github.com/my/repository","branch":"feature-login","stage":"testing","labels":["epic-100"]}
 * @x-go-type xata.BranchMetadata
 */
export type BranchMetadata = {
  /**
   * @minLength 1
   */
  repository?: string;
  branch?: BranchName;
  /**
   * @minLength 1
   */
  stage?: string;
  labels?: string[];
};

export type MigrationStatus = 'completed' | 'pending' | 'failed';

/**
 * Github repository settings for this database (optional)
 */
export type DatabaseGithubSettings = {
  /**
   * Repository owner (user or organization)
   */
  owner: string;
  /**
   * Repository name
   */
  repo: string;
};

export type Region = {
  id: string;
  name: string;
};

export type ListRegionsResponse = {
  /**
   * A list of regions where databases can be created
   */
  regions: Region[];
};
