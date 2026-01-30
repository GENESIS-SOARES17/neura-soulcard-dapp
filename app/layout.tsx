import './globals.css';
import { Inter } from 'next/font/google';
import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const inter = Inter({ subsets: ['latin'] });

// 1. Definição da Rede Neura Testnet conforme as especificações
const neuraTestnet = {
  id: 267,
  name: 'Neura Testnet',
  nativeCurrency: { name: 'ANKR', symbol: 'ANKR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/neura_testnet'] },
  },
  blockExplorers: {
    default: { name: 'Neura Explorer', url: 'https://testnet.explorer.neuraprotocol.io' },
  },
};

// 2. Configuração do Wagmi com suporte a múltiplas carteiras e rede fixa 267
const config = createConfig(
  getDefaultConfig({
    appName: "Neura SoulCard Genesis",
    // Substitua pelo seu ID do WalletConnect se tiver um
    walletConnectProjectId: "YOUR_PROJECT_ID", 
    chains: [neuraTestnet],
    ssr: true,
    // O ConnectKit detecta automaticamente Rabby, OKX e MetaMask via 'injected'
  }),
);

const queryClient = new QueryClient();

export const metadata = {
  title: 'Neura SoulCard',
  description: 'Mint your unique identity on Neura Network',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider 
              theme="auto"
              mode="light"
              customTheme={{
                "--ck-connectbutton-border-radius": "16px",
                "--ck-connectbutton-color": "#ffffff",
                "--ck-connectbutton-background": "#2563eb", // Azul Neura
              }}
            >
              {children}
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}