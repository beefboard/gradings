import { Router, Response } from 'express';
import * as ratings from '../../data/ratings';
import { isNumber } from 'util';

const router = Router();

function handleError(e: Error, res: Response) {
  console.error(e.message);
  res.status(500).send({
    error: 'Internal server error'
  });
}

router.get('/', async (req, res) => {
  const posts = req.query.posts;
  const user = req.query.user;

  if (!Array.isArray(posts)) {
    return res.status(422).send({ error: 'Posts must be an array' });
  }

  try {
    res.send(await ratings.get(posts, user));
  } catch (e) {
    handleError(e, res);
  }
});

router.get('/:postId', async (req, res) => {
  const post = req.params.postId;
  const user = req.query.user;

  try {
    const rating = await ratings.get([post], user);
    res.send(rating[post]);
  } catch (e) {
    handleError(e, res);
  }
});

router.post('/:postId', async (req, res) => {
  const post = req.params.postId;
  const user = req.body.user;
  const vote = req.body.vote;

  if (!user || !isNumber(vote)) {
    return res.status(422).send({
      error: 'User and vote must be given'
    });
  }

  try {
    await ratings.grade(post, user, vote);
    res.send({
      success: true
    });
  } catch (e) {
    handleError(e, res);
  }
});

export default router;
