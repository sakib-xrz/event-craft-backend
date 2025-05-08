import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import PaymentService from './payment.services';

const CreatePaymentIntent = catchAsync(async (req, res) => {
  const { participant_id } = req.body;

  const result = await PaymentService.CreatePaymentIntent(participant_id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment intent created successfully',
    data: {
      payment_url: result,
    },
  });
});

const VerifyPayment = catchAsync(async (req, res) => {
  const result: unknown = await PaymentService.VerifyPayment(req.body);

  res.redirect(result as string);
});

const PaymentController = {
  CreatePaymentIntent,
  VerifyPayment,
};

export default PaymentController;
