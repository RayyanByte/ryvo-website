const renderAdminPaymentSummary =
    async () => {
        const element =
            document.getElementById(
                "payment-summary"
            );

        if (!element) {
            return;
        }

        try {
            const result =
                await window.getAdminPaymentSummary();

            const data =
                result?.data || {};

            element.innerHTML = `
                <div>
                    <span>Pending</span>
                    <strong>
                        ${data.status?.pending || 0}
                    </strong>
                </div>

                <div>
                    <span>Paid</span>
                    <strong>
                        ${data.status?.paid || 0}
                    </strong>
                </div>

                <div>
                    <span>Failed</span>
                    <strong>
                        ${data.status?.failed || 0}
                    </strong>
                </div>

                <div>
                    <span>COD</span>
                    <strong>
                        ${data.method?.cod || 0}
                    </strong>
                </div>

                <div>
                    <span>UPI</span>
                    <strong>
                        ${data.method?.upi || 0}
                    </strong>
                </div>

                <div>
                    <span>Paid Revenue</span>
                    <strong>
                        ₹${Number(
                            data.paidRevenue || 0
                        ).toFixed(2)}
                    </strong>
                </div>
            `;
        } catch (error) {
            element.textContent =
                error.message;
        }
    };


const renderAdminPayments =
    async () => {
        const list =
            document.getElementById(
                "payment-list"
            );

        const message =
            document.getElementById(
                "payment-dashboard-message"
            );

        if (!list) {
            return;
        }

        const status =
            document.getElementById(
                "payment-status-filter"
            )?.value || "";

        const method =
            document.getElementById(
                "payment-method-filter"
            )?.value || "";

        try {
            if (message) {
                message.textContent =
                    "Loading payments...";
            }

            const result =
                await window.getAdminPayments({
                    status,
                    method
                });

            const payments =
                result?.data || [];

            if (!payments.length) {
                list.innerHTML =
                    "<p>No payments found.</p>";

                if (message) {
                    message.textContent =
                        "";
                }

                return;
            }

            list.innerHTML =
                payments
                    .map(
                        (payment) => {
                            const order =
                                payment.order;

                            const customer =
                                payment.customer;

                            const canMarkCod =
                                payment.paymentMethod ===
                                    "cod" &&
                                payment.paymentStatus ===
                                    "pending";

                            const canRefund =
                                payment.paymentStatus ===
                                "paid";

                            return `
                                <article
                                    class="payment-card"
                                    data-payment-id="${payment._id}"
                                >
                                    <h3>
                                        ${payment.paymentMethod.toUpperCase()}
                                    </h3>

                                    <p>
                                        Customer:
                                        ${customer?.name || "-"}
                                    </p>

                                    <p>
                                        Order:
                                        ${order?._id || "-"}
                                    </p>

                                    <p>
                                        Amount:
                                        ₹${Number(
                                            payment.amount || 0
                                        ).toFixed(2)}
                                    </p>

                                    <p>
                                        Status:
                                        ${payment.paymentStatus}
                                    </p>

                                    <p>
                                        Transaction:
                                        ${payment.transactionId || "-"}
                                    </p>

                                    ${
                                        canMarkCod
                                            ? `
                                            <button
                                                type="button"
                                                onclick="markCodPaymentFromDashboard('${order?._id || ""}')"
                                            >
                                                Mark COD Paid
                                            </button>
                                            `
                                            : ""
                                    }

                                    ${
                                        canRefund
                                            ? `
                                            <button
                                                type="button"
                                                onclick="refundPaymentFromDashboard('${payment._id}')"
                                            >
                                                Refund
                                            </button>
                                            `
                                            : ""
                                    }
                                </article>
                            `;
                        }
                    )
                    .join("");

            if (message) {
                message.textContent =
                    "";
            }

        } catch (error) {
            if (message) {
                message.textContent =
                    error.message;
            }
        }
    };


const markCodPaymentFromDashboard =
    async (orderId) => {
        try {
            await window.markAdminCodPaid(
                orderId
            );

            await renderAdminPaymentSummary();
            await renderAdminPayments();
        } catch (error) {
            alert(
                error.message
            );
        }
    };


const refundPaymentFromDashboard =
    async (paymentId) => {
        try {
            await window.refundAdminPayment(
                paymentId
            );

            await renderAdminPaymentSummary();
            await renderAdminPayments();
        } catch (error) {
            alert(
                error.message
            );
        }
    };


const initializeAdminPaymentDashboard =
    () => {
        document
            .getElementById(
                "load-payments-button"
            )
            ?.addEventListener(
                "click",
                async () => {
                    await renderAdminPaymentSummary();
                    await renderAdminPayments();
                }
            );

        renderAdminPaymentSummary();
        renderAdminPayments();
    };


window.markCodPaymentFromDashboard =
    markCodPaymentFromDashboard;

window.refundPaymentFromDashboard =
    refundPaymentFromDashboard;


if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeAdminPaymentDashboard
    );
} else {
    initializeAdminPaymentDashboard();
}


window.initializeAdminPaymentDashboard = initializeAdminPaymentDashboard;
