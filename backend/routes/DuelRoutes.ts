import { Router } from 'express';

import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import searchOpponent from '../controllers/Duels/search-opponent.js';

const DuelRoutes: Router = Router();

DuelRoutes.post(
  '/search-opponent',
  authenticate,
  authorize('user'),
  searchOpponent
);

DuelRoutes.patch(
  '/:duelId/accept',
  authenticate,
  authorize('user'),
  (req: any, res: any, next: any) => {
    // Logic for accepting a duel
    // User sends the duel ID
    // If the duel exists and is in a state that can be accepted, it is accepted
    // Otherwise, an error is returned
    const duelId: string | undefined = req.params.duelId;
    res.status(200).json({ message: `Duel ${duelId} accepted successfully` });
  }
);

DuelRoutes.patch(
  '/:duelId/reject',
  authenticate,
  authorize('user'),
  (req: any, res: any, next: any) => {
    // Logic for rejecting a duel
    // User sends the duel ID
    // If the duel exists and is in a state that can be rejected, it is rejected
    // Otherwise, an error is returned
    const duelId: string | undefined = req.params.duelId;
    res.status(200).json({ message: `Duel ${duelId} rejected successfully` });
  }
);

DuelRoutes.patch(
  '/:duelId/update-status',
  authenticate,
  authorize('user'),
  (req: any, res: any, next: any) => {
    // Logic for updating the status of a duel
    // User sends the duel ID and new data regarding the duel
    // If the duel exists and is in a state that can be updated, it is updated
    // this also handles winning logic
    // The udpate is checked against the winning state and if someone wins the duel is updated and monved to MongoDB
    // Otherwise, an error is returned
    const duelId: string | undefined = req.params.duelId;
    const userId: string | undefined = req.user?.id;
    // User to update the amount the user as done some work
    const userAmount: number | undefined = req.body?.userAmount;

    if (!duelId || !userId || userAmount === undefined) {
      return res.status(400).json({
        message: 'Duel ID, user ID, and user amount are required',
      });
    }
    res.status(200).json({
      message: `Duel ${duelId} updated successfully for user ${userId}`,
      userAmount,
    });
  }
);

export default DuelRoutes;
