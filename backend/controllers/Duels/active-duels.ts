import Duels from '../../models/DuelsModel.js';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';

const activeDuels: fn = catchAsync(async (req: Request, res: Response) => {
  const userId: string | undefined = (req as any).user?._id;
  const page: number = Number(req.query.page) || 1;
  const limit: number = Math.min(Number(req.query.limit) || 10, 10);
  const skip: number = (page - 1) * limit;

  const sortField: string | undefined =
    (req.query.sortBy as string) || 'createdAt';
  const sortOrder: number = req.query.sortOrder === 'asc' ? 1 : -1;
  const allowedSortFields: string[] = [
    'createdAt',
    'updatedAt',
    'user1Score',
    'user2Score',
  ];
  const sort: any = allowedSortFields.includes(sortField)
    ? { [sortField]: sortOrder }
    : { createdAt: -1 };

  const winnerFilter: string | undefined = req.query.winner as string; // 'me' | 'other' | undefined
  const filter: any = {
    $or: [{ user1: userId }, { user2: userId }],
  };

  if (winnerFilter === 'me') {
    filter.winner = userId;
  } else if (winnerFilter === 'other') {
    filter.winner = { $ne: userId, $exists: true };
  }

  const totalDuels: number = await Duels.countDocuments(filter);
  const duels: IDuels[] = await Duels.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const response: APIResponse = {
    message: 'Active duels fetched successfully',
    details: {
      title: 'Active Duels',
      description: `Page ${page} of active duels for user.`,
    },
    status: 'success',
    statusCode: 200,
    success: true,
    data: {
      duels,
      total: totalDuels,
      page,
      limit,
      totalPages: Math.ceil(totalDuels / limit),
    },
  };

  res.status(200).json(response);
});

export default activeDuels;
