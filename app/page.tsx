'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useSwitchChain } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // CONFIGURAÇÃO OFICIAL NEURA TESTNET
  const NEURA_CHAIN_ID = 267; 
  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';

  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [cardImage, setCardImage] = useState('/theme-blue.png');

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Forçar a troca para a rede correta (267) se estiver na errada (240)
  useEffect(() => {
    if (isConnected && chainId !== NEURA_CHAIN_ID) {
      toast.error('Rede incorreta! Mudando para Neura Testnet (267)...');
      switchChain?.({ chainId: NEURA_CHAIN_ID });
    }
  }, [isConnected, chainId, switchChain]);

  useEffect(() => {
    if (isPending) toast.loading('Aguardando aprovação na carteira...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirmando na Neura Testnet...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Mintado com Sucesso! 🎉', { id: 'mint' });
    if (error) {
      console.error("Erro de RPC:", error);
      toast.error('Erro de RPC: Reset sua conta na carteira e verifique o saldo de ANKR.', { id: 'mint' });
    }
  }, [isPending, isConfirming, isSuccess, error]);

  const handleMint = () => {
    if (!twitter || !discord) {
      toast.error('Preencha todos os campos!');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
      // Gas alto para evitar falha de RPC
      gas: 2500000n, 
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <img src="/logo ankr.png" alt="Ankr" className="h-10 w-auto" />
              <img src="/logo neura 1.png" alt="Neura" className="h-10 w-auto" />
            </div>

            <h1 className="text-3xl font-black text-center italic uppercase tracking-tighter text-slate-900">
              NEURA SOULCARD
            </h1>

            <div className="flex justify-center border-b pb-6">
              <ConnectKitButton />
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <input 
                  placeholder="Twitter @seuusuario" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" 
                  onChange={(e) => setTwitter(e.target.value)} 
                />
                <input 
                  placeholder="Discord ID" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" 
                  onChange={(e) => setDiscord(e.target.value)} 
                />
                
                <div className="flex gap-4">
                  <button onClick={() => setCardImage('/theme-blue.png')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${cardImage === '/theme-blue.png' ? 'border-blue-600' : 'border-transparent'}`}>
                    <img src="/theme-blue.png" className="w-full h-full object-cover" />
                  </button>
                  <button onClick={() => setCardImage('/theme-green.png')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${cardImage === '/theme-green.png' ? 'border-green-500' : 'border-transparent'}`}>
                    <img src="/theme-green.png" className="w-full h-full object-cover" />
                  </button>
                  <button onClick={() => setCardImage('/theme-dark.png')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${cardImage === '/theme-dark.png' ? 'border-black' : 'border-transparent'}`}>
                    <img src="/theme-dark.png" className="w-full h-full object-cover" />
                  </button>
                </div>

                <textarea 
                  placeholder="Sua bio..." 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[100px] resize-none" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                />
              </div>
            ) : (
              <div className="text-center py-10 italic text-slate-400">Conecte sua carteira para começar</div>
            )}
          </div>

          {isConnected && (
            <button 
              onClick={handleMint} 
              disabled={isPending || isConfirming} 
              className="w-full py-5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 uppercase tracking-widest transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
            >
              {isPending || isConfirming ? 'Processando...' : 'MINT SOULCARD'}
            </button>
          )}
        </div>

        {/* LADO DIREITO: PREVIEW DINÂMICO */}
        <div className="hidden lg:flex items-center justify-center bg-slate-200/40 rounded-[2.5rem] border-2 border-dashed border-slate-300">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
            <img src={cardImage} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-black italic">SOULCARD GENESIS</h2>
                <img src="/logo neura 1.png" className="h-