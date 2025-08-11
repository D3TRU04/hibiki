import { NextResponse } from 'next/server'
import { Client, Wallet, isValidAddress } from 'xrpl'

export const dynamic = 'force-dynamic'

interface ClaimRequestBody {
  recipientAddress: string
  points?: number
  amountDrops?: string
  memo?: string
}

function getEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name]
  return value ?? fallback
}

function computeDropsFromPoints(points: number): string {
  const dropsPerPointEnv = getEnv('XRPL_DROPS_PER_POINT')
  const maxDropsPerTxEnv = getEnv('XRPL_MAX_DROPS_PER_TX')

  const dropsPerPoint = dropsPerPointEnv ? Number(dropsPerPointEnv) : 10_000 // 0.01 XRP
  const maxDropsPerTx = maxDropsPerTxEnv ? Number(maxDropsPerTxEnv) : 1_000_000 // 1 XRP

  let drops = Math.max(0, Math.floor(points)) * dropsPerPoint
  if (drops > maxDropsPerTx) drops = maxDropsPerTx
  return String(drops)
}

async function getClient(): Promise<Client> {
  const rpcUrl = getEnv('XRPL_RPC_URL', 'wss://s.altnet.rippletest.net:51233')!
  const client = new Client(rpcUrl)
  await client.connect()
  return client
}

export async function POST(req: Request) {
  try {
    const seed = getEnv('XRPL_WALLET_SEED')
    if (!seed) {
      return NextResponse.json({ ok: false, error: 'Missing server XRPL_WALLET_SEED' }, { status: 500 })
    }

    const { recipientAddress, points, amountDrops, memo }: ClaimRequestBody = await req.json()

    if (!recipientAddress || !isValidAddress(recipientAddress)) {
      return NextResponse.json({ ok: false, error: 'Invalid or missing recipientAddress' }, { status: 400 })
    }

    const resolvedAmountDrops = amountDrops && Number(amountDrops) > 0
      ? amountDrops
      : computeDropsFromPoints(points ?? 1)

    const minDropsEnv = getEnv('XRPL_MIN_DROPS', '1000')
    const minDrops = Number(minDropsEnv || '1000')
    if (Number(resolvedAmountDrops) < minDrops) {
      return NextResponse.json({ ok: false, error: 'Amount too small' }, { status: 400 })
    }

    const client = await getClient()
    const funder = Wallet.fromSeed(seed)

    const payment: any = {
      TransactionType: 'Payment',
      Account: funder.classicAddress,
      Amount: resolvedAmountDrops,
      Destination: recipientAddress,
    }

    if (memo) {
      payment.Memos = [
        {
          Memo: {
            MemoType: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
            MemoData: Buffer.from(memo, 'utf8').toString('hex').toUpperCase(),
          },
        },
      ]
    }

    const prepared = await client.autofill(payment)
    const signed = funder.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)

    await client.disconnect()

    const engineResult = (result as any).result.engine_result
    const txHash = (result as any).result.tx_json?.hash

    if (engineResult !== 'tesSUCCESS') {
      return NextResponse.json(
        { ok: false, error: engineResult, txHash },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, txHash, amountDrops: resolvedAmountDrops })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
} 