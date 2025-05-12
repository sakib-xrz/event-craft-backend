"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-expect-error SSLCommerzPayment is not typed
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const store_id = config_1.default.ssl.store_id;
const store_passwd = config_1.default.ssl.store_pass;
const is_live = false;
const CreatePaymentIntent = (participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findUnique({
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
    const payment = yield prisma_1.default.payment.findUnique({
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
    if (payment.status === client_1.PaymentStatus.PAID) {
        throw new Error('Payment already paid');
    }
    // Convert amount to string and ensure all values are strings
    const data = {
        total_amount: String(payment.amount),
        currency: 'BDT',
        tran_id: String(payment.transaction_id),
        success_url: `${config_1.default.backend_base_url}/payment/ipn_listener`,
        fail_url: `${config_1.default.backend_base_url}/payment/ipn_listener`,
        cancel_url: `${config_1.default.backend_base_url}/payment/ipn_listener`,
        ipn_url: `${config_1.default.backend_base_url}/payment/ipn_listener`,
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
        const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
        const sslResponse = yield sslcz.init(data);
        console.log('SSL Response:', sslResponse);
        return sslResponse.GatewayPageURL;
    }
    catch (error) {
        console.error('SSL Payment Error:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Payment initialization failed');
    }
});
// @ts-expect-error SSLCommerzPayment is not typed
const VerifyPayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield prisma_1.default.payment.findUnique({
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
    const participant = yield prisma_1.default.participant.findUnique({
        where: {
            event_id_user_id: {
                event_id: payment.event_id,
                user_id: payment.user_id,
            },
        },
        select: {
            id: true,
        },
    });
    if (!participant) {
        throw new Error('Participant not found');
    }
    if (payment.status === client_1.PaymentStatus.PAID) {
        throw new Error('Payment already paid');
    }
    if (!payload.val_id || payload.status !== 'VALID') {
        if (payload.status === 'FAILED') {
            yield prisma_1.default.payment.update({
                where: {
                    transaction_id: payload.tran_id,
                },
                data: {
                    status: client_1.PaymentStatus.FAILED,
                },
            });
            return `${config_1.default.frontend_base_url}/${config_1.default.payment.fail_url}?participant_id=${participant.id}`;
        }
        if (payload.status === 'CANCELLED') {
            yield prisma_1.default.payment.update({
                where: {
                    transaction_id: payload.tran_id,
                },
                data: {
                    status: client_1.PaymentStatus.CANCELLED,
                },
            });
            return `${config_1.default.frontend_base_url}/${config_1.default.payment.cancel_url}?participant_id=${participant.id}`;
        }
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid IPN request');
    }
    const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
    const response = yield sslcz.validate({
        val_id: payload.val_id,
    });
    if (response.status !== 'VALID' && response.status !== 'VALIDATED') {
        yield prisma_1.default.payment.update({
            where: {
                transaction_id: payload.tran_id,
            },
            data: {
                status: client_1.PaymentStatus.FAILED,
            },
        });
        return `${config_1.default.frontend_base_url}/${config_1.default.payment.fail_url}`;
    }
    yield prisma_1.default.payment.update({
        where: {
            transaction_id: payload.tran_id,
        },
        data: {
            status: client_1.PaymentStatus.PAID,
            paid_at: new Date(),
        },
    });
    const invitation = yield prisma_1.default.invitation.findUnique({
        where: {
            event_id_receiver_id: {
                event_id: payment.event_id,
                receiver_id: payment.user_id,
            },
        },
    });
    if (invitation) {
        yield prisma_1.default.invitation.update({
            where: {
                id: invitation.id,
            },
            data: {
                payment_status: client_1.PaymentStatus.PAID,
            },
        });
    }
    if (payment.event.is_public) {
        return `${config_1.default.frontend_base_url}/${config_1.default.payment.success_url}?tran_id=${payment.transaction_id}`;
    }
    else {
        return `${config_1.default.frontend_base_url}/${config_1.default.payment.success_pending_approval_url}?tran_id=${payment.transaction_id}`;
    }
});
const PaymentService = {
    CreatePaymentIntent,
    VerifyPayment,
};
exports.default = PaymentService;
