'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected } = useAccount();
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');

  // Hook para disparar a transação
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  // Hook para monitorar quando a transação é confirmada na rede Neura
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Efeito para mostrar avisos baseados no status
  useEffect(() => {
    if (isPending) toast.loading('Aguardando aprovação na carteira...', { id: 'mint' });
    if (isConfirming) toast.loading('Transação enviada! Confirmando na rede...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Mintado com Sucesso! 🎉', { id: 'mint' });
    if (error) toast.error(`Erro: ${error.message.split('\n')[0]}`, { id: 'mint' });
  }, [isPending, isConfirming, isSuccess, error]);

  const handleMint = () => {
    if (!twitter || !discord) {
      toast.error('Preencha Twitter e Discord!');
      return;
    }

    writeContract({
      address: '0xSUA_CONTRATO_AQUI', // Substitua pelo endereço do seu contrato
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-slate-800">Neura SoulCard</h1>
        
        <div className="flex justify-center">
          <ConnectKitButton />
        </div>

        {isConnected && (
          <div className="space-y-4 pt-4 border-t">
            <input 
              placeholder="Seu Twitter" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setTwitter(e.target.value)}
            />
            <input 
              placeholder="Seu Discord" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setDiscord(e.target.value)}
            />
            <textarea 
              placeholder="Sua Bio" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setBio(e.target.value)}
            />
            
            <button 
              onClick={handleMint}
              disabled={isPending || isConfirming}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                isPending || isConfirming ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
              }`}
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSANDO...
                </span>
              ) : 'MINT SOULCARD'}
            </button>
            
            {isSuccess && hash && (
              <p className="text-center text-sm">
                <a href={`https://explorer.neura.io/tx/${hash}`} target="_blank" className="text-blue-500 underline">
                  Ver no Explorer
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}