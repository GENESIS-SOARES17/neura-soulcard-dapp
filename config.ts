import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { getDefaultConfig } from 'connectkit';

export const neura = defineChain({
  id: 240, 
  name: 'Neura',
  nativeCurrency: { name: 'ANKR', symbol: 'ANKR', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.ankr.com/neura'] } },
  blockExplorers: { default: { name: 'Neura Explorer', url: 'https://explorer.neura.io' } },
});

export const config = createConfig(
  getDefaultConfig({
    chains: [neura],
    transports: { [neura.id]: http() },
    walletConnectProjectId: '93710776b39a3f2955f3f01f016d91f2', 
    appName: 'Neura SoulCard dApp',
  })
);