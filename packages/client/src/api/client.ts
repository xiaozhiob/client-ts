import { defaultTrace, TraceFunction } from '../schema/tracing';
import { getAPIKey } from '../util/apiKey';
import { getFetchImplementation } from '../util/fetch';
import { isString } from '../util/lang';
import type * as Components from './components';
import type * as Types from './components';
import { operationsByTag } from './components';
import type { FetcherExtraProps, FetchImpl } from './fetcher';
import { getHostUrl, HostProvider } from './providers';
import type * as Responses from './responses';
import type * as Schemas from './schemas';

export type ApiExtraProps = Omit<FetcherExtraProps, 'endpoint'>;

export interface XataApiClientOptions {
  fetch?: FetchImpl;
  apiKey?: string;
  host?: HostProvider;
  trace?: TraceFunction;
}

export class XataApiClient {
  #extraProps: ApiExtraProps;
  #namespaces: Partial<{
    user: UserApi;
    authentication: AuthenticationApi;
    workspaces: WorkspaceApi;
    invites: InvitesApi;
    database: DatabaseApi;
    branches: BranchApi;
    migrations: MigrationsApi;
    migrationRequests: MigrationRequestsApi;
    tables: TableApi;
    records: RecordsApi;
    searchAndFilter: SearchAndFilterApi;
  }> = {};

  constructor(options: XataApiClientOptions = {}) {
    const provider = options.host ?? 'production';
    const apiKey = options.apiKey ?? getAPIKey();
    const trace = options.trace ?? defaultTrace;

    if (!apiKey) {
      throw new Error('Could not resolve a valid apiKey');
    }

    this.#extraProps = {
      apiUrl: getHostUrl(provider, 'main'),
      workspacesApiUrl: getHostUrl(provider, 'workspaces'),
      fetchImpl: getFetchImplementation(options.fetch),
      apiKey,
      trace
    };
  }

  public get user() {
    if (!this.#namespaces.user) this.#namespaces.user = new UserApi(this.#extraProps);
    return this.#namespaces.user;
  }

  public get authentication() {
    if (!this.#namespaces.authentication) this.#namespaces.authentication = new AuthenticationApi(this.#extraProps);
    return this.#namespaces.authentication;
  }

  public get workspaces() {
    if (!this.#namespaces.workspaces) this.#namespaces.workspaces = new WorkspaceApi(this.#extraProps);
    return this.#namespaces.workspaces;
  }

  public get invites() {
    if (!this.#namespaces.invites) this.#namespaces.invites = new InvitesApi(this.#extraProps);
    return this.#namespaces.invites;
  }

  public get database() {
    if (!this.#namespaces.database) this.#namespaces.database = new DatabaseApi(this.#extraProps);
    return this.#namespaces.database;
  }

  public get branches() {
    if (!this.#namespaces.branches) this.#namespaces.branches = new BranchApi(this.#extraProps);
    return this.#namespaces.branches;
  }

  public get migrations() {
    if (!this.#namespaces.migrations) this.#namespaces.migrations = new MigrationsApi(this.#extraProps);
    return this.#namespaces.migrations;
  }

  public get migrationRequests() {
    if (!this.#namespaces.migrationRequests)
      this.#namespaces.migrationRequests = new MigrationRequestsApi(this.#extraProps);
    return this.#namespaces.migrationRequests;
  }

  public get tables() {
    if (!this.#namespaces.tables) this.#namespaces.tables = new TableApi(this.#extraProps);
    return this.#namespaces.tables;
  }

  public get records() {
    if (!this.#namespaces.records) this.#namespaces.records = new RecordsApi(this.#extraProps);
    return this.#namespaces.records;
  }

  public get searchAndFilter() {
    if (!this.#namespaces.searchAndFilter) this.#namespaces.searchAndFilter = new SearchAndFilterApi(this.#extraProps);
    return this.#namespaces.searchAndFilter;
  }
}

class UserApi {
  constructor(private extraProps: ApiExtraProps) {}

  public getUser(): Promise<Schemas.UserWithID> {
    return operationsByTag.users.getUser({ ...this.extraProps });
  }

  public updateUser({ user }: { user: Schemas.User }): Promise<Schemas.UserWithID> {
    return operationsByTag.users.updateUser({ body: user, ...this.extraProps });
  }

  public deleteUser(): Promise<void> {
    return operationsByTag.users.deleteUser({ ...this.extraProps });
  }
}

class AuthenticationApi {
  constructor(private extraProps: ApiExtraProps) {}

  public getUserAPIKeys(): Promise<Types.GetUserAPIKeysResponse> {
    return operationsByTag.authentication.getUserAPIKeys({ ...this.extraProps });
  }

  public createUserAPIKey({ name }: { name: Schemas.APIKeyName }): Promise<Types.CreateUserAPIKeyResponse> {
    return operationsByTag.authentication.createUserAPIKey({
      pathParams: { keyName: name },
      ...this.extraProps
    });
  }

  public deleteUserAPIKey({ name }: { name: Schemas.APIKeyName }): Promise<void> {
    return operationsByTag.authentication.deleteUserAPIKey({
      pathParams: { keyName: name },
      ...this.extraProps
    });
  }
}

class WorkspaceApi {
  constructor(private extraProps: ApiExtraProps) {}

  public getWorkspacesList(): Promise<Types.GetWorkspacesListResponse> {
    return operationsByTag.workspaces.getWorkspacesList({ ...this.extraProps });
  }

  public createWorkspace({ data }: { data: Schemas.WorkspaceMeta }): Promise<Schemas.Workspace> {
    return operationsByTag.workspaces.createWorkspace({
      body: data,
      ...this.extraProps
    });
  }

  public getWorkspace({ workspace }: { workspace: Schemas.WorkspaceID }): Promise<Schemas.Workspace> {
    return operationsByTag.workspaces.getWorkspace({
      pathParams: { workspaceId: workspace },
      ...this.extraProps
    });
  }

  public updateWorkspace({
    workspace,
    update
  }: {
    workspace: Schemas.WorkspaceID;
    update: Schemas.WorkspaceMeta;
  }): Promise<Schemas.Workspace> {
    return operationsByTag.workspaces.updateWorkspace({
      pathParams: { workspaceId: workspace },
      body: update,
      ...this.extraProps
    });
  }

  public deleteWorkspace({ workspace }: { workspace: Schemas.WorkspaceID }): Promise<void> {
    return operationsByTag.workspaces.deleteWorkspace({
      pathParams: { workspaceId: workspace },
      ...this.extraProps
    });
  }

  public getWorkspaceMembersList({ workspace }: { workspace: Schemas.WorkspaceID }): Promise<Schemas.WorkspaceMembers> {
    return operationsByTag.workspaces.getWorkspaceMembersList({
      pathParams: { workspaceId: workspace },
      ...this.extraProps
    });
  }

  public updateWorkspaceMemberRole({
    workspace,
    user,
    role
  }: {
    workspace: Schemas.WorkspaceID;
    user: Schemas.UserID;
    role: Schemas.Role;
  }): Promise<void> {
    return operationsByTag.workspaces.updateWorkspaceMemberRole({
      pathParams: { workspaceId: workspace, userId: user },
      body: { role },
      ...this.extraProps
    });
  }

  public removeWorkspaceMember({
    workspace,
    user
  }: {
    workspace: Schemas.WorkspaceID;
    user: Schemas.UserID;
  }): Promise<void> {
    return operationsByTag.workspaces.removeWorkspaceMember({
      pathParams: { workspaceId: workspace, userId: user },
      ...this.extraProps
    });
  }
}

class InvitesApi {
  constructor(private extraProps: ApiExtraProps) {}

  public inviteWorkspaceMember({
    workspace,
    email,
    role
  }: {
    workspace: Schemas.WorkspaceID;
    email: string;
    role: Schemas.Role;
  }): Promise<Schemas.WorkspaceInvite> {
    return operationsByTag.invites.inviteWorkspaceMember({
      pathParams: { workspaceId: workspace },
      body: { email, role },
      ...this.extraProps
    });
  }

  public updateWorkspaceMemberInvite({
    workspace,
    invite,
    role
  }: {
    workspace: Schemas.WorkspaceID;
    invite: Schemas.InviteID;
    role: Schemas.Role;
  }): Promise<Schemas.WorkspaceInvite> {
    return operationsByTag.invites.updateWorkspaceMemberInvite({
      pathParams: { workspaceId: workspace, inviteId: invite },
      body: { role },
      ...this.extraProps
    });
  }

  public cancelWorkspaceMemberInvite({
    workspace,
    invite
  }: {
    workspace: Schemas.WorkspaceID;
    invite: Schemas.InviteID;
  }): Promise<void> {
    return operationsByTag.invites.cancelWorkspaceMemberInvite({
      pathParams: { workspaceId: workspace, inviteId: invite },
      ...this.extraProps
    });
  }

  public acceptWorkspaceMemberInvite({
    workspace,
    key
  }: {
    workspace: Schemas.WorkspaceID;
    key: Schemas.InviteKey;
  }): Promise<void> {
    return operationsByTag.invites.acceptWorkspaceMemberInvite({
      pathParams: { workspaceId: workspace, inviteKey: key },
      ...this.extraProps
    });
  }

  public resendWorkspaceMemberInvite({
    workspace,
    invite
  }: {
    workspace: Schemas.WorkspaceID;
    invite: Schemas.InviteID;
  }): Promise<void> {
    return operationsByTag.invites.resendWorkspaceMemberInvite({
      pathParams: { workspaceId: workspace, inviteId: invite },
      ...this.extraProps
    });
  }
}

class BranchApi {
  constructor(private extraProps: ApiExtraProps) {}

  public getBranchList({
    workspace,
    database
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
  }): Promise<Schemas.ListBranchesResponse> {
    return operationsByTag.branch.getBranchList({
      pathParams: { workspace, dbName: database },
      ...this.extraProps
    });
  }

  public getBranchDetails({
    workspace,
    database,
    branch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
  }): Promise<Schemas.DBBranch> {
    return operationsByTag.branch.getBranchDetails({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      ...this.extraProps
    });
  }

  public createBranch({
    workspace,
    database,
    branch,
    from,
    metadata
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    from?: string;
    metadata?: Schemas.BranchMetadata;
  }): Promise<Types.CreateBranchResponse> {
    return operationsByTag.branch.createBranch({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: { from, metadata },
      ...this.extraProps
    });
  }

  public deleteBranch({
    workspace,
    database,
    branch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
  }): Promise<Components.DeleteBranchResponse> {
    return operationsByTag.branch.deleteBranch({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      ...this.extraProps
    });
  }

  public updateBranchMetadata({
    workspace,
    database,
    branch,
    metadata
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    metadata: Schemas.BranchMetadata;
  }): Promise<void> {
    return operationsByTag.branch.updateBranchMetadata({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: metadata,
      ...this.extraProps
    });
  }

  public getBranchMetadata({
    workspace,
    database,
    branch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
  }): Promise<Schemas.BranchMetadata> {
    return operationsByTag.branch.getBranchMetadata({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      ...this.extraProps
    });
  }

  public getBranchStats({
    workspace,
    database,
    branch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
  }): Promise<Types.GetBranchStatsResponse> {
    return operationsByTag.branch.getBranchStats({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      ...this.extraProps
    });
  }

  public getGitBranchesMapping({
    workspace,
    database
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
  }): Promise<Schemas.ListGitBranchesResponse> {
    return operationsByTag.branch.getGitBranchesMapping({
      pathParams: { workspace, dbName: database },
      ...this.extraProps
    });
  }

  public addGitBranchesEntry({
    workspace,
    database,
    gitBranch,
    xataBranch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    gitBranch: string;
    xataBranch: Schemas.BranchName;
  }): Promise<Types.AddGitBranchesEntryResponse> {
    return operationsByTag.branch.addGitBranchesEntry({
      pathParams: { workspace, dbName: database },
      body: { gitBranch, xataBranch },
      ...this.extraProps
    });
  }

  public removeGitBranchesEntry({
    workspace,
    database,
    gitBranch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    gitBranch: string;
  }): Promise<void> {
    return operationsByTag.branch.removeGitBranchesEntry({
      pathParams: { workspace, dbName: database },
      queryParams: { gitBranch },
      ...this.extraProps
    });
  }

  public resolveBranch({
    workspace,
    database,
    gitBranch,
    fallbackBranch
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    gitBranch?: string;
    fallbackBranch?: string;
  }): Promise<Types.ResolveBranchResponse> {
    return operationsByTag.branch.resolveBranch({
      pathParams: { workspace, dbName: database },
      queryParams: { gitBranch, fallbackBranch },
      ...this.extraProps
    });
  }
}

class TableApi {
  constructor(private extraProps: ApiExtraProps) {}

  public createTable({
    workspace,
    database,
    branch,
    table
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
  }): Promise<Types.CreateTableResponse> {
    return operationsByTag.table.createTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      ...this.extraProps
    });
  }

  public deleteTable({
    workspace,
    database,
    branch,
    table
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
  }): Promise<Components.DeleteTableResponse> {
    return operationsByTag.table.deleteTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      ...this.extraProps
    });
  }

  public updateTable({
    workspace,
    database,
    branch,
    table,
    update
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    update: Types.UpdateTableRequestBody;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.table.updateTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: update,
      ...this.extraProps
    });
  }

  public getTableSchema({
    workspace,
    database,
    branch,
    table
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
  }): Promise<Types.GetTableSchemaResponse> {
    return operationsByTag.table.getTableSchema({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      ...this.extraProps
    });
  }

  public setTableSchema({
    workspace,
    database,
    branch,
    table,
    schema
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    schema: Types.SetTableSchemaRequestBody;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.table.setTableSchema({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: schema,
      ...this.extraProps
    });
  }

  public getTableColumns({
    workspace,
    database,
    branch,
    table
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
  }): Promise<Types.GetTableColumnsResponse> {
    return operationsByTag.table.getTableColumns({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      ...this.extraProps
    });
  }

  public addTableColumn({
    workspace,
    database,
    branch,
    table,
    column
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    column: Schemas.Column;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.table.addTableColumn({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: column,
      ...this.extraProps
    });
  }

  public getColumn({
    workspace,
    database,
    branch,
    table,
    column
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    column: Schemas.ColumnName;
  }): Promise<Schemas.Column> {
    return operationsByTag.table.getColumn({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, columnName: column },
      ...this.extraProps
    });
  }

  public updateColumn({
    workspace,
    database,
    branch,
    table,
    column,
    update
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    column: Schemas.ColumnName;
    update: Types.UpdateColumnRequestBody;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.table.updateColumn({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, columnName: column },
      body: update,
      ...this.extraProps
    });
  }

  public deleteColumn({
    workspace,
    database,
    branch,
    table,
    column
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    column: Schemas.ColumnName;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.table.deleteColumn({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, columnName: column },
      ...this.extraProps
    });
  }
}

class RecordsApi {
  constructor(private extraProps: ApiExtraProps) {}

  public insertRecord({
    workspace,
    database,
    branch,
    table,
    record,
    columns
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    record: Record<string, any>;
    columns?: Schemas.ColumnsProjection;
  }): Promise<Responses.RecordUpdateResponse> {
    return operationsByTag.records.insertRecord({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      queryParams: { columns },
      body: record,
      ...this.extraProps
    });
  }

  public getRecord({
    workspace,
    database,
    branch,
    table,
    id,
    columns
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    id: Schemas.RecordID;
    columns?: Schemas.ColumnsProjection;
  }): Promise<Schemas.XataRecord> {
    return operationsByTag.records.getRecord({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, recordId: id },
      queryParams: { columns },
      ...this.extraProps
    });
  }

  public insertRecordWithID({
    workspace,
    database,
    branch,
    table,
    id,
    record,
    columns,
    createOnly,
    ifVersion
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    id: Schemas.RecordID;
    record: Record<string, any>;
    columns?: Schemas.ColumnsProjection;
    createOnly?: boolean;
    ifVersion?: number;
  }): Promise<Responses.RecordUpdateResponse> {
    return operationsByTag.records.insertRecordWithID({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, recordId: id },
      queryParams: { columns, createOnly, ifVersion },
      body: record,
      ...this.extraProps
    });
  }

  public updateRecordWithID({
    workspace,
    database,
    branch,
    table,
    id,
    record,
    columns,
    ifVersion
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    id: Schemas.RecordID;
    record: Record<string, any>;
    columns?: Schemas.ColumnsProjection;
    ifVersion?: number;
  }): Promise<Responses.RecordUpdateResponse> {
    return operationsByTag.records.updateRecordWithID({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, recordId: id },
      queryParams: { columns, ifVersion },
      body: record,
      ...this.extraProps
    });
  }

  public upsertRecordWithID({
    workspace,
    database,
    branch,
    table,
    id,
    record,
    columns,
    ifVersion
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    id: Schemas.RecordID;
    record: Record<string, any>;
    columns?: Schemas.ColumnsProjection;
    ifVersion?: number;
  }): Promise<Responses.RecordUpdateResponse> {
    return operationsByTag.records.upsertRecordWithID({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, recordId: id },
      queryParams: { columns, ifVersion },
      body: record,
      ...this.extraProps
    });
  }

  public deleteRecord({
    workspace,
    database,
    branch,
    table,
    id,
    columns
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    id: Schemas.RecordID;
    columns?: Schemas.ColumnsProjection;
  }): Promise<Responses.RecordUpdateResponse> {
    return operationsByTag.records.deleteRecord({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table, recordId: id },
      queryParams: { columns },
      ...this.extraProps
    });
  }

  public bulkInsertTableRecords({
    workspace,
    database,
    branch,
    table,
    records,
    columns
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    records: Record<string, any>[];
    columns?: Schemas.ColumnsProjection;
  }): Promise<Responses.BulkInsertResponse> {
    return operationsByTag.records.bulkInsertTableRecords({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      queryParams: { columns },
      body: { records },
      ...this.extraProps
    });
  }
}

class SearchAndFilterApi {
  constructor(private extraProps: ApiExtraProps) {}

  public queryTable({
    workspace,
    database,
    branch,
    table,
    filter,
    sort,
    page,
    columns
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    filter?: Schemas.FilterExpression;
    sort?: Schemas.SortExpression;
    page?: Schemas.PageConfig;
    columns?: Schemas.ColumnsProjection;
  }): Promise<Responses.QueryResponse> {
    return operationsByTag.searchAndFilter.queryTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: { filter, sort, page, columns },
      ...this.extraProps
    });
  }

  public searchTable({
    workspace,
    database,
    branch,
    table,
    query,
    fuzziness,
    target,
    prefix,
    filter,
    highlight,
    boosters
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    query: string;
    fuzziness?: Schemas.FuzzinessExpression;
    target?: Schemas.TargetExpression;
    prefix?: Schemas.PrefixExpression;
    filter?: Schemas.FilterExpression;
    highlight?: Schemas.HighlightExpression;
    boosters?: Schemas.BoosterExpression[];
  }): Promise<Responses.SearchResponse> {
    return operationsByTag.searchAndFilter.searchTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: { query, fuzziness, target, prefix, filter, highlight, boosters },
      ...this.extraProps
    });
  }

  public searchBranch({
    workspace,
    database,
    branch,
    tables,
    query,
    fuzziness,
    prefix,
    highlight
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    tables?: (
      | string
      | {
          table: string;
          filter?: Schemas.FilterExpression;
          target?: Schemas.TargetExpression;
          boosters?: Schemas.BoosterExpression[];
        }
    )[];
    query: string;
    fuzziness?: Schemas.FuzzinessExpression;
    prefix?: Schemas.PrefixExpression;
    highlight?: Schemas.HighlightExpression;
  }): Promise<Responses.SearchResponse> {
    return operationsByTag.searchAndFilter.searchBranch({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: { tables, query, fuzziness, prefix, highlight },
      ...this.extraProps
    });
  }

  public summarizeTable({
    workspace,
    database,
    branch,
    table,
    filter,
    columns,
    summaries,
    sort,
    summariesFilter,
    page
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    filter?: Schemas.FilterExpression;
    columns?: Schemas.ColumnsProjection;
    summaries?: Schemas.SummaryExpressionList;
    sort?: Schemas.SortExpression;
    summariesFilter?: Schemas.FilterExpression;
    page?: { size?: number };
  }): Promise<Responses.SummarizeResponse> {
    return operationsByTag.searchAndFilter.summarizeTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: { filter, columns, summaries, sort, summariesFilter, page },
      ...this.extraProps
    });
  }

  public aggregateTable({
    workspace,
    database,
    branch,
    table,
    filter,
    aggs
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    table: Schemas.TableName;
    filter?: Schemas.FilterExpression;
    aggs?: Schemas.AggExpressionMap;
  }): Promise<Responses.AggResponse> {
    return operationsByTag.searchAndFilter.aggregateTable({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, tableName: table },
      body: { filter, aggs },
      ...this.extraProps
    });
  }
}

