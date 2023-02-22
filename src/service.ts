import { join } from 'path';
import { deepClone } from '@kokkoro/utils';
import { Bot, getPluginList, mountPlugin, Plugin, retrievalPluginInfos, unmountPlugin } from '@kokkoro/core';

export class Service {
  constructor(
    /** 插件 */
    private plugin: Plugin,
  ) { }

  /**
   * 获取插件列表
   */
  async getPluginList() {
    const pluginInfos = await retrievalPluginInfos();
    const list: {
      node_modules: string[];
      plugins: string[];
    } = {
      node_modules: [],
      plugins: [],
    };
    const infos_length = pluginInfos.length;

    for (let i = 0; i < infos_length; i++) {
      const info = pluginInfos[i];
      const { folder, local } = info;

      local ? list.plugins.push(folder) : list.node_modules.push(folder);
    }
    return JSON.stringify(list, null, 2);
  }

  /**
   * 获取 core 包信息
   */
  getCorePackage() {
    const filename = require.resolve('@kokkoro/core');
    const path = join(filename, '../../package.json');
    const pkg = require(path);

    return deepClone(pkg);
  }

  /**
   * 批量挂载插件
   */
  async batchMountPlugin(names: string[]) {
    const pluginList = getPluginList();
    const pluginInfos = await retrievalPluginInfos();
    const names_length = names.length;
    const plugin_length = pluginInfos.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      if (pluginList.has(name)) {
        result[name] = {
          message: 'plugin has been mounted.',
        };
        continue;
      }
      result[name] = {
        message: 'plugin is undefined.',
      };

      for (let j = 0; j < plugin_length; j++) {
        const info = pluginInfos[j];

        if (name === info.name) {
          try {
            mountPlugin(info);
            result[name] = {
              message: 'plugin mount success.',
            };
          } catch (error) {
            result[name] = {
              message: `plugin mount failure, ${(<Error>error).message}.`,
            };
          }
          break;
        }
      }
    }
    return JSON.stringify(result, null, 2);
  }

  /**
   * 批量卸载插件
   */
  async batchUnmountPlugin(names: string[]) {
    const pluginList = getPluginList();
    const names_length = names.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      if (!pluginList.has(name)) {
        result[name] = {
          message: 'plugin is not mounted.',
        };
        continue;
      }

      try {
        unmountPlugin(name);

        result[name] = {
          message: 'plugin unmount success.',
        };
      } catch (error) {
        result[name] = {
          message: `plugin unmount failure, ${(<Error>error).message}.`,
        };
      }
    }
    return JSON.stringify(result, null, 2);
  }

  /**
   * 批量重载插件
   */
  async batchReloadPlugin(names: string[]) {
    const pluginList = getPluginList();
    const pluginInfos = await retrievalPluginInfos();
    const names_length = names.length;
    const plugin_length = pluginInfos.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      if (!pluginList.has(name)) {
        result[name] = {
          message: 'plugin is not mounted.',
        };
        continue;
      }
      result[name] = {
        message: 'plugin is undefined.',
      };

      for (let j = 0; j < plugin_length; j++) {
        const info = pluginInfos[j];

        if (name === info.name) {
          try {
            // TODO ／人◕ ‿‿ ◕人＼ 可能会有异步的问题，待优化
            unmountPlugin(name);
            mountPlugin(info);

            result[name] = {
              message: 'plugin reload success.',
            };
          } catch (error) {
            result[name] = {
              message: `plugin reload failure, ${(<Error>error).message}.`,
            };
          }
          break;
        }
      }

    }
    return JSON.stringify(result, null, 2);
  }

  /**
   * 批量启用插件
   */
  async batchEnablePlugin(bot: Bot, names: string[]) {
    const names_length = names.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      try {
        await bot.profile.enablePlugin(name);

        result[name] = {
          message: 'plugin enable success.',
        };
      } catch (error) {
        result[name] = {
          message: `plugin enable failure, ${(<Error>error).message}.`,
        };
      }
    }
    return JSON.stringify(result, null, 2);
  }

  /**
   * 批量禁用插件
   */
  async batchDisablePlugin(bot: Bot, names: string[]) {
    const names_length = names.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      try {
        await bot.profile.disablePlugin(name);

        result[name] = {
          message: 'plugin disable success.',
        };
      } catch (error) {
        result[name] = {
          message: `plugin disable failure, ${(<Error>error).message}.`,
        };
      }
    }
    return JSON.stringify(result, null, 2);
  }

  /**
   * 批量应用群服务
   */
  async batchApplyServer(bot: Bot, group_id: number, names: string[]) {
    const names_length = names.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      try {
        await bot.profile.updateOption(group_id, name, 'apply', true);

        result[name] = {
          message: 'group server apply success.',
        };
      } catch (error) {
        result[name] = {
          message: `group server apply failure, ${(<Error>error).message}.`,
        };
      }
    }
    return JSON.stringify(result, null, 2);
  }

  /**
   * 批量免除群服务
   */
  async batchExemptServer(bot: Bot, group_id: number, names: string[]) {
    const names_length = names.length;
    const result: Record<string, { message: string }> = {};

    for (let i = 0; i < names_length; i++) {
      const name = names[i];

      try {
        await bot.profile.updateOption(group_id, name, 'apply', false);

        result[name] = {
          message: 'group server exempt success.',
        };
      } catch (error) {
        result[name] = {
          message: `group server exempt failure, ${(<Error>error).message}.`,
        };
      }
    }
    return JSON.stringify(result, null, 2);
  }
}
