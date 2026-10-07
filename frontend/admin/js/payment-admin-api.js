const ADMIN_PAYMENT_API =
    "http://localhost:5000/api/payments/admin";

const adminPaymentRequest = async (
    path,
    options = {}
) => {
    const response =
        await fetch(
            `${ADMIN_PAYMENT_API}${path}`,
            {
                ...options,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );

    let result = null;

    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Admin payment request failed."
        );
    }

    return result;
};

const getAdminPaymentSummary =
    async () => {
        return adminPaymentRequest("/summary");
    };

const getAdminPayments =
    async ({
        status = "",
        method = "",
        page = 1,
        limit = 20
    } = {}) => {
        const params =
            new URLSearchParams();

        if (status) {
            params.set("status", status);
        }

        if (method) {
            params.set("method", method);
        }

        params.set("page", page);
        params.set("limit", limit);

        return adminPaymentRequest(
            `/?${params.toString()}`
        );
    };

const getAdminPayment =
    async (paymentId) => {
        if (!paymentId) {
            throw new Error(
                "Payment ID is required."
            );
        }

        return adminPaymentRequest(
            `/${encodeURIComponent(paymentId)}`
        );
    };

const markAdminCodPaid =
    async (orderId) => {
        if (!orderId) {
            throw new Error(
                "Order ID is required."
            );
        }

        return adminPaymentRequest(
            `/order/${encodeURIComponent(orderId)}/cod-paid`,
            {
                method: "PATCH"
            }
        );
    };

const refundAdminPayment =
    async (paymentId) => {
        if (!paymentId) {
            throw new Error(
                "Payment ID is required."
            );
        }

        return adminPaymentRequest(
            `/${encodeURIComponent(paymentId)}/refund`,
            {
                method: "PATCH"
            }
        );
    };

window.getAdminPaymentSummary =
    getAdminPaymentSummary;

window.getAdminPayments =
    getAdminPayments;

window.getAdminPayment =
    getAdminPayment;

window.markAdminCodPaid =
    markAdminCodPaid;

window.refundAdminPayment =
    refundAdminPayment;
