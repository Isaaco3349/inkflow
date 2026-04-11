// src/lib/execute/index.ts
// Onchain execution layer — uses ZeroDev to send gasless transactions on Ink
// Plug in real contract addresses here as they become available

import {
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient,
  } from '@zerodev/sdk'
  import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
  import {
    createPublicClient,
    http,
    encodeFunctionData,
    parseUnits,
    type Address,
  } from 'viem'
  import { privateKeyToAccount } from 'viem/accounts'
import { signTradeIntent, postValidationArtifact } from '@/lib/erc8004'
  
  // ── Ink Mainnet ───────────────────────────────────────────────────────────────
  export const inkChain = {
    id: 57073,
    name: 'Ink',
    network: 'ink',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
      public:  { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
    },
    blockExplorers: {
      default: { name: 'Ink Explorer', url: 'https://explorer.inkonchain.com' },
    },
  } as const
  
  // ── Verified token addresses on Ink Mainnet ───────────────────────────────────
  export const TOKEN_ADDRESSES: Record<string, Address> = {
    'USDC.e': '0xF1815bd50389c46847f0Bda824eC8da914045D14',
    USDT0:    '0x0200C29006150606B650577BBE7B6248F58470c1',
    WETH:     '0x4200000000000000000000000000000000000006',
  }
  
  // ── Protocol addresses (update when confirmed) ────────────────────────────────
  // TODO: Replace SUPERSWAP_ROUTER with verified address from SuperSwap team
  export const PROTOCOL_ADDRESSES = {
    SUPERSWAP_ROUTER: '0x0000000000000000000000000000000000000000' as Address, // PLACEHOLDER
    AAVE_POOL:        '0x0000000000000000000000000000000000000000' as Address, // PLACEHOLDER
  }
  
  // ── ERC20 ABI (minimal — just approve + transfer) ────────────────────────────
  const ERC20_ABI = [
    {
      name: 'approve',
      type: 'function',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount',  type: 'uint256' },
      ],
      outputs: [{ type: 'bool' }],
    },
    {
      name: 'transfer',
      type: 'function',
      inputs: [
        { name: 'to',     type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ type: 'bool' }],
    },
  ] as const
  
  // ── UniswapV3-compatible swap ABI (SuperSwap uses same interface) ─────────────
  const SWAP_ROUTER_ABI = [
    {
      name: 'exactInputSingle',
      type: 'function',
      inputs: [
        {
          name: 'params',
          type: 'tuple',
          components: [
            { name: 'tokenIn',           type: 'address' },
            { name: 'tokenOut',          type: 'address' },
            { name: 'fee',               type: 'uint24'  },
            { name: 'recipient',         type: 'address' },
            { name: 'deadline',          type: 'uint256' },
            { name: 'amountIn',          type: 'uint256' },
            { name: 'amountOutMinimum',  type: 'uint256' },
            { name: 'sqrtPriceLimitX96', type: 'uint160' },
          ],
        },
      ],
      outputs: [{ name: 'amountOut', type: 'uint256' }],
    },
  ] as const
  
  // ── Public client ─────────────────────────────────────────────────────────────
  export const publicClient = createPublicClient({
    chain: inkChain as any,
    transport: http(),
  })
  
  // ── Build ZeroDev kernel client from a private key ────────────────────────────
  export async function buildKernelClient(privateKey: `0x${string}`) {
    const signer = privateKeyToAccount(privateKey)
  
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      kernelVersion: '0.3.1',
      entryPoint: {
        address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as Address,
        version: '0.7',
      },
    })
  
    const account = await createKernelAccount(publicClient, {
      plugins: { sudo: ecdsaValidator },
      kernelVersion: '0.3.1',
      entryPoint: {
        address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as Address,
        version: '0.7',
      },
    })
  
    const paymasterClient = createZeroDevPaymasterClient({
      chain: inkChain as any,
      transport: http(process.env.ZERODEV_PAYMASTER_RPC),
    })
  
    const kernelClient = createKernelAccountClient({
      account,
      chain: inkChain as any,
      bundlerTransport: http(process.env.ZERODEV_BUNDLER_RPC),
      paymaster: paymasterClient,
      paymasterContext: { type: 'VERIFYING_PAYMASTER' },
    })
  
    return { kernelClient, account }
  }
  
  // ── Execute a gasless swap via SuperSwap ──────────────────────────────────────
  export async function executeSwap({
    privateKey,
    fromToken,
    toToken,
    amountIn,
    recipientAddress,
  }: {
    privateKey: `0x${string}`
    fromToken: string
    toToken: string
    amountIn: string   // human readable e.g. "50"
    recipientAddress: Address
  }) {
    if (PROTOCOL_ADDRESSES.SUPERSWAP_ROUTER === '0x0000000000000000000000000000000000000000') {
      throw new Error('SuperSwap router address not configured yet. Contact SuperSwap team for verified address.')
    }
  
    const { kernelClient, account } = await buildKernelClient(privateKey)
  
    const tokenInAddress  = TOKEN_ADDRESSES[fromToken]
    const tokenOutAddress = TOKEN_ADDRESSES[toToken]
    const decimals        = fromToken === 'WETH' ? 18 : 6
    const amount          = parseUnits(amountIn, decimals)
    const deadline        = BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 min
  
    // Step 1: Approve router to spend tokens
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PROTOCOL_ADDRESSES.SUPERSWAP_ROUTER, amount],
    })
  
    // Step 2: Execute swap
    const swapData = encodeFunctionData({
      abi: SWAP_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn:           tokenInAddress,
        tokenOut:          tokenOutAddress,
        fee:               3000,        // 0.3% fee tier
        recipient:         recipientAddress,
        deadline,
        amountIn:          amount,
        amountOutMinimum:  0n,          // TODO: add slippage protection
        sqrtPriceLimitX96: 0n,
      }],
    })
  
    // Send both as a batched gasless UserOperation
    const agentKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`
    const artifact = await signTradeIntent(agentKey, {
      action: 'swap',
      fromToken,
      toToken,
      amount: amountIn,
      protocol: 'SuperSwap',
    })

    const txHash = await kernelClient.sendTransactions({
      transactions: [
        { to: tokenInAddress,                          data: approveData, value: 0n },
        { to: PROTOCOL_ADDRESSES.SUPERSWAP_ROUTER,    data: swapData,    value: 0n },
      ],
    })

    await postValidationArtifact(agentKey, { ...artifact, txHash: txHash as `0x${string}` })
    return txHash
  }
  
  // ── Execute a gasless Aave deposit ────────────────────────────────────────────
  export async function executeDeposit({
    privateKey,
    token,
    amount,
    recipientAddress,
  }: {
    privateKey: `0x${string}`
    token: string
    amount: string
    recipientAddress: Address
  }) {
    if (PROTOCOL_ADDRESSES.AAVE_POOL === '0x0000000000000000000000000000000000000000') {
      throw new Error('Aave pool address not configured yet.')
    }
  
    const { kernelClient } = await buildKernelClient(privateKey)
    const tokenAddress = TOKEN_ADDRESSES[token]
    const decimals     = token === 'WETH' ? 18 : 6
    const amountIn     = parseUnits(amount, decimals)
  
    const AAVE_ABI = [{
      name: 'supply',
      type: 'function',
      inputs: [
        { name: 'asset',   type: 'address' },
        { name: 'amount',  type: 'uint256' },
        { name: 'onBehalfOf', type: 'address' },
        { name: 'referralCode', type: 'uint16' },
      ],
      outputs: [],
    }] as const
  
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PROTOCOL_ADDRESSES.AAVE_POOL, amountIn],
    })
  
    const depositData = encodeFunctionData({
      abi: AAVE_ABI,
      functionName: 'supply',
      args: [tokenAddress, amountIn, recipientAddress, 0],
    })
  
    const agentKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`
    const artifact = await signTradeIntent(agentKey, {
      action: 'deposit',
      fromToken: token,
      toToken: token,
      amount,
      protocol: 'Aave',
    })

    const txHash = await kernelClient.sendTransactions({
      transactions: [
        { to: tokenAddress,                  data: approveData, value: 0n },
        { to: PROTOCOL_ADDRESSES.AAVE_POOL, data: depositData, value: 0n },
      ],
    })

    await postValidationArtifact(agentKey, { ...artifact, txHash: txHash as `0x${string}` })
    return txHash
  }
