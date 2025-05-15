import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ParticipantService from './participant.services';

const ApproveParticipant = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.params.id;
  const user = req.user;
  const result = await ParticipantService.ApproveParticipant(
    participantId,
    user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Participant approved successfully',
    data: result,
  });
});

const RejectParticipant = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.params.id;
  const user = req.user;
  const result = await ParticipantService.RejectParticipant(
    participantId,
    user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Participant rejected successfully',
    data: result,
  });
});

const BanParticipant = catchAsync(async (req: Request, res: Response) => {
  const participantId = req.params.id;
  const user = req.user;
  const result = await ParticipantService.BanParticipant(participantId, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Participant banned successfully',
    data: result,
  });
});

const GetParticipantByToken = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.params.token;
    const result = await ParticipantService.GetParticipantByToken(token);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Participant fetched successfully',
      data: result,
    });
  },
);

const ParticipantController = {
  ApproveParticipant,
  RejectParticipant,
  BanParticipant,
  GetParticipantByToken,
};

export default ParticipantController;
