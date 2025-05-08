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

  const data = {
    total_amount: payment.amount,
    currency: 'BDT',
    tran_id: payment.transaction_id,
    success_url: `${config.backend_base_url}/payment/ipn_listener`,
    fail_url: `${config.backend_base_url}/payment/ipn_listener`,
    cancel_url: `${config.backend_base_url}/payment/ipn_listener`,
    ipn_url: `${config.backend_base_url}/payment/ipn_listener`,
    shipping_method: 'N/A',
    product_name: participant.event.title,
    product_category: 'N/A',
    product_profile: 'N/A',
    cus_name: participant.user.full_name,
    cus_email: participant.user.email,
    cus_add1: 'N/A',
    cus_add2: 'N/A',
    cus_city: 'N/A',
    cus_state: 'N/A',
    cus_postcode: 'N/A',
    cus_country: 'Bangladesh',
    cus_phone: 'N/A',
    cus_fax: 'N/A',
    ship_name: participant.user.full_name,
    ship_add1: 'N/A',
    ship_add2: 'N/A',
    ship_city: 'N/A',
    ship_state: 'N/A',
    ship_postcode: 'N/A',
    ship_country: 'Bangladesh',
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const sslResponse = await sslcz.init(data);

  return sslResponse.GatewayPageURL;
};

// @ts-expect-error SSLCommerzPayment is not typed
const VerifyPayment = async (payload) => {
  const payment = await prisma.payment.findUnique({
    where: {
      transaction_id: payload.tran_id,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
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

      return `${config.frontend_base_url}/${config.payment.fail_url}`;
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

      return `${config.frontend_base_url}/${config.payment.cancel_url}`;
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

  return `${config.frontend_base_url}/${config.payment.success_url}`;
};

const PaymentService = {
  CreatePaymentIntent,
  VerifyPayment,
};
export default PaymentService;
