import { Config } from '@oclif/core';
import fetch from 'node-fetch';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { clearEnvVariables } from '../utils.test.js';
import prompts from 'prompts';
import { randomUUID } from 'crypto';
import { Schemas } from '@xata.io/client';
import * as fs from 'fs/promises';
import { Dirent } from 'fs';
import Push from './index.js';

vi.mock('prompts');
vi.mock('node-fetch');
vi.mock('fs/promises');

clearEnvVariables();

beforeEach(() => {
  process.env.XATA_API_KEY = '1234abcdef';
  process.env.XATA_BRANCH = 'main';
});

const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
const promptsMock = prompts as unknown as ReturnType<typeof vi.fn>;

const REGION = 'us-east-1';
const baseUrl = `https://test-1234.${REGION}.xata.sh/db/db1:main`;

const baseFetch = (url: string, request: any) => {
  if (url === 'https://api.xata.io/workspaces' && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        workspaces: [{ id: 'test-1234', name: 'test-1234' }]
      })
    };
  } else if (url === 'https://api.xata.io/workspaces/test-1234/dbs' && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        databases: [{ name: 'db1', region: REGION }]
      })
    };
  } else if (url === `${baseUrl}` && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({ schema: { tables: [{ name: 'table1', columns: [{ name: 'a', type: 'string' }] }] } })
    };
  } else if (url === `${baseUrl}/schema/push` && request.method === 'POST') {
    return {
      ok: true,
      json: async () => ({
        migrationID: staticMigrationId,
        parentMigrationID: staticMigration.parentID,
        status: 'completed'
      })
    };
  } else if (url === `${baseUrl}/pgroll/apply` && request.method === 'POST') {
    return {
      ok: true,
      json: async () => ({
        jobID: '1234'
      })
    };
  } else if (url === `https://test-1234.us-east-1.xata.sh/db/db1:main/schema` && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        schema: {
          name: 'bb_hmtsb6hnd552p1rencda7oo3eg_3hae5b',
          tables: {
            table1: {
              oid: '747164',
              name: 'table1',
              comment: '',
              columns: {
                a: {
                  name: 'a',
                  type: 'string',
                  default: null,
                  nullable: true,
                  unique: false,
                  comment: ''
                },
                xata_createdat: {
                  name: '_createdat',
                  type: 'timestamptz',
                  default: 'now()',
                  nullable: false,
                  unique: false,
                  comment: ''
                },
                xata_id: {
                  name: '_id',
                  type: 'text',
                  default: null,
                  nullable: false,
                  unique: true,
                  comment: ''
                },
                xata_updatedat: {
                  name: '_updatedat',
                  type: 'timestamptz',
                  default: 'now()',
                  nullable: false,
                  unique: false,
                  comment: ''
                },
                xata_version: {
                  name: '_version',
                  type: 'integer',
                  default: '0',
                  nullable: false,
                  unique: false,
                  comment: ''
                }
              },
              indexes: {},
              primaryKey: ['xata_id'],
              foreignKeys: null,
              checkConstraints: null,
              uniqueConstraints: null
            }
          }
        }
      })
    };
  }

  throw new Error(`Unexpected fetch request: ${url} ${request.method}`);
};

const staticMigrationId = 'mig_ce3lg2hp3o0em98s8r50';
const staticMigration: Schemas.MigrationObject = {
  id: staticMigrationId,
  parentID: 'mig_ce3lfvhp3o0em98s8r40',
  checksum: '1:92d84ef84afc56e2152fd48d098d1b7ef4328217eadd5db6b3f646ac94a1a5ad',
  operations: [
    {
      addColumn: {
        column: {
          name: 'test',
          type: 'string'
        },
        table: 'test'
      }
    }
  ]
};

const staticMigrationTwo = {
  id: `mig_${randomUUID()}`,
  parentID: `mig_${randomUUID()}`,
  checksum: `1:${randomUUID()}`,
  operations: [
    {
      addColumn: {
        column: {
          name: 'test',
          type: 'string'
        },
        table: 'test'
      }
    }
  ]
} as Schemas.MigrationObject;

const fetchEmpty = (url: string, request: any) => {
  if (url === `${baseUrl}/schema/history` && request.method === 'POST') {
    return {
      ok: true,
      json: async () => ({
        meta: {
          cursor: 1,
          more: false
        },
        logs: []
      })
    };
  } else {
    return baseFetch(url, request);
  }
};

const fetchSingle = (url: string, request: any) => {
  if (url === `${baseUrl}/schema/history` && request.method === 'POST') {
    return {
      ok: true,
      json: async () => ({
        meta: {
          cursor: 1,
          more: false
        },
        logs: [staticMigration]
      })
    };
  } else {
    return baseFetch(url, request);
  }
};

const staticMigrationPgRollName = 'mig_cmkjcdrj7c92neg7lnmg';
const staticMigrationPgRollResponse = {
  migrations: [
    {
      done: false,
      migration: `{"name": "${staticMigrationPgRollName}", "operations": [{"drop_column": {"down": "", "table": "tester", "column": "Firstname"}}]}`,
      migrationType: 'pgroll',
      name: staticMigrationPgRollName,
      parent: 'mig_cmkjccmg1th0of00f5n0',
      startedAt: '2024-01-18T14:31:20.795975Z'
    }
  ]
};

