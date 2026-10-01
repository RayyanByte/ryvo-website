const API_URL = "http://localhost:5000/api/addresses/";

async function loadAddresses() {
    const container = document.querySelector("[data-customer-addresses]");

    if (!container) {
        return;
    }

    try {
        const componentResponse = await fetch("../components/addresses.html");

        if (!componentResponse.ok) {
            throw new Error("Could not load addresses component.");
        }

        container.innerHTML = await componentResponse.text();

        window.dispatchEvent(
            new CustomEvent("customerAddressesComponentLoaded")
        );

        const token = localStorage.getItem("authToken");
        const list = document.getElementById("addresses-list");

        if (!token) {
            if (list) {
                list.innerHTML = `
                    <p class="addresses-empty">
                        Please sign in to manage your addresses.
                    </p>
                `;
            }

            return;
        }

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Could not load addresses."
            );
        }

        renderAddresses(result.data || []);
    } catch (error) {
        console.error("Address loading error:", error);

        const list = document.getElementById("addresses-list");

        if (list) {
            list.innerHTML = `
                <p class="addresses-empty">
                    Unable to load addresses. Please try again.
                </p>
            `;
        }
    }
}

function renderAddresses(addresses) {
    const list = document.getElementById("addresses-list");

    if (!list) {
        return;
    }

    if (!addresses.length) {
        list.innerHTML = `
            <p class="addresses-empty">
                No saved addresses yet.
            </p>
        `;

        return;
    }

    list.innerHTML = addresses.map((address) => `
        <article
            class="address-card"
            data-address-id="${address._id}"
        >
            <div class="address-card-header">
                <div>
                    <span class="address-label">
                        ${address.label || "Address"}
                    </span>

                    ${
                        address.isDefault
                            ? `<span class="address-default">Default</span>`
                            : ""
                    }
                </div>
            </div>

            <strong class="address-name">
                ${address.fullName || ""}
            </strong>

            <p class="address-text">
                ${address.addressLine || ""}
            </p>

            ${
                address.landmark
                    ? `<p class="address-text">${address.landmark}</p>`
                    : ""
            }

            <p class="address-text">
                ${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}
            </p>

            <p class="address-phone">
                ${address.phone || ""}
            </p>

            <div class="address-actions">
                <button
                    type="button"
                    class="address-edit-button"
                    data-edit-address="${address._id}"
                >
                    Edit Address
                </button>

                <button
                    type="button"
                    class="address-delete-button"
                    data-delete-address="${address._id}"
                >
                    Delete Address
                </button>

                ${
                    !address.isDefault
                        ? `
                            <button
                                type="button"
                                class="address-default-button"
                                data-default-address="${address._id}"
                            >
                                Set as Default
                            </button>
                        `
                        : ""
                }
            </div>
        </article>
    `).join("");

    list.querySelectorAll("[data-edit-address]").forEach((button) => {
        button.addEventListener("click", () => {
            const selectedAddress = addresses.find(
                (address) =>
                    address._id === button.dataset.editAddress
            );

            if (!selectedAddress) {
                return;
            }

            window.dispatchEvent(
                new CustomEvent("editCustomerAddress", {
                    detail: selectedAddress
                })
            );
        });
    });

    list.querySelectorAll("[data-delete-address]").forEach((button) => {
        button.addEventListener("click", async () => {
            const selectedAddress = addresses.find(
                (address) =>
                    address._id === button.dataset.deleteAddress
            );

            if (!selectedAddress) {
                return;
            }

            const confirmed = window.confirm(
                `Delete your ${selectedAddress.label || "saved"} address?`
            );

            if (!confirmed) {
                return;
            }

            await deleteAddress(
                selectedAddress._id,
                button
            );
        });
    });

    list.querySelectorAll("[data-default-address]").forEach((button) => {
        button.addEventListener("click", async () => {
            await setDefaultAddress(
                button.dataset.defaultAddress,
                button
            );
        });
    });
}

async function deleteAddress(addressId, button) {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
        window.alert("Please sign in first.");
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        const response = await fetch(
            `${API_URL}${addressId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Failed to delete address."
            );
        }

        await loadAddresses();
    } catch (error) {
        console.error(
            "Delete address error:",
            error
        );

        window.alert(
            error.message ||
            "Unable to delete address."
        );

        button.disabled = false;
        button.textContent = "Delete Address";
    }
}

async function setDefaultAddress(addressId, button) {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
        window.alert("Please sign in first.");
        return;
    }

    button.disabled = true;
    button.textContent = "Setting...";

    try {
        const response = await fetch(
            `${API_URL}${addressId}/default`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Failed to set default address."
            );
        }

        await loadAddresses();
    } catch (error) {
        console.error(
            "Set default address error:",
            error
        );

        window.alert(
            error.message ||
            "Unable to set default address."
        );

        button.disabled = false;
        button.textContent = "Set as Default";
    }
}

window.addEventListener("customerAddressSaved", () => {
    loadAddresses();
});

loadAddresses();
