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

function normalizeRpcUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function computeWeiFromPoints(points: number): string {
  const weiPerPointEnv = getEnv('EVM_WEI_PER_POINT')
  const maxWeiPerTxEnv = getEnv('EVM_MAX_WEI_PER_TX')

  const defaultWeiPerPoint = BigInt('10000000000000000') // 0.01 XRP (18 decimals)
  const defaultMaxWeiPerTx = BigInt('1000000000000000000') // 1 XRP

  const weiPerPoint = weiPerPointEnv ? BigInt(weiPerPointEnv) : defaultWeiPerPoint
  const maxWeiPerTx = maxWeiPerTxEnv ? BigInt(maxWeiPerTxEnv) : defaultMaxWeiPerTx

  let wei = BigInt(Math.max(0, Math.floor(points))) * weiPerPoint
  if (wei > maxWeiPerTx) wei = maxWeiPerTx
  return wei.toString()
}

export async function POST(req: Request) {
  try {
    const privateKey = getEnv('EVM_DEPLOYER_PRIVATE_KEY')
    const rpcUrlRaw = getEnv('RIPPLE_EVM_RPC_URL', 'https://rpc.testnet.xrplevm.org/')!
    const rpcUrl = normalizeRpcUrl(rpcUrlRaw)

    if (!privateKey) {
      return NextResponse.json({ ok: false, error: 'Missing EVM_DEPLOYER_PRIVATE_KEY' }, { status: 500 })
    }

    if (!privateKey.startsWith('0x')) {
      return NextResponse.json({ ok: false, error: 'Invalid private key format' }, { status: 500 })
    }

    const { recipientAddress, points, amountWei }: ClaimEvmRequestBody = await req.json()

    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      return NextResponse.json({ ok: false, error: 'Invalid or missing recipientAddress' }, { status: 400 })
    }

    const valueWei = amountWei && BigInt(amountWei) > BigInt('0')
      ? amountWei
      : computeWeiFromPoints(points ?? 1)

    const minWeiEnv = getEnv('EVM_MIN_WEI', '100000000000000') // default 0.0001 XRP
    const minWei = BigInt(minWeiEnv || '100000000000000')
    if (BigInt(valueWei) < minWei) {
      return NextResponse.json({ ok: false, error: 'Amount too small' }, { status: 400 })
    }

    try {
      // Provider with explicit chainId for XRPL EVM sidechain
      const chainId = Number(getEnv('NEXT_PUBLIC_EVM_CHAIN_ID', '1449000'))
      const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcUrl }, { name: 'xrpl-evm', chainId })
      const wallet = new ethers.Wallet(privateKey, provider)

      // Best-effort balance check to surface clear error
      const balance = await provider.getBalance(wallet.address)
      if (balance.lt(ethers.BigNumber.from(valueWei))) {
        return NextResponse.json({ ok: false, error: 'Insufficient funds', balance: balance.toString(), neededWei: valueWei }, { status: 400 })
      }

      const tx = await wallet.sendTransaction({
        to: recipientAddress,
        value: ethers.BigNumber.from(valueWei),
      })

      const receipt = await tx.wait()
      if (receipt?.status !== 1) {
        return NextResponse.json({ ok: false, error: 'Tx failed', txHash: tx.hash }, { status: 500 })
      }

      return NextResponse.json({ ok: true, txHash: tx.hash, amountWei: valueWei, chain: 'evm' })
    } catch (ethersError) {
      const message = ethersError instanceof Error ? ethersError.message : 'Unknown'
      return NextResponse.json({ ok: false, error: `Ethers error: ${message}` }, { status: 500 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
} 