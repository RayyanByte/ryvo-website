const initCustomerDashboard = async () => {

    const container =
        document.getElementById(
            "customer-admin-list"
        );

    const searchInput =
        document.getElementById(
            "customer-search"
        );

    const searchButton =
        document.getElementById(
            "customer-search-btn"
        );

    if (!container) {
        return;
    }

    const loadCustomers = async () => {

        container.innerHTML =
            "<p>Loading customers...</p>";

        try {

            const search =
                searchInput?.value.trim() || "";

            const result =
                await customerAdminApi.getCustomers(
                    search
                );

            const customers =
                result?.data?.customers ||
                result?.customers ||
                result?.data ||
                [];

            if (!customers.length) {
                container.innerHTML =
                    "<p>No customers found.</p>";
                return;
            }

            container.innerHTML =
                customers.map(
                    (customer) => `
                        <article class="customer-card">

                            <h3>
                                ${customer.name || "-"}
                            </h3>

                            <p>
                                Email:
                                ${customer.email || "-"}
                            </p>

                            <p>
                                Phone:
                                ${customer.phone || "-"}
                            </p>

                            <p>
                                Status:
                                ${customer.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </p>

                            <button
                                type="button"
                                data-customer-id="${customer._id}"
                                data-active="${customer.isActive}"
                                class="customer-status-btn"
                            >
                                ${
                                    customer.isActive
                                        ? "Deactivate"
                                        : "Activate"
                                }
                            </button>

                        </article>
                    `
                ).join("");

            container
                .querySelectorAll(
                    ".customer-status-btn"
                )
                .forEach((button) => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const customerId =
                                button.dataset.customerId;

                            const isActive =
                                button.dataset.active !== "true";

                            await customerAdminApi.updateStatus(
                                customerId,
                                isActive
                            );

                            await loadCustomers();
                        }
                    );
                });

        } catch (error) {

            container.innerHTML =
                `<p>${error.message}</p>`;
        }
    };

    if (searchButton) {
        searchButton.addEventListener(
            "click",
            loadCustomers
        );
    }

    if (searchInput) {
        searchInput.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    loadCustomers();
                }
            }
        );
    }

    await loadCustomers();
};


window.initCustomerDashboard =
    initCustomerDashboard;