const staticMigrationPgRollTwoName = 'mig_abcdcdrj7c92neg7lefg';
const staticMigrationPgRollTwo = {
  done: false,
  migration: `{"name": "${staticMigrationPgRollTwoName}", "operations": [{"drop_column": {"up": "", "table": "tester", "column": "Firstname"}}]}`,
  migrationType: 'pgroll',
  name: staticMigrationPgRollTwoName,
  parent: 'mig_cmkjccmg1th0of00f5n0',
  startedAt: '2024-01-18T14:31:20.795975Z'
};

const pgrollFetchSingle = (url: string, request: any) => {
  if (url === `${baseUrl}` && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        usePgRoll: true,
        schema: { tables: [{ name: 'table1', columns: [{ name: 'a', type: 'string' }] }] }
      })
    };
  } else if (url === `${baseUrl}/pgroll/migrations` && request.method === 'GET') {
    return {
      ok: true,
      json: async () => staticMigrationPgRollResponse
    };
  } else {
    return baseFetch(url, request);
  }
};

const pgrollFetchEmpty = (url: string, request: any) => {
  if (url === `${baseUrl}` && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        usePgRoll: true,
        schema: { tables: [{ name: 'table1', columns: [{ name: 'a', type: 'string' }] }] }
      })
    };
  } else if (url === `${baseUrl}/pgroll/migrations` && request.method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        migrations: []
      })
    };
  } else {
    return baseFetch(url, request);
  }
};

promptsMock.mockReturnValue({ confirm: true, database: 'db1', workspace: 'test-1234' });

describe('push', () => {
  describe('for Xata 1.0 branches', () => {
    test('pushes migrations remotely if there are none', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [staticMigrationId as unknown as Dirent]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigration));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => staticMigrationId);
      fetchMock.mockImplementation(fetchEmpty);
      await command.run();
      expect(log).toHaveBeenCalledWith('Pushed 1 migrations to main');
    });

    test('combines new local migrations with existing remote migrations', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [
        staticMigrationTwo.id as unknown as Dirent,
        staticMigrationId as unknown as Dirent
      ]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigrationTwo));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigration));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => staticMigrationTwo.id + '\n' + staticMigrationId);
      fetchMock.mockImplementation(fetchSingle);
      await command.run();
      expect(log).toHaveBeenCalledWith('Pushed 1 migrations to main');
    });

    test('does not push migrations rempte if they already exist', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [staticMigrationId as unknown as Dirent]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigration));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => staticMigrationId);
      fetchMock.mockImplementation(fetchSingle);
      await command.run();
      expect(log).toHaveBeenCalledWith('No new migrations to push');
    });
  });

  describe('for Xata 2.0 branches', () => {
    test('prompts user to run a xata pull -f if there current migrations are not in pgroll format', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [staticMigrationId as unknown as Dirent]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigration));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => staticMigrationId);
      fetchMock.mockImplementation(pgrollFetchSingle);
      await command.run();
      expect(log).toHaveBeenCalledWith('Please run xata pull -f to convert all migrations to pgroll format');
    });

    test('pushes migrations remotely if there are none', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [staticMigrationPgRollName as unknown as Dirent]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
        JSON.stringify(staticMigrationPgRollResponse.migrations[0])
      );
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => staticMigrationPgRollName);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
        JSON.stringify(staticMigrationPgRollResponse.migrations[0])
      );
      fetchMock.mockImplementation(pgrollFetchEmpty);
      await command.run();
      expect(log).toHaveBeenCalledWith('Pushed 1 migrations to main');
    });

    test('combines new local migrations with existing remote migrations', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [
        staticMigrationPgRollName as unknown as Dirent,
        staticMigrationPgRollTwoName as unknown as Dirent
      ]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(
        async () => staticMigrationPgRollName + '\n' + staticMigrationPgRollTwoName
      );
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigrationPgRollTwo));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
        JSON.stringify(staticMigrationPgRollResponse.migrations[0])
      );
      vi.spyOn(fs, 'readFile').mockImplementationOnce(
        async () => staticMigrationPgRollName + '\n' + staticMigrationPgRollTwoName
      );
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => JSON.stringify(staticMigrationPgRollTwo));
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
        JSON.stringify(staticMigrationPgRollResponse.migrations[0])
      );
      fetchMock.mockImplementation(pgrollFetchSingle);
      await command.run();
      expect(log).toHaveBeenCalledWith('Pushed 1 migrations to main');
    });

    test('does not push migrations remote if they already exist', async () => {
      const config = await Config.load();
      const command = new Push(['main'], config);
      const log = vi.spyOn(command, 'log');
      vi.spyOn(fs, 'readdir').mockImplementation(async () => [staticMigrationPgRollName as unknown as Dirent]);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
        JSON.stringify(staticMigrationPgRollResponse.migrations[0])
      );
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () => staticMigrationPgRollName);
      vi.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
        JSON.stringify(staticMigrationPgRollResponse.migrations[0])
      );
      fetchMock.mockImplementation(pgrollFetchSingle);
      await command.run();
      expect(log).toHaveBeenCalledWith('No new migrations to push');
    });
  });
});