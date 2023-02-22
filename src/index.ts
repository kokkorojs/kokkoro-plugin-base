import { Plugin } from '@kokkoro/core';
import { Service } from './service';

const plugin = new Plugin();
const service = new Service(plugin);

plugin
  .command('hello')
  .action((ctx, bot) => {
    const message = service.getMessage();
    ctx.reply(message);
  })
