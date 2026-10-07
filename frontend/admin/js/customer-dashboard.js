(() => {

    let customers = [];

    const $ = (id) =>
        document.getElementById(id);

    const esc = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    const message = (
        text,
        type = "info"
    ) => {
        const element =
            $("customerDashboardMessage");

        element.textContent = text;
        element.dataset.type = type;
    };

    const render = () => {

        const list =
            $("customerList");

        if (!customers.length) {
            list.innerHTML =
                "<p>No customers found.</p>";
            return;
        }

        list.innerHTML =
            customers.map(
                (customer) => `
                    <article class="admin-card">

                        <div class="admin-card-body">

                            <h3>
                                ${esc(customer.name)}
                            </h3>

                            <p>
                                ${esc(customer.email)}
                            </p>

                            <p>
                                ${esc(
                                    customer.phone ||
                                    "No phone"
                                )}
                            </p>

                            <p>
                                ${
                                    customer.isActive
                                        ? "Active"
                                        : "Inactive"
                                }
                            </p>

                            <button
                                type="button"
                                class="${
                                    customer.isActive
                                        ? "admin-danger-button"
                                        : "admin-primary-button"
                                }"
                                data-customer-status="${
                                    customer._id
                                }"
                                data-active="${
                                    customer.isActive
                                }"
                            >
                                ${
                                    customer.isActive
                                        ? "Deactivate"
                                        : "Activate"
                                }
                            </button>

                        </div>

                    </article>
                `
            ).join("");
    };

    const load = async () => {

        const search =
            $("customerSearch")
                .value
                .trim();

        const result =
            await customerAdminApi
                .getCustomers(
                    1,
                    search
                );

        if (!result.success) {
            message(
                result.message ||
                    "Unable to load customers.",
                "error"
            );
            return;
        }

        customers =
            Array.isArray(result.data)
                ? result.data
                : [];

        render();
    };

    const handleClick = async (
        event
    ) => {

        const button =
            event.target.closest(
                "[data-customer-status]"
            );

        if (!button) {
            return;
        }

        const customerId =
            button.dataset
                .customerStatus;

        const current =
            button.dataset.active ===
            "true";

        const result =
            await customerAdminApi
                .updateStatus(
                    customerId,
                    !current
                );

        if (!result.success) {
            message(
                result.message ||
                    "Unable to update customer.",
                "error"
            );
            return;
        }

        message(
            result.message ||
                "Customer updated.",
            "success"
        );

        await load();
    };

    const init = async () => {

        $("searchCustomersButton")
            .addEventListener(
                "click",
                load
            );

        $("customerSearch")
            .addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key ===
                        "Enter"
                    ) {
                        load();
                    }
                }
            );

        $("customerList")
            .addEventListener(
                "click",
                handleClick
            );

        await load();
    };

    window.initCustomerDashboard =
        init;

})();
