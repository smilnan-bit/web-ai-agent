/**
 * 通过路由配置，自动生成路由类型声明文件
 */
const fs = require('fs');
const path = require('path');

class RoutesTypeGenerator {
  apply(compiler) {
    compiler.hooks.shouldEmit.tap('MyPlugin', (compilation) => {
      // 返回 true 以输出 output 结果，否则返回 false
      const routerModal = compilation.modules.find((i) => {
        if (i.resource) {
          // 插件会根据配置的 {name: "${name}"}拿到对应的name生成声明
          return i.resource.includes('/src/routes/index.tsx');
        }
      });
      if (routerModal) {
        const resource = routerModal.resource;
        const source = fs.readFileSync(resource).toString();
        const routerNameReg = /name\s*:\s*['|"]([\w\d]*)['|"]/gm;

        const dirname = path.dirname(resource);
        const dsFilePath = path.join(dirname, 'routesType.d.ts');
        // name: ${path}
        const _allRouterStrings = source.match(routerNameReg);
        const allRouterStrings = [...new Set(_allRouterStrings)];
        const pathNames = allRouterStrings.map((i) => {
          return i.slice(5).trim().slice(1, -1);
        });
        let interfaceStr = pathNames.reduce((str, name) => {
          return `${str}    ${name}: RouteTypeI;\n`;
        }, '');
        interfaceStr += '    [name: string]: RouteTypeI;\n';
        let template = `/* 请注意，不要手动修改该文件，该文件为RoutesTypeGenerator自动生成 */\n`;
        template += `import type { RouteTypeI } from '@ysf/ys-router';\ndeclare module '@ysf/ys-router' {\n`
        template += `  interface BaseRoutesMapI {\n${interfaceStr}`;
        template += `  }\n`;
        template += `}\n`;
        fs.writeFileSync(dsFilePath, template);
      }
      return true;
    });
  }
}

module.exports = RoutesTypeGenerator;
