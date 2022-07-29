import { Flags } from '@oclif/core';
import { Miniflare } from 'miniflare';
import { BaseCommand } from '../../base.js';
import { buildWatcher, compileWorkers } from '../../workers.js';

export default class WorkersCompile extends BaseCommand {
  static description = 'Extract and compile xata workers';

  static flags = {
    ...this.databaseURLFlag,
    include: Flags.string({
      description: 'Include a glob pattern of files to compile'
    }),
    ignore: Flags.string({
      description: 'Exclude a glob pattern of files to compile'
    }),
    port: Flags.integer({
      description: 'Port to use for the watcher'
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WorkersCompile);
    const watchPort = flags.port ?? 64749;

    const { databaseURL } = await this.getDatabaseURL(flags.db);
    const { apiKey } = (await this.getProfile()) ?? {};

    const { results } = await buildWatcher({
      action: (path) => compileWorkers(path),
      included: flags.include?.split(','),
      ignored: flags.ignore?.split(',')
    });

    const mounts = results.flat().map(({ name, modules, main }) => [
      name,
      {
        modules: true,
        script: modules.find(({ name }) => name === main)?.content ?? modules[0].content,
        bindings: {
          XATA_API_KEY: apiKey,
          XATA_DATABASE_URL: databaseURL
        },
        routes: [`http://localhost:${watchPort}/${name}`]
      }
    ]);

    const miniflare = new Miniflare({
      mounts: Object.fromEntries(mounts)
    });

    const server = await miniflare.createServer();

    server.listen(watchPort, () => {
      console.log(`Listening on port ${watchPort}`);
    });
  }
}
