// @ts-expect-error SSLCommerzPayment is not typed
import SSLCommerzPayment from 'sslcommerz-lts';
import { PaymentStatus } from '@prisma/client';
import config from '../../config';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const store_id = config.ssl.store_id;
const store_passwd = config.ssl.store_pass;
const is_live = false;

const CreatePaymentIntent = async (participantId: string) => {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      user: {
        select: {
          full_name: true,
          email: true,
        },
      },
      event: {
        select: {
          title: true,
          registration_fee: true,
        },
      },
    },
  });

  if (!participant) {
    throw new Error('Participant not found');
  }

  const payment = await prisma.payment.findUnique({
    where: {
      event_id_user_id: {
        event_id: participant.event_id,
        user_id: participant.user_id,
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status === PaymentStatus.PAID) {
    throw new Error('Payment already paid');
  }

  // Convert amount to string and ensure all values are strings
  const data = {
    total_amount: String(payment.amount),
    currency: 'BDT',
    tran_id: String(payment.transaction_id),
    success_url: `${config.backend_base_url}/payment/ipn_listener`,
    fail_url: `${config.backend_base_url}/payment/ipn_listener`,
    cancel_url: `${config.backend_base_url}/payment/ipn_listener`,
    ipn_url: `${config.backend_base_url}/payment/ipn_listener`,
    shipping_method: 'No',
    product_name: String(participant.event.title),
    product_category: 'Event',
    product_profile: 'general',
    cus_name: String(participant.user.full_name),
    cus_email: String(participant.user.email),
    cus_add1: 'Customer Address',
    cus_add2: 'Customer Address 2',
    cus_city: 'City',
    cus_state: 'State',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000',
    cus_fax: '01700000000',
    ship_name: String(participant.user.full_name),
    ship_add1: 'Ship Address',
    ship_add2: 'Ship Address 2',
    ship_city: 'City',
    ship_state: 'State',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
  };

  try {
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const sslResponse = await sslcz.init(data);

    return sslResponse.GatewayPageURL;
  } catch (error) {
    console.error('SSL Payment Error:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Payment initialization failed',
    );
  }
};

// @ts-expect-error SSLCommerzPayment is not typed
const VerifyPayment = async (payload) => {
  const payment = await prisma.payment.findUnique({
    where: {
      transaction_id: payload.tran_id,
    },
    include: {
      event: {
        select: {
          id: true,
          is_public: true,
        },
      },
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const participant = await prisma.participant.findUnique({
    where: {
      event_id_user_id: {
        event_id: payment.event_id,
        user_id: payment.user_id,
      },
    },
    select: {
      id: true,
      token: true,
    },
  });

  if (!participant) {
    throw new Error('Participant not found');
  }

  if (payment.status === PaymentStatus.PAID) {
    throw new Error('Payment already paid');
  }

  if (!payload.val_id || payload.status !== 'VALID') {
    if (payload.status === 'FAILED') {
      await prisma.payment.update({
        where: {
          transaction_id: payload.tran_id,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      return `${config.frontend_base_url}/${config.payment.fail_url}?participant_id=${participant.id}&pay_id=${payment.id}`;
    }

    if (payload.status === 'CANCELLED') {
      await prisma.payment.update({
        where: {
          transaction_id: payload.tran_id,
        },
        data: {
          status: PaymentStatus.CANCELLED,
        },
      });

      return `${config.frontend_base_url}/${config.payment.cancel_url}?participant_id=${participant.id}&pay_id=${payment.id}`;
    }

    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid IPN request');
  }

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const response = await sslcz.validate({
    val_id: payload.val_id,
  });

  if (response.status !== 'VALID' && response.status !== 'VALIDATED') {
    await prisma.payment.update({
      where: {
        transaction_id: payload.tran_id,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    return `${config.frontend_base_url}/${config.payment.fail_url}`;
  }

  await prisma.payment.update({
    where: {
      transaction_id: payload.tran_id,
    },
    data: {
      status: PaymentStatus.PAID,
      paid_at: new Date(),
    },
  });

  await prisma.participant.update({
    where: {
      id: participant.id,
    },
    data: {
      payment_status: PaymentStatus.PAID,
    },
  });

  const invitation = await prisma.invitation.findUnique({
    where: {
      event_id_receiver_id: {
        event_id: payment.event_id,
        receiver_id: payment.user_id,
      },
    },
  });

  if (invitation) {
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        payment_status: PaymentStatus.PAID,
      },
    });
  }

  if (payment.event.is_public) {
    return `${config.frontend_base_url}/${config.payment.success_url}?pay_id=${payment.id}&token=${participant.token}`;
  } else {
    return `${config.frontend_base_url}/${config.payment.success_pending_approval_url}?pay_id=${payment.id}`;
  }
};

const GetPaymentDetails = async (paymentId: string) => {
  console.log('paymentId', paymentId);

  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    select: {
      amount: true,
      status: true,
      paid_at: true,
      transaction_id: true,
      event: {
        select: {
          id: true,
          title: true,
          is_virtual: true,
          date_time: true,
          venue: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return payment;
};

const PaymentService = {
  CreatePaymentIntent,
  VerifyPayment,
  GetPaymentDetails,
};
export default PaymentService;
