import { Plugin } from '@kokkoro/core';
import { Service } from './service';

const pkg = require('../package.json');
const plugin = new Plugin();
const service = new Service(plugin);

plugin
  .version(pkg.version)

//#region 打印
plugin
  .command('print <message>')
  .description('打印测试')
  .sugar(/^(打印|输出)\s?(?<message>.+)$/)
  .action(async (ctx) => {
    await ctx.reply(ctx.query.message);
  })
//#endregion

//#region 状态
plugin
  .command('state')
  .description('查看 bot 运行信息')
  .sugar(/^(状态)$/)
  .action(async (ctx, bot) => {
    const { uin, nickname, gl, fl, stat } = bot;
    const state = {
      uin, nickname,
      group_count: gl.size,
      friend_count: fl.size,
      stat,
    };
    await ctx.reply(JSON.stringify(state, null, 2));
  })
//#endregion

//#region 插件
plugin
  .command('plugin')
  .description('插件模块列表')
  .sugar(/^(插件)$/)
  .action(async (ctx) => {
    const message = await service.getPluginList();
    await ctx.reply(message);
  })
//#endregion

//#region 挂载
plugin
  .command('mount <...names>')
  .description('挂载插件')
  .limit(5)
  .sugar(/^(挂载)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx) => {
    const { names } = ctx.query;
    const message = await service.batchMountPlugin(names);

    await ctx.reply(message);
  })
//#endregion

//#region 卸载
plugin
  .command('unmount <...names>')
  .description('卸载插件')
  .limit(5)
  .sugar(/^(卸载)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx) => {
    const { names } = ctx.query;
    const message = await service.batchUnmountPlugin(names);

    await ctx.reply(message);
  })
//#endregion

//#region 重载
plugin
  .command('reload <...names>')
  .description('重载插件')
  .limit(5)
  .sugar(/^(重载)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx) => {
    const { names } = ctx.query;
    const message = await service.batchReloadPlugin(names);

    await ctx.reply(message);
  })
//#endregion

//#region 启用
plugin
  .command('enable <...names>')
  .description('启用插件')
  .limit(4)
  .sugar(/^(启用)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx, bot) => {
    const { names } = ctx.query;
    const message = await service.batchEnablePlugin(bot, names);

    await ctx.reply(message);
  });
//#endregion

//#region 禁用
plugin
  .command('disable <...names>')
  .description('禁用插件')
  .limit(4)
  .sugar(/^(禁用)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx, bot) => {
    const { names } = ctx.query;
    const message = await service.batchDisablePlugin(bot, names);

    await ctx.reply(message);
  });
//#endregion

//#region 群服务
plugin
  .command('server')
  .description('查看当前群服务列表')
  .sugar(/^(服务|群服务|列表)$/)
  .action(async (ctx) => {
    const server: { [key: string]: boolean } = {};
    const { group_id, setting } = ctx;

    if (group_id) {
      const keys = Object.keys(setting!);
      const keys_length = keys.length;

      for (let i = 0; i < keys_length; i++) {
        const name = keys[i];
        const option = setting![name];

        server[name] = option.apply;
      }
      await ctx.reply(JSON.stringify(server, null, 2));
    } else {
      await ctx.reply(`server 指令仅支持群聊，若要查看本地可用插件，可使用 plugin 指令`);
    }
  });
//#endregion

//#region 应用
plugin
  .command('apply <...names>')
  .description('应用群服务')
  .limit(3)
  .sugar(/^(应用)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx, bot) => {
    const { group_id, query } = ctx;

    if (group_id) {
      const { names } = query;
      const message = await service.batchApplyServer(bot, group_id, names);

      await ctx.reply(message);
    } else {
      await ctx.reply(`apply 指令仅支持群聊，若要为该 bot 启用插件，可使用 enable 指令`);
    }
  });
//#endregion

//#region 免除
plugin
  .command('exempt <...names>')
  .description('免除群服务')
  .limit(3)
  .sugar(/^(免除)\s?(?<names>([a-z]|\s)+)$/)
  .action(async (ctx, bot) => {
    const { group_id, query } = ctx;

    if (group_id) {
      const { names } = query;
      const message = await service.batchExemptServer(bot, group_id, names);

      await ctx.reply(message);
    } else {
      await ctx.reply(`exempt 指令仅支持群聊，若要为该 bot 禁用插件，可使用 disable 指令`);
    }
  });
//#endregion

//#region 帮助
plugin
  .command('help')
  .description('帮助信息')
  .sugar(/^(帮助)$/)
  .action(async (ctx) => {
    const message = ['Commands: '];
    const commands_length = plugin.commands.length;

    for (let i = 0; i < commands_length; i++) {
      const command = plugin.commands[i];
      const { raw_name, desc } = command;

      message.push(`  ${raw_name}  ${desc}`);
    }
    message.push('\nMore: https://kokkoro.js.org/');
    await ctx.reply(message.join('\n'));
  });
//#endregion

//#region 版本
plugin
  .command('version')
  .description('版本信息')
  .sugar(/^(版本|ver)$/)
  .action(async (ctx) => {
    const corePkg = service.getCorePackage();
    const version = {
      name: corePkg.name,
      version: corePkg.version,
      upday: corePkg.upday,
      author: corePkg.author,
      license: corePkg.license,
      homepage: corePkg.homepage,
    };

    await ctx.reply(JSON.stringify(version, null, 2));
  });
//#endregion
