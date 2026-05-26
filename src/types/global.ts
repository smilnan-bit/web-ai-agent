declare global {
  const BUILD_ENV: 'dev' | 'test' | 'onlineGray' | 'online' | 'overmind' | 'pre' | 'perf' | 'oversea';
  const NODE_ENV: string;
  interface Window {
    QiyuAdaptor: any;
    __GLOBAL_CONFIG__?: basicNS.GlobalConfigType;
  }
}

export type {};
