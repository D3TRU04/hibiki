import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

export const dynamic = 'force-dynamic'

interface ClaimEvmRequestBody {
  recipientAddress: string
  points?: number
  amountWei?: string
  memo?: string
}

function getEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name]
  return value ?? fallback
}

function computeWeiFromPoints(points: number): string {
  const weiPerPointEnv = getEnv('EVM_WEI_PER_POINT')
  const maxWeiPerTxEnv = getEnv('EVM_MAX_WEI_PER_TX')

  const weiPerPoint = weiPerPointEnv ? BigInt(weiPerPointEnv) : 10_000_000_000_000_000n // 0.01 XRP (18 decimals)
  const maxWeiPerTx = maxWeiPerTxEnv ? BigInt(maxWeiPerTxEnv) : 1_000_000_000_000_000_000n // 1 XRP

  let wei = BigInt(Math.max(0, Math.floor(points))) * weiPerPoint
  if (wei > maxWeiPerTx) wei = maxWeiPerTx
  return wei.toString()
}

export async function POST(req: Request) {
  try {
    const privateKey = getEnv('EVM_DEPLOYER_PRIVATE_KEY')
    const rpcUrl = getEnv('RIPPLE_EVM_RPC_URL', 'https://rpc.testnet.xrplevm.org/')!

    if (!privateKey) {
      return NextResponse.json({ ok: false, error: 'Missing EVM_DEPLOYER_PRIVATE_KEY' }, { status: 500 })
    }

    const { recipientAddress, points, amountWei }: ClaimEvmRequestBody = await req.json()

    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      return NextResponse.json({ ok: false, error: 'Invalid or missing recipientAddress' }, { status: 400 })
    }

    const valueWei = amountWei && BigInt(amountWei) > 0n
      ? amountWei
      : computeWeiFromPoints(points ?? 1)

    const minWeiEnv = getEnv('EVM_MIN_WEI', '100000000000000') // default 0.0001 XRP
    const minWei = BigInt(minWeiEnv || '100000000000000')
    if (BigInt(valueWei) < minWei) {
      return NextResponse.json({ ok: false, error: 'Amount too small' }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)

    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      value: BigInt(valueWei),
    })

    const receipt = await tx.wait()

    if (receipt?.status !== 1n) {
      return NextResponse.json({ ok: false, error: 'Tx failed', txHash: tx.hash }, { status: 500 })
    }

    return NextResponse.json({ ok: true, txHash: tx.hash, amountWei: valueWei, chain: 'evm' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
} 