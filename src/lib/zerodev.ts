/**
 * lib/zerodev.ts
 * ZeroDev embedded wallet setup for Inkflow.
 * Handles: wallet creation, smart account, paymaster (gasless), signing.
 *
 * Docs: https://docs.zerodev.app
 * Supported on Ink Mainnet (Chain ID: 57073)
 */

import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { createPublicClient, http, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// ── Ink Mainnet chain definition ──────────────────────────────────
export const inkMainnet = {
  id: 57073,
  name: 'Ink',
  network: 'ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
    public: { http: [process.env.NEXT_PUBLIC_INK_RPC_URL || 'https://rpc-gel.inkonchain.com'] },
  },
  blockExplorers: {
    default: { name: 'Ink Explorer', url: 'https://explorer.inkonchain.com' },
  },
} as const

// ── Public client for reading chain state ─────────────────────────
export const publicClient = createPublicClient({
  chain: inkMainnet,
  transport: http(process.env.NEXT_PUBLIC_INK_RPC_URL),
})

// ── Create a smart account from a private key ─────────────────────
// In production: derive the private key from user's social login session
// e.g. via Privy, Dynamic, or your own auth system
export async function createSmartAccount(privateKey: `0x${string}`) {
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
    plugins: {
      sudo: ecdsaValidator,
    },
    kernelVersion: '0.3.1',
    entryPoint: {
      address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as Address,
      version: '0.7',
    },
  })

  return account
}

// ── Create a gasless kernel client (paymaster sponsored) ──────────
export async function createGaslessClient(privateKey: `0x${string}`) {
  const account = await createSmartAccount(privateKey)

  const paymasterClient = createZeroDevPaymasterClient({
    chain: inkMainnet,
    transport: http(process.env.ZERODEV_PAYMASTER_RPC),
  })

  const kernelClient = createKernelAccountClient({
    account,
    chain: inkMainnet,
    bundlerTransport: http(process.env.ZERODEV_BUNDLER_RPC),
    paymaster: paymasterClient,
    paymasterContext: {
      type: 'VERIFYING_PAYMASTER',
    },
  })

  return { kernelClient, account }
}

// ── Get wallet address from smart account ─────────────────────────
export async function getWalletAddress(privateKey: `0x${string}`): Promise<Address> {
  const account = await createSmartAccount(privateKey)
  return account.address
}

// ── Send a gasless user operation ─────────────────────────────────
export async function sendGaslessTransaction(
  privateKey: `0x${string}`,
  to: Address,
  data: `0x${string}`,
  value?: bigint
) {
  const { kernelClient } = await createGaslessClient(privateKey)

  const txHash = await kernelClient.sendTransaction({
    to,
    data,
    value: value ?? 0n,
  })

  return txHash
}
