import type { NextApiRequest, NextApiResponse } from 'next'

const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:5000'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params = [] } = req.query as { params?: string[] }
  const target = `${gatewayUrl}/api/workshops/${params.join('/')}`

  try {
    const fetchRes = await fetch(target, {
      method: req.method,
      headers: { 'Content-Type': 'application/json', ...(req.headers as any) },
      body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body)
    })
    const data = await fetchRes.text()
    res.status(fetchRes.status).send(data)
  } catch (err) {
    console.error('Gateway request failed', err)
    res.status(502).json({ message: 'Gateway unavailable' })
  }
}
