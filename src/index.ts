import RaydiumSwap from './RaydiumSwap';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import 'dotenv/config';


export const swapConfig = {
  executeSwap: false, // Send tx when true, simulate tx when false
  useVersionedTransaction: true,
  tradeAmount: 0.001,
  inMintAddress: "So11111111111111111111111111111111111111112",
  outMintAddress: "64GhPSS8P8wNaGWH2uysASxp9XYsqS3An3eJ3w5YNJK9",
  maxLamports: 1500000, // Micro lamports for priority fee
  direction: "in" as "in" | "out", // Swap direction: 'in' or 'out'
  liquidityFile: "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
  maxRetries: 5,
};

const privateKey = process.env.WALLET_PRIVATE_KEY
const RPCUrl = process.env.RPC_URL


export async function swap() {
  console.log(`Initiating Radium Swap`);
  const raydiumSwap = new RaydiumSwap(RPCUrl, privateKey);
  console.log(`Raydium Swap initialized`);
  console.log(`Swapping ${swapConfig.tradeAmount} of ${swapConfig.inMintAddress} for ${swapConfig.outMintAddress}...`)

  console.log(`Loading pool keys`, Date.now());
  await raydiumSwap.loadPoolKeys(swapConfig.liquidityFile);
  console.log(`Loaded pool keys`, Date.now());

  console.log(`Loading pool info`, Date.now());
  /* Find pool information for the given token pair. */
  const poolInfo = raydiumSwap.findPoolInfoForTokens(swapConfig.inMintAddress, swapConfig.outMintAddress);
  if (!poolInfo) {
    console.error('Pool info not found', Date.now());
    return 'Pool info not found';
  } else {
    console.log('Found pool info', Date.now());
    
  }

  /* Prepare the swap transaction with the given parameters. */
  const tx = await raydiumSwap.getSwapTransaction(
    swapConfig.outMintAddress,
    swapConfig.tradeAmount,
    poolInfo,
    swapConfig.maxLamports,
    swapConfig.useVersionedTransaction,
    swapConfig.direction
  );

  /*  Depending on the configuration, execute or simulate the swap.  */
  if (swapConfig.executeSwap) {
    const txid = swapConfig.useVersionedTransaction
      ? await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction, swapConfig.maxRetries)
      : await raydiumSwap.sendLegacyTransaction(tx as Transaction, swapConfig.maxRetries);
    console.log(`https://solscan.io/tx/${txid}`);

  } else {
    const simRes = swapConfig.useVersionedTransaction
      ? await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction)
      : await raydiumSwap.simulateLegacyTransaction(tx as Transaction);

    console.log(simRes);
  }
};

swap();