class MigrationRequestsApi {
  constructor(private extraProps: ApiExtraProps) {}

  public queryMigrationRequests({
    workspace,
    database,
    filter,
    sort,
    page,
    columns
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    filter?: Schemas.FilterExpression;
    sort?: Schemas.SortExpression;
    page?: Schemas.PageConfig;
    columns?: Schemas.ColumnsProjection;
  }): Promise<Components.QueryMigrationRequestsResponse> {
    return operationsByTag.migrationRequests.queryMigrationRequests({
      pathParams: { workspace, dbName: database },
      body: { filter, sort, page, columns },
      ...this.extraProps
    });
  }

  public createMigrationRequest({
    workspace,
    database,
    migration
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migration: Components.CreateMigrationRequestRequestBody;
  }): Promise<Components.CreateMigrationRequestResponse> {
    return operationsByTag.migrationRequests.createMigrationRequest({
      pathParams: { workspace, dbName: database },
      body: migration,
      ...this.extraProps
    });
  }

  public getMigrationRequest({
    workspace,
    database,
    migrationRequest
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migrationRequest: number;
  }): Promise<Schemas.MigrationRequest> {
    return operationsByTag.migrationRequests.getMigrationRequest({
      pathParams: { workspace, dbName: database, mrNumber: migrationRequest },
      ...this.extraProps
    });
  }

