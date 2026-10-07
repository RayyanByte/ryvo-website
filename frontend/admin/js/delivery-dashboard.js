const initializeAdminDeliveryDashboard = async () => {

    const container =
        document.getElementById(
            "delivery-admin-list"
        );

    if (!container) {
        return;
    }

    try {

        const result =
            await window.getAdminDeliveryBoys();

        const deliveryBoys =
            result?.data ||
            result?.deliveryBoys ||
            [];

        if (!deliveryBoys.length) {
            container.innerHTML =
                "<p>No delivery boys found.</p>";
            return;
        }

        container.innerHTML =
            deliveryBoys.map(
                (boy) => `
                    <article class="delivery-card">

                        <h3>
                            ${boy.name || "Unnamed"}
                        </h3>

                        <p>
                            Email:
                            ${boy.email || "-"}
                        </p>

                        <p>
                            Phone:
                            ${boy.phone || "-"}
                        </p>

                        <p>
                            Status:
                            ${boy.isActive ? "Active" : "Inactive"}
                        </p>

                    </article>
                `
            ).join("");

    } catch (error) {

        container.innerHTML =
            `<p>${error.message}</p>`;
    }
};


window.initializeAdminDeliveryDashboard =
    initializeAdminDeliveryDashboard;
