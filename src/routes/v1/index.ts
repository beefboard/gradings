import { Router } from 'express';
import grades from './grades';

const router = Router();

router.use('/grades', grades);

router.get('/', (_, res) => {
  res.send({
    grades: '/grades'
  });
});

export default router;
