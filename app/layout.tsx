import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, coinbaseWallet, injected } from "wagmi/connectors"; // 'injected' detecta OKX e Tally
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig(
  getDefaultConfig({
    // Seus IDs de projeto e correntes
    appName: "Neura SoulCard",
    walletConnectProjectId: "SEU_PROJECT_ID_AQUI", // Obtenha em cloud.walletconnect.com
    chains: [
      {
        id: 267, // ID da Neura Testnet
        name: 'Neura Testnet',
        nativeCurrency: { name: 'NEURA', symbol: 'NEURA', decimals: 18 },
        rpcUrls: { default: { http: ['https://rpc.testnet.neuraprotocol.io'] } },
      }
    ],
    // Aqui é onde a mágica acontece:
    connectors: [
      injected(), // Isso detecta automaticamente OKX, Tally, MetaMask instaladas no navegador
      coinbaseWallet({ appName: 'Neura SoulCard' }),
    ],
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};