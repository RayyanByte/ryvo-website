const ORDER_ADDRESS_API_URL =
    "http://localhost:5000/api/addresses/";

const ORDER_ADDRESS_STORAGE_KEY =
    "ryvo_order_address_id";


let selectedOrderAddressId = null;

let loadedOrderAddresses = [];


const getAuthToken = () => {

    return localStorage.getItem(
        "authToken"
    );
};


const renderAddressMessage = (
    message
) => {

    const messageElement =
        document.getElementById(
            "order-address-selection-message"
        );


    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;
};


const setConfirmButtonState = () => {

    const button =
        document.getElementById(
            "confirm-order-address-button"
        );


    if (!button) {
        return;
    }


    button.disabled =
        !selectedOrderAddressId;
};


const saveSelectedAddressId = (
    addressId
) => {

    if (!addressId) {
        return false;
    }


    try {

        sessionStorage.setItem(
            ORDER_ADDRESS_STORAGE_KEY,
            addressId
        );

        return true;

    } catch (error) {

        console.error(
            "Order address storage error:",
            error
        );

        return false;
    }
};


const loadSelectedAddressId = () => {

    try {

        return sessionStorage.getItem(
            ORDER_ADDRESS_STORAGE_KEY
        );

    } catch (error) {

        console.error(
            "Order address storage read error:",
            error
        );

        return null;
    }
};


const renderOrderAddresses = (
    addresses
) => {

    const list =
        document.getElementById(
            "order-address-list"
        );


    if (!list) {
        return;
    }


    if (!addresses.length) {

        list.innerHTML = `
            <p class="order-address-message">
                No saved addresses found.
                Please add an address from your customer dashboard.
            </p>
        `;

        return;
    }


    list.innerHTML =
        addresses.map(
            (address) => {

                const isSelected =
                    address._id ===
                    selectedOrderAddressId;


                return `
                    <button
                        type="button"
                        class="order-address-card ${
                            isSelected
                                ? "selected"
                                : ""
                        }"
                        data-order-address-id="${address._id}"
                        aria-pressed="${
                            isSelected
                                ? "true"
                                : "false"
                        }"
                    >

                        <span
                            class="order-address-card-header"
                        >
                            <strong>
                                ${address.label || "Address"}
                            </strong>

                            ${
                                address.isDefault
                                    ? `
                                        <span class="order-address-default">
                                            Default
                                        </span>
                                    `
                                    : ""
                            }
                        </span>


                        <span
                            class="order-address-name"
                        >
                            ${address.fullName || ""}
                        </span>


                        <span
                            class="order-address-text"
                        >
                            ${address.addressLine || ""}
                        </span>


                        ${
                            address.landmark
                                ? `
                                    <span
                                        class="order-address-text"
                                    >
                                        ${address.landmark}
                                    </span>
                                `
                                : ""
                        }


                        <span
                            class="order-address-text"
                        >
                            ${address.city || ""},
                            ${address.state || ""}
                            -
                            ${address.pincode || ""}
                        </span>


                        <span
                            class="order-address-phone"
                        >
                            ${address.phone || ""}
                        </span>

                    </button>
                `;
            }
        ).join("");


    list
        .querySelectorAll(
            "[data-order-address-id]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        selectedOrderAddressId =
                            button.dataset.orderAddressId;


                        saveSelectedAddressId(
                            selectedOrderAddressId
                        );


                        list
                            .querySelectorAll(
                                "[data-order-address-id]"
                            )
                            .forEach(
                                (addressButton) => {

                                    const selected =
                                        addressButton.dataset
                                            .orderAddressId ===
                                        selectedOrderAddressId;


                                    addressButton.classList.toggle(
                                        "selected",
                                        selected
                                    );


                                    addressButton.setAttribute(
                                        "aria-pressed",
                                        selected
                                            ? "true"
                                            : "false"
                                    );
                                }
                            );


                        renderAddressMessage(
                            "Delivery address selected."
                        );


                        setConfirmButtonState();
                    }
                );
            }
        );
};


const loadOrderAddresses = async () => {

    const list =
        document.getElementById(
            "order-address-list"
        );


    if (!list) {
        return;
    }


    const token =
        getAuthToken();


    if (!token) {

        list.innerHTML = `
            <p class="order-address-message">
                Please sign in before placing an order.
            </p>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                ORDER_ADDRESS_API_URL,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Could not load saved addresses."
            );
        }


        loadedOrderAddresses =
            Array.isArray(result.data)
                ? result.data
                : [];


        const storedAddressId =
            loadSelectedAddressId();


        const storedAddressExists =
            loadedOrderAddresses.some(
                (address) =>
                    address._id ===
                    storedAddressId
            );


        if (storedAddressExists) {

            selectedOrderAddressId =
                storedAddressId;

        } else {

            selectedOrderAddressId =
                null;

            sessionStorage.removeItem(
                ORDER_ADDRESS_STORAGE_KEY
            );
        }


        renderOrderAddresses(
            loadedOrderAddresses
        );


        setConfirmButtonState();

    } catch (error) {

        console.error(
            "Order address loading error:",
            error
        );


        list.innerHTML = `
            <p class="order-address-message">
                Unable to load your saved addresses.
                Please try again.
            </p>
        `;
    }
};


const confirmOrderAddress = () => {

    if (!selectedOrderAddressId) {

        renderAddressMessage(
            "Please select a delivery address first."
        );

        return;
    }


    const selectedAddress =
        loadedOrderAddresses.find(
            (address) =>
                address._id ===
                selectedOrderAddressId
        );


    if (!selectedAddress) {

        renderAddressMessage(
            "The selected address is no longer available."
        );

        selectedOrderAddressId =
            null;

        setConfirmButtonState();

        return;
    }


    window.orderDeliveryAddress = {
        ...selectedAddress
    };


    window.dispatchEvent(
        new CustomEvent(
            "orderAddressConfirmed",
            {
                detail: {
                    ...selectedAddress
                }
            }
        )
    );


    renderAddressMessage(
        "Delivery address confirmed."
    );
};


const initializeOrderAddressSelection = () => {

    const confirmButton =
        document.getElementById(
            "confirm-order-address-button"
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            confirmOrderAddress
        );
    }


    loadOrderAddresses();
};


window.getSelectedOrderAddressId = () => {

    return selectedOrderAddressId;
};


window.getSelectedOrderAddress = () => {

    if (!selectedOrderAddressId) {
        return null;
    }


    const address =
        loadedOrderAddresses.find(
            (item) =>
                item._id ===
                selectedOrderAddressId
        );


    return address
        ? { ...address }
        : null;
};


window.clearSelectedOrderAddress = () => {

    selectedOrderAddressId = null;

    window.orderDeliveryAddress = null;


    try {

        sessionStorage.removeItem(
            ORDER_ADDRESS_STORAGE_KEY
        );

    } catch (error) {

        console.error(
            "Order address storage clear error:",
            error
        );
    }


    setConfirmButtonState();
};


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeOrderAddressSelection
    );

} else {

    initializeOrderAddressSelection();
}
