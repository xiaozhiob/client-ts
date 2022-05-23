import { FetcherExtraProps, FetchImpl } from './api/fetcher';
import { XataPlugin } from './plugins';
import { SchemaPlugin, SchemaPluginResult } from './schema';
import { BaseData } from './schema/record';
import { LinkDictionary } from './schema/repository';
import { SearchPlugin, SearchPluginResult } from './search';
import { getAPIKey } from './util/apiKey';
import { BranchStrategy, BranchStrategyOption, BranchStrategyValue, isBranchStrategyBuilder } from './util/branches';
import { getCurrentBranchName, getDatabaseURL } from './util/config';
import { getFetchImplementation } from './util/fetch';
import { AllRequired, StringKeys } from './util/types';

export type BaseClientOptions = {
  fetch?: FetchImpl;
  apiKey?: string;
  databaseURL?: string;
  branch?: BranchStrategyOption;
};

export const buildClient = <Plugins extends Record<string, XataPlugin> = {}>(plugins?: Plugins) =>
  class {
    #branch: BranchStrategyValue;
    db: SchemaPluginResult<any>;
    search: SearchPluginResult<any>;

    constructor(options: BaseClientOptions = {}, links?: LinkDictionary, tables?: string[]) {
      const safeOptions = this.#parseOptions(options);

      const db = new SchemaPlugin(links, tables).build({ getFetchProps: () => this.#getFetchProps(safeOptions) });
      const search = new SearchPlugin(db, links ?? {}).build({
        getFetchProps: () => this.#getFetchProps(safeOptions)
      });

      // We assign the namespaces after creating in case the user overrides the db plugin
      this.db = db;
      this.search = search;

      for (const [key, namespace] of Object.entries(plugins ?? {})) {
        if (!namespace) continue;
        const result = namespace.build({ getFetchProps: () => this.#getFetchProps(safeOptions) });

        if (result instanceof Promise) {
          void result.then((namespace: unknown) => {
            // @ts-ignore
            this[key] = namespace;
          });
        } else {
          // @ts-ignore
          this[key] = result;
        }
      }
    }

    #parseOptions(options?: BaseClientOptions) {
      const fetch = getFetchImplementation(options?.fetch);
      const databaseURL = options?.databaseURL || getDatabaseURL();
      const apiKey = options?.apiKey || getAPIKey();
      const branch = async () =>
        options?.branch
          ? await this.#evaluateBranch(options.branch)
          : await getCurrentBranchName({ apiKey, databaseURL, fetchImpl: options?.fetch });

      if (!databaseURL || !apiKey) {
        throw new Error('Options databaseURL and apiKey are required');
      }

      return { fetch, databaseURL, apiKey, branch };
    }

    async #getFetchProps({
      fetch,
      apiKey,
      databaseURL,
      branch
    }: AllRequired<BaseClientOptions>): Promise<FetcherExtraProps> {
      const branchValue = await this.#evaluateBranch(branch);
      if (!branchValue) throw new Error('Unable to resolve branch value');

      return {
        fetchImpl: fetch,
        apiKey,
        apiUrl: '',
        // Instead of using workspace and dbBranch, we inject a probably CNAME'd URL
        workspacesApiUrl: (path, params) => {
          const hasBranch = params.dbBranchName ?? params.branch;
          const newPath = path.replace(/^\/db\/[^/]+/, hasBranch ? `:${branchValue}` : '');
          return databaseURL + newPath;
        }
      };
    }

    async #evaluateBranch(param?: BranchStrategyOption): Promise<string | undefined> {
      if (this.#branch) return this.#branch;
      if (!param) return undefined;

      const strategies = Array.isArray(param) ? [...param] : [param];

      const evaluateBranch = async (strategy: BranchStrategy) => {
        return isBranchStrategyBuilder(strategy) ? await strategy() : strategy;
      };

      for await (const strategy of strategies) {
        const branch = await evaluateBranch(strategy);
        if (branch) {
          this.#branch = branch;
          return branch;
        }
      }
    }
  } as unknown as ClientConstructor<Plugins>;

export interface ClientConstructor<Plugins extends Record<string, XataPlugin>> {
  new <Schemas extends Record<string, BaseData>>(options?: Partial<BaseClientOptions>, links?: LinkDictionary): Omit<
    {
      db: Awaited<ReturnType<SchemaPlugin<Schemas>['build']>>;
      search: Awaited<ReturnType<SearchPlugin<Schemas>['build']>>;
    },
    keyof Plugins
  > & {
    [Key in StringKeys<NonNullable<Plugins>>]: Awaited<ReturnType<NonNullable<Plugins>[Key]['build']>>;
  };
}

export class BaseClient extends buildClient()<Record<string, any>> {}
