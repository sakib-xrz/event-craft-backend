import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import InvitationService from './invitation.services';

const SendInvitation = catchAsync(async (req, res) => {
  const { eventId, receiver_id } = req.body;
  const { id: userId } = req.user;
  const invitation = await InvitationService.SendInvitation(
    eventId,
    userId,
    receiver_id,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Invitation sent successfully',
    data: invitation,
  });
});

const GetReceivedInvitations = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const invitations = await InvitationService.GetReceivedInvitations(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Received invitations fetched successfully',
    data: invitations,
  });
});

const GetSentInvitations = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const invitations = await InvitationService.GetSentInvitations(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sent invitations fetched successfully',
    data: invitations,
  });
});

const AcceptInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.body;
  const invitation = await InvitationService.AcceptInvitation(invitationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invitation accepted successfully',
    data: invitation,
  });
});

const DeclineInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.body;
  const invitation = await InvitationService.DeclineInvitation(invitationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invitation declined successfully',
    data: invitation,
  });
});

const InvitationController = {
  SendInvitation,
  GetReceivedInvitations,
  GetSentInvitations,
  AcceptInvitation,
  DeclineInvitation,
};

export default InvitationController;
