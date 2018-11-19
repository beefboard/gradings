import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.send({
    v1: '/v1'
  });
});

router.use((_, res) => {
  res.status(404).send({
    error: 'Not found'
  });
});

export default router;