  public updateMigrationRequest({
    workspace,
    database,
    migrationRequest,
    update
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migrationRequest: number;
    update: Components.UpdateMigrationRequestRequestBody;
  }): Promise<void> {
    return operationsByTag.migrationRequests.updateMigrationRequest({
      pathParams: { workspace, dbName: database, mrNumber: migrationRequest },
      body: update,
      ...this.extraProps
    });
  }

  public listMigrationRequestsCommits({
    workspace,
    database,
    migrationRequest,
    page
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migrationRequest: number;
    page?: { after?: string; before?: string; size?: number };
  }): Promise<Components.ListMigrationRequestsCommitsResponse> {
    return operationsByTag.migrationRequests.listMigrationRequestsCommits({
      pathParams: { workspace, dbName: database, mrNumber: migrationRequest },
      body: { page },
      ...this.extraProps
    });
  }

  public compareMigrationRequest({
    workspace,
    database,
    migrationRequest
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migrationRequest: number;
  }): Promise<Responses.SchemaCompareResponse> {
    return operationsByTag.migrationRequests.compareMigrationRequest({
      pathParams: { workspace, dbName: database, mrNumber: migrationRequest },
      ...this.extraProps
    });
  }

  public getMigrationRequestIsMerged({
    workspace,
    database,
    migrationRequest
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migrationRequest: number;
  }): Promise<Components.GetMigrationRequestIsMergedResponse> {
    return operationsByTag.migrationRequests.getMigrationRequestIsMerged({
      pathParams: { workspace, dbName: database, mrNumber: migrationRequest },
      ...this.extraProps
    });
  }

