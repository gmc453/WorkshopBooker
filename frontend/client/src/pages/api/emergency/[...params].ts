import type { NextApiRequest, NextApiResponse } from 'next'
import apiGateway from '../../../apiGateway'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params = [] } = req.query
  const path = Array.isArray(params) ? params.join('/') : params
  try {
    const response = await apiGateway.request({
      url: `/api/emergency/${path}`,
      method: req.method as any,
      data: req.body,
      params: req.query
    })
    res.status(response.status).json(response.data)
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ message: 'Gateway unavailable' })
    }
  }
}
