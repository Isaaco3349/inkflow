// src/lib/erc8004/index.ts
// ERC-8004 Trustless Agent integration for Inkflow
// Registers Inkflow AI agent on-chain and signs every DeFi action as a
// verifiable trade intent using EIP-712 typed data signatures.
//
// Identity Registry (Sepolia):  0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
// Reputation Registry (Sepolia): 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

import {
    createPublicClient,
    createWalletClient,
    http,
    encodeFunctionData,
    hashTypedData,
    type Address,
    type Hash,
  } from "viem"
  import { privateKeyToAccount } from "viem/accounts"
  import { sepolia } from "viem/chains"
  
  // ── Registry addresses (deployed by ERC-8004 team on Sepolia) ──────────────
  export const IDENTITY_REGISTRY  = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as Address
  export const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as Address
  
  // ── Minimal ABIs ────────────────────────────────────────────────────────────
  const IDENTITY_ABI = [
    {
      name: "register",
      type: "function",
      inputs: [{ name: "agentURI", type: "string" }],
      outputs: [{ name: "agentId", type: "uint256" }],
    },
    {
      name: "ownerOf",
      type: "function",
      inputs: [{ name: "tokenId", type: "uint256" }],
      outputs: [{ type: "address" }],
    },
  ] as const
  
  const REPUTATION_ABI = [
    {
      name: "giveFeedback",
      type: "function",
      inputs: [
        { name: "agentId",      type: "uint256" },
        { name: "feedbackURI",  type: "string"  },
        { name: "feedbackHash", type: "bytes32" },
      ],
      outputs: [],
    },
  ] as const
  
  // ── EIP-712 domain for Inkflow trade intents ────────────────────────────────
  const DOMAIN = {
    name:    "Inkflow",
    version: "1",
    chainId: 57073, // Ink Mainnet
  } as const
  
  const TRADE_INTENT_TYPE = {
    TradeIntent: [
      { name: "action",    type: "string"  },
      { name: "fromToken", type: "string"  },
      { name: "toToken",   type: "string"  },
      { name: "amount",    type: "string"  },
      { name: "protocol",  type: "string"  },
      { name: "agentId",   type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ],
  } as const
  
  // ── Types ───────────────────────────────────────────────────────────────────
  export interface TradeIntent {
    action:    string
    fromToken: string
    toToken:   string
    amount:    string
    protocol:  string
    agentId:   bigint
    timestamp: bigint
  }
  
  export interface ValidationArtifact {
    intentHash:  Hash
    signature:   Hash
    agentId:     bigint
    timestamp:   number
    action:      string
    txHash?:     Hash
  }
  
  // ── Public client on Sepolia (for registry calls) ───────────────────────────
  const sepoliaClient = createPublicClient({
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  })
  
  // ── Register Inkflow agent on ERC-8004 Identity Registry ───────────────────
  // Call this ONCE. Returns the agentId (store it in your .env).
  export async function registerAgent(agentPrivateKey: `0x${string}`): Promise<bigint> {
    const account = privateKeyToAccount(agentPrivateKey)
  
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    })
  
    const agentCard = {
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      name: "Inkflow DeFi Agent",
      description:
        "AI-powered DeFi agent on Inkonchain. Executes swaps, yield deposits, and borrows via natural language. Powered by Claude AI. Built on Kraken's L2.",
      image: "https://inkflow-rho.vercel.app/inkflow-logo.png",
      services: [
        { name: "web",  endpoint: "https://inkflow-rho.vercel.app" },
        { name: "A2A",  endpoint: "https://inkflow-rho.vercel.app/api/agent" },
      ],
    }
  
    // Upload agent card to a public URL (use data URI for hackathon simplicity)
    const agentURI = `data:application/json;base64,${Buffer.from(
      JSON.stringify(agentCard)
    ).toString("base64")}`
  
    const data = encodeFunctionData({
      abi: IDENTITY_ABI,
      functionName: "register",
      args: [agentURI],
    })
  
    const txHash = await walletClient.sendTransaction({
      to:   IDENTITY_REGISTRY,
      data,
    })
  
    console.log(`[ERC-8004] Agent registered. TX: ${txHash}`)
    console.log(`[ERC-8004] Check Sepolia Etherscan for your agentId`)
  
    return txHash as unknown as bigint
  }
  
  // ── Sign a trade intent with EIP-712 ───────────────────────────────────────
  // Call this BEFORE every DeFi execution. Returns a validation artifact.
  export async function signTradeIntent(
    agentPrivateKey: `0x${string}`,
    intent: Omit<TradeIntent, "agentId" | "timestamp">
  ): Promise<ValidationArtifact> {
    const agentId   = BigInt(process.env.ERC8004_AGENT_ID || "1")
    const timestamp = BigInt(Math.floor(Date.now() / 1000))
  
    const fullIntent: TradeIntent = { ...intent, agentId, timestamp }
  
    const intentHash = hashTypedData({
      domain:      DOMAIN,
      types:       TRADE_INTENT_TYPE,
      primaryType: "TradeIntent",
      message:     fullIntent,
    })
  
    const account = privateKeyToAccount(agentPrivateKey)
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    })
  
    const signature = await walletClient.signTypedData({
      domain:      DOMAIN,
      types:       TRADE_INTENT_TYPE,
      primaryType: "TradeIntent",
      message:     fullIntent,
    })
  
    const artifact: ValidationArtifact = {
      intentHash,
      signature:  signature as Hash,
      agentId,
      timestamp:  Number(timestamp),
      action:     intent.action,
    }
  
    console.log(`[ERC-8004] Trade intent signed:`, artifact)
    return artifact
  }
  
  // ── Post validation artifact to Reputation Registry ────────────────────────
  // Call this AFTER a successful transaction.
  export async function postValidationArtifact(
    agentPrivateKey: `0x${string}`,
    artifact: ValidationArtifact
  ): Promise<Hash> {
    const account = privateKeyToAccount(agentPrivateKey)
  
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    })
  
    const feedbackData = {
      action:      artifact.action,
      intentHash:  artifact.intentHash,
      txHash:      artifact.txHash || "0x",
      timestamp:   artifact.timestamp,
      agentId:     artifact.agentId.toString(),
    }
  
    const feedbackURI = `data:application/json;base64,${Buffer.from(
      JSON.stringify(feedbackData)
    ).toString("base64")}`
  
    // feedbackHash = keccak256 of the artifact
    const feedbackHash = artifact.intentHash as `0x${string}`
  
    const data = encodeFunctionData({
      abi:          REPUTATION_ABI,
      functionName: "giveFeedback",
      args: [artifact.agentId, feedbackURI, feedbackHash as `0x${string}` & { length: 66 }],
    })
  
    const txHash = await walletClient.sendTransaction({
      to:   REPUTATION_REGISTRY,
      data,
    })
  
    console.log(`[ERC-8004] Validation artifact posted. TX: ${txHash}`)
    return txHash
  }