  public mergeMigrationRequest({
    workspace,
    database,
    migrationRequest
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    migrationRequest: number;
  }): Promise<Schemas.Commit> {
    return operationsByTag.migrationRequests.mergeMigrationRequest({
      pathParams: { workspace, dbName: database, mrNumber: migrationRequest },
      ...this.extraProps
    });
  }
}

class MigrationsApi {
  constructor(private extraProps: ApiExtraProps) {}

  public getBranchMigrationHistory({
    workspace,
    database,
    branch,
    limit,
    startFrom
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    limit?: number;
    startFrom?: string;
  }): Promise<Types.GetBranchMigrationHistoryResponse> {
    return operationsByTag.migrations.getBranchMigrationHistory({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: { limit, startFrom },
      ...this.extraProps
    });
  }

  public getBranchMigrationPlan({
    workspace,
    database,
    branch,
    schema
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    schema: Schemas.Schema;
  }): Promise<Responses.BranchMigrationPlan> {
    return operationsByTag.migrations.getBranchMigrationPlan({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: schema,
      ...this.extraProps
    });
  }

  public executeBranchMigrationPlan({
    workspace,
    database,
    branch,
    plan
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    plan: Types.ExecuteBranchMigrationPlanRequestBody;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.migrations.executeBranchMigrationPlan({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: plan,
      ...this.extraProps
    });
  }

  public getBranchSchemaHistory({
    workspace,
    database,
    branch,
    page
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    page?: { after?: string; before?: string; size?: number };
  }): Promise<Types.GetBranchSchemaHistoryResponse> {
    return operationsByTag.migrations.getBranchSchemaHistory({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: { page },
      ...this.extraProps
    });
  }

  public compareBranchWithUserSchema({
    workspace,
    database,
    branch,
    schema
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    schema: Schemas.Schema;
  }): Promise<Responses.SchemaCompareResponse> {
    return operationsByTag.migrations.compareBranchWithUserSchema({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: { schema },
      ...this.extraProps
    });
  }

  public compareBranchSchemas({
    workspace,
    database,
    branch,
    compare,
    schema
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    compare: Schemas.BranchName;
    schema: Schemas.Schema;
  }): Promise<Responses.SchemaCompareResponse> {
    return operationsByTag.migrations.compareBranchSchemas({
      pathParams: { workspace, dbBranchName: `${database}:${branch}`, branchName: compare },
      body: { schema },
      ...this.extraProps
    });
  }

  public updateBranchSchema({
    workspace,
    database,
    branch,
    migration
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    migration: Schemas.Migration;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.migrations.updateBranchSchema({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: migration,
      ...this.extraProps
    });
  }

  public previewBranchSchemaEdit({
    workspace,
    database,
    branch,
    migration
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    migration: Schemas.Migration;
  }): Promise<Components.PreviewBranchSchemaEditResponse> {
    return operationsByTag.migrations.previewBranchSchemaEdit({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: migration,
      ...this.extraProps
    });
  }

  public applyBranchSchemaEdit({
    workspace,
    database,
    branch,
    edits
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    branch: Schemas.BranchName;
    edits: Schemas.SchemaEditScript;
  }): Promise<Responses.SchemaUpdateResponse> {
    return operationsByTag.migrations.applyBranchSchemaEdit({
      pathParams: { workspace, dbBranchName: `${database}:${branch}` },
      body: { edits },
      ...this.extraProps
    });
  }
}
class DatabaseApi {
  constructor(private extraProps: ApiExtraProps) {}

  public getDatabaseList({ workspace }: { workspace: Schemas.WorkspaceID }): Promise<Schemas.CPListDatabasesResponse> {
    return operationsByTag.databases.cPGetDatabaseList({
      pathParams: { workspaceId: workspace },
      ...this.extraProps
    });
  }

  public createDatabase({
    workspace,
    database,
    data
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    data: Components.CPCreateDatabaseRequestBody;
  }): Promise<Components.CreateDatabaseResponse> {
    return operationsByTag.databases.cPCreateDatabase({
      pathParams: { workspaceId: workspace, dbName: database },
      body: data,
      ...this.extraProps
    });
  }

  public deleteDatabase({
    workspace,
    database
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
  }): Promise<Components.CPDeleteDatabaseResponse> {
    return operationsByTag.databases.cPDeleteDatabase({
      pathParams: { workspaceId: workspace, dbName: database },
      ...this.extraProps
    });
  }

  public getDatabaseMetadata({
    workspace,
    database
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
  }): Promise<Schemas.CPDatabaseMetadata> {
    return operationsByTag.databases.cPGetCPDatabaseMetadata({
      pathParams: { workspaceId: workspace, dbName: database },
      ...this.extraProps
    });
  }

  public updateDatabaseMetadata({
    workspace,
    database,
    metadata
  }: {
    workspace: Schemas.WorkspaceID;
    database: Schemas.DBName;
    metadata: Schemas.DatabaseMetadata;
  }): Promise<Schemas.CPDatabaseMetadata> {
    return operationsByTag.databases.cPUpdateCPDatabaseMetadata({
      pathParams: { workspaceId: workspace, dbName: database },
      body: metadata,
      ...this.extraProps
    });
  }

  public listRegions({ workspace }: { workspace: Schemas.WorkspaceID }): Promise<Schemas.ListRegionsResponse> {
    return operationsByTag.databases.listRegions({
      pathParams: { workspaceId: workspace },
      ...this.extraProps
    });
  }
}
